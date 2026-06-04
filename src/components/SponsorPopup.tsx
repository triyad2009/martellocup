import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Crown } from "lucide-react";
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

const INTERVAL_MS = 45_000; // show every 45s
const FIRST_DELAY_MS = 8_000;
const AUTO_HIDE_MS = 9_000;

export function SponsorPopup() {
  const { lang } = useI18n();
  const [rows, setRows] = useState<Sponsor[]>([]);
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    supabase
      .from("sponsors")
      .select("id,name,tier,logo_url,banner_url,description_bn,description_en")
      .eq("tier", "gold")
      .eq("status", "approved")
      .order("sort_order")
      .then(({ data }) => setRows((data ?? []) as Sponsor[]));
  }, []);

  useEffect(() => {
    if (dismissed || rows.length === 0) return;
    const first = setTimeout(() => setOpen(true), FIRST_DELAY_MS);
    const cycle = setInterval(() => {
      setIdx((i) => (i + 1) % rows.length);
      setOpen(true);
    }, INTERVAL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(cycle);
    };
  }, [rows.length, dismissed]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), AUTO_HIDE_MS);
    return () => clearTimeout(t);
  }, [open, idx]);

  if (rows.length === 0) return null;
  const s = rows[idx];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ type: "spring", damping: 18 }}
          className="fixed z-[60] bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 sm:w-[360px] max-w-[420px] rounded-2xl overflow-hidden border-2 border-yellow-500/60 bg-card shadow-2xl"
          role="dialog"
          aria-label="Gold sponsor"
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setDismissed(true);
            }}
            aria-label="Close"
            className="absolute top-2 right-2 z-10 h-8 w-8 inline-flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
          >
            <X className="h-4 w-4" />
          </button>

          <Link
            to="/sponsors"
            hash={s.id}
            onClick={() => setOpen(false)}
            className="block group"
          >
            <div className="relative h-32 bg-gradient-to-br from-yellow-500/15 to-amber-500/15">
              {s.banner_url ? (
                <img src={s.banner_url} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Crown className="h-14 w-14 text-yellow-500/50" />
                </div>
              )}
              <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500 text-yellow-950 text-[10px] font-black tracking-widest shadow">
                <Crown className="h-3 w-3" /> GOLD
              </div>
            </div>
            <div className="p-3 flex items-center gap-3 min-w-0">
              {s.logo_url && (
                <img src={s.logo_url} alt="" className="h-11 w-11 rounded-lg object-contain bg-white p-1 border border-border shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-widest text-yellow-600 dark:text-yellow-500 font-bold">
                  {lang === "bn" ? "গোল্ড স্পন্সর" : "Gold Sponsor"}
                </p>
                <p className="font-display font-bold truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {(lang === "bn" ? s.description_bn : s.description_en) || (lang === "bn" ? "বিস্তারিত দেখুন" : "View details")}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
