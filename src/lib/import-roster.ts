/**
 * Import candidate rosters from CSV / TSV (Excel → Save As CSV).
 * Pure TypeScript — no paid APIs. Maps flexible headers into FitScore
 * `Candidate` / `BenchCandidate` types for ranking in the portal.
 */

import type { Candidate, Industry } from "./fitscore";
import type { BenchCandidate } from "./data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RawRow = Record<string, string>;

export interface ImportError {
  row: number;
  message: string;
}

export interface ImportResult {
  candidates: Candidate[];
  bench: BenchCandidate[];
  errors: ImportError[];
  warnings: string[];
  skipped: number;
}

export const MAX_IMPORT_ROWS = 2000;

export const CANDIDATE_TEMPLATE_HEADERS = [
  "Name",
  "Title",
  "Skills",
  "Industry",
  "Location",
  "State",
  "Years Experience",
  "Project Types",
  "Email",
  "Phone",
  "Summary",
  "Available Date",
  "End Date",
  "Current Client",
  "Current Role",
  "Bill Rate",
] as const;

// ---------------------------------------------------------------------------
// Header aliases → canonical field
// ---------------------------------------------------------------------------

const FIELD_ALIASES: Record<string, string[]> = {
  name: ["name", "full name", "fullname", "candidate", "candidate name"],
  title: ["title", "role", "job title", "current title", "position"],
  skills: ["skills", "skill", "skill set", "skillset", "keywords", "tags"],
  industry: ["industry", "sector", "vertical", "discipline"],
  location: ["location", "city", "city/state", "city state", "address", "market"],
  state: ["state", "st", "region"],
  yearsExperience: [
    "years experience",
    "years",
    "experience",
    "yrs",
    "yrs experience",
    "years of experience",
    "yoe",
  ],
  projectTypes: [
    "project types",
    "projects",
    "project type",
    "projecttype",
    "project keywords",
  ],
  email: ["email", "e-mail", "email address", "mail"],
  phone: ["phone", "mobile", "cell", "telephone", "phone number"],
  summary: ["summary", "notes", "bio", "about", "comments"],
  availableDate: [
    "available date",
    "available",
    "availability",
    "start date",
    "available on",
  ],
  endDate: [
    "end date",
    "enddate",
    "assignment end",
    "bench date",
    "roll off",
    "roll-off",
    "finish date",
  ],
  currentClient: [
    "current client",
    "client",
    "employer",
    "company",
    "current company",
  ],
  currentRole: ["current role", "current title", "assignment role", "assignment"],
  billRate: ["bill rate", "rate", "billrate", "hourly", "hourly rate"],
};

function buildAliasLookup(): Map<string, string> {
  const map = new Map<string, string>();
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const a of aliases) {
      map.set(normalizeHeader(a), field);
    }
  }
  return map;
}

const ALIAS_LOOKUP = buildAliasLookup();

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

export function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .replace(/[_/]+/g, " ")
    .replace(/\s+/g, " ");
}

export function splitList(value: string): string[] {
  if (!value.trim()) return [];
  // Prefer semicolon (common when skills contain commas); fall back to comma
  const sep = value.includes(";") ? ";" : ",";
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of value.split(sep)) {
    const t = part.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

export function parseIndustry(raw: string): Industry {
  const v = raw.trim().toLowerCase();
  if (!v) return "other";
  if (
    v.includes("construct") ||
    v === "gc" ||
    v === "const" ||
    v.includes("builder") ||
    v.includes("contractor")
  ) {
    return "construction";
  }
  if (
    v.includes("engineer") ||
    v === "eng" ||
    v.includes("structural") ||
    v.includes("mep") ||
    v.includes("civil")
  ) {
    return "engineering";
  }
  if (
    v.includes("architect") ||
    v === "arch" ||
    v.includes("design") ||
    v.includes("aia")
  ) {
    return "architecture";
  }
  if (
    v.includes("account") ||
    v.includes("finance") ||
    v.includes("cpa") ||
    v.includes("controller") ||
    v.includes("bookkeep")
  ) {
    return "accounting";
  }
  if (
    v === "construction" ||
    v === "engineering" ||
    v === "architecture" ||
    v === "accounting" ||
    v === "other"
  ) {
    return v;
  }
  return "other";
}

function parseYears(raw: string): number {
  if (!raw.trim()) return 0;
  const m = raw.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!m) return 0;
  return Math.max(0, Math.round(Number(m[1])));
}

function parseBillRate(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const m = raw.replace(/[$,]/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!m) return undefined;
  return Number(m[1]);
}

/** Normalize dates to YYYY-MM-DD when possible. */
export function normalizeDate(raw: string): string | undefined {
  const v = raw.trim();
  if (!v) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  // M/D/YYYY or MM/DD/YYYY
  const us = v.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (us) {
    const mm = us[1].padStart(2, "0");
    const dd = us[2].padStart(2, "0");
    return `${us[3]}-${mm}-${dd}`;
  }
  const d = new Date(v);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return v; // keep raw; bench may still parse loosely
}

