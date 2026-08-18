import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  MapPinned,
  Radar,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  Upload,
  Download,
  RotateCcw,
  FileSpreadsheet,
  Bot,
  Linkedin,
} from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentPanel } from "@/components/portal/agent-panel";
import { LinkedInPanel } from "@/components/portal/linkedin-panel";
import { heatMapProjects, jobReqs } from "@/lib/data";
import { rankCandidatesForJob, type FitScoreResult } from "@/lib/fitscore";
import { getBenchAlertSummary } from "@/lib/bench";
import {
  downloadCandidatesTemplate,
  parseRosterFile,
} from "@/lib/import-roster";
import { useRosterStore } from "@/lib/roster-store";
import { SITE, pageHead } from "@/lib/seo";
import { ConflictWallPanel } from "@/components/portal/conflict-wall-panel";
import { useConflictStore } from "@/lib/conflict-store";
import { isConflicted } from "@/lib/conflict-wall";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal")({
  component: PortalPage,
  head: () =>
    pageHead({
      title:
        `Desk | Import · Agents · FitCards · Conflict Wall | ${SITE.name}`,
      description:
        "Recruiter desk: Excel/CSV import, FitScore agents, LinkedIn assist, Conflict Wall, Heat Map, and BenchAlert.",
      path: "/portal",
      noindex: true,
    }),
});

function PortalPage() {
  const { user, isPending } = useCurrentUserState();

  if (isPending) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="h-40 animate-pulse rounded-xl bg-elevated" />
        </div>
      </SiteShell>
    );
  }

  if (!user) {
    return <RedirectToSignIn to="/login" />;
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Portal</p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome{user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Import · Agents · LinkedIn · FitScore · FitCards · Conflict Wall ·
              Bench · Heat Map
            </p>
          </div>
          <Badge variant="outline" className="border-success/40 text-success">
            Signed in
          </Badge>
        </div>

        <RosterImportBar />

        <Tabs defaultValue="agents" className="mt-6 space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="agents" className="gap-2">
              <Bot className="h-4 w-4" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="gap-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </TabsTrigger>
            <TabsTrigger value="fit" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              FitScore
            </TabsTrigger>
            <TabsTrigger value="bench" className="gap-2">
              <Radar className="h-4 w-4" />
              BenchAlert
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="gap-2">
              <MapPinned className="h-4 w-4" />
              Heat Map
            </TabsTrigger>
            <TabsTrigger value="conflicts" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Conflicts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <AgentPanel />
          </TabsContent>
          <TabsContent value="linkedin">
            <LinkedInPanel />
          </TabsContent>
          <TabsContent value="heatmap">
            <HeatMapPanel />
          </TabsContent>
          <TabsContent value="conflicts">
            <ConflictWallPanel />
          </TabsContent>
          <TabsContent value="bench">
            <BenchPanel />
          </TabsContent>
          <TabsContent value="fit">
            <FitScorePanel />
          </TabsContent>
        </Tabs>
      </div>
    </SiteShell>
  );
}

function RosterImportBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const {
    source,
    candidates,
    bench,
    fileName,
    importedAt,
    setFromImport,
    clearImport,
  } = useRosterStore();

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const result = await parseRosterFile(file);
      if (result.candidates.length === 0) {
        const msg =
          result.errors[0]?.message ??
          "No candidates found. Check headers match the template.";
        toast.error(msg);
        if (result.errors.length > 1) {
          toast.message(
            `${result.errors.length} row issues — fix Name column and retry.`,
          );
        }
        return;
      }
      setFromImport(result, { fileName: file.name });
      toast.success(
        `Imported ${result.candidates.length} candidates` +
          (result.bench.length
            ? ` · ${result.bench.length} with end dates for BenchAlert`
            : ""),
      );
      if (result.warnings.length > 0) {
        toast.message(result.warnings.slice(0, 3).join(" · "));
      }
      if (result.skipped > 0) {
        toast.message(`Skipped ${result.skipped} row(s) (see errors).`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not read file. Try CSV UTF-8 from Excel Save As.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Card className="border-border bg-surface">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm font-medium">Candidate roster</p>
            <Badge variant={source === "import" ? "default" : "secondary"}>
              {source === "import" ? "Imported" : "Demo data"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted">
            {source === "import" ? (
              <>
                {candidates.length} candidates
                {bench.length > 0 ? ` · ${bench.length} on bench` : ""}
                {fileName ? (
                  <>
                    {" "}
                    from <span className="text-fg">{fileName}</span>
                  </>
                ) : null}
                {importedAt
                  ? ` · ${new Date(importedAt).toLocaleString()}`
                  : null}
                . Stored in this browser only.
              </>
            ) : (
              <>
                Using demo people. Import <strong>.xlsx</strong> or{" "}
                <strong>.csv</strong> to rank your roster, run agents, and queue
                LinkedIn outreach. Saved in this browser.
              </>
            )}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.tsv,.txt,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/tab-separated-values,text/plain"
            className="sr-only"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            size="sm"
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-1.5 h-4 w-4" />
            {busy ? "Importing…" : "Import Excel / CSV"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              downloadCandidatesTemplate();
              toast.message(
                "Template downloaded — fill in Excel (.xlsx or CSV) then Import.",
              );
            }}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Template
          </Button>
          {source === "import" ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => {
                clearImport();
                toast.message("Restored demo roster.");
              }}
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Clear import
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function demandColor(score: number) {
  if (score >= 8) return "bg-destructive/80";
  if (score >= 6) return "bg-warning/80";
  return "bg-primary/70";
}

function HeatMapPanel() {
  const sorted = useMemo(
    () => [...heatMapProjects].sort((a, b) => b.demandScore - a.demandScore),
    [],
  );
  const byState = useMemo(() => {
    const map = new Map<string, typeof sorted>();
    for (const p of sorted) {
      const list = map.get(p.state) ?? [];
      list.push(p);
      map.set(p.state, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [sorted]);

  return (
    <div className="space-y-6">
      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-base">Regional demand</CardTitle>
          <CardDescription>
            Demo data of active project pressure by city. Darker = higher demand
            score (1–10). Use this to brief clients on scarcity before competitors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-border bg-bg p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {p.city}, {p.state}
                    </p>
                    <p className="text-xs text-muted">{p.name}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 font-mono text-xs font-semibold text-fg",
                      demandColor(p.demandScore),
                    )}
                  >
                    {p.demandScore}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-elevated">
                  <div
                    className={cn("h-full rounded-full", demandColor(p.demandScore))}
                    style={{ width: `${p.demandScore * 10}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(p.roleDemand).map(([role, n]) => (
                    <span
                      key={role}
                      className="rounded border border-border bg-elevated px-1.5 py-0.5 text-[10px] text-muted"
                    >
                      {role} ×{n}
                    </span>
                  ))}
                </div>
                {p.valueMm ? (
                  <p className="mt-2 text-[11px] text-muted">${p.valueMm}M project</p>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {byState.map(([state, projects]) => {
          const avg =
            projects.reduce((s, p) => s + p.demandScore, 0) / projects.length;
          return (
            <Card key={state} className="border-border bg-surface">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{state}</CardTitle>
                <CardDescription className="text-xs">
                  {projects.length} tracked projects · avg demand {avg.toFixed(1)}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function BenchPanel() {
  const { source, bench, fileName } = useRosterStore();
  const asOf = source === "demo" ? "2026-08-05" : new Date().toISOString().slice(0, 10);

  const summary = useMemo(
    () =>
      getBenchAlertSummary(bench, jobReqs, {
        withinDays: 60,
        minScore: 45,
        matchesPerCandidate: 2,
        asOf,
      }),
    [bench, asOf],
  );

  return (
    <div className="space-y-4">
      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-base">BenchAlert</CardTitle>
          <CardDescription>
            Contractors finishing within {summary.withinDays} days of{" "}
            {summary.asOf}, auto-matched to open reqs via FitScore (open algorithm,
            no paid model).
            {source === "import"
              ? " Using End Date rows from your import."
              : " Demo bench roster — import a CSV with End Date to use yours."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.alerts.length === 0 ? (
            <p className="text-sm text-muted">
              {source === "import" && bench.length === 0
                ? "No End Date column in this import — add End Date (YYYY-MM-DD) for BenchAlert, or use the template."
                : "No bench alerts in this window."}
            </p>
          ) : (
            summary.alerts.map((alert) => (
              <div
                key={alert.candidate.id}
                className="rounded-lg border border-border bg-bg p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{alert.candidate.name}</p>
                    <p className="text-sm text-muted">
                      {alert.candidate.currentRole} · {alert.candidate.currentClient}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Ends {alert.endDate} · {alert.daysUntilEnd} days left ·{" "}
                      {alert.candidate.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.daysUntilEnd <= 14 ? (
                      <Badge variant="outline" className="border-warning/50 text-warning">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Soon
                      </Badge>
                    ) : null}
                    <Badge variant="secondary">Best {alert.bestScore}</Badge>
                  </div>
                </div>
                {alert.matches.length > 0 ? (
                  <ul className="mt-3 space-y-2 border-t border-border pt-3">
                    {alert.matches.map((m) => (
                      <li
                        key={m.job.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-sm"
                      >
                        <span>
                          {m.job.title}
                          <span className="text-muted"> · {m.job.company}</span>
                        </span>
                        <span className="font-mono text-primary">{m.fit.score}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-muted">No strong open matches yet.</p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
      <p className="text-xs text-muted">
        {source === "import"
          ? `Roster: ${bench.length} people with end dates${fileName ? ` from ${fileName}` : ""}. FitScore matches run locally.`
          : `Demo bench roster: ${bench.length} people. Import CSV with End Date to replace.`}
      </p>
    </div>
  );
}

function FitScorePanel() {
  const { source, candidates, fileName } = useRosterStore();
  const holds = useConflictStore((s) => s.holds);
  const openJobs = jobReqs.filter((j) => !j.status || j.status === "open");
  const [jobId, setJobId] = useState(openJobs[0]?.id ?? "");
  const job = openJobs.find((j) => j.id === jobId) ?? openJobs[0];

  const ranked = useMemo(() => {
    if (!job) return [] as FitScoreResult[];
    return rankCandidatesForJob(candidates, job);
  }, [job, candidates]);

  return (
    <div className="space-y-4">
      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-base">FitScore Engine</CardTitle>
          <CardDescription>
            Transparent local scoring (skills 30%, title 20%, industry 15%, location
            15%, experience 10%, project types 10%). Pure TypeScript — no API keys.
            Ready to re-rank later with Ollama or another open model.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
              Requisition
            </label>
            <div className="relative">
              <select
                value={job?.id ?? ""}
                onChange={(e) => setJobId(e.target.value)}
                className="h-10 w-full appearance-none rounded-md border border-input bg-bg px-3 pr-9 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {openJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} — {j.company}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>
          </div>

          {job ? (
            <p className="text-sm text-muted">
              Ranking {candidates.length}{" "}
              {source === "import" ? "imported" : "demo"} candidates
              {source === "import" && fileName ? (
                <>
                  {" "}
                  from <span className="text-fg">{fileName}</span>
                </>
              ) : null}{" "}
              for <span className="text-fg">{job.title}</span> in {job.location}.
            </p>
          ) : null}

          {candidates.length === 0 ? (
            <p className="text-sm text-muted">
              No candidates in roster. Import a CSV or restore demo data.
            </p>
          ) : (
            <div className="space-y-2">
              {ranked.map((r, i) => {
                const cand = candidates.find((c) => c.id === r.candidateId);
                if (!cand) return null;
                const blocked = job
                  ? isConflicted(holds, cand.id, job.company)
                  : false;
                return (
                  <details
                    key={r.candidateId}
                    className="group rounded-lg border border-border bg-bg open:bg-elevated/30"
                  >
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted">#{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium">{cand.name}</p>
                          <p className="text-xs text-muted">
                            {cand.title} · {cand.location}
                            {blocked ? " · CONFLICT HOLD" : ""}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "font-mono text-sm font-semibold",
                          r.score >= 80
                            ? "text-success"
                            : r.score >= 60
                              ? "text-primary"
                              : "text-muted",
                        )}
                      >
                        {r.score}
                      </span>
                    </summary>
                    <div className="space-y-3 border-t border-border px-3 py-3 text-sm">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {(
                          [
                            ["Skills", r.breakdown.skills],
                            ["Title", r.breakdown.titleRole],
                            ["Industry", r.breakdown.industry],
                            ["Location", r.breakdown.location],
                            ["Experience", r.breakdown.experience],
                            ["Projects", r.breakdown.projectTypes],
                          ] as const
                        ).map(([label, val]) => (
                          <div
                            key={label}
                            className="rounded border border-border px-2 py-1.5"
                          >
                            <p className="text-[10px] uppercase tracking-wide text-muted">
                              {label}
                            </p>
                            <p className="font-mono text-sm">{val}</p>
                          </div>
                        ))}
                      </div>
                      <ul className="list-inside list-disc space-y-1 text-xs text-muted">
                        {r.reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                      {blocked ? (
                        <p className="text-xs text-[#e85d2a]">
                          On the Conflict Wall for {job?.company}. Do not pitch.
                        </p>
                      ) : null}
                      <Button asChild size="sm" variant="outline">
                        <Link
                          to="/card"
                          search={{
                            job: job?.id ?? "job-001",
                            person: cand.id,
                          }}
                        >
                          Open FitCard
                        </Link>
                      </Button>
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/jobs">View public job board</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <a href={`mailto:${SITE.email}`}>Ask about a score</a>
        </Button>
      </div>
    </div>
  );
}
