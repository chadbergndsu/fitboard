import { useMemo, useState } from "react";
import { ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { jobReqs } from "@/lib/data";
import { useConflictStore } from "@/lib/conflict-store";
import { useRosterStore } from "@/lib/roster-store";
import { candidates as seedCandidates } from "@/lib/data";

export function ConflictWallPanel() {
  const holds = useConflictStore((s) => s.holds);
  const addHold = useConflictStore((s) => s.addHold);
  const removeHold = useConflictStore((s) => s.removeHold);
  const imported = useRosterStore((s) => s.candidates);

  const people = useMemo(() => {
    const map = new Map(seedCandidates.map((c) => [c.id, c]));
    for (const c of imported) map.set(c.id, c);
    return [...map.values()];
  }, [imported]);

  const clients = useMemo(
    () => [...new Set(jobReqs.map((j) => j.company))].sort(),
    [],
  );

  const [candidateId, setCandidateId] = useState(people[0]?.id ?? "");
  const [clientName, setClientName] = useState(clients[0] ?? "");
  const [reason, setReason] = useState("Exclusive / already submitted");

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    const person = people.find((p) => p.id === candidateId);
    if (!person || !clientName.trim()) {
      toast.error("Pick a person and a client.");
      return;
    }
    addHold({
      candidateId: person.id,
      candidateName: person.name,
      clientName: clientName.trim(),
      reason: reason.trim() || "Do not pitch",
    });
    toast.success(`Hold set: ${person.name} ↔ ${clientName.trim()}`);
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4 text-[#e85d2a]" />
            Conflict Wall
          </CardTitle>
          <CardDescription>
            Do-not-pitch holds. If a candidate is already in play at a GC, they
            stay off that client’s shortlist. This is the thing that keeps desks
            from burning both sides.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={onAdd}>
            <div className="space-y-1.5">
              <Label htmlFor="cw-person">Talent</Label>
              <select
                id="cw-person"
                className="h-10 w-full rounded-md border border-input bg-bg px-3 text-sm"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cw-client">Client</Label>
              <Input
                id="cw-client"
                list="cw-clients"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client / GC"
              />
              <datalist id="cw-clients">
                {clients.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cw-reason">Reason</Label>
              <Input
                id="cw-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <Button type="submit" className="sm:w-auto">
              Add hold
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-base">Active holds</CardTitle>
          <CardDescription>
            {holds.length === 0
              ? "No holds yet — the wall is clear."
              : `${holds.length} active`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {holds.map((h) => (
            <div
              key={h.id}
              className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">
                  {h.candidateName}{" "}
                  <span className="text-muted">↔ {h.clientName}</span>
                </p>
                <p className="text-xs text-muted">{h.reason}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeHold(h.id)}
                aria-label="Remove hold"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
