import { createFileRoute } from "@tanstack/react-router";
import { TrailerYard } from "@/components/trailer-yard/trailer-yard";
import { SITE, pageHead } from "@/lib/seo";

/** Modular jobsite trailer dashboard (former homepage). */
export const Route = createFileRoute("/yard")({
  component: YardPage,
  head: () =>
    pageHead({
      title: `Trailer Yard | ${SITE.name}`,
      description: `Modular jobsite trailer workspace — Construction, Engineering, Architecture, Accounting. ${SITE.tagline}`,
      path: "/yard",
    }),
});

function YardPage() {
  return <TrailerYard />;
}
