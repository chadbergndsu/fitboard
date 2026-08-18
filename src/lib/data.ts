/**
 * Seed / demo data for MG Recruiting Source.
 * Construction, engineering, architecture, and accounting talent
 * concentrated in MN and the Upper Midwest.
 */

import type { Candidate, JobReq } from "./fitscore";

// ---------------------------------------------------------------------------
// Candidates (8)
// ---------------------------------------------------------------------------

export const candidates: Candidate[] = [
  {
    id: "cand-001",
    name: "Jordan Hale",
    title: "Senior Project Manager",
    skills: [
      "Procore",
      "P6",
      "MS Project",
      "Change Orders",
      "Subcontractor Management",
      "OSHA 30",
      "GMP",
      "Owner Coordination",
    ],
    industry: "construction",
    location: "Minneapolis, MN",
    state: "MN",
    yearsExperience: 14,
    projectTypes: ["healthcare", "higher-ed", "commercial", "renovation"],
    summary:
      "GC-side PM with deep Twin Cities healthcare and campus renovation experience.",
    email: "jordan.hale@example.com",
    phone: "(612) 555-0142",
    availableDate: "2026-08-01",
  },
  {
    id: "cand-002",
    name: "Priya Nair",
    title: "Structural Engineer",
    skills: [
      "RISA",
      "RAM Structural",
      "AutoCAD",
      "Revit Structure",
      "Steel Design",
      "Concrete Design",
      "PE License",
      "IBC",
    ],
    industry: "engineering",
    location: "St Paul, MN",
    state: "MN",
    yearsExperience: 9,
    projectTypes: ["commercial", "industrial", "bridges", "multi-family"],
    summary:
      "PE with mixed structural experience across commercial and light industrial.",
    email: "priya.nair@example.com",
    phone: "(651) 555-0198",
    availableDate: "2026-09-15",
  },
  {
    id: "cand-003",
    name: "Marcus Berg",
    title: "Field Superintendent",
    skills: [
      "Procore",
      "Safety Leadership",
      "OSHA 30",
      "Concrete",
      "Steel Erection",
      "Schedule Recovery",
      "Trade Coordination",
      "Bluebeam",
    ],
    industry: "construction",
    location: "Fargo, ND",
    state: "ND",
    yearsExperience: 18,
    projectTypes: ["industrial", "warehouse", "cold-storage", "food-processing"],
    summary:
      "Seasoned superintendent for industrial and food-processing builds in ND/MN.",
    email: "marcus.berg@example.com",
    phone: "(701) 555-0117",
    availableDate: "2026-07-20",
  },
  {
    id: "cand-004",
    name: "Elena Soto",
    title: "Project Architect",
    skills: [
      "Revit",
      "SketchUp",
      "Adobe Suite",
      "Code Review",
      "SD/DD/CD",
      "CA Administration",
      "LEED",
      "Spec Writing",
    ],
    industry: "architecture",
    location: "Minneapolis, MN",
    state: "MN",
    yearsExperience: 11,
    projectTypes: ["K-12", "municipal", "libraries", "renovation"],
    summary:
      "Licensed architect focused on K-12 and civic work throughout Minnesota.",
    email: "elena.soto@example.com",
    phone: "(612) 555-0166",
    availableDate: "2026-08-18",
  },
  {
    id: "cand-005",
    name: "Derek Olson",
    title: "Senior Estimator",
    skills: [
      "HeavyBid",
      "Bluebeam",
      "Quantity Takeoff",
      "Conceptual Estimating",
      "Sub Bidding",
      "Excel",
      "Hard Bid",
      "Unit Price",
    ],
    industry: "construction",
    location: "Duluth, MN",
    state: "MN",
    yearsExperience: 12,
    projectTypes: ["DOT", "civil", "municipal", "bridge", "utilities"],
    summary:
      "Heavy civil estimator with MnDOT and municipal utility package experience.",
    email: "derek.olson@example.com",
    phone: "(218) 555-0133",
    availableDate: "2026-10-01",
  },
  {
    id: "cand-006",
    name: "Aisha Rahman",
    title: "Mechanical Engineer",
    skills: [
      "HAP",
      "Revit MEP",
      "AutoCAD",
      "HVAC Design",
      "Plumbing Design",
      "Energy Modeling",
      "PE License",
      "ASHRAE",
    ],
    industry: "engineering",
    location: "Rochester, MN",
    state: "MN",
    yearsExperience: 7,
    projectTypes: ["healthcare", "labs", "commercial", "higher-ed"],
    summary:
      "MEP mechanical designer with healthcare and lab facility experience near Mayo corridor.",
    email: "aisha.rahman@example.com",
    phone: "(507) 555-0184",
    availableDate: "2026-08-25",
  },
  {
    id: "cand-007",
    name: "Tomás Rivera",
    title: "BIM / VDC Manager",
    skills: [
      "Revit",
      "Navisworks",
      "BIM 360",
      "Clash Detection",
      "Dynamo",
      "Laser Scanning",
      "Coordination Meetings",
      "LOD Standards",
    ],
    industry: "construction",
    location: "Eau Claire, WI",
    state: "WI",
    yearsExperience: 8,
    projectTypes: ["healthcare", "commercial", "higher-ed", "renovation"],
    summary:
      "VDC lead comfortable owning model coordination for multi-trade GC teams.",
    email: "tomas.rivera@example.com",
    phone: "(715) 555-0129",
    availableDate: "2026-09-01",
  },
  {
    id: "cand-008",
    name: "Heather Quinn",
    title: "Controller",
    skills: [
      "GAAP",
      "Job Cost Accounting",
      "Sage 300 CRE",
      "WIP",
      "Percent Complete",
      "Cash Flow",
      "Audit Coordination",
      "Excel",
      "CPA",
    ],
    industry: "accounting",
    location: "Sioux Falls, SD",
    state: "SD",
    yearsExperience: 15,
    projectTypes: ["construction-accounting", "contractor-finance", "multi-entity"],
    summary:
      "Construction-focused controller with WIP, bonding, and multi-entity experience.",
    email: "heather.quinn@example.com",
    phone: "(605) 555-0155",
    availableDate: "2026-08-10",
  },
];

