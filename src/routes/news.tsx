import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Newspaper, Calendar } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTable } from "@/lib/content";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News & Updates · Martello Cup Season 10" },
      { name: "description", content: "Latest Martello Cup news, announcements, match previews and reports for Season 10 (The Tenth Tide)." },
      { property: "og:title", content: "Martello Cup News — Season 10" },
      { property: "og:description", content: "Official Martello Cup news and announcements." },
      { property: "og:url", content: "https://martellocup.lovable.app/news" },
    ],
    links: [{ rel: "canonical", href: "https://martellocup.lovable.app/news" }],
  }),
  component: NewsPage,
});

type Item = {
  id: string;
  title_bn: string;
  title_en: string;
  excerpt_bn: string | null;
  excerpt_en: string | null;
  category: string | null;
  cover_url: string | null;
  published_date: string;
};

function NewsPage() {
  const { lang } = useI18n();
  const { rows, loading } = useTable<Item>("news", { order: "published_date", ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <Newspaper className="h-7 w-7" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-2">
          {lang === "bn" ? "সংবাদ" : "News"}
        </h1>
      </motion.div>

      {loading ? (
        <p className="text-center text-muted-foreground py-10">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-10 text-center">
          <Newspaper className="h-10 w-10 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">{lang === "bn" ? "এডমিন থেকে খবর প্রকাশ করুন।" : "Publish news from the admin panel."}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rows.map((n, i) => (
            <motion.article
              key={n.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-card border border-border shadow-card overflow-hidden flex flex-col"
            >
              <div className="aspect-video bg-gradient-primary relative overflow-hidden">
                {n.cover_url ? (
                  <img src={n.cover_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Newspaper className="h-12 w-12 text-white/60 absolute inset-0 m-auto" />
                )}
                {n.category && (
                  <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-full bg-white/90 text-primary">
                    {n.category}
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-display font-bold text-lg leading-snug">{lang === "bn" ? n.title_bn : n.title_en}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{lang === "bn" ? n.excerpt_bn : n.excerpt_en}</p>
                <div className="mt-auto pt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(n.published_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
