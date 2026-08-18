/**
 * Architectural line drawings for featured projects — pure SVG, blueprint style.
 */

import type { BlueprintProject, DemandLevel } from "./blueprint-data";
import { demandStroke } from "./blueprint-data";

const BLUE = "#3d8ec4";
const BLUE_DIM = "#2a5f85";
const BLUE_FAINT = "#1a3d58";
const PAPER_LINE = "#1e4a6a";

function RedlineHatch({
  x,
  y,
  w,
  h,
  demand,
  id,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  demand: DemandLevel;
  id: string;
}) {
  const color = demandStroke(demand);
  const opacity = demand === "high" ? 0.22 : demand === "elevated" ? 0.14 : 0.08;
  return (
    <g opacity={opacity} pointerEvents="none">
      <defs>
        <pattern
          id={`hatch-${id}`}
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="10" stroke={color} strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#hatch-${id})`} />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="none"
        stroke={color}
        strokeWidth={demand === "high" ? 2.5 : 1.5}
        strokeDasharray={demand === "high" ? "8 4" : "6 4"}
      />
    </g>
  );
}

function SheetTitle({
  project,
  x,
  y,
}: {
  project: BlueprintProject;
  x: number;
  y: number;
}) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect
        x={0}
        y={0}
        width={project.width}
        height={48}
        fill="rgba(8,16,28,0.9)"
        stroke={BLUE_DIM}
        strokeWidth={1}
      />
      <text
        x={14}
        y={18}
        fill={BLUE}
        fontSize={12}
        fontFamily="ui-monospace, monospace"
        letterSpacing="0.1em"
      >
        SHEET {project.sheetNo} · {project.drawingType.toUpperCase()}
      </text>
      <text
        x={14}
        y={38}
        fill="#dce6ee"
        fontSize={15}
        fontFamily="system-ui, sans-serif"
        fontWeight={600}
      >
        {project.name}
      </text>
      <text
        x={project.width - 14}
        y={30}
        fill={demandStroke(project.demand)}
        fontSize={13}
        fontFamily="ui-monospace, monospace"
        textAnchor="end"
        fontWeight={700}
      >
        DEMAND {project.demandScore}/10
      </text>
    </g>
  );
}