// ---------------------------------------------------------------------------
// Job requisitions (5)
// ---------------------------------------------------------------------------

export const jobReqs: JobReq[] = [
  {
    id: "job-001",
    title: "Senior Project Manager — Healthcare",
    company: "Northstar General Contractors",
    requiredSkills: [
      "Procore",
      "P6",
      "Change Orders",
      "Subcontractor Management",
      "GMP",
      "OSHA 30",
    ],
    industry: "construction",
    location: "Minneapolis, MN",
    state: "MN",
    minYearsExperience: 10,
    preferredYearsExperience: 12,
    projectTypes: ["healthcare", "renovation", "commercial"],
    description:
      "Lead $40–80M healthcare renovations and ambulatory builds across the Twin Cities.",
    status: "open",
    salaryRange: "$130k–$155k + bonus",
  },
  {
    id: "job-002",
    title: "Structural Engineer (PE)",
    company: "Prairie Bridge & Building",
    requiredSkills: [
      "RISA",
      "Revit Structure",
      "Steel Design",
      "Concrete Design",
      "PE License",
      "AutoCAD",
    ],
    industry: "engineering",
    location: "St Paul, MN",
    state: "MN",
    minYearsExperience: 6,
    preferredYearsExperience: 8,
    projectTypes: ["commercial", "industrial", "multi-family"],
    description:
      "Design and seal structural packages for mid-rise commercial and industrial clients.",
    status: "open",
    salaryRange: "$95k–$120k",
  },
  {
    id: "job-003",
    title: "Field Superintendent — Industrial",
    company: "Red River Builders",
    requiredSkills: [
      "Procore",
      "Safety Leadership",
      "OSHA 30",
      "Trade Coordination",
      "Schedule Recovery",
      "Steel Erection",
    ],
    industry: "construction",
    location: "Fargo, ND",
    state: "ND",
    minYearsExperience: 12,
    preferredYearsExperience: 15,
    projectTypes: ["industrial", "food-processing", "warehouse"],
    description:
      "Own field execution for food-processing and warehouse expansions in the Red River Valley.",
    status: "open",
    salaryRange: "$115k–$140k + per diem",
  },
  {
    id: "job-004",
    title: "Project Architect — K-12",
    company: "Lakeside Design Group",
    requiredSkills: [
      "Revit",
      "SD/DD/CD",
      "CA Administration",
      "Code Review",
      "LEED",
      "Spec Writing",
    ],
    industry: "architecture",
    location: "Minneapolis, MN",
    state: "MN",
    minYearsExperience: 8,
    preferredYearsExperience: 10,
    projectTypes: ["K-12", "municipal", "renovation"],
    description:
      "Drive K-12 and civic design from SD through CA for Minnesota school districts.",
    status: "open",
    salaryRange: "$100k–$125k",
  },
  {
    id: "job-005",
    title: "Construction Controller",
    company: "Heartland Specialty Contractors",
    requiredSkills: [
      "Job Cost Accounting",
      "WIP",
      "Percent Complete",
      "Sage 300 CRE",
      "GAAP",
      "CPA",
    ],
    industry: "accounting",
    location: "Sioux Falls, SD",
    state: "SD",
    minYearsExperience: 10,
    preferredYearsExperience: 12,
    projectTypes: ["construction-accounting", "contractor-finance"],
    description:
      "Own job-cost, WIP, and bonding packages for a growing specialty contractor.",
    status: "open",
    salaryRange: "$110k–$135k",
  },
];

