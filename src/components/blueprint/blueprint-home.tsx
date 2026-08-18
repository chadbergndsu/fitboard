import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Minus,
  Plus,
  Maximize2,
  X,
  Phone,
  ArrowRight,
  Crosshair,
  Hand,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/seo";
import { cn } from "@/lib/utils";
import {
  BOARD,
  blueprintProjects,
  demandLabel,
  demandStroke,
  roleAnnotations,
  type RoleAnnotation,
} from "./blueprint-data";
import { ProjectDrawing } from "./blueprint-drawings";
import { usePanZoom } from "./use-pan-zoom";

const BLUE = "#3d8ec4";

/** Callout plate size in world units — large enough to read at typical zoom. */
const CALLOUT_W = 340;
const CALLOUT_H = 72;

function AnnotationCallout({
  ann,
  selected,
  onSelect,
}: {
  ann: RoleAnnotation;
  selected: boolean;
  onSelect: (a: RoleAnnotation) => void;
}) {
  const stroke = demandStroke(ann.demand);
  const midX = (ann.ax + ann.lx) / 2;
  const midY = (ann.ay + ann.ly) / 2 + (ann.ly < ann.ay ? -28 : 28);

  return (
    <g data-blueprint-ui>
      {/* Leader / dimension style line */}
      <path
        d={`M ${ann.ax} ${ann.ay} L ${midX} ${midY} L ${ann.lx} ${ann.ly}`}
        fill="none"
        stroke={stroke}
        strokeWidth={selected ? 2.25 : 1.6}
        strokeDasharray={ann.demand === "high" ? "0" : "6 4"}
        opacity={0.95}
      />
      <circle cx={ann.ax} cy={ann.ay} r={6} fill={stroke} />
      <circle
        cx={ann.ax}
        cy={ann.ay}
        r={selected ? 16 : 13}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        opacity={0.75}
      />

      {/* Callout plate — HTML for readable wrapping + larger hit target */}
      <g transform={`translate(${ann.lx}, ${ann.ly})`}>
        <foreignObject
          x={0}
          y={-CALLOUT_H / 2}
          width={CALLOUT_W}
          height={CALLOUT_H}
          style={{ overflow: "visible" }}
        >
          <div
            // @ts-expect-error xmlns required for SVG foreignObject HTML
            xmlns="http://www.w3.org/1999/xhtml"
            className="h-full w-full cursor-pointer select-none"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(ann);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onSelect(ann);
              }
            }}
            role="button"
            tabIndex={0}
            style={{
              boxSizing: "border-box",
              height: "100%",
              borderLeft: `4px solid ${stroke}`,
              border: selected
                ? `2px solid ${stroke}`
                : `1.5px solid ${BLUE}`,
              borderLeftWidth: 4,
              borderLeftColor: stroke,
              background: selected
                ? "rgba(12,22,36,0.98)"
                : "rgba(8,16,28,0.94)",
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 4,
              boxShadow: selected
                ? `0 0 0 1px ${stroke}55, 0 8px 24px rgba(0,0,0,0.45)`
                : "0 6px 20px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                color: "#f0f5f9",
                fontSize: 15,
                fontWeight: 600,
                lineHeight: 1.25,
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              {ann.title}
            </div>
            <div
              style={{
                color: stroke,
                fontSize: 12,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {ann.demand === "high" ? "▲ Open · High demand" : "○ Open role"} ·{" "}
              {ann.location}
            </div>
          </div>
        </foreignObject>
      </g>
    </g>
  );
}

function RoleCard({
  ann,
  onClose,
}: {
  ann: RoleAnnotation;
  onClose: () => void;
}) {
  return (
    <div
      data-blueprint-ui
      className="pointer-events-auto w-[min(100%,26rem)] rounded-sm border border-[#2a5f85] bg-[rgba(8,14,24,0.97)] shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-md"
      role="dialog"
      aria-labelledby="role-card-title"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#1e4a6a] px-5 py-4">
        <div className="min-w-0">
          <p
            className="font-mono text-xs uppercase tracking-[0.14em]"
            style={{ color: demandStroke(ann.demand) }}
          >
            Open requisition · {ann.location}
          </p>
          <h2
            id="role-card-title"
            className="mt-1.5 text-lg font-semibold leading-snug text-[#eef3f7] sm:text-xl"
          >
            {ann.title}
          </h2>
          <p className="mt-1 text-sm text-[#8aa0b4]">{ann.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-11 w-11 shrink-0 place-items-center rounded border border-[#2a5f85] text-[#8ab0c8] hover:bg-[#122536] hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-4 px-5 py-5">
        <p className="text-base leading-relaxed text-[#c5d4e0]">{ann.description}</p>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button
            asChild
            className="h-12 flex-1 border-0 bg-[#e85d2a] text-base text-white hover:bg-[#f06a38]"
          >
            <a
              href={`mailto:${SITE.email}?subject=${encodeURIComponent(`Interest: ${ann.title}`)}`}
            >
              Apply Now
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 flex-1 border-[#3d8ec4] bg-transparent text-base text-[#c5dcec] hover:bg-[#122536]"
          >
            <a href={`tel:${SITE.phoneE164}`}>
              <Phone className="mr-1 h-4 w-4" />
              Talk to the desk
            </a>
          </Button>
        </div>
        <p className="text-sm text-[#6a8296]">
          Or{" "}
          <Link
            to="/contact"
            className="text-[#5b9fd4] underline-offset-2 hover:underline"
          >
            send a message
          </Link>{" "}
          · Twin Cities
        </p>
      </div>
    </div>
  );
}

function DemandPanel({
  onFocusProject,
  activeId,
}: {
  onFocusProject: (id: string) => void;
  activeId: string | null;
}) {
  return (
    <aside
      data-blueprint-ui
      className="pointer-events-auto w-[min(100%,22rem)] rounded-sm border border-[#1e4a6a] bg-[rgba(6,12,22,0.94)] shadow-lg backdrop-blur-md"
    >
      <div className="border-b border-[#1e4a6a] px-4 py-3">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#3d8ec4]">
          Live demand heat
        </p>
        <p className="mt-1 text-sm text-[#8aa0b4]">
          Twin Cities · Fargo corridor
        </p>
      </div>
      <ul className="divide-y divide-[#162a3d]">
        {blueprintProjects.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onFocusProject(p.id)}
              className={cn(
                "flex w-full items-start gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-[#0e1c2c]",
                activeId === p.id && "bg-[#0e1c2c]",
              )}
            >
              <span
                className="mt-0.5 flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-sm border font-mono text-sm font-bold"
                style={{
                  borderColor: demandStroke(p.demand),
                  color: demandStroke(p.demand),
                }}
              >
                {p.demandScore}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold leading-snug text-[#e4edf4]">
                  {p.name}
                </span>
                <span className="mt-1 block text-sm text-[#7a93a8]">
                  {p.city}, {p.state} · ${p.valueMm}M
                </span>
                <span className="mt-0.5 block text-xs text-[#5a7a90]">
                  {p.projectType}
                </span>
                <span
                  className="mt-1.5 block font-mono text-[11px] uppercase tracking-wider"
                  style={{ color: demandStroke(p.demand) }}
                >
                  {demandLabel(p.demandScore)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="border-t border-[#1e4a6a] px-4 py-3">
        <Link
          to="/jobs"
          className="flex min-h-11 items-center justify-between text-sm text-[#5b9fd4] hover:text-[#8ec4e8]"
        >
          All open roles
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}

function BlueprintWorld({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (a: RoleAnnotation) => void;
}) {
  // Grid density
  const gridStep = 40;

  return (
    <svg
      width={BOARD.width}
      height={BOARD.height}
      viewBox={`0 0 ${BOARD.width} ${BOARD.height}`}
      className="select-none"
      style={{ display: "block" }}
    >
      <defs>
        <pattern
          id="bp-grid"
          width={gridStep}
          height={gridStep}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridStep} 0 L 0 0 0 ${gridStep}`}
            fill="none"
            stroke="#1a3d58"
            strokeWidth="0.6"
          />
        </pattern>
        <pattern
          id="bp-grid-major"
          width={gridStep * 5}
          height={gridStep * 5}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridStep * 5} 0 L 0 0 0 ${gridStep * 5}`}
            fill="none"
            stroke="#245878"
            strokeWidth="0.9"
          />
        </pattern>
        <filter id="paper-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.04" />
          </feComponentTransfer>
        </filter>
        <radialGradient id="vignette" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#0a1524" stopOpacity="0" />
          <stop offset="100%" stopColor="#020508" stopOpacity="0.65" />
        </radialGradient>
      </defs>

      {/* Paper */}
      <rect width={BOARD.width} height={BOARD.height} fill="#071018" />
      <rect width={BOARD.width} height={BOARD.height} fill="url(#bp-grid)" />
      <rect width={BOARD.width} height={BOARD.height} fill="url(#bp-grid-major)" />
      <rect
        width={BOARD.width}
        height={BOARD.height}
        filter="url(#paper-noise)"
        opacity={0.5}
      />

      {/* Border / title block frame */}
      <rect
        x={40}
        y={40}
        width={BOARD.width - 80}
        height={BOARD.height - 80}
        fill="none"
        stroke="#2a5f85"
        strokeWidth={2}
      />
      <rect
        x={48}
        y={48}
        width={BOARD.width - 96}
        height={BOARD.height - 96}
        fill="none"
        stroke="#1a3d58"
        strokeWidth={0.75}
      />

      {/* Title block */}
      <g transform="translate(80, 70)">
        <text
          fill="#3d8ec4"
          fontSize={14}
          fontFamily="ui-monospace, monospace"
          letterSpacing="0.18em"
        >
          {BOARD.title}
        </text>
        <text
          y={36}
          fill="#c5d8e8"
          fontSize={28}
          fontFamily="system-ui, sans-serif"
          fontWeight={600}
        >
          {SITE.tagline}
        </text>
        <text
          y={62}
          fill="#9eb6c8"
          fontSize={15}
          fontFamily="system-ui, sans-serif"
        >
          {SITE.hook}
        </text>
        <text
          y={86}
          fill="#6a8aa0"
          fontSize={14}
          fontFamily="ui-monospace, monospace"
        >
          {BOARD.revision} · {BOARD.date} · SCALE {BOARD.scale} · LAKEVILLE, MN
        </text>
      </g>

      {/* Region labels */}
      <text
        x={420}
        y={240}
        fill="#3a6f90"
        fontSize={16}
        fontFamily="ui-monospace, monospace"
        letterSpacing="0.28em"
      >
        TWIN CITIES METRO
      </text>
      <text
        x={2200}
        y={320}
        fill="#3a6f90"
        fontSize={16}
        fontFamily="ui-monospace, monospace"
        letterSpacing="0.28em"
      >
        FARGO / RED RIVER
      </text>

      {/* Corridor dashed connector */}
      <path
        d="M 900 540 C 1200 480, 1600 500, 1980 560"
        fill="none"
        stroke="#1e4a6a"
        strokeWidth={1.5}
        strokeDasharray="10 8"
      />
      <text
        x={1400}
        y={500}
        fill="#4a7a98"
        fontSize={13}
        fontFamily="ui-monospace, monospace"
        letterSpacing="0.12em"
      >
        I-94 CORRIDOR · DEMAND AXIS
      </text>

      {blueprintProjects.map((p) => (
        <ProjectDrawing key={p.id} project={p} />
      ))}

      {roleAnnotations.map((ann) => (
        <AnnotationCallout
          key={ann.id}
          ann={ann}
          selected={selectedId === ann.id}
          onSelect={onSelect}
        />
      ))}

      {/* Drawing board stamp */}
      <g transform={`translate(${BOARD.width - 360}, ${BOARD.height - 180})`}>
        <rect
          width={280}
          height={108}
          fill="rgba(6,12,22,0.92)"
          stroke="#2a5f85"
          strokeWidth={1.25}
        />
        <text
          x={14}
          y={26}
          fill="#3d8ec4"
          fontSize={12}
          fontFamily="ui-monospace, monospace"
          letterSpacing="0.12em"
        >
          DRAWN FOR
        </text>
        <text
          x={14}
          y={50}
          fill="#e0eaf2"
          fontSize={16}
          fontFamily="system-ui, sans-serif"
          fontWeight={600}
        >
          Fitboard
        </text>
        <text
          x={14}
          y={74}
          fill="#8aa0b4"
          fontSize={13}
          fontFamily="ui-monospace, monospace"
        >
          Desk lead · Twin Cities
        </text>
        <text
          x={14}
          y={94}
          fill="#8aa0b4"
          fontSize={13}
          fontFamily="ui-monospace, monospace"
        >
          {SITE.phone}
        </text>
      </g>

      <rect
        width={BOARD.width}
        height={BOARD.height}
        fill="url(#vignette)"
        pointerEvents="none"
      />
    </svg>
  );
}

export function BlueprintHome() {
  const [selected, setSelected] = useState<RoleAnnotation | null>(null);
  const [focusedProject, setFocusedProject] = useState<string | null>(null);
  const [heatOpen, setHeatOpen] = useState(true);

  const panZoom = usePanZoom({
    minScale: 0.4,
    maxScale: 2.4,
    initial: { x: -40, y: -20, scale: 0.72 },
  });

  // Fit board on mount / resize — prefer readable scale over seeing everything
  useEffect(() => {
    const fit = () => {
      const el = panZoom.containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pad = 32;
      const sx = (rect.width - pad * 2) / BOARD.width;
      const sy = (rect.height - pad * 2) / BOARD.height;
      // Floor at 0.55 so callout text stays legible; user can zoom out further
      const scale = Math.min(Math.max(Math.min(sx, sy), 0.55), 0.95);
      const x = (rect.width - BOARD.width * scale) / 2;
      const y = (rect.height - BOARD.height * scale) / 2 + 4;
      panZoom.setState({ x, y, scale });
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fit once + on resize
  }, []);

  const onSelect = useCallback(
    (ann: RoleAnnotation) => {
      setSelected(ann);
      setFocusedProject(ann.projectId);
      panZoom.focusWorldPoint(
        ann.lx + CALLOUT_W / 2,
        ann.ly,
        Math.max(panZoom.state.scale, 0.95),
      );
    },
    [panZoom],
  );

  const onFocusProject = useCallback(
    (id: string) => {
      const p = blueprintProjects.find((x) => x.id === id);
      if (!p) return;
      setFocusedProject(id);
      panZoom.focusWorldPoint(p.x + p.width / 2, p.y + p.height / 2, 1.0);
    },
    [panZoom],
  );

  const transform = useMemo(
    () =>
      `translate(${panZoom.state.x}px, ${panZoom.state.y}px) scale(${panZoom.state.scale})`,
    [panZoom.state],
  );

  return (
    <div className="relative flex h-[calc(100dvh-var(--grok-banner-h,0px))] flex-col overflow-hidden bg-[#050a10]">
      {/* Header over blueprint */}
      <div className="relative z-30 shrink-0 border-b border-[#1a3d58]/60 bg-[rgba(5,10,16,0.88)] backdrop-blur-md">
        <SiteHeader />
      </div>

      {/* Canvas */}
      <div
        ref={panZoom.containerRef}
        className={cn(
          "relative min-h-0 flex-1 touch-none overflow-hidden",
          panZoom.isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onPointerDown={panZoom.onPointerDown}
        onPointerMove={panZoom.onPointerMove}
        onPointerUp={panZoom.onPointerUp}
        onPointerCancel={panZoom.onPointerUp}
        role="application"
        aria-label="Interactive regional demand blueprint. Drag to pan, scroll to zoom. Click role callouts for details."
      >
        {/* Subtle scanline / board feel */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)",
          }}
        />

        <div
          className="absolute left-0 top-0 origin-top-left will-change-transform"
          style={{ transform }}
        >
          <BlueprintWorld
            selectedId={selected?.id ?? null}
            onSelect={onSelect}
          />
        </div>

        {/* Tagline chip (always readable) */}
        <div
          data-blueprint-ui
          className="pointer-events-none absolute left-3 top-3 z-20 max-w-[min(100%-1.5rem,28rem)] sm:left-5 sm:top-4"
        >
          <div className="rounded-sm border border-[#1e4a6a]/90 bg-[rgba(5,12,20,0.9)] px-4 py-3 backdrop-blur-sm">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#3d8ec4]">
              Fitboard · Twin Cities
            </p>
            <p className="mt-1 text-base font-semibold tracking-tight text-[#e8f0f6] sm:text-lg">
              Constructing dreams.{" "}
              <span className="text-[#e85d2a]">Strengthening teams.</span>
            </p>
            <p className="mt-2 max-w-md text-sm leading-snug text-[#9eb6c8]">
              {SITE.hook}
            </p>
          </div>
        </div>

        {/* Zoom controls */}
        <div
          data-blueprint-ui
          className="absolute right-3 top-3 z-20 flex flex-col gap-1.5 sm:right-5 sm:top-4"
        >
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-sm border border-[#2a5f85] bg-[rgba(8,16,28,0.94)] text-[#8ab0c8] hover:bg-[#122536] hover:text-white"
            aria-label="Zoom in"
            onClick={() => panZoom.zoomBy(1.15)}
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-sm border border-[#2a5f85] bg-[rgba(8,16,28,0.94)] text-[#8ab0c8] hover:bg-[#122536] hover:text-white"
            aria-label="Zoom out"
            onClick={() => panZoom.zoomBy(1 / 1.15)}
          >
            <Minus className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-sm border border-[#2a5f85] bg-[rgba(8,16,28,0.94)] text-[#8ab0c8] hover:bg-[#122536] hover:text-white"
            aria-label="Reset view"
            onClick={() => {
              const el = panZoom.containerRef.current;
              if (!el) return;
              const rect = el.getBoundingClientRect();
              const scale = Math.min(
                Math.max(
                  Math.min(rect.width / BOARD.width, rect.height / BOARD.height) * 0.95,
                  0.55,
                ),
                0.95,
              );
              panZoom.setState({
                scale,
                x: (rect.width - BOARD.width * scale) / 2,
                y: (rect.height - BOARD.height * scale) / 2,
              });
            }}
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>

        {/* Hint */}
        <div
          data-blueprint-ui
          className="pointer-events-none absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-[#1e4a6a]/70 bg-[rgba(5,12,20,0.9)] px-4 py-2 font-mono text-xs text-[#8aa0b4] sm:flex"
        >
          <Hand className="h-3.5 w-3.5" />
          Drag to pan · Scroll to zoom · Tap role callouts
          <Crosshair className="h-3.5 w-3.5" />
        </div>

        {/* Demand heat panel */}
        <div
          data-blueprint-ui
          className="absolute bottom-3 left-3 z-20 sm:bottom-5 sm:left-5"
        >
          <div className="mb-2 sm:hidden">
            <button
              type="button"
              className="min-h-11 rounded-sm border border-[#2a5f85] bg-[rgba(8,16,28,0.94)] px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-[#8ab0c8]"
              onClick={() => setHeatOpen((v) => !v)}
            >
              {heatOpen ? "Hide heat" : "Demand heat"}
            </button>
          </div>
          <div className={cn(!heatOpen && "hidden sm:block")}>
            <DemandPanel
              onFocusProject={onFocusProject}
              activeId={focusedProject}
            />
          </div>
        </div>

        {/* Role floating card */}
        {selected ? (
          <div
            data-blueprint-ui
            className="absolute bottom-3 right-3 z-20 sm:bottom-auto sm:right-5 sm:top-28"
          >
            <RoleCard ann={selected} onClose={() => setSelected(null)} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