/** North Loop Medical Pavilion — building elevation */
export function DrawingMedicalPavilion({ project }: { project: BlueprintProject }) {
  const { x, y, width, height } = project;
  const ox = x + 40;
  const oy = y + 82;
  const bw = width - 80;
  const bh = height - 132;

  return (
    <g>
      {/* Sheet border */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(6,14,24,0.55)"
        stroke={BLUE_DIM}
        strokeWidth={1.5}
      />
      <rect
        x={x + 6}
        y={y + 6}
        width={width - 12}
        height={height - 12}
        fill="none"
        stroke={BLUE_FAINT}
        strokeWidth={0.75}
      />
      <SheetTitle project={project} x={x} y={y} />

      <RedlineHatch
        id="med"
        x={ox + 20}
        y={oy + 30}
        w={bw - 40}
        h={bh * 0.55}
        demand={project.demand}
      />

      {/* Ground line */}
      <line
        x1={ox - 10}
        y1={oy + bh}
        x2={ox + bw + 10}
        y2={oy + bh}
        stroke={BLUE}
        strokeWidth={1.5}
      />
      <line
        x1={ox - 10}
        y1={oy + bh + 6}
        x2={ox + bw + 10}
        y2={oy + bh + 6}
        stroke={BLUE_DIM}
        strokeWidth={0.75}
      />

      {/* Main massing — elevation */}
      <rect
        x={ox + 40}
        y={oy + bh * 0.28}
        width={bw * 0.55}
        height={bh * 0.72}
        fill="none"
        stroke={BLUE}
        strokeWidth={1.75}
      />
      {/* Curtain wall grid */}
      {Array.from({ length: 5 }).map((_, i) => (
        <line
          key={`v${i}`}
          x1={ox + 40 + ((bw * 0.55) / 5) * (i + 1)}
          y1={oy + bh * 0.28}
          x2={ox + 40 + ((bw * 0.55) / 5) * (i + 1)}
          y2={oy + bh}
          stroke={BLUE_DIM}
          strokeWidth={0.6}
        />
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <line
          key={`h${i}`}
          x1={ox + 40}
          y1={oy + bh * 0.28 + ((bh * 0.72) / 5) * (i + 1)}
          x2={ox + 40 + bw * 0.55}
          y2={oy + bh * 0.28 + ((bh * 0.72) / 5) * (i + 1)}
          stroke={BLUE_DIM}
          strokeWidth={0.6}
        />
      ))}

      {/* Entry canopy */}
      <path
        d={`M ${ox + 40 + bw * 0.12} ${oy + bh * 0.72}
            L ${ox + 40 + bw * 0.12} ${oy + bh * 0.62}
            L ${ox + 40 + bw * 0.38} ${oy + bh * 0.62}
            L ${ox + 40 + bw * 0.38} ${oy + bh * 0.72}`}
        fill="none"
        stroke={BLUE}
        strokeWidth={1.25}
      />

      {/* Secondary wing */}
      <rect
        x={ox + 40 + bw * 0.55}
        y={oy + bh * 0.48}
        width={bw * 0.32}
        height={bh * 0.52}
        fill="none"
        stroke={BLUE}
        strokeWidth={1.5}
      />
      {Array.from({ length: 3 }).map((_, i) => (
        <line
          key={`w${i}`}
          x1={ox + 40 + bw * 0.55 + ((bw * 0.32) / 4) * (i + 1)}
          y1={oy + bh * 0.48}
          x2={ox + 40 + bw * 0.55 + ((bw * 0.32) / 4) * (i + 1)}
          y2={oy + bh}
          stroke={BLUE_DIM}
          strokeWidth={0.5}
        />
      ))}

      {/* Dimension line — overall width */}
      <g stroke={BLUE} strokeWidth={0.8} fill={BLUE}>
        <line x1={ox + 40} y1={oy + bh + 28} x2={ox + 40 + bw * 0.87} y2={oy + bh + 28} />
        <line x1={ox + 40} y1={oy + bh + 22} x2={ox + 40} y2={oy + bh + 34} />
        <line
          x1={ox + 40 + bw * 0.87}
          y1={oy + bh + 22}
          x2={ox + 40 + bw * 0.87}
          y2={oy + bh + 34}
        />
        <text
          x={ox + 40 + (bw * 0.87) / 2}
          y={oy + bh + 48}
          textAnchor="middle"
          fontSize={13}
          fontFamily="ui-monospace, monospace"
          fill={BLUE}
        >
          284'-0" OVERALL
        </text>
      </g>

      {/* City label */}
      <text
        x={ox}
        y={oy + 18}
        fill={BLUE}
        fontSize={13}
        fontFamily="ui-monospace, monospace"
        letterSpacing="0.12em"
      >
        MINNEAPOLIS, MN · HEALTHCARE
      </text>
    </g>
  );
}

/** Twin Cities Mixed-Use Tower — structural elevation */
export function DrawingMixedUseTower({ project }: { project: BlueprintProject }) {
  const { x, y, width, height } = project;
  const ox = x + 80;
  const oy = y + 92;
  const tw = width * 0.42;
  const th = height - 172;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(6,14,24,0.55)"
        stroke={BLUE_DIM}
        strokeWidth={1.5}
      />
      <rect
        x={x + 6}
        y={y + 6}
        width={width - 12}
        height={height - 12}
        fill="none"
        stroke={BLUE_FAINT}
        strokeWidth={0.75}
      />
      <SheetTitle project={project} x={x} y={y} />

      <RedlineHatch
        id="tower"
        x={ox - 10}
        y={oy + 20}
        w={tw + 20}
        h={th * 0.7}
        demand={project.demand}
      />

      {/* Grid lines background */}
      {Array.from({ length: 6 }).map((_, i) => (
        <line
          key={`g${i}`}
          x1={ox + tw + 40}
          y1={oy + 20 + i * 40}
          x2={ox + tw + 200}
          y2={oy + 20 + i * 40}
          stroke={PAPER_LINE}
          strokeWidth={0.5}
          strokeDasharray="4 6"
        />
      ))}

      {/* Tower silhouette — stories */}
      <rect
        x={ox}
        y={oy}
        width={tw}
        height={th}
        fill="none"
        stroke={BLUE}
        strokeWidth={2}
      />
      {Array.from({ length: 14 }).map((_, i) => {
        const ly = oy + (th / 15) * (i + 1);
        return (
          <line
            key={`fl${i}`}
            x1={ox}
            y1={ly}
            x2={ox + tw}
            y2={ly}
            stroke={i % 3 === 0 ? BLUE : BLUE_DIM}
            strokeWidth={i % 3 === 0 ? 1 : 0.45}
          />
        );
      })}
      {/* Column lines */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={ox + tw * f}
          y1={oy}
          x2={ox + tw * f}
          y2={oy + th}
          stroke={BLUE_DIM}
          strokeWidth={0.7}
          strokeDasharray="3 3"
        />
      ))}

      {/* Core */}
      <rect
        x={ox + tw * 0.35}
        y={oy + th * 0.15}
        width={tw * 0.3}
        height={th * 0.7}
        fill="none"
        stroke={demandStroke(project.demand)}
        strokeWidth={1.25}
        strokeDasharray="5 3"
      />
      <text
        x={ox + tw * 0.5}
        y={oy + th * 0.5}
        textAnchor="middle"
        fill={demandStroke(project.demand)}
        fontSize={13}
        fontFamily="ui-monospace, monospace"
        fontWeight={600}
      >
        CORE
      </text>

      {/* Mechanical penthouse */}
      <rect
        x={ox + tw * 0.15}
        y={oy - 28}
        width={tw * 0.7}
        height={28}
        fill="none"
        stroke={BLUE}
        strokeWidth={1.25}
      />

      {/* Height dimension */}
      <g stroke={BLUE} fill={BLUE}>
        <line x1={ox + tw + 24} y1={oy} x2={ox + tw + 24} y2={oy + th} strokeWidth={0.8} />
        <line x1={ox + tw + 18} y1={oy} x2={ox + tw + 30} y2={oy} strokeWidth={0.8} />
        <line
          x1={ox + tw + 18}
          y1={oy + th}
          x2={ox + tw + 30}
          y2={oy + th}
          strokeWidth={0.8}
        />
        <text
          x={ox + tw + 42}
          y={oy + th / 2}
          fill={BLUE}
          fontSize={13}
          fontFamily="ui-monospace, monospace"
          transform={`rotate(-90 ${ox + tw + 42} ${oy + th / 2})`}
          textAnchor="middle"
        >
          18 STORIES · ± 214'-0"
        </text>
      </g>

      <text
        x={ox}
        y={oy + th + 32}
        fill={BLUE}
        fontSize={13}
        fontFamily="ui-monospace, monospace"
        letterSpacing="0.1em"
      >
        MINNEAPOLIS · STRUCTURAL FRAME
      </text>
    </g>
  );
}