// ---------------------------------------------------------------------------
// Heat Map projects (12) — role demand by city
// ---------------------------------------------------------------------------

export type HeatMapRole =
  | "Project Manager"
  | "Superintendent"
  | "Structural Engineer"
  | "MEP Engineer"
  | "Architect"
  | "Estimator"
  | "BIM/VDC"
  | "Controller / Accounting";

export interface HeatMapProject {
  id: string;
  name: string;
  city: string;
  state: string;
  /** Primary industry vertical. */
  industry: "construction" | "engineering" | "architecture" | "accounting";
  /** Relative demand 1–10 for heat map intensity. */
  demandScore: number;
  /** Open seats by role title. */
  roleDemand: Partial<Record<HeatMapRole, number>>;
  projectType: string;
  valueMm?: number;
  notes?: string;
}

export const heatMapProjects: HeatMapProject[] = [
  {
    id: "hm-001",
    name: "North Loop Medical Pavilion",
    city: "Minneapolis",
    state: "MN",
    industry: "construction",
    demandScore: 9,
    roleDemand: {
      "Project Manager": 2,
      Superintendent: 2,
      "BIM/VDC": 1,
      "MEP Engineer": 1,
    },
    projectType: "healthcare",
    valueMm: 78,
    notes: "Phased ambulatory + OR renovation; aggressive schedule.",
  },
  {
    id: "hm-002",
    name: "Red River Cold Storage Expansion",
    city: "Fargo",
    state: "ND",
    industry: "construction",
    demandScore: 8,
    roleDemand: {
      Superintendent: 2,
      "Project Manager": 1,
      Estimator: 1,
    },
    projectType: "cold-storage",
    valueMm: 42,
  },
  {
    id: "hm-003",
    name: "Lake Superior Port Terminal Upgrade",
    city: "Duluth",
    state: "MN",
    industry: "engineering",
    demandScore: 7,
    roleDemand: {
      "Structural Engineer": 2,
      Estimator: 1,
      "Project Manager": 1,
    },
    projectType: "civil",
    valueMm: 55,
    notes: "Marine / heavy civil with seasonal constraints.",
  },
  {
    id: "hm-004",
    name: "Mayo Corridor Lab Fit-Out",
    city: "Rochester",
    state: "MN",
    industry: "engineering",
    demandScore: 8,
    roleDemand: {
      "MEP Engineer": 3,
      "Project Manager": 1,
      Architect: 1,
    },
    projectType: "labs",
    valueMm: 31,
  },
  {
    id: "hm-005",
    name: "Sioux Empire Food Plant Phase 2",
    city: "Sioux Falls",
    state: "SD",
    industry: "construction",
    demandScore: 7,
    roleDemand: {
      Superintendent: 1,
      "Project Manager": 1,
      "Controller / Accounting": 1,
    },
    projectType: "food-processing",
    valueMm: 36,
  },
  {
    id: "hm-006",
    name: "Capitol Area Civic Annex",
    city: "St Paul",
    state: "MN",
    industry: "architecture",
    demandScore: 6,
    roleDemand: {
      Architect: 2,
      "Structural Engineer": 1,
      "BIM/VDC": 1,
    },
    projectType: "municipal",
    valueMm: 28,
  },
  {
    id: "hm-007",
    name: "Chippewa Valley High School Addition",
    city: "Eau Claire",
    state: "WI",
    industry: "architecture",
    demandScore: 6,
    roleDemand: {
      Architect: 1,
      "Project Manager": 1,
      "MEP Engineer": 1,
    },
    projectType: "K-12",
    valueMm: 22,
  },
  {
    id: "hm-008",
    name: "Bismarck Energy Services HQ",
    city: "Bismarck",
    state: "ND",
    industry: "construction",
    demandScore: 5,
    roleDemand: {
      "Project Manager": 1,
      Superintendent: 1,
      Estimator: 1,
    },
    projectType: "commercial",
    valueMm: 19,
  },
  {
    id: "hm-009",
    name: "Twin Cities Mixed-Use Tower — Structure",
    city: "Minneapolis",
    state: "MN",
    industry: "engineering",
    demandScore: 9,
    roleDemand: {
      "Structural Engineer": 3,
      "BIM/VDC": 1,
      "Project Manager": 1,
    },
    projectType: "commercial",
    valueMm: 120,
  },
  {
    id: "hm-010",
    name: "MnDOT District 1 Bridge Package",
    city: "Duluth",
    state: "MN",
    industry: "construction",
    demandScore: 7,
    roleDemand: {
      Estimator: 2,
      "Project Manager": 1,
      "Structural Engineer": 1,
    },
    projectType: "DOT",
    valueMm: 48,
  },
  {
    id: "hm-011",
    name: "East Metro Warehouse District",
    city: "St Paul",
    state: "MN",
    industry: "construction",
    demandScore: 6,
    roleDemand: {
      Superintendent: 2,
      "Project Manager": 1,
      "Controller / Accounting": 1,
    },
    projectType: "warehouse",
    valueMm: 33,
  },
  {
    id: "hm-012",
    name: "Prairie Healthcare ASC",
    city: "Sioux Falls",
    state: "SD",
    industry: "engineering",
    demandScore: 7,
    roleDemand: {
      "MEP Engineer": 2,
      Architect: 1,
      "Project Manager": 1,
    },
    projectType: "healthcare",
    valueMm: 27,
  },
];

