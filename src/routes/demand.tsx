import { createFileRoute } from "@tanstack/react-router";
import { BlueprintHome } from "@/components/blueprint/blueprint-home";
import { SITE, pageHead } from "@/lib/seo";

/**
 * Full interactive demand blueprint board (pan/zoom annotations).
 * Linked from the Demand trailer on the yard homepage.
 */
export const Route = createFileRoute("/demand")({
  component: DemandPage,
  head: () =>
    pageHead({
      title: `Demand Board | ${SITE.name}`,
      description: `Regional project demand blueprint for Twin Cities and Fargo. ${SITE.tagline}`,
      path: "/demand",
    }),
});

function DemandPage() {
  return <BlueprintHome />;
}
