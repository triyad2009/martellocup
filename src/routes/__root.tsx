import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import appCss from "../styles.css?url";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIAssistant } from "@/components/AIAssistant";
import { SponsorPopup } from "@/components/SponsorPopup";
import { ThemeApplier } from "@/lib/settings";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-primary text-glow-red">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

const SITE_URL = "https://martellocup.mvp.bd";
const SITE_TITLE = "Martello Cup — Season 10 (The Tenth Tide) Official Football Tournament";
const SITE_DESC = "Martello Cup Season 10 (The Tenth Tide) — the official football tournament of Martello. Live fixtures, results, points table, team registration, tickets, jersey shop, and season news.";
const SITE_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/tDq1dI3ZrQWssm7Zr4YN6NdE3842/social-images/social-1777021169850-1000150813.webp";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESC },
      { name: "author", content: "TAHSINULLAH RIYAD" },
      { name: "application-name", content: "Martello Cup" },
      { name: "apple-mobile-web-app-title", content: "Martello Cup" },
      { name: "theme-color", content: "#1a6fb8" },
      { name: "keywords", content: "Martello Cup, Martello Cup Season 10, The Tenth Tide, Martello football tournament, Martello Cup fixtures, Martello Cup results, Martello Cup tickets, Martello Cup registration, Martello" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "google", content: "notranslate" },
      { property: "og:site_name", content: "Martello Cup" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:locale", content: "bn_BD" },
      { property: "og:locale:alternate", content: "en_US" },
      { property: "og:image", content: SITE_IMAGE },
      { property: "og:image:alt", content: "Martello Cup Season 10 — The Tenth Tide" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESC },
      { name: "twitter:image", content: SITE_IMAGE },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "Martello Cup",
              alternateName: ["Martello Cup Season 10", "The Tenth Tide", "মার্টেলো কাপ"],
              url: SITE_URL,
              logo: SITE_IMAGE,
              sameAs: [SITE_URL],
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: "Martello Cup",
              description: SITE_DESC,
              publisher: { "@id": `${SITE_URL}/#organization` },
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/news?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
              inLanguage: ["bn", "en"],
            },
            {
              "@type": "SportsEvent",
              name: "Martello Cup Season 10 — The Tenth Tide",
              alternateName: "Martello Cup",
              sport: "Football",
              description: SITE_DESC,
              url: SITE_URL,
              image: SITE_IMAGE,
              eventStatus: "https://schema.org/EventScheduled",
              eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
              organizer: { "@id": `${SITE_URL}/#organization` },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <ThemeApplier />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
            <AIAssistant />
            <SponsorPopup />
          </div>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
