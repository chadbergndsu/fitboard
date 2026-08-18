import { createFileRoute, Link } from "@tanstack/react-router";
import { HardHat, Ruler, Building2, Calculator, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/industries")({
  component: IndustriesPage,
  head: () =>
    pageHead({
      title:
        "Industries | Construction Engineering Architecture Accounting Recruiting MN",
      description:
        `${SITE.name} is a recruiter platform for construction, engineering, architecture, and accounting desks across Minnesota and the Upper Midwest.`,
      path: "/industries",
    }),
});

const industries = [
  {
    icon: HardHat,
    title: "Construction",
    slug: "construction",
    roles: ["Project Manager", "Superintendent", "Estimator", "Field Engineer", "Safety Manager"],
    body: "Commercial, healthcare, industrial, and heavy civil. We understand project timelines, GC culture, and the difference between a resume and a job-site leader.",
  },
  {
    icon: Ruler,
    title: "Engineering",
    slug: "engineering",
    roles: ["Structural PE", "Civil Engineer", "MEP Designer", "Project Engineer", "BIM Manager"],
    body: "Licensed and pre-licensed talent for design firms and owner-operators who need technical depth without long search cycles.",
  },
  {
    icon: Building2,
    title: "Architecture",
    slug: "architecture",
    roles: ["Project Architect", "Job Captain", "Interior Designer", "Spec Writer"],
    body: "Studio culture fit matters. We match portfolios and personality to firms building schools, healthcare, and mixed-use across the region.",
  },
  {
    icon: Calculator,
    title: "Accounting",
    slug: "accounting",
    roles: ["Controller", "Project Accountant", "AP/AR Lead", "CFO (contract)"],
    body: "Contractor finance is specialized. We place people who understand job cost, WIP, and bonding — not generic bookkeepers.",
  },
];

function IndustriesPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Specialization</p>
          <h1 className="mt-2 font-display text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Four competitive markets. One focused firm.
          </h1>
          <p className="mt-3 leading-relaxed text-muted">
            Key positions in these industries are hard to fill. We bring larger-firm
            network power with dedicated local service for employers and candidates.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:mt-10">
          {industries.map((ind) => (
            <Card key={ind.slug} className="border-border bg-surface" id={ind.slug}>
              <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <ind.icon className="h-5 w-5" />
                    </span>
                    <CardTitle className="text-xl">{ind.title}</CardTitle>
                  </div>
                  <CardDescription className="max-w-2xl text-sm leading-relaxed">
                    {ind.body}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {ind.roles.map((r) => (
                      <span
                        key={r}
                        className="rounded-full border border-border bg-elevated px-2.5 py-1 text-xs text-fg/90"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full shrink-0 sm:w-auto">
                  <Link to="/contact">
                    Hire in {ind.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
