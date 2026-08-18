import { useCallback, useEffect, useRef, useState, type PointerEvent as RE, type WheelEvent as RWE } from "react";

export interface PanZoomState {
  x: number;
  y: number;
  scale: number;
}

export interface UsePanZoomOptions {
  minScale?: number;
  maxScale?: number;
  /** Initial centered offset for the world. */
  initial?: PanZoomState;
}

/**
 * Smooth pan (drag) + wheel/pinch zoom for a blueprint canvas.
 * Transform is applied as: translate(x,y) scale(scale) with transform-origin 0 0.
 */
export function usePanZoom(options: UsePanZoomOptions = {}) {
  const minScale = options.minScale ?? 0.35;
  const maxScale = options.maxScale ?? 2.4;
  const [state, setState] = useState<PanZoomState>(
    options.initial ?? { x: 0, y: 0, scale: 0.72 },
  );
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const clampScale = useCallback(
    (s: number) => Math.min(maxScale, Math.max(minScale, s)),
    [minScale, maxScale],
  );

  const onPointerDown = useCallback((e: RE<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    // Don't start pan from interactive controls
    const t = e.target as HTMLElement;
    if (t.closest("[data-blueprint-ui], button, a, [role='button']")) return;
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origX: state.x,
      origY: state.y,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
  }, [state.x, state.y]);

  const onPointerMove = useCallback((e: RE<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true;
    setState((s) => ({
      ...s,
      x: d.origX + dx,
      y: d.origY + dy,
    }));
  }, []);

  const onPointerUp = useCallback((e: RE<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    drag.current = null;
    setIsDragging(false);
  }, []);

  const onWheel = useCallback(
    (e: RWE<HTMLDivElement>) => {
      e.preventDefault();
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const delta = -e.deltaY;
      const factor = delta > 0 ? 1.08 : 1 / 1.08;

      setState((s) => {
        const nextScale = clampScale(s.scale * factor);
        const ratio = nextScale / s.scale;
        // Zoom toward cursor
        const nx = px - (px - s.x) * ratio;
        const ny = py - (py - s.y) * ratio;
        return { x: nx, y: ny, scale: nextScale };
      });
    },
    [clampScale],
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const el = containerRef.current;
      if (!el) {
        setState((s) => ({ ...s, scale: clampScale(s.scale * factor) }));
        return;
      }
      const rect = el.getBoundingClientRect();
      const px = rect.width / 2;
      const py = rect.height / 2;
      setState((s) => {
        const nextScale = clampScale(s.scale * factor);
        const ratio = nextScale / s.scale;
        return {
          x: px - (px - s.x) * ratio,
          y: py - (py - s.y) * ratio,
          scale: nextScale,
        };
      });
    },
    [clampScale],
  );

  const resetView = useCallback((next?: PanZoomState) => {
    setState(next ?? options.initial ?? { x: 0, y: 0, scale: 0.72 });
  }, [options.initial]);

  /** Center a world-space point in the viewport. */
  const focusWorldPoint = useCallback(
    (wx: number, wy: number, scale?: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const sc = scale != null ? clampScale(scale) : state.scale;
      setState({
        scale: sc,
        x: rect.width / 2 - wx * sc,
        y: rect.height / 2 - wy * sc,
      });
    },
    [clampScale, state.scale],
  );

  // Non-passive wheel so we can zoom without scrolling the page
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onNativeWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = ev.clientX - rect.left;
      const py = ev.clientY - rect.top;
      const factor = -ev.deltaY > 0 ? 1.08 : 1 / 1.08;
      setState((s) => {
        const nextScale = Math.min(maxScale, Math.max(minScale, s.scale * factor));
        const ratio = nextScale / s.scale;
        return {
          x: px - (px - s.x) * ratio,
          y: py - (py - s.y) * ratio,
          scale: nextScale,
        };
      });
    };
    el.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => el.removeEventListener("wheel", onNativeWheel);
  }, [minScale, maxScale]);

  const didDrag = useCallback(() => drag.current?.moved ?? false, []);

  return {
    state,
    containerRef,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel,
    zoomBy,
    resetView,
    focusWorldPoint,
    didDrag,
    setState,
  };
}
