/**
 * FitScore — Open-source style local matching engine for MG Recruiting Source.
 *
 * This is a pure TypeScript algorithm that runs entirely client-side / in-process.
 * No paid APIs, no external LLM calls. Weights and scoring are transparent and
 * auditable. Swap or augment later with Ollama / local LLM for semantic re-rank
 * without changing the FitScoreResult contract.
 *
 * Weights (must sum to 100%):
 *   skills overlap .................... 30%
 *   title / role match ............... 20%
 *   industry match ................... 15%
 *   location (MN / Upper Midwest) .... 15%
 *   experience years vs req .......... 10%
 *   project type keywords ............ 10%
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Industries MG Recruiting focuses on. */
export type Industry =
  | "construction"
  | "engineering"
  | "architecture"
  | "accounting"
  | "other";

/** Candidate profile used by FitScore. */
export interface Candidate {
  id: string;
  name: string;
  title: string;
  /** Free-form skill tags (e.g. "Revit", "AutoCAD", "PMP"). */
  skills: string[];
  industry: Industry;
  /** City + state, e.g. "Minneapolis, MN". */
  location: string;
  /** State code when known (MN, ND, WI, SD, IA, …). */
  state?: string;
  yearsExperience: number;
  /** Project-type keywords from past work (e.g. "healthcare", "K-12", "DOT"). */
  projectTypes: string[];
  /** Optional free-text summary used only for reason generation. */
  summary?: string;
  email?: string;
  phone?: string;
  /** ISO date when available for placement / bench end. */
  availableDate?: string;
}

/** Open job requisition. */
export interface JobReq {
  id: string;
  title: string;
  company: string;
  /** Required / preferred skill tags. */
  requiredSkills: string[];
  industry: Industry;
  location: string;
  state?: string;
  /** Minimum years of experience required. */
  minYearsExperience: number;
  /** Preferred / ideal years (soft target). */
  preferredYearsExperience?: number;
  /** Project-type keywords the role works on. */
  projectTypes: string[];
  description?: string;
  /** Open / filled / on-hold — scoring ignores status. */
  status?: "open" | "filled" | "on-hold";
  salaryRange?: string;
}

/** Per-dimension contribution (0–100 scale before weight). */
export interface FitScoreBreakdown {
  skills: number;
  titleRole: number;
  industry: number;
  location: number;
  experience: number;
  projectTypes: number;
}

export interface FitScoreResult {
  /** Composite score 0–100 (rounded). */
  score: number;
  breakdown: FitScoreBreakdown;
  /** Human-readable match explanations for recruiters. */
  reasons: string[];
  candidateId: string;
  jobId: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const FIT_WEIGHTS = {
  skills: 0.3,
  titleRole: 0.2,
  industry: 0.15,
  location: 0.15,
  experience: 0.1,
  projectTypes: 0.1,
} as const;

/** Preferred states for Upper Midwest / MN-centric staffing. */
const PREFERRED_STATES = new Set([
  "MN",
  "ND",
  "SD",
  "WI",
  "IA",
  "NE",
  "MT",
]);

const CORE_PREFERRED_STATES = new Set(["MN", "ND", "WI", "SD"]);

/** Common title synonyms / seniority tokens for role matching. */
const TITLE_SYNONYMS: Record<string, string[]> = {
  pm: ["project manager", "pm", "proj manager", "project mgr"],
  pe: ["project engineer", "pe", "field engineer"],
  se: ["structural engineer", "structural eng"],
  me: ["mechanical engineer", "mech engineer", "hvac engineer"],
  ee: ["electrical engineer", "elec engineer"],
  ce: ["civil engineer", "civil eng"],
  superintendent: ["superintendent", "super", "field super"],
  estimator: ["estimator", "chief estimator", "senior estimator"],
  architect: ["architect", "project architect", "design architect"],
  drafter: ["drafter", "cad drafter", "revit drafter", "designer"],
  controller: ["controller", "accounting manager", "finance manager"],
  accountant: ["accountant", "staff accountant", "senior accountant", "cpa"],
  superintendent_gc: ["general superintendent", "senior superintendent"],
  bim: ["bim manager", "bim coordinator", "vdc manager", "vdc coordinator"],
  qa: ["qa/qc", "quality manager", "qc manager"],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string): string[] {
  return normalize(s)
    .split(/[\s,/|-]+/)
    .filter(Boolean);
}

/** Jaccard-like overlap of string arrays (case-insensitive). Returns 0–1. */
function setOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a.map(normalize));
  const setB = new Set(b.map(normalize));
  let inter = 0;
  for (const x of setA) {
    if (setB.has(x)) inter += 1;
  }
  // Prefer recall against required set (B) for skills/job keywords
  return inter / setB.size;
}

