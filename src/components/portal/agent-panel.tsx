import { useMemo, useState } from "react";
import { Bot, Copy, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { jobReqs } from "@/lib/data";
import { runDraftAgent, runRankAgent } from "@/lib/agent-engine";
import { useAgentStore } from "@/lib/agent-store";
import { useRosterStore } from "@/lib/roster-store";
import { useLinkedInStore } from "@/lib/linkedin-store";
import { cn } from "@/lib/utils";

export function AgentPanel() {
  const { candidates, source } = useRosterStore();
  const { runs, addRun, clearRuns } = useAgentStore();
  const addLead = useLinkedInStore((s) => s.addLead);
  const openJobs = useMemo(
    () => jobReqs.filter((j) => !j.status || j.status === "open"),
    [],
  );
  const [jobId, setJobId] = useState(openJobs[0]?.id ?? "");
  const job = openJobs.find((j) => j.id === jobId) ?? openJobs[0];
  const [busy, setBusy] = useState(false);

  function runRank() {
    if (!job) return;
    setBusy(true);
    try {
      const run = runRankAgent(candidates, job);
      addRun(run);
      toast.success(run.summary);
    } finally {
      setBusy(false);
    }
  }

  function runDrafts() {
    if (!job) return;
    setBusy(true);
    try {
      const run = runDraftAgent(candidates, job, 5);
      addRun(run);
      toast.success(run.summary);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4 text-primary" />
            Agents
          </CardTitle>
          <CardDescription>
            Local agents — no paid API. Rank uses FitScore; Draft builds LinkedIn
            + email outreach for top fits. Runs on your imported roster (
            {source === "import" ? "imported" : "demo"} · {candidates.length}{" "}
            people).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
              Target requisition
            </label>
            <select
              value={job?.id ?? ""}
              onChange={(e) => setJobId(e.target.value)}
              className="h-11 w-full rounded-md border border-input bg-bg px-3 text-sm"
            >
              {openJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} — {j.company}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              disabled={busy || !job || candidates.length === 0}
              onClick={runRank}
              className="border-0 bg-[#3d8ec4] text-white hover:bg-[#4a9fd4]"
            >
              <Play className="mr-1.5 h-4 w-4" />
              Run rank agent
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy || !job || candidates.length === 0}
              onClick={runDrafts}
            >
              <Play className="mr-1.5 h-4 w-4" />
              Run draft agent
            </Button>
            {runs.length > 0 ? (
              <Button type="button" variant="ghost" onClick={() => clearRuns()}>
                <Trash2 className="mr-1.5 h-4 w-4" />
                Clear history
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {runs.length === 0 ? (
        <p className="text-sm text-muted">
          No agent runs yet. Import an Excel/CSV roster, pick a job, then run Rank
          or Draft.
        </p>
      ) : (
        runs.map((run) => (
          <Card key={run.id} className="border-border bg-surface">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{run.kind}</Badge>
                <CardTitle className="text-sm font-medium">{run.jobTitle}</CardTitle>
              </div>
              <CardDescription className="text-xs">
                {new Date(run.createdAt).toLocaleString()} · {run.summary}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {run.rankings?.map((r, i) => (
                <div
                  key={r.candidateId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-bg px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-mono text-xs text-muted">#{i + 1}</span>{" "}
                    <span className="font-medium">{r.name}</span>
                    <p className="text-xs text-muted">
                      {r.title} · {r.location}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "font-mono font-semibold",
                      r.score >= 70 ? "text-success" : "text-primary",
                    )}
                  >
                    {r.score}
                  </span>
                </div>
              ))}
              {run.drafts?.map((d, idx) => (
                <div
                  key={`${d.candidateId}-${d.channel}-${idx}`}
                  className="rounded border border-border bg-bg p-3 text-sm"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <Badge variant="outline" className="mr-2 capitalize">
                        {d.channel}
                      </Badge>
                      <span className="font-medium">{d.name}</span>
                      <span className="ml-2 font-mono text-xs text-muted">
                        Fit {d.fitScore}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            d.subject ? `${d.subject}\n\n${d.body}` : d.body,
                          );
                          toast.success("Copied draft");
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      {d.channel === "linkedin" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            addLead({
                              name: d.name,
                              title: "",
                              profileUrl: "",
                              notes: `From agent draft · ${run.jobTitle}`,
                              candidateId: d.candidateId,
                              draftMessage: d.body,
                              status: "to-message",
                            });
                            toast.success("Added to LinkedIn queue");
                          }}
                        >
                          → LinkedIn queue
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {d.subject ? (
                    <p className="mb-1 text-xs font-medium text-muted">
                      Subject: {d.subject}
                    </p>
                  ) : null}
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-fg/90">
                    {d.body}
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
