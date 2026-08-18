import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { CreatedWithGrokBanner } from "@/components/created-with-grok-banner";
import { SuggestionButton } from "@/components/suggestion-button";
import { Toaster } from "sonner";
import { SITE, absoluteUrl, ogImageUrl, siteOrigin } from "@/lib/seo";
import appCss from "../styles.css?url";

const rootOgImage = ogImageUrl(SITE.name);

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: `${SITE.name} | ${SITE.tagline}` },
      { name: "description", content: SITE.description },
      { name: "theme-color", content: SITE.themeColor },
      { name: "color-scheme", content: "dark" },
      { name: "format-detection", content: "telephone=yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent",
      },
      { name: "application-name", content: SITE.shortName },
      { property: "og:site_name", content: SITE.name },
      { property: "og:locale", content: SITE.locale },
      { property: "og:title", content: SITE.name },
      { property: "og:description", content: SITE.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE.name },
      { name: "twitter:description", content: SITE.description },
      ...(rootOgImage
        ? [
            { property: "og:image", content: rootOgImage },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { name: "twitter:image", content: rootOgImage },
          ]
        : []),
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: absoluteUrl("/") },
    ],
  }),
  component: RootShell,
});

function RootShell() {
  const origin = siteOrigin();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EmploymentAgency",
              name: SITE.name,
              alternateName: SITE.shortName,
              description: SITE.description,
              slogan: SITE.tagline,
              url: origin,
              email: SITE.email,
              telephone: SITE.phoneE164,
              address: {
                "@type": "PostalAddress",
                addressLocality: "Minneapolis",
                addressRegion: "MN",
                addressCountry: "US",
              },
              areaServed: [
                "Minnesota",
                "North Dakota",
                "Wisconsin",
                "South Dakota",
                "Iowa",
              ],
              founder: {
                "@type": "Person",
                name: SITE.recruiterName,
                jobTitle: SITE.recruiterTitle,
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: SITE.phoneE164,
                contactType: "sales",
                email: SITE.email,
                areaServed: "US",
                availableLanguage: "English",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-dvh bg-bg text-fg antialiased">
        <CreatedWithGrokBanner />
        <AuthProvider>
          <Outlet />
          <SuggestionButton />
          <Toaster theme="dark" position="bottom-right" richColors closeButton />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
