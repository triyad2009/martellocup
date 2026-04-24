import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
});

const PHOTOS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  hue: (i * 47) % 360,
  caption: `Match Moment ${i + 1}`,
}));

function GalleryPage() {
  const { lang } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <ImageIcon className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">
          {lang === "bn" ? "গ্যালারি" : "Gallery"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {lang === "bn" ? "মার্টেলো কাপের স্মরণীয় মুহূর্ত" : "Memorable moments from Martello Cup"}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {PHOTOS.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.03 }}
            className="aspect-square rounded-xl overflow-hidden relative cursor-pointer group"
            style={{
              background: `linear-gradient(135deg, oklch(0.6 0.18 ${p.hue}), oklch(0.4 0.20 ${(p.hue + 60) % 360}))`,
            }}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-3">
              <p className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                {p.caption}
              </p>
            </div>
            <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white/40" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
