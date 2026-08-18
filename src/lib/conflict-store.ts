import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ConflictHold } from "./conflict-wall";

type ConflictState = {
  holds: ConflictHold[];
  addHold: (input: Omit<ConflictHold, "id" | "createdAt">) => void;
  removeHold: (id: string) => void;
};

export const useConflictStore = create<ConflictState>()(
  persist(
    (set) => ({
      holds: [],
      addHold: (input) =>
        set((s) => ({
          holds: [
            {
              ...input,
              id: `hold-${crypto.randomUUID()}`,
              createdAt: new Date().toISOString(),
            },
            ...s.holds,
          ],
        })),
      removeHold: (id) =>
        set((s) => ({ holds: s.holds.filter((h) => h.id !== id) })),
    }),
    { name: "fitboard-conflict-wall" },
  ),
);