function extractState(location: string, explicit?: string): string | undefined {
  if (explicit?.trim()) {
    const s = explicit.trim().toUpperCase();
    return s.length === 2 ? s : s.slice(0, 2);
  }
  const m = location.match(/\b([A-Z]{2})\b\s*$/);
  if (m) return m[1];
  const m2 = location.match(/,\s*([A-Za-z]{2})\s*$/);
  if (m2) return m2[1].toUpperCase();
  return undefined;
}

/** Simple stable hash for deterministic import ids. */
export function stableId(parts: string[]): string {
  const input = parts.join("|").toLowerCase();
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `import-${(h >>> 0).toString(16)}`;
}

// ---------------------------------------------------------------------------
// CSV / TSV parse (RFC4180-ish)
// ---------------------------------------------------------------------------

export function parseDelimited(text: string, delimiter = ","): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;
  const s = text.replace(/^\uFEFF/, ""); // strip BOM

  while (i < s.length) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === delimiter) {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      // skip completely empty trailing lines
      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      i++;
      continue;
    }
    field += c;
    i++;
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) {
    rows.push(row);
  }
  return rows;
}

export function parseCsv(text: string): string[][] {
  // Detect tab-delimited if more tabs than commas on first line
  const firstLine = text.split(/\r?\n/)[0] ?? "";
  const tabs = (firstLine.match(/\t/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return parseDelimited(text, tabs > commas ? "\t" : ",");
}

export function gridToRawRows(grid: string[][]): RawRow[] {
  if (grid.length === 0) return [];
  const headers = grid[0].map((h) => h.trim());
  const out: RawRow[] = [];
  for (let r = 1; r < grid.length; r++) {
    const cells = grid[r];
    const row: RawRow = {};
    let any = false;
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c] || `col_${c}`;
      const val = (cells[c] ?? "").trim();
      if (val) any = true;
      row[key] = val;
    }
    if (any) out.push(row);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Map rows → candidates
// ---------------------------------------------------------------------------

function rowToFields(raw: RawRow): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const [header, value] of Object.entries(raw)) {
    const field = ALIAS_LOOKUP.get(normalizeHeader(header));
    if (field && value.trim() && !fields[field]) {
      fields[field] = value.trim();
    }
  }
  return fields;
}

export function mapRowsToCandidates(
  rows: RawRow[],
  options: { maxRows?: number } = {},
): ImportResult {
  const maxRows = options.maxRows ?? MAX_IMPORT_ROWS;
  const errors: ImportError[] = [];
  const warnings: string[] = [];
  const candidates: Candidate[] = [];
  const bench: BenchCandidate[] = [];
  let skipped = 0;

  if (rows.length === 0) {
    errors.push({ row: 0, message: "No data rows found (empty file or header only)." });
    return { candidates, bench, errors, warnings, skipped };
  }

  if (rows.length > maxRows) {
    warnings.push(
      `File has ${rows.length} rows; only the first ${maxRows} will be imported.`,
    );
  }

  const slice = rows.slice(0, maxRows);
  const seenIds = new Set<string>();

  for (let i = 0; i < slice.length; i++) {
    const rowNum = i + 2; // 1-based spreadsheet row (header = 1)
    const fields = rowToFields(slice[i]);
    const name = fields.name?.trim();
    if (!name) {
      errors.push({ row: rowNum, message: "Missing required Name." });
      skipped++;
      continue;
    }

    let title = fields.title?.trim() ?? "";
    if (!title) {
      title = "—";
      warnings.push(`Row ${rowNum}: missing Title for "${name}" — used "—".`);
    }

    const skills = splitList(fields.skills ?? "");
    const projectTypes = splitList(fields.projectTypes ?? "");
    const industry = parseIndustry(fields.industry ?? "");
    const location = fields.location?.trim() || "Unknown";
    const state = extractState(location, fields.state);
    const yearsExperience = parseYears(fields.yearsExperience ?? "0");
    const email = fields.email?.trim() || undefined;
    const phone = fields.phone?.trim() || undefined;
    const summary = fields.summary?.trim() || undefined;
    const availableDate = normalizeDate(fields.availableDate ?? "");
    const endDate = normalizeDate(fields.endDate ?? "");

    if (skills.length === 0) {
      warnings.push(`Row ${rowNum}: no skills listed for "${name}".`);
    }

    let id = stableId([email ?? "", name, title, String(rowNum)]);
    if (seenIds.has(id)) {
      id = `${id}-${rowNum}`;
    }
    seenIds.add(id);

    const base: Candidate = {
      id,
      name,
      title,
      skills,
      industry,
      location,
      state,
      yearsExperience,
      projectTypes,
      summary,
      email,
      phone,
      availableDate,
    };

    candidates.push(base);

    if (endDate) {
      bench.push({
        ...base,
        endDate,
        currentClient: fields.currentClient?.trim() || "—",
        currentRole: fields.currentRole?.trim() || title,
        billRate: parseBillRate(fields.billRate ?? ""),
      });
    }
  }

  // Detect if no name column mapped at all
  if (candidates.length === 0 && skipped === slice.length && slice.length > 0) {
    const sampleKeys = Object.keys(slice[0] ?? {}).join(", ");
    warnings.push(
      `No candidates imported. Check headers (expected Name, Title, Skills, …). Found: ${sampleKeys || "(none)"}`,
    );
  }

  return { candidates, bench, errors, warnings, skipped };
}

