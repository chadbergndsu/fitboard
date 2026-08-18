import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Phone } from "lucide-react";
import { SITE } from "@/lib/seo";
import { candidates, benchCandidates, jobReqs } from "@/lib/data";
import { rankCandidatesForJob, type Candidate, type JobReq } from "@/lib/fitscore";
import {
  BOARD_CITIES,
  boardPointForLocation,
  offsetPoint,
} from "@/lib/war-room-geo";
import { cn } from "@/lib/utils";

type Phase = "idle" | "req" | "scan" | "rank" | "lock" | "placed";

const CYCLE_MS = 16000;

function phaseAt(t: number): Phase {
  if (t < 1200) return "idle";
  if (t < 2800) return "req";
  if (t < 5200) return "scan";
  if (t < 8000) return "rank";
  if (t < 11000) return "lock";
  return "placed";
}

function industryColor(industry: string): string {
  if (industry === "construction") return "#e85d2a";
  if (industry === "engineering") return "#3d8ec4";
  if (industry === "architecture") return "#c4a35a";
  if (industry === "accounting") return "#5baf8a";
  return "#8b9bb0";
}

export function PlacementWarRoom() {
  const people = useMemo(() => {
    const map = new Map<string, Candidate>();
    for (const c of candidates) map.set(c.id, c);
    for (const b of benchCandidates) {
      if (!map.has(b.id)) map.set(b.id, b);
    }
    return [...map.values()];
  }, []);

  const jobs = useMemo(
    () => jobReqs.filter((j) => !j.status || j.status === "open"),
    [],
  );

  const [jobIndex, setJobIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [pausedOnJob, setPausedOnJob] = useState(false);
  const [runKey, setRunKey] = useState(0);

  const job = jobs[jobIndex] ?? jobs[0];
  const phase = phaseAt(elapsed);

  const ranked = useMemo(() => {
    if (!job) return [];
    return rankCandidatesForJob(people, job).slice(0, 4);
  }, [people, job]);

  const winner = ranked[0];
  const winnerPerson = people.find((p) => p.id === winner?.candidateId);

  useEffect(() => {
    let start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      let t = now - start;
      if (t >= CYCLE_MS) {
        start = now;
        t = 0;
        setJobIndex((i) => {
          if (pausedOnJob) return i;
          return (i + 1) % Math.max(jobs.length, 1);
        });
      }
      setElapsed(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [jobs.length, pausedOnJob, jobIndex, runKey]);

  const jobPt = job ? boardPointForLocation(job.location) : BOARD_CITIES[0];
  const winnerPt = winnerPerson
    ? offsetPoint(boardPointForLocation(winnerPerson.location), winnerPerson.id)
    : jobPt;

  const shownRank =
    phase === "scan"
      ? ranked.slice(0, Math.min(4, 1 + Math.floor((elapsed - 2800) / 600)))
      : ranked;

  const scoreDisplay = (() => {
    if (!winner) return 0;
    if (phase === "lock") {
      const p = Math.min(1, (elapsed - 8000) / 1400);
      return Math.round(winner.score * p);
    }
    if (phase === "placed") return winner.score;
    return 0;
  })();

  function pickJob(i: number) {
    setPausedOnJob(true);
    setJobIndex(i);
    setRunKey((k) => k + 1);
    setElapsed(0);
  }

  return (
    <div className="relative isolate min-h-[calc(100dvh-var(--grok-banner-h,0px))] overflow-hidden bg-[#05070b] text-[#f3efe6]">
      <div className="pointer-events-none absolute inset-0">
        <img
          src="/war-room/boardroom.jpg"
          alt=""
          className="war-room-ken h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070b]/92 via-[#05070b]/72 to-[#05070b]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-transparent to-[#05070b]/55" />
        <div className="war-room-grain absolute inset-0 opacity-[0.18]" />
      </div>

      <header className="relative z-20 flex items-center justify-between gap-3 px-4 py-4 sm:px-7">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <span className="grid h-10 w-10 place-items-center rounded-sm bg-[#e85d2a] text-[13px] font-bold tracking-[0.12em] text-white">
            {SITE.mark}
          </span>
          <span>
            <span className="block font-display text-[15px] leading-none tracking-tight text-[#f3efe6] sm:text-base">
              {SITE.name}
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.22em] text-[#b8a78a]">
              {SITE.recruiterTitle} · Twin Cities desk
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden rounded-sm border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#d7cbb8] no-underline hover:border-white/30 sm:inline-block"
          >
            Sign in
          </Link>
          <Link
            to="/portal"
            className="rounded-sm bg-[#e85d2a] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white no-underline hover:bg-[#f06a38]"
          >
            Open the board
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-[1400px] gap-6 px-4 pb-10 pt-2 sm:px-7 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:items-end lg:gap-10 lg:pt-4">
        <section className="max-w-xl pb-2">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e85d2a]/40 bg-[#e85d2a]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-[#f0a57a]">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full bg-[#5baf8a]",
                phase !== "idle" && "animate-pulse",
              )}
            />
            Twin Cities talent board · live
          </p>
          <h1 className="font-display text-[2.35rem] leading-[0.95] tracking-[-0.03em] text-[#f7f1e6] sm:text-6xl lg:text-[4.25rem]">
            Constructing
            <br />
            <em className="italic text-[#e8c9a0]">dreams.</em>
            <br />
            Strengthening
            <br />
            teams.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[#c9c0b0] sm:text-base">
            This is how a desk fills a seat. A client opens a req. The board
            finds who is actually ready across Minneapolis–St. Paul. FitScore
            locks the match. The rest is a phone call.
          </p>

          <dl className="mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
            <Stat label="Ready talent" value={String(people.length)} />
            <Stat label="Open seats" value={String(jobs.length)} />
            <Stat
              label="This fill"
              value={
                phase === "lock" || phase === "placed"
                  ? String(scoreDisplay)
                  : "—"
              }
              hint={
                phase === "placed"
                  ? "FitScore · locked"
                  : phase === "lock"
                    ? "FitScore"
                    : "watching"
              }
            />
          </dl>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => pickJob(jobIndex)}
              className="rounded-sm border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-[#f3efe6] hover:bg-white/10"
            >
              Replay this fill
            </button>
            <Link
              to="/portal"
              className="rounded-sm bg-[#e85d2a] px-4 py-3 text-center text-sm font-semibold text-white no-underline hover:bg-[#f06a38]"
            >
              Work the real roster
            </Link>
            <a
              href={`tel:${SITE.phoneE164}`}
              className="inline-flex items-center justify-center gap-2 rounded-sm px-4 py-3 text-sm text-[#d7cbb8] no-underline hover:text-white"
            >
              <Phone className="h-4 w-4" />
              {SITE.phone}
            </a>
          </div>
        </section>

        <section className="relative">
          <div className="overflow-hidden rounded-sm border border-white/12 bg-[#070a10]/78 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#b8a78a]">
                Placement theater · MSP
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e85d2a]">
                {phase === "placed" ? "Placed" : "Live"}
              </p>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1fr_15.5rem]">
              <div className="relative aspect-[5/4] min-h-[280px] sm:min-h-[360px]">
                <img
                  src="/war-room/skyline.jpg"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-55"
                />
                <div className="absolute inset-0 bg-[#071018]/35" />
                <BoardMap
                  people={people}
                  job={job}
                  jobPt={jobPt}
                  winnerId={winner?.candidateId}
                  winnerPt={winnerPt}
                  phase={phase}
                  shownIds={new Set(shownRank.map((r) => r.candidateId))}
                />
                {phase !== "idle" && job ? (
                  <div className="absolute left-3 top-3 max-w-[16rem] rounded-sm border border-[#e85d2a]/50 bg-[#120c08]/90 px-3 py-2 shadow-lg">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e85d2a]">
                      {phase === "placed" ? "Filled" : "Open req"}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-tight text-[#f7f1e6]">
                      {job.company}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#c9c0b0]">
                      {job.title}
                    </p>
                  </div>
                ) : null}
                {phase === "placed" && winnerPerson && winner ? (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <div className="war-room-stamp -rotate-12 rounded-sm border-2 border-[#e85d2a] bg-[#e85d2a]/15 px-6 py-2 font-display text-3xl tracking-[0.18em] text-[#ffb089] sm:text-4xl">
                      PLACED
                    </div>
                  </div>
                ) : null}
              </div>

              <aside className="border-t border-white/10 bg-[#080c12]/80 p-3 lg:border-l lg:border-t-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#8b95a5]">
                  FitScore shortlist
                </p>
                <ol className="mt-2 space-y-2">
                  {(phase === "idle" || phase === "req" ? [] : shownRank).map(
                    (r, i) => {
                      const p = people.find((x) => x.id === r.candidateId);
                      if (!p) return null;
                      const active =
                        (phase === "lock" || phase === "placed") && i === 0;
                      return (
                        <li
                          key={r.candidateId}
                          className={cn(
                            "rounded-sm border px-2.5 py-2",
                            active
                              ? "border-[#e85d2a]/70 bg-[#e85d2a]/10"
                              : "border-white/10 bg-white/3",
                          )}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-[13px] font-medium text-[#f3efe6]">
                              {p.name}
                            </p>
                            <p className="font-mono text-sm text-[#e8c9a0]">
                              {active || phase === "placed"
                                ? i === 0
                                  ? scoreDisplay
                                  : r.score
                                : "··"}
                            </p>
                          </div>
                          <p className="mt-0.5 text-[11px] text-[#9aa3ad]">
                            {p.title} · {p.location.split(",")[0]}
                          </p>
                        </li>
                      );
                    },
                  )}
                  {phase === "idle" || phase === "req" ? (
                    <li className="px-1 py-6 text-center text-[12px] text-[#8b95a5]">
                      Waiting for the next req…
                    </li>
                  ) : null}
                </ol>
                {phase === "placed" && winnerPerson ? (
                  <p className="mt-3 text-[12px] leading-relaxed text-[#d7cbb8]">
                    {winnerPerson.name} is the lock for {job?.company}.{" "}
                    {winner?.reasons[0]}
                  </p>
                ) : null}
              </aside>
            </div>

            <div className="flex flex-wrap gap-1.5 border-t border-white/10 px-3 py-2">
              {jobs.map((j, i) => (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => pickJob(i)}
                  className={cn(
                    "rounded-sm px-2 py-1 text-[10px] uppercase tracking-[0.12em]",
                    i === jobIndex
                      ? "bg-[#e85d2a] text-white"
                      : "bg-white/5 text-[#b8a78a] hover:bg-white/10",
                  )}
                >
                  {j.company.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-2 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-[#8b95a5]">
            Twin Cities desk · live board
          </p>
        </section>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8b95a5]">
        {label}
      </dt>
      <dd className="mt-1 font-display text-2xl leading-none text-[#f7f1e6] sm:text-3xl">
        {value}
      </dd>
      {hint ? <p className="mt-1 text-[10px] text-[#8b95a5]">{hint}</p> : null}
    </div>
  );
}

function BoardMap({
  people,
  job,
  jobPt,
  winnerId,
  winnerPt,
  phase,
  shownIds,
}: {
  people: Candidate[];
  job: JobReq | undefined;
  jobPt: { x: number; y: number; label: string };
  winnerId?: string;
  winnerPt: { x: number; y: number };
  phase: Phase;
  shownIds: Set<string>;
}) {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
      <defs>
        <radialGradient id="radar" cx="38%" cy="82%" r="70%">
          <stop offset="0%" stopColor="#e85d2a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#e85d2a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#radar)" />
      <path
        d="M48 0 C 46 18 44 28 42 38 C 40 50 46 62 52 72 C 58 82 66 90 78 100"
        fill="none"
        stroke="#3d8ec4"
        strokeOpacity="0.45"
        strokeWidth="0.7"
      />
      <circle
        cx="38"
        cy="82"
        r={phase === "idle" ? 6 : 10}
        fill="none"
        stroke="#e85d2a"
        strokeOpacity="0.35"
        className="origin-center"
      />
      {BOARD_CITIES.map((c) => (
        <g key={c.id}>
          <circle
            cx={c.x}
            cy={c.y}
            r={c.kind === "core" ? 1.1 : 0.7}
            fill={c.id === "lakeville" ? "#e85d2a" : "#d7cbb8"}
            fillOpacity={c.kind === "region" ? 0.55 : 0.9}
          />
          {c.kind === "core" || c.id === "lakeville" ? (
            <text
              x={c.x + 1.8}
              y={c.y - 1.4}
              fill="#f3efe6"
              fontSize={c.kind === "core" ? 2.7 : 2.3}
              opacity={0.92}
            >
              {c.label}
            </text>
          ) : null}
        </g>
      ))}
      {people.map((p) => {
        const pt = offsetPoint(boardPointForLocation(p.location), p.id);
        const hot = shownIds.has(p.id);
        const win = p.id === winnerId && (phase === "lock" || phase === "placed");
        return (
          <circle
            key={p.id}
            cx={pt.x}
            cy={pt.y}
            r={win ? 1.8 : hot ? 1.35 : 0.7}
            fill={win ? "#e85d2a" : industryColor(p.industry)}
            opacity={hot || win || phase === "idle" ? 1 : 0.25}
          />
        );
      })}
      {job && (phase === "req" || phase === "scan" || phase === "rank" || phase === "lock" || phase === "placed") ? (
        <g>
          <circle
            cx={jobPt.x}
            cy={jobPt.y}
            r="3.2"
            fill="none"
            stroke="#f3efe6"
            strokeWidth="0.4"
          />
          <circle cx={jobPt.x} cy={jobPt.y} r="1.3" fill="#f3efe6" />
        </g>
      ) : null}
      {(phase === "lock" || phase === "placed") && winnerId ? (
        <line
          x1={winnerPt.x}
          y1={winnerPt.y}
          x2={jobPt.x}
          y2={jobPt.y}
          stroke="#e85d2a"
          strokeWidth="0.55"
          strokeDasharray="2 1.2"
        />
      ) : null}
    </svg>
  );
}