/** Fuzzy skill match: exact tag match + partial token containment. Returns 0–1. */
function skillsOverlapScore(
  candidateSkills: string[],
  requiredSkills: string[],
): { ratio: number; matched: string[] } {
  if (requiredSkills.length === 0) return { ratio: 1, matched: [] };

  const candNorm = candidateSkills.map(normalize);
  const matched: string[] = [];

  for (const req of requiredSkills) {
    const r = normalize(req);
    const hit = candNorm.some(
      (c) =>
        c === r ||
        c.includes(r) ||
        r.includes(c) ||
        // multi-token partial (e.g. "project management" vs "PMP")
        tokenize(c).some((t) => t.length > 2 && r.includes(t)) ||
        tokenize(r).some((t) => t.length > 2 && c.includes(t)),
    );
    if (hit) matched.push(req);
  }

  return {
    ratio: matched.length / requiredSkills.length,
    matched,
  };
}

function extractState(location: string, explicit?: string): string | undefined {
  if (explicit) return explicit.toUpperCase();
  const m = location.match(/\b([A-Z]{2})\b\s*$/);
  if (m) return m[1];
  // try after comma
  const parts = location.split(",").map((p) => p.trim());
  if (parts.length >= 2) {
    const last = parts[parts.length - 1].toUpperCase();
    if (/^[A-Z]{2}$/.test(last)) return last;
  }
  return undefined;
}

function isMnMetro(location: string): boolean {
  const l = normalize(location);
  return (
    l.includes("minneapolis") ||
    l.includes("st paul") ||
    l.includes("saint paul") ||
    l.includes("bloomington") ||
    l.includes("eden prairie") ||
    l.includes("maple grove") ||
    l.includes("plymouth") ||
    l.includes("edina") ||
    l.includes("twin cities")
  );
}

/** Title/role match 0–100. */
function scoreTitleRole(candidateTitle: string, jobTitle: string): {
  score: number;
  note: string;
} {
  const c = normalize(candidateTitle);
  const j = normalize(jobTitle);

  if (c === j) {
    return { score: 100, note: `Exact title match: "${candidateTitle}"` };
  }

  // Shared significant tokens
  const cTokens = new Set(tokenize(c).filter((t) => t.length > 2));
  const jTokens = tokenize(j).filter((t) => t.length > 2);
  const shared = jTokens.filter((t) => cTokens.has(t));
  const tokenRatio =
    jTokens.length === 0 ? 0 : shared.length / jTokens.length;

  // Synonym group match
  let synonymHit = false;
  for (const group of Object.values(TITLE_SYNONYMS)) {
    const candIn = group.some((g) => c.includes(g) || g.includes(c));
    const jobIn = group.some((g) => j.includes(g) || g.includes(j));
    if (candIn && jobIn) {
      synonymHit = true;
      break;
    }
  }

  let score = Math.round(tokenRatio * 85);
  if (synonymHit) score = Math.max(score, 80);
  // seniority bonus/penalty soft
  const seniorWords = ["senior", "sr", "lead", "principal", "chief"];
  const juniorWords = ["junior", "jr", "assistant", "associate", "entry"];
  const candSenior = seniorWords.some((w) => c.includes(w));
  const jobSenior = seniorWords.some((w) => j.includes(w));
  const candJunior = juniorWords.some((w) => c.includes(w));
  const jobJunior = juniorWords.some((w) => j.includes(w));
  if (candSenior === jobSenior || candJunior === jobJunior) {
    score = Math.min(100, score + 5);
  }

  score = Math.max(0, Math.min(100, score));

  let note: string;
  if (score >= 80) {
    note = `Strong role alignment: "${candidateTitle}" ↔ "${jobTitle}"`;
  } else if (score >= 50) {
    note = `Partial title overlap (${shared.join(", ") || "related role"})`;
  } else if (score > 0) {
    note = `Limited title overlap with "${jobTitle}"`;
  } else {
    note = `Title differs: candidate is "${candidateTitle}"`;
  }

  return { score, note };
}

