import { describe, expect, it } from "vitest";
import {
  boardPointForLocation,
  cityIdFromLocation,
  offsetPoint,
} from "./war-room-geo";

describe("war-room-geo", () => {
  it("maps Twin Cities and regional cities", () => {
    expect(cityIdFromLocation("Minneapolis, MN")).toBe("minneapolis");
    expect(cityIdFromLocation("St Paul, MN")).toBe("st-paul");
    expect(cityIdFromLocation("Lakeville, MN")).toBe("lakeville");
    expect(cityIdFromLocation("Fargo, ND")).toBe("fargo");
    expect(cityIdFromLocation("Sioux Falls, SD")).toBe("sioux-falls");
  });

  it("returns a board point for a location", () => {
    const p = boardPointForLocation("St. Paul, MN");
    expect(p.label).toBe("St. Paul");
    expect(p.x).toBeGreaterThan(40);
  });

  it("jitters stacked people off the same pin", () => {
    const base = boardPointForLocation("Minneapolis, MN");
    const a = offsetPoint(base, "cand-001");
    const b = offsetPoint(base, "cand-009");
    expect(a.x === b.x && a.y === b.y).toBe(false);
  });
});
