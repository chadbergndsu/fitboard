import { useRef, useState, type DragEvent } from "react";
import { Link } from "@tanstack/react-router";
import { GripVertical, ChevronDown, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { TrailerDef } from "@/lib/trailer-yard";
import { jobReqs, heatMapProjects } from "@/lib/data";

interface SiteTrailerProps {
  trailer: TrailerDef;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDropTarget: boolean;
}

export function SiteTrailer({
  trailer,
  index,
  expanded,
  onToggle,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  isDropTarget,
}: SiteTrailerProps) {
  const [dragOver, setDragOver] = useState(false);
  const handleRef = useRef<HTMLButtonElement>(null);

  function handleDragStart(e: DragEvent) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    onDragStart(index);
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col transition-all duration-300",
        isDragging && "opacity-40 scale-[0.98]",
        isDropTarget && "ring-2 ring-[#e85d2a]/60 ring-offset-2 ring-offset-[#0a0e14]",
        dragOver && !isDragging && "translate-y-1",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
        onDragOver(index);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onDragEnd();
      }}
      data-trailer={trailer.id}
    >
      {/* Trailer body */}
      <div
        className={cn(
          "relative overflow-hidden rounded-sm border bg-[#121820]",
          "shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]",
        )}
        style={{ borderColor: `${trailer.accent}55` }}
      >
        {/* Corrugated roof strip */}
        <div
          className="h-2.5 w-full border-b"
          style={{
            borderColor: `${trailer.accent}40`,
            backgroundImage: `repeating-linear-gradient(
              90deg,
              #1a222d 0px,
              #1a222d 6px,
              #151c26 6px,
              #151c26 12px
            )`,
          }}
        />

        {/* Unit plate + drag */}
        <div className="flex items-stretch border-b border-[#243041]">
          <button
            ref={handleRef}
            type="button"
            draggable
            onDragStart={handleDragStart}
            onDragEnd={onDragEnd}
            className="flex w-10 shrink-0 cursor-grab items-center justify-center border-r border-[#243041] text-muted active:cursor-grabbing hover:bg-elevated hover:text-fg"
            aria-label={`Drag to rearrange ${trailer.title} trailer`}
            title="Drag to rearrange"
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="flex min-h-[4.5rem] flex-1 items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-[#1a222d]/80 sm:gap-4 sm:px-4"
            aria-expanded={expanded}
          >
            {/* Door plate */}
            <div
              className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-sm border-2 font-mono text-[11px] font-bold tracking-wider sm:h-16 sm:w-16 sm:text-xs"
              style={{
                borderColor: trailer.accent,
                color: trailer.accent,
                background: `linear-gradient(160deg, ${trailer.accent}18, transparent 60%)`,
              }}
            >
              <span className="text-[9px] opacity-70">{trailer.unit}</span>
              <span>{trailer.doorLabel}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-fg sm:text-xl">
                  {trailer.title}
                </h2>
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                  style={{
                    background: `${trailer.accent}22`,
                    color: trailer.accent,
                  }}
                >
                  Trailer
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted">{trailer.subtitle}</p>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-muted transition-transform duration-300",
                expanded && "rotate-180",
              )}
            />
          </button>
        </div>

        {/* Expanded bay — “doors open” */}
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="border-t border-[#243041] bg-[#0d1219] px-4 py-4 sm:px-5 sm:py-5">
              {/* Open door graphic */}
              <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: trailer.accent }}
                />
                Doors open · {trailer.unit}
              </div>

              <p className="max-w-2xl text-sm leading-relaxed text-fg/90 sm:text-base">
                {trailer.body}
              </p>

              {trailer.roles && trailer.roles.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {trailer.roles.map((r) => (
                    <span
                      key={r}
                      className="rounded-full border border-border bg-elevated/80 px-3 py-1.5 text-xs text-fg/90"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              ) : null}

              {trailer.id === "open-roles" ? <OpenRolesPreview /> : null}
              {trailer.id === "demand" ? <DemandPreview /> : null}
              {trailer.id === "about" ? (
                <p className="mt-4 border-l-2 border-primary/50 pl-3 text-sm font-medium text-fg sm:text-base">
                  {SITE.hook}
                </p>
              ) : null}
              {trailer.id === "contact" ? (
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <a
                    href={`tel:${SITE.phoneE164}`}
                    className="inline-flex min-h-11 items-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {SITE.phone}
                  </a>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="inline-flex min-h-11 items-center text-primary hover:underline"
                  >
                    {SITE.email}
                  </a>
                </div>
              ) : null}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {trailer.href ? (
                  <Button
                    asChild
                    className="border-0 text-white hover:opacity-95"
                    style={{ backgroundColor: trailer.accent }}
                  >
                    <Link
                      to={
                        trailer.href as
                          | "/"
                          | "/industries"
                          | "/jobs"
                          | "/demand"
                          | "/twin"
                          | "/yard"
                          | "/about"
                          | "/contact"
                          | "/portal"
                      }
                    >
                      {trailer.cta ?? "Open"}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                ) : null}
                {trailer.kind === "industry" ? (
                  <Button asChild variant="outline">
                    <Link to="/contact">Hire in {trailer.title}</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Wheel wells */}
        <div className="flex justify-between px-6 pb-2 pt-1">
          <WheelWell />
          <WheelWell />
          <WheelWell className="hidden sm:block" />
        </div>
      </div>

      {/* Ground shadow / pad */}
      <div className="mx-3 h-1.5 rounded-full bg-black/50 blur-[2px]" />
    </article>
  );
}

function WheelWell({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-3 w-10 rounded-full border border-[#2a3544] bg-[#0a0e14]",
        className,
      )}
    />
  );
}

function OpenRolesPreview() {
  const open = jobReqs.filter((j) => !j.status || j.status === "open").slice(0, 3);
  return (
    <ul className="mt-4 space-y-2">
      {open.map((j) => (
        <li
          key={j.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-bg/80 px-3 py-2.5 text-sm"
        >
          <span className="font-medium text-fg">{j.title}</span>
          <span className="text-xs text-muted">
            {j.location} · {j.industry}
          </span>
        </li>
      ))}
    </ul>
  );
}

function DemandPreview() {
  const hot = [...heatMapProjects]
    .sort((a, b) => b.demandScore - a.demandScore)
    .slice(0, 3);
  return (
    <ul className="mt-4 space-y-2">
      {hot.map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between gap-3 rounded border border-border bg-bg/80 px-3 py-2.5 text-sm"
        >
          <span>
            <span className="font-medium text-fg">{p.name}</span>
            <span className="mt-0.5 block text-xs text-muted">
              {p.city}, {p.state}
            </span>
          </span>
          <span className="font-mono text-sm font-bold text-[#e85d2a]">
            {p.demandScore}
          </span>
        </li>
      ))}
    </ul>
  );
}
