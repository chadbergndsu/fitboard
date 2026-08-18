import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Briefcase, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { jobReqs } from "@/lib/data";
import { SITE, pageHead, siteOrigin } from "@/lib/seo";

const jobsSeo = pageHead({
  title:
    `Open Roles | ${SITE.name}`,
  description:
    "Current openings in construction, engineering, architecture, and accounting across Minnesota and the Upper Midwest.",
  path: "/jobs",
});

export const Route = createFileRoute("/jobs")({
  component: JobsPage,
  head: () => ({
    ...jobsSeo,
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          jobReqs
            .filter((j) => !j.status || j.status === "open")
            .map((job) => ({
              "@context": "https://schema.org",
              "@type": "JobPosting",
              title: job.title,
              description: job.description,
              hiringOrganization: {
                "@type": "Organization",
                name: SITE.name,
                sameAs: siteOrigin(),
              },
              jobLocation: {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: job.location.split(",")[0]?.trim(),
                  addressRegion: job.state,
                  addressCountry: "US",
                },
              },
              employmentType: "FULL_TIME",
              industry: job.industry,
            })),
        ),
      },
    ],
  }),
});

function JobsPage() {
  const openJobs = jobReqs.filter((j) => !j.status || j.status === "open");

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Careers</p>
          <h1 className="mt-2 font-display text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Open roles
          </h1>
          <p className="mt-3 text-muted leading-relaxed">
            Select placements across the Upper Midwest. Clients hire through the desk —
            candidates get a real conversation, not a black-hole ATS.
          </p>
        </div>

        <div className="mt-10 grid gap-4">
          {openJobs.map((job) => (
            <Card key={job.id} className="border-border bg-surface" id={job.id}>
              <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <Badge variant="secondary">Full-time</Badge>
                  </div>
                  <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {job.company}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                    <span className="capitalize text-muted">{job.industry}</span>
                  </CardDescription>
                </div>
                <div className="flex w-full shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:items-end">
                  {job.salaryRange ? (
                    <p className="font-mono text-sm font-medium text-primary">
                      {job.salaryRange}
                    </p>
                  ) : null}
                  <Button asChild size="sm" className="w-full sm:w-auto">
                    <a
                      href={`mailto:${SITE.email}?subject=${encodeURIComponent(`Interest: ${job.title}`)}`}
                    >
                      Apply
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 border-t border-border pt-4">
                <p className="text-sm leading-relaxed text-fg/90">{job.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills.slice(0, 8).map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border bg-elevated px-2.5 py-0.5 text-xs text-muted"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-border bg-elevated/40 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="font-medium">Don't see the right role?</p>
            <p className="mt-1 text-sm text-muted">
              Send your background to the desk. Many of the best placements start off-market.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
            <Button asChild>
              <Link to="/contact">Contact</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/portal">Open portal</Link>
            </Button>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