/** Location preference 0–100 — MN / Upper Midwest bias. */
function scoreLocation(
  candLoc: string,
  candState: string | undefined,
  jobLoc: string,
  jobState: string | undefined,
): { score: number; note: string } {
  const cs = extractState(candLoc, candState);
  const js = extractState(jobLoc, jobState);
  const sameCity =
    normalize(candLoc).split(",")[0] === normalize(jobLoc).split(",")[0];

  if (sameCity || (cs && js && cs === js && isMnMetro(candLoc) && isMnMetro(jobLoc))) {
    return {
      score: 100,
      note: `Local match — ${candLoc} aligns with ${jobLoc}`,
    };
  }

  if (cs && js && cs === js) {
    return {
      score: 90,
      note: `Same state (${cs}) as role location`,
    };
  }

  if (cs && js && CORE_PREFERRED_STATES.has(cs) && CORE_PREFERRED_STATES.has(js)) {
    return {
      score: 75,
      note: `Upper Midwest corridor (${cs} → ${js}) — strong regional fit`,
    };
  }

  if (cs && PREFERRED_STATES.has(cs)) {
    return {
      score: 60,
      note: `Candidate in preferred Upper Midwest state (${cs})`,
    };
  }

  if (js && PREFERRED_STATES.has(js) && cs && !PREFERRED_STATES.has(cs)) {
    return {
      score: 25,
      note: `Candidate outside Upper Midwest (${cs ?? candLoc}); relocation may be needed`,
    };
  }

  return {
    score: 40,
    note: `Location: ${candLoc} vs ${jobLoc}`,
  };
}

/** Experience years vs req 0–100. */
function scoreExperience(
  years: number,
  minYears: number,
  preferredYears?: number,
): { score: number; note: string } {
  const target = preferredYears ?? minYears + 2;

  if (years >= minYears && years <= target + 3) {
    // sweet spot
    const ideal = preferredYears ?? minYears + 1;
    const dist = Math.abs(years - ideal);
    const score = Math.max(85, 100 - dist * 3);
    return {
      score,
      note: `${years} yrs experience meets requirement (${minYears}+ yrs)`,
    };
  }

  if (years >= minYears) {
    // overqualified soft penalty
    const over = years - target;
    const score = Math.max(70, 95 - over * 2);
    return {
      score,
      note: `${years} yrs — exceeds minimum (${minYears}+); may be overqualified`,
    };
  }

  // under min
  const gap = minYears - years;
  if (gap <= 1) {
    return {
      score: 65,
      note: `${years} yrs is close to ${minYears}+ required (1 yr short)`,
    };
  }
  if (gap <= 2) {
    return {
      score: 45,
      note: `${years} yrs is ${gap} yrs below the ${minYears}+ requirement`,
    };
  }
  return {
    score: Math.max(10, 40 - gap * 8),
    note: `${years} yrs falls short of ${minYears}+ required`,
  };
}

function scoreIndustry(
  cand: Industry,
  job: Industry,
): { score: number; note: string } {
  if (cand === job) {
    return { score: 100, note: `Industry match: ${cand}` };
  }
  // Adjacent industries that often cross-hire
  const adjacent: Record<Industry, Industry[]> = {
    construction: ["engineering", "architecture"],
    engineering: ["construction", "architecture"],
    architecture: ["construction", "engineering"],
    accounting: [],
    other: [],
  };
  if (adjacent[cand]?.includes(job) || adjacent[job]?.includes(cand)) {
    return {
      score: 70,
      note: `Adjacent industries: ${cand} ↔ ${job}`,
    };
  }
  return {
    score: 20,
    note: `Industry mismatch: ${cand} vs ${job}`,
  };
}