// ---------------------------------------------------------------------------
// File entry + template
// ---------------------------------------------------------------------------

export function mapCsvTextToCandidates(text: string): ImportResult {
  const grid = parseCsv(text);
  if (grid.length === 0) {
    return {
      candidates: [],
      bench: [],
      errors: [{ row: 0, message: "Empty file." }],
      warnings: [],
      skipped: 0,
    };
  }
  return mapRowsToCandidates(gridToRawRows(grid));
}

/**
 * Parse a user-selected file. Supports .csv / .tsv / .txt and .xlsx (Excel).
 * .xlsx is parsed client-side with read-excel-file (no network, no paid SaaS).
 */
export async function parseRosterFile(file: File): Promise<ImportResult> {
  const name = file.name.toLowerCase();

  // Excel binary
  if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".xlsm")) {
    try {
      const readXlsxFile = (await import("read-excel-file/browser")).default;
      const rows = (await readXlsxFile(file)) as unknown as unknown[][];
      if (!rows.length) {
        return {
          candidates: [],
          bench: [],
          errors: [{ row: 0, message: "Excel sheet is empty." }],
          warnings: [],
          skipped: 0,
        };
      }
      // Convert to string grid then RawRow map
      const grid: string[][] = rows.map((row) =>
        (Array.isArray(row) ? row : []).map((cell) => {
          if (cell == null) return "";
          if (cell instanceof Date) return cell.toISOString().slice(0, 10);
          return String(cell);
        }),
      );
      const result = mapRowsToCandidates(gridToRawRows(grid));
      if (result.candidates.length > 0) {
        result.warnings = [
          `Parsed Excel file "${file.name}" (first sheet).`,
          ...result.warnings,
        ];
      }
      return result;
    } catch (err) {
      return {
        candidates: [],
        bench: [],
        errors: [
          {
            row: 0,
            message:
              err instanceof Error
                ? `Excel parse failed: ${err.message}. Try Save As → CSV UTF-8.`
                : "Excel parse failed. Try Save As → CSV UTF-8.",
          },
        ],
        warnings: [],
        skipped: 0,
      };
    }
  }

  if (
    !name.endsWith(".csv") &&
    !name.endsWith(".tsv") &&
    !name.endsWith(".txt") &&
    file.type &&
    !file.type.includes("csv") &&
    !file.type.includes("text") &&
    !file.type.includes("tab-separated") &&
    !file.type.includes("sheet")
  ) {
    return {
      candidates: [],
      bench: [],
      errors: [
        {
          row: 0,
          message: `Unsupported file type "${file.name}". Use .xlsx, .csv, or .tsv.`,
        },
      ],
      warnings: [],
      skipped: 0,
    };
  }

  const text = await file.text();
  return mapCsvTextToCandidates(text);
}

export function exportCandidatesTemplateCsv(): string {
  const sample1 = [
    "Jordan Hale",
    "Senior Project Manager",
    "Procore; P6; OSHA 30; Change Orders; GMP",
    "construction",
    "Minneapolis, MN",
    "MN",
    "14",
    "healthcare; commercial; renovation",
    "jordan.hale@example.com",
    "(612) 555-0142",
    "GC-side PM with Twin Cities healthcare experience",
    "2026-08-01",
    "2026-08-22",
    "Northstar General Contractors",
    "PM — Tower Fit-Out",
    "95",
  ];
  const sample2 = [
    "Priya Nair",
    "Structural Engineer",
    "RISA; Revit Structure; Steel Design; PE License",
    "engineering",
    "St Paul, MN",
    "MN",
    "9",
    "commercial; industrial; multi-family",
    "priya.nair@example.com",
    "(651) 555-0198",
    "PE with mixed structural experience",
    "2026-09-15",
    "",
    "",
    "",
    "",
  ];
  const lines = [
    CANDIDATE_TEMPLATE_HEADERS.join(","),
    sample1.map(csvEscape).join(","),
    sample2.map(csvEscape).join(","),
  ];
  return lines.join("\n") + "\n";
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Trigger a browser download of the template CSV. */
export function downloadCandidatesTemplate(): void {
  const csv = exportCandidatesTemplateCsv();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mg-candidates-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}
