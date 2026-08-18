import { createFileRoute } from "@tanstack/react-router";
import { PlacementWarRoom } from "@/components/war-room/placement-war-room";
import { SITE, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () =>
    pageHead({
      title: `${SITE.name} | Twin Cities talent board`,
      description: `${SITE.tagline} Watch a Twin Cities seat fill in real time — ${SITE.hook}`,
      path: "/",
    }),
});

function HomePage() {
  return <PlacementWarRoom />;
}