function scoreProjectTypes(
  candTypes: string[],
  jobTypes: string[],
): { score: number; matched: string[]; note: string } {
  if (jobTypes.length === 0) {
    return {
      score: 70,
      matched: [],
      note: "No project-type filter on requisition",
    };
  }
  const { ratio, matched } = skillsOverlapScore(candTypes, jobTypes);
  // also use simple set overlap for multi-word types
  const soft = setOverlap(candTypes, jobTypes);
  const combined = Math.max(ratio, soft);
  const score = Math.round(combined * 100);
  return {
    score,
    matched,
    note:
      matched.length > 0
        ? `Project types in common: ${matched.join(", ")}`
        : "Limited project-type keyword overlap",
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute FitScore between a candidate and a job requisition.
 * Pure function — no I/O, no network. Safe to run in browser or Node.
 */
export function computeFitScore(
  candidate: Candidate,
  job: JobReq,
): FitScoreResult {
  const skills = skillsOverlapScore(candidate.skills, job.requiredSkills);
  const title = scoreTitleRole(candidate.title, job.title);
  const industry = scoreIndustry(candidate.industry, job.industry);
  const location = scoreLocation(
    candidate.location,
    candidate.state,
    job.location,
    job.state,
  );
  const experience = scoreExperience(
    candidate.yearsExperience,
    job.minYearsExperience,
    job.preferredYearsExperience,
  );
  const projects = scoreProjectTypes(candidate.projectTypes, job.projectTypes);

  const breakdown: FitScoreBreakdown = {
    skills: Math.round(skills.ratio * 100),
    titleRole: title.score,
    industry: industry.score,
    location: location.score,
    experience: experience.score,
    projectTypes: projects.score,
  };

  const weighted =
    breakdown.skills * FIT_WEIGHTS.skills +
    breakdown.titleRole * FIT_WEIGHTS.titleRole +
    breakdown.industry * FIT_WEIGHTS.industry +
    breakdown.location * FIT_WEIGHTS.location +
    breakdown.experience * FIT_WEIGHTS.experience +
    breakdown.projectTypes * FIT_WEIGHTS.projectTypes;

  const score = Math.max(0, Math.min(100, Math.round(weighted)));

  const reasons: string[] = [];

  if (skills.matched.length > 0) {
    reasons.push(
      `Skills match (${breakdown.skills}%): ${skills.matched.slice(0, 6).join(", ")}`,
    );
  } else if (job.requiredSkills.length > 0) {
    reasons.push("Few or no required skills present on candidate profile");
  }

  reasons.push(title.note);
  reasons.push(industry.note);
  reasons.push(location.note);
  reasons.push(experience.note);
  reasons.push(projects.note);

  if (score >= 80) {
    reasons.unshift("Strong overall FitScore — prioritize for outreach");
  } else if (score >= 60) {
    reasons.unshift("Solid FitScore — worth a recruiter review");
  } else if (score < 40) {
    reasons.unshift("Low FitScore — likely a stretch match");
  }

  return {
    score,
    breakdown,
    reasons,
    candidateId: candidate.id,
    jobId: job.id,
  };
}

/**
 * Rank candidates for a job by FitScore (desc).
 */
export function rankCandidatesForJob(
  candidates: Candidate[],
  job: JobReq,
): FitScoreResult[] {
  return candidates
    .map((c) => computeFitScore(c, job))
    .sort((a, b) => b.score - a.score);
}

/**
 * Rank open jobs for a candidate by FitScore (desc).
 */
export function rankJobsForCandidate(
  candidate: Candidate,
  jobs: JobReq[],
): FitScoreResult[] {
  return jobs
    .map((j) => computeFitScore(candidate, j))
    .sort((a, b) => b.score - a.score);
}
