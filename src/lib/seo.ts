/**
 * Shared page head helpers for MG Recruiting Source SEO.
 * Per-route title/description + Open Graph / Twitter / canonical.
 */

export const SITE = {
  name: "Fitboard",
  shortName: "Fitboard",
  mark: "FB",
  tagline: "Rank the bench. Run the board.",
  hook: "Score the match before you pick up the phone.",
  description:
    "Fitboard is a recruiter platform for construction, engineering, architecture, and accounting desks. FitScore matching, a conflict wall, shareable scorecards, bench alerts, and a live placement board.",
  phone: "(612) 555-0199",
  phoneE164: "+16125550199",
  email: "hello@fitboard.app",
  address: "Minneapolis–Saint Paul, MN",
  recruiterName: "Alex Rivera",
  recruiterTitle: "Desk lead",
  locale: "en_US",
  themeColor: "#0b0f14",
  defaultOrigin: "https://fitboard.app",
} as const;

const host = import.meta.env.VITE_PUBLIC_HOSTNAME as string | undefined;

export function siteOrigin(): string {
  if (host) return `https://${host}`;
  return SITE.defaultOrigin;
}

export function absoluteUrl(path = "/"): string {
  const base = siteOrigin().replace(/\/$/, "");
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function ogImageUrl(title: string = SITE.name): string | undefined {
  if (!host) return undefined;
  return `https://og.grok.me/v1/card.png?host=${encodeURIComponent(host)}&title=${encodeURIComponent(title)}`;
}

export type PageHeadInput = {
  /** Full document title (already branded). */
  title: string;
  description: string;
  /** Path only, e.g. `/jobs` or `/`. */
  path?: string;
  /** noindex for portal / login / private surfaces. */
  noindex?: boolean;
  ogType?: "website" | "article" | "profile";
};

type MetaEntry =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }
  | { charSet: string };

type LinkEntry = { rel: string; href: string };

/**
 * Build TanStack Router `head()` meta + links for a page.
 * Includes title, description, robots, Open Graph, Twitter, canonical.
 */
export function pageHead(input: PageHeadInput): {
  meta: MetaEntry[];
  links: LinkEntry[];
} {
  const path = input.path ?? "/";
  const url = absoluteUrl(path);
  const ogImage = ogImageUrl(input.title);
  const robots = input.noindex ? "noindex, nofollow" : "index, follow";

  const meta: MetaEntry[] = [
    { title: input.title },
    { name: "description", content: input.description },
    { name: "robots", content: robots },
    { name: "author", content: SITE.name },
    {
      name: "keywords",
      content:
        "recruiter platform, FitScore, construction staffing, engineering recruiting, architecture talent, accounting desk, bench alerts, conflict wall",
    },
    // Open Graph
    { property: "og:site_name", content: SITE.name },
    { property: "og:locale", content: SITE.locale },
    { property: "og:type", content: input.ogType ?? "website" },
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description },
    { property: "og:url", content: url },
    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: input.title },
    { name: "twitter:description", content: input.description },
  ];

  if (ogImage) {
    meta.push(
      { property: "og:image", content: ogImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: input.title },
      { name: "twitter:image", content: ogImage },
    );
  }

  return {
    meta,
    links: [{ rel: "canonical", href: url }],
  };
}
