/**
 * Modular jobsite trailer workspace — section layout + default order.
 */

export type TrailerId =
  | "construction"
  | "engineering"
  | "architecture"
  | "accounting"
  | "open-roles"
  | "demand"
  | "twin"
  | "about"
  | "contact"
  | "portal";

export interface TrailerDef {
  id: TrailerId;
  unit: string;
  title: string;
  subtitle: string;
  /** Short plate text on closed trailer door */
  doorLabel: string;
  /** Accent stripe (CSS color) */
  accent: string;
  kind: "industry" | "ops" | "connect";
  roles?: string[];
  body: string;
  href?: string;
  cta?: string;
}

export const DEFAULT_TRAILER_ORDER: TrailerId[] = [
  "construction",
  "engineering",
  "architecture",
  "accounting",
  "open-roles",
  "demand",
  "twin",
  "about",
  "contact",
  "portal",
];

export const TRAILERS: Record<TrailerId, TrailerDef> = {
  construction: {
    id: "construction",
    unit: "T-01",
    title: "Construction",
    subtitle: "Jobsite · GC & specialty",
    doorLabel: "CONST",
    accent: "#e85d2a",
    kind: "industry",
    roles: [
      "Project Manager",
      "Superintendent",
      "Estimator",
      "Field Engineer",
      "Safety Manager",
    ],
    body: "Commercial, healthcare, industrial, and heavy civil. We understand project timelines, GC culture, and the difference between a polished resume and a job-site leader.",
    href: "/industries",
    cta: "Staff construction",
  },
  engineering: {
    id: "engineering",
    unit: "T-02",
    title: "Engineering",
    subtitle: "Structural · Civil · MEP",
    doorLabel: "ENGR",
    accent: "#3d8ec4",
    kind: "industry",
    roles: [
      "Structural PE",
      "Civil Engineer",
      "MEP Designer",
      "Project Engineer",
      "BIM Manager",
    ],
    body: "Licensed and pre-licensed talent for design firms and owner-operators who need technical depth without long search cycles.",
    href: "/industries",
    cta: "Staff engineering",
  },
  architecture: {
    id: "architecture",
    unit: "T-03",
    title: "Architecture",
    subtitle: "Studios · K-12 · civic",
    doorLabel: "ARCH",
    accent: "#8b9bb0",
    kind: "industry",
    roles: ["Project Architect", "Job Captain", "Interior Designer", "Spec Writer"],
    body: "Studio culture fit matters. We match portfolios and personality to firms building schools, healthcare, and mixed-use across the region.",
    href: "/industries",
    cta: "Staff architecture",
  },
  accounting: {
    id: "accounting",
    unit: "T-04",
    title: "Accounting",
    subtitle: "Job cost · WIP · bonding",
    doorLabel: "ACCT",
    accent: "#5baf8a",
    kind: "industry",
    roles: ["Controller", "Project Accountant", "AP/AR Lead", "CFO (contract)"],
    body: "Contractor finance is specialized. We place people who understand job cost, WIP, and bonding — not generic bookkeepers.",
    href: "/industries",
    cta: "Staff accounting",
  },
  "open-roles": {
    id: "open-roles",
    unit: "T-05",
    title: "Open Roles",
    subtitle: "Live requisitions",
    doorLabel: "REQS",
    accent: "#d4a574",
    kind: "ops",
    body: "Select placements across the Upper Midwest. Candidates get a real conversation — not a black-hole ATS.",
    href: "/jobs",
    cta: "View openings",
  },
  demand: {
    id: "demand",
    unit: "T-06",
    title: "Demand Board",
    subtitle: "Regional heat · Twin Cities & Fargo",
    doorLabel: "HEAT",
    accent: "#c44b3c",
    kind: "ops",
    body: "Project pressure and role scarcity on an interactive blueprint — pan, zoom, and open callouts for high-demand seats.",
    href: "/demand",
    cta: "Open demand board",
  },
  twin: {
    id: "twin",
    unit: "T-06B",
    title: "Digital Twin",
    subtitle: "HQ hub · talent across MSP",
    doorLabel: "TWIN",
    accent: "#5b9fd4",
    kind: "ops",
    body: "3D twin of the Twin Cities desk: talent waiting across Minneapolis–St. Paul for the right client match.",
    href: "/twin",
    cta: "Open 3D twin",
  },
  about: {
    id: "about",
    unit: "T-07",
    title: "About Fitboard",
    subtitle: "Recruiter OS",
    doorLabel: "FB",
    accent: "#5b9fd4",
    kind: "connect",
    body: "Score the match before you pick up the phone. FitScore, Conflict Wall, and FitCards for AEC desks.",
    href: "/about",
    cta: "About the platform",
  },
  contact: {
    id: "contact",
    unit: "T-08",
    title: "Contact",
    subtitle: "Hire or explore a move",
    doorLabel: "CALL",
    accent: "#e85d2a",
    kind: "connect",
    body: "Call, email, or message the desk — no ticket queue.",
    href: "/contact",
    cta: "Talk to the desk",
  },
  portal: {
    id: "portal",
    unit: "T-09",
    title: "Client Portal",
    subtitle: "Heat Map · BenchAlert · FitScore",
    doorLabel: "PORT",
    accent: "#3d8ec4",
    kind: "ops",
    body: "Signed-in workspace: regional heat map, finishing talent alerts, FitScore ranking, and CSV candidate import.",
    href: "/portal",
    cta: "Enter portal",
  },
};

export function normalizeOrder(order: string[]): TrailerId[] {
  const known = new Set(DEFAULT_TRAILER_ORDER);
  const cleaned = order.filter((id): id is TrailerId => known.has(id as TrailerId));
  for (const id of DEFAULT_TRAILER_ORDER) {
    if (!cleaned.includes(id)) cleaned.push(id);
  }
  return cleaned;
}
