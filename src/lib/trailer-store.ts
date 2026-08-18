import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_TRAILER_ORDER,
  normalizeOrder,
  type TrailerId,
} from "./trailer-yard";

interface TrailerYardState {
  order: TrailerId[];
  expandedId: TrailerId | null;
  setExpanded: (id: TrailerId | null) => void;
  toggleExpanded: (id: TrailerId) => void;
  moveTrailer: (fromIndex: number, toIndex: number) => void;
  resetLayout: () => void;
}

export const useTrailerYardStore = create<TrailerYardState>()(
  persist(
    (set, get) => ({
      order: [...DEFAULT_TRAILER_ORDER],
      expandedId: null,
      setExpanded: (id) => set({ expandedId: id }),
      toggleExpanded: (id) =>
        set({ expandedId: get().expandedId === id ? null : id }),
      moveTrailer: (fromIndex, toIndex) => {
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
        const order = [...get().order];
        if (fromIndex >= order.length || toIndex >= order.length) return;
        const [item] = order.splice(fromIndex, 1);
        order.splice(toIndex, 0, item);
        set({ order });
      },
      resetLayout: () =>
        set({ order: [...DEFAULT_TRAILER_ORDER], expandedId: null }),
    }),
    {
      name: "mg-trailer-yard-v1",
      partialize: (s) => ({ order: s.order }),
      merge: (persisted, current) => {
        const p = persisted as { order?: string[] } | undefined;
        if (!p?.order) return current;
        return {
          ...current,
          order: normalizeOrder(p.order),
        };
      },
    },
  ),
);
