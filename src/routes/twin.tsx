import { createFileRoute } from "@tanstack/react-router";
import { DigitalTwin } from "@/components/digital-twin/digital-twin";
import { SITE, pageHead } from "@/lib/seo";

/** Previous 3D house twin — kept for comparison, no longer the first impression. */
export const Route = createFileRoute("/twin")({
  component: DigitalTwin,
  head: () =>
    pageHead({
      title: `3D twin | ${SITE.name}`,
      description: `3D digital twin of the Twin Cities talent network.`,
      path: "/twin",
      noindex: true,
    }),
});
