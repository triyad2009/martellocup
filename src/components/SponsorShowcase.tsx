import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, ChevronRight, Crown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

type Sponsor = {
  id: string;
  name: string;
  tier: string;
  logo_url: string | null;
  banner_url: string | null;
  description_bn: string;
  description_en: string;
};

export function SponsorShowcase({ compact = false }: { compact?: boolean }) {
  const { lang } = useI18n();
  const [rows, setRows] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("sponsors")
      .select("id,name,tier,logo_url,banner_url,description_bn,description_en")
      .eq("tier", "gold")
      .eq("status", "approved")
      .order("sort_order")
      .then(({ data }) => {
        setRows((data ?? []) as Sponsor[]);
        setLoading(false);
      });
  }, []);

  if (loading || rows.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/40 mb-3">
          <Crown className="h-4 w-4 text-yellow-600" />
          <span className="text-xs font-bold tracking-widest uppercase text-yellow-700 dark:text-yellow-500">
            {lang === "bn" ? "গোল্ড স্পন্সর" : "GOLD SPONSORS"}
          </span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold">
          {lang === "bn" ? "আমাদের প্রধান অংশীদার" : "Our Premier Partners"}
        </h2>
      </motion.div>

      <div className={`grid gap-4 sm:gap-5 grid-cols-1 ${compact ? "sm:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"}`}>
        {rows.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="min-w-0"
          >
            <Link
              to="/sponsors"
              hash={s.id}
              className="block group rounded-2xl overflow-hidden bg-card border-2 border-yellow-500/30 hover:border-yellow-500 shadow-card hover:shadow-glow-red transition-all w-full"
            >
              <div className="relative h-40 sm:h-52 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 overflow-hidden">
                {s.banner_url ? (
                  <img
                    src={s.banner_url}
                    alt={s.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Award className="h-16 w-16 sm:h-20 sm:w-20 text-yellow-500/40" />
                  </div>
                )}
                <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500 text-yellow-950 text-[10px] font-black tracking-widest shadow-lg">
                  <Crown className="h-3 w-3" /> GOLD
                </div>
              </div>
              <div className="p-4 sm:p-5 flex items-center gap-3 min-w-0">
                {s.logo_url && (
                  <img
                    src={s.logo_url}
                    alt=""
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-contain bg-white p-1.5 border border-border shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-base sm:text-lg truncate">{s.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 break-words">
                    {(lang === "bn" ? s.description_bn : s.description_en) ||
                      (lang === "bn" ? "বিস্তারিত দেখুন" : "View details")}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
