import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgentRun } from "./agent-engine";

interface AgentState {
  runs: AgentRun[];
  addRun: (run: AgentRun) => void;
  clearRuns: () => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      runs: [],
      addRun: (run) =>
        set((s) => ({
          runs: [run, ...s.runs].slice(0, 40),
        })),
      clearRuns: () => set({ runs: [] }),
    }),
    { name: "mg-agent-runs-v1" },
  ),
);
