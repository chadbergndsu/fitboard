/**
 * Conflict Wall — do-not-pitch holds.
 * Boutique desks lose trust when the same PM is sent to two competing GCs.
 */

export type ConflictHold = {
  id: string;
  candidateId: string;
  candidateName: string;
  clientName: string;
  reason: string;
  createdAt: string;
};

export function normalizeClient(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function isConflicted(
  holds: ConflictHold[],
  candidateId: string,
  clientName: string,
): boolean {
  const client = normalizeClient(clientName);
  if (!client) return false;
  return holds.some(
    (h) =>
      h.candidateId === candidateId &&
      (normalizeClient(h.clientName) === client ||
        normalizeClient(h.clientName).includes(client) ||
        client.includes(normalizeClient(h.clientName))),
  );
}

export function holdsForCandidate(
  holds: ConflictHold[],
  candidateId: string,
): ConflictHold[] {
  return holds.filter((h) => h.candidateId === candidateId);
}
