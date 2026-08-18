/**
 * Blueprint board layout — world coordinates for the interactive homepage.
 * Three featured AEC projects with role callouts mapped to open demand.
 */

export type DemandLevel = "high" | "elevated" | "steady";

export interface BlueprintProject {
  id: string;
  name: string;
  city: string;
  state: string;
  /** Drawing sheet origin in world space. */
  x: number;
  y: number;
  width: number;
  height: number;
  demandScore: number;
  demand: DemandLevel;
  valueMm: number;
  projectType: string;
  drawingType: "elevation" | "floor-plan" | "structural";
  sheetNo: string;
}

export interface RoleAnnotation {
  id: string;
  /** Linked job id when matching open reqs. */
  jobId?: string;
  projectId: string;
  title: string;
  subtitle: string;
  description: string;
  /** Anchor on the drawing (world coords). */
  ax: number;
  ay: number;
  /** Callout label position. */
  lx: number;
  ly: number;
  demand: DemandLevel;
  industry: string;
  location: string;
}

export const BOARD = {
  width: 3200,
  height: 2000,
  title: "MG RECRUITING SOURCE — REGIONAL DEMAND BOARD",
  revision: "REV A · UPPER MIDWEST",
  date: "2026-08-05",
  scale: "NTS",
} as const;

export const blueprintProjects: BlueprintProject[] = [
  {
    id: "proj-north-loop",
    name: "North Loop Medical Pavilion",
    city: "Minneapolis",
    state: "MN",
    x: 180,
    y: 280,
    width: 720,
    height: 520,
    demandScore: 9,
    demand: "high",
    valueMm: 78,
    projectType: "Healthcare / Ambulatory",
    drawingType: "elevation",
    sheetNo: "A-101",
  },
  {
    id: "proj-tower",
    name: "Twin Cities Mixed-Use Tower — Structure",
    city: "Minneapolis",
    state: "MN",
    x: 1100,
    y: 220,
    width: 640,
    height: 680,
    demandScore: 9,
    demand: "high",
    valueMm: 120,
    projectType: "Mid-rise Commercial",
    drawingType: "structural",
    sheetNo: "S-201",
  },
  {
    id: "proj-cold",
    name: "Red River Cold Storage Expansion",
    city: "Fargo",
    state: "ND",
    x: 1980,
    y: 360,
    width: 780,
    height: 480,
    demandScore: 8,
    demand: "elevated",
    valueMm: 42,
    projectType: "Industrial / Cold Storage",
    drawingType: "floor-plan",
    sheetNo: "A-302",
  },
];

export const roleAnnotations: RoleAnnotation[] = [
  {
    id: "ann-pm-healthcare",
    jobId: "job-001",
    projectId: "proj-north-loop",
    title: "Project Manager — Commercial Construction",
    subtitle: "Healthcare · North Loop",
    description:
      "Lead phased ambulatory + OR renovation packages. Procore, GMP, and owner coordination for a $78M Twin Cities healthcare build.",
    ax: 520,
    ay: 420,
    lx: 820,
    ly: 280,
    demand: "high",
    industry: "construction",
    location: "Minneapolis, MN",
  },
  {
    id: "ann-super-multi",
    projectId: "proj-north-loop",
    title: "Superintendent — Multifamily / Healthcare",
    subtitle: "Field leadership · North Loop",
    description:
      "Own site execution, trade sequencing, and schedule recovery on aggressive healthcare phasing in the North Loop.",
    ax: 380,
    ay: 620,
    lx: 80,
    ly: 760,
    demand: "high",
    industry: "construction",
    location: "Minneapolis, MN",
  },
  {
    id: "ann-se",
    jobId: "job-002",
    projectId: "proj-tower",
    title: "Structural Engineer",
    subtitle: "PE · Mixed-Use Tower",
    description:
      "Design and seal structural packages for mid-rise commercial structure. Steel, concrete, Revit Structure, RISA.",
    ax: 1420,
    ay: 480,
    lx: 1720,
    ly: 240,
    demand: "high",
    industry: "engineering",
    location: "St Paul, MN",
  },
  {
    id: "ann-pm-tower",
    projectId: "proj-tower",
    title: "Project Manager — High-Rise Structure",
    subtitle: "Tower · Twin Cities",
    description:
      "Drive structural package delivery and GC coordination for a 120M-class mixed-use tower in Minneapolis.",
    ax: 1280,
    ay: 700,
    lx: 920,
    ly: 880,
    demand: "elevated",
    industry: "construction",
    location: "Minneapolis, MN",
  },
  {
    id: "ann-super-industrial",
    jobId: "job-003",
    projectId: "proj-cold",
    title: "Superintendent — Multifamily / Industrial",
    subtitle: "Cold storage · Fargo",
    description:
      "Field leadership for cold-storage expansion: envelope, refrigeration coordination, and Red River Valley logistics.",
    ax: 2280,
    ay: 520,
    lx: 2720,
    ly: 380,
    demand: "high",
    industry: "construction",
    location: "Fargo, ND",
  },
  {
    id: "ann-estimator",
    projectId: "proj-cold",
    title: "Estimator — Industrial",
    subtitle: "Precon · Fargo ND",
    description:
      "Quantity takeoff and bid packages for cold-storage shell and interior fit. Experience with industrial GC pricing preferred.",
    ax: 2420,
    ay: 680,
    lx: 2620,
    ly: 860,
    demand: "elevated",
    industry: "construction",
    location: "Fargo, ND",
  },
];

export function demandStroke(level: DemandLevel): string {
  if (level === "high") return "#e85d2a";
  if (level === "elevated") return "#c97840";
  return "#5a8fad";
}

export function demandLabel(score: number): string {
  if (score >= 9) return "CRITICAL DEMAND";
  if (score >= 7) return "ELEVATED DEMAND";
  return "ACTIVE DEMAND";
}
