import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Newspaper, Calendar, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/news")({
  component: NewsPage,
});

const NEWS = [
  {
    titleBn: "মার্টেলো কাপ ২০২৫ আনুষ্ঠানিকভাবে ঘোষণা",
    titleEn: "Martello Cup 2025 Officially Announced",
    excerptBn: "৮টি দল নিয়ে গাইনবাড়ীতে শুরু হচ্ছে এই বছরের সবচেয়ে প্রতীক্ষিত ফুটবল টুর্নামেন্ট।",
    excerptEn: "The most anticipated football tournament of the year kicks off in Gainbari with 8 teams.",
    date: "2025-04-15",
    cat: "Announcement",
    hue: 5,
  },
  {
    titleBn: "নিবন্ধন এখন চালু — দল নিবন্ধন করুন",
    titleEn: "Registrations Now Open — Register Your Team",
    excerptBn: "অনলাইনে দ্রুত ও সহজে দল নিবন্ধন করুন। সংরক্ষিত আসন সীমিত।",
    excerptEn: "Quickly register your team online. Spots are limited so secure yours today.",
    date: "2025-04-10",
    cat: "Registration",
    hue: 200,
  },
  {
    titleBn: "৮ দলের চূড়ান্ত গ্রুপিং সম্পন্ন",
    titleEn: "Final Group Draw for 8 Teams Completed",
    excerptBn: "গ্রুপ এ ও গ্রুপ বি — দেখুন আপনার পছন্দের দল কোন গ্রুপে রয়েছে।",
    excerptEn: "Group A and Group B drawn — see which group your favorite team is in.",
    date: "2025-04-05",
    cat: "Update",
    hue: 130,
  },
];

function NewsPage() {
  const { lang } = useI18n();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <Newspaper className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">
          {lang === "bn" ? "সংবাদ" : "News"}
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {NEWS.map((n, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            className="rounded-2xl bg-card border border-border shadow-card overflow-hidden hover:shadow-elevated transition-shadow flex flex-col"
          >
            <div
              className="h-44 relative"
              style={{
                background: `linear-gradient(135deg, oklch(0.55 0.20 ${n.hue}), oklch(0.35 0.18 ${(n.hue + 40) % 360}))`,
              }}
            >
              <span className="absolute top-3 left-3 bg-white/90 text-dark text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                {n.cat}
              </span>
              <Newspaper className="absolute bottom-4 right-4 h-10 w-10 text-white/30" />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Calendar className="h-3 w-3" />
                {n.date}
              </div>
              <h2 className="font-display font-bold text-lg leading-tight mb-2">
                {lang === "bn" ? n.titleBn : n.titleEn}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {lang === "bn" ? n.excerptBn : n.excerptEn}
              </p>
              <button className="mt-4 inline-flex items-center gap-1 text-primary font-semibold text-sm self-start hover:gap-2 transition-all">
                {lang === "bn" ? "বিস্তারিত পড়ুন" : "Read more"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
