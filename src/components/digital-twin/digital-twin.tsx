import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Home,
  Radio,
  ArrowRight,
  Activity,
  MapPin,
  Users,
  Building2,
  MousePointer2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { candidates, benchCandidates, jobReqs } from "@/lib/data";
import type { TwinPick } from "./twin-scene-3d";

const TwinScene3D = lazy(() =>
  import("./twin-scene-3d").then((m) => ({ default: m.TwinScene3D })),
);

/**
 * Digital twin: Twin Cities desk hub; talent across MSP waiting for clients.
 */
export function DigitalTwin() {
  const [selected, setSelected] = useState<TwinPick>({ kind: "home" });
  const [tick, setTick] = useState(0);
  const [client, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 2800);
    return () => window.clearInterval(id);
  }, []);

  // Everyone on the map: active candidates + bench (unique by id)
  const people = useMemo(() => {
    const map = new Map(candidates.map((c) => [c.id, c]));
    for (const b of benchCandidates) {
      if (!map.has(b.id)) map.set(b.id, b);
    }
    return [...map.values()];
  }, []);

  const openJobs = useMemo(
    () => jobReqs.filter((j) => !j.status || j.status === "open"),
    [],
  );

  const mspCount = useMemo(() => {
    return people.filter((p) => {
      const loc = p.location.toLowerCase();
      return (
        loc.includes("minneapolis") ||
        loc.includes("st paul") ||
        loc.includes("st. paul") ||
        loc.includes("bloomington") ||
        loc.includes("edina") ||
        loc.includes("lakeville") ||
        loc.includes("burnsville") ||
        loc.includes("eagan") ||
        p.state === "MN"
      );
    }).length;
  }, [people]);

  const selectionDetail = useMemo(() => {
    if (selected.kind === "home") {
      return {
        title: `${SITE.name} · HQ`,
        meta: SITE.address,
        body: `${SITE.hook} Desk hub in the Twin Cities. Proven talent across Minneapolis–St. Paul stands ready for the right client match.`,
        stats: [
          { label: "Talent on map", value: String(people.length) },
          { label: "MSP-area", value: String(mspCount) },
          { label: "Open clients", value: String(openJobs.length) },
        ],
        accent: "#e85d2a",
        href: "/about" as const,
        cta: "About Fitboard",
      };
    }
    if (selected.kind === "person") {
      const p = people.find((x) => x.id === selected.id);
      if (!p) return null;
      return {
        title: p.name,
        meta: `${p.title} · ${p.location}`,
        body:
          p.summary ??
          `Available talent waiting for the right client. ${p.yearsExperience} years · ${p.industry}.`,
        stats: [
          { label: "Experience", value: `${p.yearsExperience}y` },
          { label: "Industry", value: p.industry },
          { label: "Skills", value: String(p.skills.length) },
        ],
        accent:
          p.industry === "construction"
            ? "#e85d2a"
            : p.industry === "engineering"
              ? "#3d8ec4"
              : p.industry === "accounting"
                ? "#5baf8a"
                : "#8b9bb0",
        roles: p.skills.slice(0, 6),
        href: "/contact" as const,
        cta: "Place this talent",
      };
    }
    const j = openJobs.find((x) => x.id === selected.id);
    if (!j) return null;
    return {
      title: j.company,
      meta: `${j.title} · ${j.location}`,
      body:
        j.description ??
        "Client open seat — matching talent from the MSP waiting network.",
      stats: [
        { label: "Status", value: j.status ?? "open" },
        { label: "Industry", value: j.industry },
        { label: "Min yrs", value: String(j.minYearsExperience) },
      ],
      accent: "#3d8ec4",
      href: "/jobs" as const,
      cta: "View open roles",
    };
  }, [selected, people, openJobs, mspCount]);

  return (
    <div className="flex min-h-[calc(100dvh-var(--grok-banner-h,0px))] flex-col bg-[#06090e]">
      <div className="relative z-30 border-b border-[#1a222d] bg-[#0a0e14]/95 backdrop-blur-md">
        <SiteHeader />
      </div>

      <main className="relative flex-1">
        <div className="relative mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_20rem] lg:py-10">
          <div className="space-y-3 lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-[#e85d2a]/50 font-mono text-[10px] uppercase tracking-wider text-[#e85d2a]"
              >
                <Radio
                  className={cn(
                    "mr-1.5 h-3 w-3",
                    tick % 2 === 0 ? "text-[#5baf8a]" : "text-[#e85d2a]",
                  )}
                />
                Twin live · MSP
              </Badge>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted">
                <MousePointer2 className="h-3.5 w-3.5 text-primary" />
                Orbit · zoom · click people waiting across MSP
              </span>
            </div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              <Home className="mr-2 inline-block h-7 w-7 align-[-0.15em] text-[#e85d2a]" />
              Desk hub. Talent across MSP.
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Digital twin of the real network:{" "}
              <strong className="font-medium text-fg/90">the Twin Cities desk</strong>{" "}
              as the hub, with{" "}
              <strong className="font-medium text-fg/90">
                people all over Minneapolis–St. Paul
              </strong>{" "}
              already waiting for his clients. Soft arcs show who is ready when the
              right req opens.
            </p>
            <p className="max-w-xl text-sm font-medium text-fg/90">{SITE.hook}</p>
            <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
              <Button
                asChild
                className="border-0 bg-[#3d8ec4] text-white hover:bg-[#4a9fd4]"
              >
                <Link to="/portal">
                  Client portal
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/yard">Trailer yard</Link>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-sm border border-[#1e4a6a]/60 bg-[#0a1018] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between border-b border-[#1a2a3a] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[#6a8296]">
              <span>3D twin · house + MSP waiting network</span>
              <span className="text-[#e85d2a]">HQ-01</span>
            </div>
            {client ? (
              <Suspense
                fallback={
                  <div className="flex h-[min(72vh,580px)] items-center justify-center font-mono text-sm text-muted">
                    Loading 3D twin…
                  </div>
                }
              >
                <TwinScene3D
                  people={people}
                  jobs={openJobs}
                  selected={selected}
                  onPick={setSelected}
                />
              </Suspense>
            ) : (
              <div className="flex h-[min(72vh,580px)] items-center justify-center font-mono text-sm text-muted">
                Initializing 3D…
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-sm border border-[#1e4a6a]/50 bg-[#0c1219] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#3d8ec4]">
                Network telemetry
              </p>
              <dl className="mt-3 grid grid-cols-1 gap-3">
                <TwinStat icon={Home} label="Hub" value="Twin Cities" />
                <TwinStat
                  icon={Users}
                  label="People waiting"
                  value={String(people.length)}
                />
                <TwinStat icon={MapPin} label="MSP-area talent" value={String(mspCount)} />
                <TwinStat
                  icon={Building2}
                  label="Clients needing hires"
                  value={String(openJobs.length)}
                />
                <TwinStat icon={Activity} label="Status" value="Ready to place" />
              </dl>
            </div>

            {selectionDetail ? (
              <div
                className="flex flex-1 flex-col rounded-sm border bg-[#0c1219] p-4"
                style={{
                  borderColor: `${selectionDetail.accent ?? "#3d8ec4"}66`,
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  Selected
                </p>
                <h2 className="mt-2 text-lg font-semibold leading-snug text-fg">
                  {selectionDetail.title}
                </h2>
                <p className="mt-1 text-xs text-muted">{selectionDetail.meta}</p>
                <p className="mt-3 text-sm leading-relaxed text-fg/90">
                  {selectionDetail.body}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {selectionDetail.stats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded border border-border bg-bg/60 px-2 py-2 text-center"
                    >
                      <p className="font-mono text-[9px] uppercase text-muted">
                        {s.label}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold capitalize text-fg">
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>
                {"roles" in selectionDetail && selectionDetail.roles ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectionDetail.roles.map((r) => (
                      <span
                        key={r}
                        className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-auto flex flex-col gap-2 pt-4">
                  {selectionDetail.href ? (
                    <Button
                      asChild
                      className="w-full border-0 text-white"
                      style={{ backgroundColor: selectionDetail.accent }}
                    >
                      <Link to={selectionDetail.href}>
                        {selectionDetail.cta}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                  <Button
                    asChild
                    className="w-full border-0 bg-[#3d8ec4] text-white hover:bg-[#4a9fd4]"
                  >
                    <Link to="/portal">Client portal</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href={`tel:${SITE.phoneE164}`}>Call {SITE.phone}</a>
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link to="/yard">Trailer yard</Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </aside>

          {/* Portal callout — always visible */}
          <div className="rounded-sm border border-[#3d8ec4]/40 bg-[#0c1520] p-4 lg:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#3d8ec4]">
                  Desk · portal
                </p>
                <p className="mt-1 text-sm text-fg/90 sm:text-base">
                  Heat Map · BenchAlert · FitScore · CSV import — sign in to work the
                  pipeline.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild className="border-0 bg-[#3d8ec4] text-white hover:bg-[#4a9fd4]">
                  <Link to="/portal">
                    Open portal
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>

          <p className="text-center font-mono text-[11px] text-muted lg:col-span-2">
            LANDING · DIGITAL TWIN · PORTAL → /portal · {SITE.hook}
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function TwinStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded border border-border bg-bg/50 px-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted">{label}</p>
        <p className="font-mono text-base font-semibold text-fg">{value}</p>
      </div>
    </div>
  );
}
