/**
 * LinkedIn assist — manual CRM-style tracking (no LinkedIn scrape / ToS risk).
 * Paste profile URLs + notes; attach agent drafts; track outreach status.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LinkedInStatus =
  | "queued"
  | "to-message"
  | "messaged"
  | "replied"
  | "passed";

export interface LinkedInLead {
  id: string;
  name: string;
  title: string;
  company?: string;
  location?: string;
  profileUrl: string;
  notes: string;
  status: LinkedInStatus;
  candidateId?: string;
  draftMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface LinkedInState {
  leads: LinkedInLead[];
  addLead: (
    input: Omit<LinkedInLead, "id" | "createdAt" | "updatedAt" | "status"> & {
      status?: LinkedInStatus;
    },
  ) => void;
  updateLead: (id: string, patch: Partial<LinkedInLead>) => void;
  removeLead: (id: string) => void;
  clearLeads: () => void;
}

export const useLinkedInStore = create<LinkedInState>()(
  persist(
    (set) => ({
      leads: [],
      addLead: (input) => {
        const now = new Date().toISOString();
        const lead: LinkedInLead = {
          id: `li-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: input.name,
          title: input.title,
          company: input.company,
          location: input.location,
          profileUrl: input.profileUrl,
          notes: input.notes ?? "",
          status: input.status ?? "queued",
          candidateId: input.candidateId,
          draftMessage: input.draftMessage,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ leads: [lead, ...s.leads] }));
      },
      updateLead: (id, patch) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id
              ? { ...l, ...patch, updatedAt: new Date().toISOString() }
              : l,
          ),
        })),
      removeLead: (id) =>
        set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),
      clearLeads: () => set({ leads: [] }),
    }),
    { name: "mg-linkedin-leads-v1" },
  ),
);
