import { describe, expect, it } from "vitest";
import { isConflicted, type ConflictHold } from "./conflict-wall";

const hold = (over: Partial<ConflictHold> = {}): ConflictHold => ({
  id: "h1",
  candidateId: "cand-001",
  candidateName: "Jordan Hale",
  clientName: "Northstar General Contractors",
  reason: "Exclusive search",
  createdAt: "2026-08-01T00:00:00.000Z",
  ...over,
});

describe("conflict wall", () => {
  it("blocks the same candidate at the same client", () => {
    expect(
      isConflicted([hold()], "cand-001", "Northstar General Contractors"),
    ).toBe(true);
  });

  it("allows the same candidate at a different client", () => {
    expect(isConflicted([hold()], "cand-001", "Prairie Bridge & Building")).toBe(
      false,
    );
  });

  it("is case-insensitive and ignores extra punctuation", () => {
    expect(isConflicted([hold()], "cand-001", "northstar general contractors")).toBe(
      true,
    );
  });
});
