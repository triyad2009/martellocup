import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTable } from "@/lib/content";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo Gallery · Martello Cup Season 10" },
      { name: "description", content: "Photos and highlights from Martello Cup Season 10 (The Tenth Tide) — matchday moments, celebrations and behind the scenes." },
      { property: "og:title", content: "Martello Cup Gallery — Season 10" },
      { property: "og:description", content: "The best photos from Martello Cup Season 10." },
      { property: "og:url", content: "https://martellocup.lovable.app/gallery" },
    ],
    links: [{ rel: "canonical", href: "https://martellocup.lovable.app/gallery" }],
  }),
  component: GalleryPage,
});

type Img = {
  id: string;
  image_url: string;
  caption_bn: string | null;
  caption_en: string | null;
};

function GalleryPage() {
  const { lang } = useI18n();
  const { rows, loading } = useTable<Img>("gallery_images");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <ImageIcon className="h-7 w-7" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-2">
          {lang === "bn" ? "গ্যালারি" : "Gallery"}
        </h1>
        <p className="text-muted-foreground">{lang === "bn" ? "টুর্নামেন্টের মুহূর্তসমূহ" : "Tournament moments"}</p>
      </motion.div>

      {loading ? (
        <p className="text-center text-muted-foreground py-10">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-10 text-center">
          <ImageIcon className="h-10 w-10 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">{lang === "bn" ? "এডমিন থেকে ছবি আপলোড করুন।" : "Upload images from the admin panel."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {rows.map((p, i) => {
            const caption = lang === "bn" ? p.caption_bn : p.caption_en;
            return (
              <motion.figure
                key={p.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.02 }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border shadow-card bg-muted"
              >
                <img src={p.image_url} alt={caption ?? ""} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                {caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 p-2 text-xs text-white font-semibold bg-gradient-to-t from-black/80 to-transparent">
                    {caption}
                  </figcaption>
                )}
              </motion.figure>
            );
          })}
        </div>
      )}
    </div>
  );
}
