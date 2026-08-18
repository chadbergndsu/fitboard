import { describe, expect, it } from "vitest";
import { SITE, absoluteUrl, pageHead } from "./seo";

describe("pageHead", () => {
  it("includes title, description, og, twitter, and canonical", () => {
    const head = pageHead({
      title: "Test Title | MG Recruiting",
      description: "Test description for SEO.",
      path: "/jobs",
    });

    const titles = head.meta.filter((m) => "title" in m);
    expect(titles).toHaveLength(1);
    expect((titles[0] as { title: string }).title).toContain("Test Title");

    const byName = (name: string) =>
      head.meta.find((m) => "name" in m && m.name === name) as
        | { name: string; content: string }
        | undefined;
    const byProp = (property: string) =>
      head.meta.find((m) => "property" in m && m.property === property) as
        | { property: string; content: string }
        | undefined;

    expect(byName("description")?.content).toBe("Test description for SEO.");
    expect(byName("robots")?.content).toBe("index, follow");
    expect(byName("twitter:title")?.content).toContain("Test Title");
    expect(byProp("og:title")?.content).toContain("Test Title");
    expect(byProp("og:site_name")?.content).toBe(SITE.name);
    expect(byProp("og:url")?.content).toBe(absoluteUrl("/jobs"));
    expect(head.links[0]).toEqual({ rel: "canonical", href: absoluteUrl("/jobs") });
  });

  it("marks private pages noindex", () => {
    const head = pageHead({
      title: "Portal",
      description: "Private",
      path: "/portal",
      noindex: true,
    });
    const robots = head.meta.find(
      (m) => "name" in m && m.name === "robots",
    ) as { content: string };
    expect(robots.content).toBe("noindex, nofollow");
  });

  it("exposes product tagline and hook", () => {
    expect(SITE.tagline.toLowerCase()).toContain("bench");
    expect(SITE.hook.toLowerCase()).toContain("score");
    expect(SITE.name).toBe("Fitboard");
  });
});
