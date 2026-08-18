import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mail } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () =>
    pageHead({
      title: `About | ${SITE.name}`,
      description: `${SITE.hook} ${SITE.description}`,
      path: "/about",
    }),
});

function AboutPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <p className="text-sm font-medium text-primary">About</p>
            <h1 className="font-display text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {SITE.name}
            </h1>
            <p className="text-lg text-muted">Recruiter platform · AEC + accounting desks</p>
            <p className="max-w-xl border-l-2 border-primary/50 pl-4 text-base font-medium leading-snug text-fg sm:text-lg">
              {SITE.hook}
            </p>
            <div className="space-y-4 text-base leading-relaxed text-fg/90">
              <p>
                Most recruiting tools are CRMs with a job board glued on. Fitboard is
                the opposite: a desk that ranks the bench, flags conflicts, and hands
                a hiring manager a scorecard they can actually read.
              </p>
              <p>
                Built for construction, engineering, architecture, and accounting
                searches — licenses, project types, and site culture matter more than
                a keyword dump.
              </p>
              <p>
                FitScore is local TypeScript. No rented ATS. Import a roster, run the
                board, share a FitCard.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/portal">
                  Open the desk
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <a href={`mailto:${SITE.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  {SITE.email}
                </a>
              </Button>
              <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto">
                <Link to="/contact">Contact</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-border bg-surface">
              <CardHeader>
                <CardTitle className="text-base">What&apos;s unique</CardTitle>
                <CardDescription>Not another generic ATS clone.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  ["FitScore", "Transparent local matching — weights you can audit"],
                  ["FitCard", "Share a score with a hiring manager, no login"],
                  ["Conflict Wall", "Do-not-pitch holds so you don't burn two GCs"],
                  ["Placement board", "Watch a fill play out on the Twin Cities map"],
                  ["BenchAlert", "Who is rolling off, and where they fit next"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-start justify-between gap-4 border-b border-border pb-2 last:border-0 last:pb-0"
                  >
                    <span className="font-medium">{k}</span>
                    <span className="text-right text-muted">{v}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
