/**
 * Portal agents — pure TypeScript (no paid API required).
 * - rank: FitScore rank candidates for a job
 * - draft: LinkedIn / email outreach drafts from rank + profile
 */

import {
  rankCandidatesForJob,
  type Candidate,
  type FitScoreResult,
  type JobReq,
} from "./fitscore";
import { SITE } from "./seo";

export type AgentKind = "rank" | "draft";

export interface AgentRun {
  id: string;
  kind: AgentKind;
  createdAt: string;
  jobId: string;
  jobTitle: string;
  summary: string;
  /** Rank results */
  rankings?: Array<{
    candidateId: string;
    name: string;
    score: number;
    title: string;
    location: string;
    topReason: string;
  }>;
  /** Outreach drafts */
  drafts?: Array<{
    candidateId: string;
    name: string;
    channel: "linkedin" | "email";
    subject?: string;
    body: string;
    fitScore: number;
  }>;
}

export function runRankAgent(
  candidates: Candidate[],
  job: JobReq,
  limit = 15,
): AgentRun {
  const ranked = rankCandidatesForJob(candidates, job).slice(0, limit);
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const rankings = ranked.map((r) => {
    const c = byId.get(r.candidateId);
    return {
      candidateId: r.candidateId,
      name: c?.name ?? r.candidateId,
      score: r.score,
      title: c?.title ?? "",
      location: c?.location ?? "",
      topReason: r.reasons[0] ?? "",
    };
  });
  const top = rankings[0];
  return {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind: "rank",
    createdAt: new Date().toISOString(),
    jobId: job.id,
    jobTitle: job.title,
    summary: top
      ? `Ranked ${rankings.length} candidates for “${job.title}”. Top: ${top.name} (${top.score}).`
      : `No candidates to rank for “${job.title}”.`,
    rankings,
  };
}

export function buildLinkedInDraft(
  candidate: Candidate,
  job: JobReq,
  fit: FitScoreResult,
): string {
  const first = candidate.name.split(" ")[0] ?? candidate.name;
  const skillHint =
    candidate.skills.slice(0, 3).join(", ") || "your background";
  return [
    `Hi ${first} — ${SITE.recruiterName} with ${SITE.name} (Twin Cities desk).`,
    ``,
    `I'm supporting a search for ${job.title} at ${job.company} (${job.location}).`,
    `Your profile stood out on our FitScore (${fit.score}/100) — especially around ${skillHint}.`,
    ``,
    `Open to a short conversation this week if you're exploring? Happy to share role details first.`,
    ``,
    `— ${SITE.recruiterName}`,
    `${SITE.name} · ${SITE.phone}`,
  ].join("\n");
}

export function buildEmailDraft(
  candidate: Candidate,
  job: JobReq,
  fit: FitScoreResult,
): { subject: string; body: string } {
  const first = candidate.name.split(" ")[0] ?? candidate.name;
  return {
    subject: `${job.title} · ${job.location} — intro from ${SITE.name}`,
    body: [
      `Hi ${first},`,
      ``,
      `I'm ${SITE.recruiterName} with ${SITE.name}. We place construction, engineering, architecture, and accounting talent across the Upper Midwest.`,
      ``,
      `I'm working a ${job.title} opportunity with ${job.company} in ${job.location}. Based on your background (${candidate.title}, ${candidate.yearsExperience}+ years), FitScore put you at ${fit.score}/100 for this req.`,
      ``,
      fit.reasons[0] ? `Why you surfaced: ${fit.reasons[0]}` : "",
      ``,
      `If you're open to a brief call, reply with a time that works — or tell me what you're targeting next.`,
      ``,
      `Best,`,
      SITE.recruiterName,
      `${SITE.recruiterTitle} · ${SITE.name}`,
      `${SITE.email} · ${SITE.phone}`,
      SITE.address,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export function runDraftAgent(
  candidates: Candidate[],
  job: JobReq,
  topN = 5,
): AgentRun {
  const ranked = rankCandidatesForJob(candidates, job).slice(0, topN);
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const drafts: AgentRun["drafts"] = [];
  for (const r of ranked) {
    const c = byId.get(r.candidateId);
    if (!c) continue;
    const li = buildLinkedInDraft(c, job, r);
    const em = buildEmailDraft(c, job, r);
    drafts.push({
      candidateId: c.id,
      name: c.name,
      channel: "linkedin",
      body: li,
      fitScore: r.score,
    });
    drafts.push({
      candidateId: c.id,
      name: c.name,
      channel: "email",
      subject: em.subject,
      body: em.body,
      fitScore: r.score,
    });
  }
  return {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind: "draft",
    createdAt: new Date().toISOString(),
    jobId: job.id,
    jobTitle: job.title,
    summary: `Generated ${drafts.length} outreach drafts (LinkedIn + email) for top ${ranked.length} fits on “${job.title}”.`,
    drafts,
  };
}