/** Red River Cold Storage — floor plan */
export function DrawingColdStorage({ project }: { project: BlueprintProject }) {
  const { x, y, width, height } = project;
  const ox = x + 50;
  const oy = y + 82;
  const pw = width - 100;
  const ph = height - 152;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(6,14,24,0.55)"
        stroke={BLUE_DIM}
        strokeWidth={1.5}
      />
      <rect
        x={x + 6}
        y={y + 6}
        width={width - 12}
        height={height - 12}
        fill="none"
        stroke={BLUE_FAINT}
        strokeWidth={0.75}
      />
      <SheetTitle project={project} x={x} y={y} />

      <RedlineHatch
        id="cold"
        x={ox + 20}
        y={oy + 20}
        w={pw * 0.55}
        h={ph * 0.7}
        demand={project.demand}
      />

      {/* Outer envelope */}
      <rect
        x={ox}
        y={oy}
        width={pw}
        height={ph}
        fill="none"
        stroke={BLUE}
        strokeWidth={2}
      />

      {/* Cold rooms */}
      <rect
        x={ox + 20}
        y={oy + 20}
        width={pw * 0.45}
        height={ph * 0.55}
        fill="none"
        stroke={BLUE}
        strokeWidth={1.25}
      />
      <line
        x1={ox + 20 + (pw * 0.45) / 2}
        y1={oy + 20}
        x2={ox + 20 + (pw * 0.45) / 2}
        y2={oy + 20 + ph * 0.55}
        stroke={BLUE_DIM}
        strokeWidth={0.75}
      />
      <text
        x={ox + 20 + pw * 0.22}
        y={oy + 20 + ph * 0.28}
        textAnchor="middle"
        fill={BLUE}
        fontSize={14}
        fontFamily="ui-monospace, monospace"
        fontWeight={600}
      >
        FREEZER
      </text>
      <text
        x={ox + 20 + pw * 0.34}
        y={oy + 20 + ph * 0.28}
        textAnchor="middle"
        fill={BLUE}
        fontSize={14}
        fontFamily="ui-monospace, monospace"
        fontWeight={600}
      >
        COOLER
      </text>

      {/* Dock area */}
      <rect
        x={ox + pw * 0.55}
        y={oy + 20}
        width={pw * 0.4}
        height={ph * 0.4}
        fill="none"
        stroke={BLUE}
        strokeWidth={1.25}
      />
      {Array.from({ length: 4 }).map((_, i) => (
        <rect
          key={`dock${i}`}
          x={ox + pw * 0.55 + 16 + i * ((pw * 0.4 - 32) / 4)}
          y={oy + 20 + ph * 0.4 - 8}
          width={(pw * 0.4 - 48) / 4}
          height={16}
          fill="none"
          stroke={demandStroke(project.demand)}
          strokeWidth={1}
        />
      ))}
      <text
        x={ox + pw * 0.75}
        y={oy + 20 + ph * 0.2}
        textAnchor="middle"
        fill={BLUE}
        fontSize={14}
        fontFamily="ui-monospace, monospace"
        fontWeight={600}
      >
        LOADING DOCK
      </text>

      {/* Office strip */}
      <rect
        x={ox + 20}
        y={oy + ph * 0.7}
        width={pw * 0.35}
        height={ph * 0.22}
        fill="none"
        stroke={BLUE_DIM}
        strokeWidth={1}
      />
      <text
        x={ox + 20 + pw * 0.175}
        y={oy + ph * 0.82}
        textAnchor="middle"
        fill={BLUE}
        fontSize={13}
        fontFamily="ui-monospace, monospace"
        fontWeight={600}
      >
        OFFICE
      </text>

      {/* Grid bubbles */}
      {["A", "B", "C", "D"].map((label, i) => (
        <g key={label}>
          <circle
            cx={ox + 40 + i * (pw / 4)}
            cy={oy + ph + 24}
            r={12}
            fill="none"
            stroke={BLUE}
            strokeWidth={1}
          />
          <text
            x={ox + 40 + i * (pw / 4)}
            y={oy + ph + 28}
            textAnchor="middle"
            fill={BLUE}
            fontSize={11}
            fontFamily="ui-monospace, monospace"
          >
            {label}
          </text>
        </g>
      ))}

      <text
        x={ox}
        y={oy - 10}
        fill={BLUE}
        fontSize={13}
        fontFamily="ui-monospace, monospace"
        letterSpacing="0.1em"
      >
        FARGO, ND · FLOOR PLAN LEVEL 1
      </text>
    </g>
  );
}

export function ProjectDrawing({ project }: { project: BlueprintProject }) {
  if (project.drawingType === "elevation") {
    return <DrawingMedicalPavilion project={project} />;
  }
  if (project.drawingType === "structural") {
    return <DrawingMixedUseTower project={project} />;
  }
  return <DrawingColdStorage project={project} />;
}
