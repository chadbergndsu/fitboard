import { describe, expect, it } from "vitest";
import { candidates, jobReqs } from "./data";
import { runDraftAgent, runRankAgent } from "./agent-engine";

describe("agent engine", () => {
  it("ranks candidates for a job", () => {
    const job = jobReqs[0]!;
    const run = runRankAgent(candidates, job, 5);
    expect(run.kind).toBe("rank");
    expect(run.rankings?.length).toBeGreaterThan(0);
    expect(run.rankings![0]!.score).toBeGreaterThanOrEqual(
      run.rankings![run.rankings!.length - 1]!.score,
    );
  });

  it("drafts linkedin and email for top fits", () => {
    const job = jobReqs[0]!;
    const run = runDraftAgent(candidates, job, 2);
    expect(run.kind).toBe("draft");
    expect(run.drafts?.length).toBe(4); // 2 people × 2 channels
    expect(run.drafts!.some((d) => d.channel === "linkedin")).toBe(true);
    expect(run.drafts!.some((d) => d.channel === "email" && d.subject)).toBe(
      true,
    );
  });
});
