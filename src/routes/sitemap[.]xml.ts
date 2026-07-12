import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://martellocup.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/fixtures", changefreq: "daily", priority: "0.9" },
  { path: "/results", changefreq: "daily", priority: "0.9" },
  { path: "/points-table", changefreq: "daily", priority: "0.9" },
  { path: "/teams", changefreq: "weekly", priority: "0.8" },
  { path: "/players", changefreq: "weekly", priority: "0.7" },
  { path: "/news", changefreq: "daily", priority: "0.8" },
  { path: "/gallery", changefreq: "weekly", priority: "0.6" },
  { path: "/sponsors", changefreq: "monthly", priority: "0.6" },
  { path: "/members", changefreq: "monthly", priority: "0.6" },
  { path: "/committee", changefreq: "monthly", priority: "0.6" },
  { path: "/tickets", changefreq: "weekly", priority: "0.8" },
  { path: "/jersey", changefreq: "weekly", priority: "0.7" },
  { path: "/registration", changefreq: "weekly", priority: "0.8" },
  { path: "/fifa", changefreq: "daily", priority: "0.8" },
  { path: "/feed", changefreq: "hourly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/auth", changefreq: "yearly", priority: "0.3" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const urls = entries
          .map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path}</loc>`,
              e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
              e.priority ? `    <priority>${e.priority}</priority>` : null,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n"),
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
