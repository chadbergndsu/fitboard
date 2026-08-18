/**
 * Portal roster state — demo seeds or client-imported CSV.
 * Persists import in localStorage (browser-only; no SaaS).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Candidate } from "./fitscore";
import {
  benchCandidates as demoBench,
  candidates as demoCandidates,
  type BenchCandidate,
} from "./data";
import type { ImportResult } from "./import-roster";

export type RosterSource = "demo" | "import";

export interface RosterState {
  source: RosterSource;
  candidates: Candidate[];
  bench: BenchCandidate[];
  importedAt: string | null;
  fileName: string | null;
  lastWarnings: string[];
  lastErrors: { row: number; message: string }[];
  setFromImport: (result: ImportResult, meta: { fileName: string }) => void;
  clearImport: () => void;
}

const demoState = (): Pick<
  RosterState,
  | "source"
  | "candidates"
  | "bench"
  | "importedAt"
  | "fileName"
  | "lastWarnings"
  | "lastErrors"
> => ({
  source: "demo",
  candidates: demoCandidates,
  bench: demoBench,
  importedAt: null,
  fileName: null,
  lastWarnings: [],
  lastErrors: [],
});

export const useRosterStore = create<RosterState>()(
  persist(
    (set) => ({
      ...demoState(),

      setFromImport: (result, meta) => {
        if (result.candidates.length === 0) {
          set({
            lastWarnings: result.warnings,
            lastErrors: result.errors,
          });
          return;
        }
        set({
          source: "import",
          candidates: result.candidates,
          // Prefer explicit bench rows; if none, demo bench is wrong for import —
          // leave empty so BenchAlert shows "none" rather than mixing demo people.
          bench: result.bench,
          importedAt: new Date().toISOString(),
          fileName: meta.fileName,
          lastWarnings: result.warnings,
          lastErrors: result.errors,
        });
      },

      clearImport: () => set(demoState()),
    }),
    {
      name: "mg-roster-v1",
      partialize: (s) => ({
        source: s.source,
        candidates: s.candidates,
        bench: s.bench,
        importedAt: s.importedAt,
        fileName: s.fileName,
      }),
      // If storage is corrupt, fall back to demo
      merge: (persisted, current) => {
        const p = persisted as Partial<RosterState> | undefined;
        if (!p || p.source !== "import" || !Array.isArray(p.candidates)) {
          return { ...current, ...demoState() };
        }
        return {
          ...current,
          source: "import" as const,
          candidates: p.candidates as Candidate[],
          bench: (p.bench as BenchCandidate[]) ?? [],
          importedAt: p.importedAt ?? null,
          fileName: p.fileName ?? null,
        };
      },
    },
  ),
);
