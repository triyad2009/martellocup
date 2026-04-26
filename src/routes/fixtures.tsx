import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Trophy } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTable } from "@/lib/content";

export const Route = createFileRoute("/fixtures")({
  component: FixturesPage,
});

type Fixture = {
  id: string;
  round: string | null;
  home_team: string;
  away_team: string;
  match_date: string;
  match_time: string | null;
  venue: string | null;
  status: string;
};

function FixturesPage() {
  const { lang } = useI18n();
  const { rows, loading } = useTable<Fixture>("fixtures", { order: "match_date", ascending: true });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <Calendar className="h-7 w-7" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-2">
          {lang === "bn" ? "ফিক্সচার" : "Fixtures"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "bn" ? "আসন্ন ও নির্ধারিত ম্যাচসমূহ" : "Upcoming and scheduled matches"}
        </p>
      </motion.div>

      {loading ? (
        <p className="text-center text-muted-foreground py-10">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-10 text-center">
          <Trophy className="h-10 w-10 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">
            {lang === "bn" ? "এডমিন থেকে ফিক্সচার যোগ করুন।" : "Add fixtures from the admin panel."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="rounded-2xl bg-card border border-border shadow-card p-5"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {m.round && (
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {m.round}
                  </span>
                )}
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {m.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 items-center gap-3">
                <div className="text-right font-display font-bold text-lg sm:text-2xl">{m.home_team}</div>
                <div className="text-center text-xs sm:text-sm text-muted-foreground font-bold">VS</div>
                <div className="text-left font-display font-bold text-lg sm:text-2xl">{m.away_team}</div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(m.match_date).toLocaleDateString()}
                </span>
                {m.match_time && (
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {m.match_time}</span>
                )}
                {m.venue && (
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {m.venue}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