// ---------------------------------------------------------------------------
// Bench candidates (6) — finishing assignments, used by BenchAlert
// ---------------------------------------------------------------------------

export interface BenchCandidate extends Candidate {
  /** ISO date the current assignment ends. */
  endDate: string;
  currentClient: string;
  currentRole: string;
  /** Optional bill rate for bench planning demos. */
  billRate?: number;
}

export const benchCandidates: BenchCandidate[] = [
  {
    id: "bench-001",
    name: "Kevin Lund",
    title: "Project Manager",
    skills: [
      "Procore",
      "MS Project",
      "Change Orders",
      "Owner Coordination",
      "OSHA 30",
      "GMP",
    ],
    industry: "construction",
    location: "Minneapolis, MN",
    state: "MN",
    yearsExperience: 11,
    projectTypes: ["healthcare", "commercial", "renovation"],
    summary: "Rolling off a hospital tower fit-out in midtown Minneapolis.",
    email: "kevin.lund@example.com",
    endDate: "2026-08-22",
    currentClient: "Northstar General Contractors",
    currentRole: "PM — Tower Fit-Out",
    billRate: 95,
  },
  {
    id: "bench-002",
    name: "Sara Jensen",
    title: "Structural Engineer",
    skills: [
      "RISA",
      "RAM Structural",
      "Revit Structure",
      "Steel Design",
      "PE License",
      "IBC",
    ],
    industry: "engineering",
    location: "St Paul, MN",
    state: "MN",
    yearsExperience: 8,
    projectTypes: ["commercial", "multi-family", "industrial"],
    summary: "PE finishing design package for a mid-rise mixed-use structure.",
    email: "sara.jensen@example.com",
    endDate: "2026-08-14",
    currentClient: "Prairie Bridge & Building",
    currentRole: "SE — Mixed-Use Tower",
    billRate: 88,
  },
  {
    id: "bench-003",
    name: "Noah Pedersen",
    title: "Field Superintendent",
    skills: [
      "Procore",
      "Safety Leadership",
      "OSHA 30",
      "Trade Coordination",
      "Concrete",
      "Schedule Recovery",
    ],
    industry: "construction",
    location: "Fargo, ND",
    state: "ND",
    yearsExperience: 16,
    projectTypes: ["industrial", "warehouse", "food-processing"],
    summary: "Industrial super wrapping a cold-storage shell in West Fargo.",
    email: "noah.pedersen@example.com",
    endDate: "2026-09-05",
    currentClient: "Red River Builders",
    currentRole: "Super — Cold Storage",
    billRate: 92,
  },
  {
    id: "bench-004",
    name: "Mia Chen",
    title: "Project Architect",
    skills: [
      "Revit",
      "SD/DD/CD",
      "CA Administration",
      "Code Review",
      "LEED",
      "SketchUp",
    ],
    industry: "architecture",
    location: "Minneapolis, MN",
    state: "MN",
    yearsExperience: 10,
    projectTypes: ["K-12", "municipal", "libraries"],
    summary: "Closing CA on a suburban elementary school addition.",
    email: "mia.chen@example.com",
    endDate: "2026-08-28",
    currentClient: "Lakeside Design Group",
    currentRole: "PA — Elementary Addition",
    billRate: 85,
  },
  {
    id: "bench-005",
    name: "Owen Briggs",
    title: "Senior Estimator",
    skills: [
      "HeavyBid",
      "Bluebeam",
      "Quantity Takeoff",
      "Hard Bid",
      "Unit Price",
      "Sub Bidding",
    ],
    industry: "construction",
    location: "Duluth, MN",
    state: "MN",
    yearsExperience: 13,
    projectTypes: ["DOT", "civil", "bridge", "municipal"],
    summary: "Heavy civil estimator free after MnDOT bid season peak.",
    email: "owen.briggs@example.com",
    endDate: "2026-10-12",
    currentClient: "North Shore Civil",
    currentRole: "Estimator — Bridge Package",
    billRate: 80,
  },
  {
    id: "bench-006",
    name: "Grace Okonkwo",
    title: "Staff Accountant — Job Cost",
    skills: [
      "Job Cost Accounting",
      "WIP",
      "Percent Complete",
      "Sage 300 CRE",
      "GAAP",
      "Excel",
    ],
    industry: "accounting",
    location: "Sioux Falls, SD",
    state: "SD",
    yearsExperience: 6,
    projectTypes: ["construction-accounting", "contractor-finance"],
    summary: "Job-cost accountant rolling off a specialty contractor engagement.",
    email: "grace.okonkwo@example.com",
    endDate: "2026-08-18",
    currentClient: "Heartland Specialty Contractors",
    currentRole: "Job Cost Accountant",
    billRate: 72,
  },
];

/** Convenience lookup maps. */
export const candidateById = Object.fromEntries(
  candidates.map((c) => [c.id, c]),
) as Record<string, Candidate>;

export const jobById = Object.fromEntries(jobReqs.map((j) => [j.id, j])) as Record<
  string,
  JobReq
>;

export const benchById = Object.fromEntries(
  benchCandidates.map((c) => [c.id, c]),
) as Record<string, BenchCandidate>;
