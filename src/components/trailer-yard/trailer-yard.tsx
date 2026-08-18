import { useCallback, useState } from "react";
import { Link } from "@tanstack/react-router";
import { RotateCcw, LayoutGrid, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/seo";
import { TRAILERS, type TrailerId } from "@/lib/trailer-yard";
import { useTrailerYardStore } from "@/lib/trailer-store";
import { SiteTrailer } from "./site-trailer";

/**
 * Modular jobsite trailer dashboard — primary homepage workspace.
 * Roll out trailers, expand bays, drag to rearrange the yard.
 */
export function TrailerYard() {
  const { order, expandedId, toggleExpanded, moveTrailer, resetLayout } =
    useTrailerYardStore();
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const onDragStart = useCallback((index: number) => {
    setDragFrom(index);
  }, []);

  const onDragOver = useCallback((index: number) => {
    setDragOver(index);
  }, []);

  const onDragEnd = useCallback(() => {
    if (dragFrom != null && dragOver != null && dragFrom !== dragOver) {
      moveTrailer(dragFrom, dragOver);
    }
    setDragFrom(null);
    setDragOver(null);
  }, [dragFrom, dragOver, moveTrailer]);

  return (
    <div className="flex min-h-[calc(100dvh-var(--grok-banner-h,0px))] flex-col bg-[#080b10]">
      <div className="relative z-30 border-b border-[#1a222d] bg-[#0a0e14]/95 backdrop-blur-md">
        <SiteHeader />
      </div>

      {/* Yard surface */}
      <main className="relative flex-1">
        {/* Asphalt + striping */}
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundColor: "#0a0e14",
            backgroundImage: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(61,142,196,0.08), transparent 55%),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 47px,
                rgba(36,48,65,0.35) 47px,
                rgba(36,48,65,0.35) 48px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 47px,
                rgba(36,48,65,0.25) 47px,
                rgba(36,48,65,0.25) 48px
              )
            `,
          }}
        />
        {/* Pad stripe */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#e85d2a]/50 to-transparent" />

        <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          {/* Yard header */}
          <header className="mb-8 space-y-4 sm:mb-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#3d8ec4]">
                  Jobsite trailer yard · Twin Cities
                </p>
                <h1 className="font-display text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                  Rank the bench.
                  <span className="mt-1 block text-primary">Strengthening teams.</span>
                </h1>
                <p className="max-w-xl text-base font-medium leading-snug text-fg/90 sm:text-lg">
                  {SITE.hook}
                </p>
                <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                  Every major section is a physical jobsite trailer.{" "}
                  <strong className="font-medium text-fg/80">Roll one out</strong> to
                  expand.{" "}
                  <strong className="font-medium text-fg/80">Drag the grip</strong> to
                  rearrange your workspace — Construction, Engineering, Architecture,
                  Accounting, and ops bays.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11 border-[#2a3544]"
                  onClick={() => resetLayout()}
                >
                  <RotateCcw className="mr-1.5 h-4 w-4" />
                  Reset yard layout
                </Button>
                <p className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  {order.length} trailers on pad
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                asChild
                className="border-0 bg-[#e85d2a] text-white hover:bg-[#f06a38]"
              >
                <a href={`tel:${SITE.phoneE164}`}>
                  <Phone className="mr-1.5 h-4 w-4" />
                  {SITE.phone}
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Hire talent</Link>
              </Button>
              <Button
                asChild
                className="border-0 bg-[#3d8ec4] text-white hover:bg-[#4a9fd4]"
              >
                <Link to="/portal">Client portal</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/">Digital twin home</Link>
              </Button>
            </div>
          </header>

          {/* Industry row label */}
          <div className="mb-3 flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6a8296]">
              Industry trailers
            </span>
            <span className="h-px flex-1 bg-[#243041]" />
          </div>

          {/* Trailer stack */}
          <div className="space-y-4 sm:space-y-5">
            {order.map((id, index) => {
              const trailer = TRAILERS[id as TrailerId];
              if (!trailer) return null;
              const isIndustry = trailer.kind === "industry";
              const prev = index > 0 ? TRAILERS[order[index - 1]] : null;
              const showOpsLabel =
                trailer.kind !== "industry" &&
                (!prev || prev.kind === "industry");

              return (
                <div key={id}>
                  {showOpsLabel ? (
                    <div className="mb-3 mt-8 flex items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6a8296]">
                        Ops & connect trailers
                      </span>
                      <span className="h-px flex-1 bg-[#243041]" />
                    </div>
                  ) : null}
                  <SiteTrailer
                    trailer={trailer}
                    index={index}
                    expanded={expandedId === id}
                    onToggle={() => toggleExpanded(id)}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
                    isDragging={dragFrom === index}
                    isDropTarget={dragOver === index && dragFrom !== index}
                  />
                  {/* Subtle separator after industry block visual */}
                  {isIndustry && index === 3 ? null : null}
                </div>
              );
            })}
          </div>

          <p className="mt-10 text-center font-mono text-[11px] text-muted">
            MG RECRUITING SOURCE · TRAILER YARD DASHBOARD ·{" "}
            {SITE.address.toUpperCase()}
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
