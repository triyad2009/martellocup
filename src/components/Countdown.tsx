import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

function diff(target: Date) {
  const now = Date.now();
  const ms = Math.max(0, target.getTime() - now);
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { d, h, m, s };
}

export function Countdown({ target }: { target: Date }) {
  const { t } = useI18n();
  // Start with zeros so server-render and first client-render match.
  // After mount, update to real countdown and tick every second.
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(diff(target));
    const id = setInterval(() => setTime(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const items = [
    { v: time.d, label: t("hero.days") },
    { v: time.h, label: t("hero.hours") },
    { v: time.m, label: t("hero.minutes") },
    { v: time.s, label: t("hero.seconds") },
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {items.map((it, i) => (
        <motion.div
          key={it.label}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 * i }}
          className="flex flex-col items-center"
        >
          <div className="relative w-16 sm:w-20 h-16 sm:h-20 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-elevated overflow-hidden">
            <motion.span
              key={it.v}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-display text-2xl sm:text-3xl font-bold text-white"
            >
              {String(it.v).padStart(2, "0")}
            </motion.span>
          </div>
          <span className="mt-2 text-xs sm:text-sm text-white/70 uppercase tracking-wider">{it.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
