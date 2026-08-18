import { describe, expect, it } from "vitest";
import { rankCandidatesForJob } from "./fitscore";
import { jobReqs } from "./data";
import {
  exportCandidatesTemplateCsv,
  mapCsvTextToCandidates,
  mapRowsToCandidates,
  normalizeDate,
  normalizeHeader,
  parseCsv,
  parseIndustry,
  splitList,
  stableId,
} from "./import-roster";

describe("parseCsv", () => {
  it("parses simple and quoted fields", () => {
    const grid = parseCsv(
      'Name,Title,Skills\n"Hale, Jordan",PM,"Procore, P6"\nPriya,SE,RISA\n',
    );
    expect(grid).toHaveLength(3);
    expect(grid[1][0]).toBe("Hale, Jordan");
    expect(grid[1][2]).toBe("Procore, P6");
    expect(grid[2][0]).toBe("Priya");
  });

  it("detects TSV", () => {
    const grid = parseCsv("Name\tTitle\nA\tB\n");
    expect(grid[0]).toEqual(["Name", "Title"]);
    expect(grid[1]).toEqual(["A", "B"]);
  });
});

describe("normalize helpers", () => {
  it("normalizes headers", () => {
    expect(normalizeHeader("  Years_Experience ")).toBe("years experience");
  });

  it("splits skills on semicolon preferentially", () => {
    expect(splitList("Procore; P6, advanced; OSHA 30")).toEqual([
      "Procore",
      "P6, advanced",
      "OSHA 30",
    ]);
  });

  it("maps industries fuzzily", () => {
    expect(parseIndustry("GC / Construction")).toBe("construction");
    expect(parseIndustry("Structural Eng")).toBe("engineering");
    expect(parseIndustry("Architecture & Design")).toBe("architecture");
    expect(parseIndustry("CPA / Finance")).toBe("accounting");
    expect(parseIndustry("")).toBe("other");
  });

  it("normalizes dates", () => {
    expect(normalizeDate("2026-08-22")).toBe("2026-08-22");
    expect(normalizeDate("8/22/2026")).toBe("2026-08-22");
  });

  it("stableId is deterministic", () => {
    expect(stableId(["a", "b"])).toBe(stableId(["a", "b"]));
    expect(stableId(["a", "b"])).not.toBe(stableId(["a", "c"]));
  });
});

describe("mapCsvTextToCandidates", () => {
  it("imports candidates and bench rows with end dates", () => {
    const csv = exportCandidatesTemplateCsv();
    const result = mapCsvTextToCandidates(csv);
    expect(result.errors).toEqual([]);
    expect(result.candidates).toHaveLength(2);
    expect(result.candidates[0].name).toBe("Jordan Hale");
    expect(result.candidates[0].skills).toContain("Procore");
    expect(result.candidates[0].industry).toBe("construction");
    expect(result.bench).toHaveLength(1);
    expect(result.bench[0].endDate).toBe("2026-08-22");
    expect(result.bench[0].currentClient).toContain("Northstar");
  });

  it("skips rows without name and records errors", () => {
    const result = mapCsvTextToCandidates(
      "Name,Title,Skills\n,PM,Procore\nValid Person,SE,RISA\n",
    );
    expect(result.candidates).toHaveLength(1);
    expect(result.skipped).toBe(1);
    expect(result.errors.some((e) => e.message.includes("Name"))).toBe(true);
  });

  it("handles empty file", () => {
    const result = mapCsvTextToCandidates("");
    expect(result.candidates).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("ranks imported candidates with FitScore", () => {
    const result = mapCsvTextToCandidates(exportCandidatesTemplateCsv());
    const job = jobReqs.find((j) => j.id === "job-001")!;
    const ranked = rankCandidatesForJob(result.candidates, job);
    expect(ranked).toHaveLength(2);
    expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score);
    // Healthcare PM should score high against healthcare PM req
    const jordan = ranked.find(
      (r) => r.candidateId === result.candidates[0].id,
    );
    expect(jordan).toBeDefined();
    expect(jordan!.score).toBeGreaterThan(40);
  });

  it("maps flexible header aliases", () => {
    const result = mapRowsToCandidates([
      {
        "Full Name": "Alex Test",
        Role: "Estimator",
        Keywords: "Excel; Takeoff; Bluebeam",
        Sector: "const",
        City: "Fargo, ND",
        Yrs: "12",
        Projects: "industrial",
      },
    ]);
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].title).toBe("Estimator");
    expect(result.candidates[0].industry).toBe("construction");
    expect(result.candidates[0].skills).toContain("Bluebeam");
    expect(result.candidates[0].yearsExperience).toBe(12);
  });
});
