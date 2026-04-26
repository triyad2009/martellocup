import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Trophy, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTable } from "@/lib/content";

export const Route = createFileRoute("/results")({
  component: ResultsPage,
});

type Result = {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  match_date: string;
  motm: string | null;
  scorers: string | null;
};

function ResultsPage() {
  const { lang } = useI18n();
  const { rows, loading } = useTable<Result>("results", { order: "match_date", ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <Trophy className="h-7 w-7" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-2">
          {lang === "bn" ? "ফলাফল" : "Results"}
        </h1>
        <p className="text-muted-foreground">{lang === "bn" ? "সাম্প্রতিক ম্যাচের ফলাফল" : "Recent match results"}</p>
      </motion.div>

      {loading ? (
        <p className="text-center text-muted-foreground py-10">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-10 text-center">
          <Trophy className="h-10 w-10 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">
            {lang === "bn" ? "এডমিন থেকে ফলাফল যোগ করুন।" : "Add results from the admin panel."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((r, i) => {
            const homeWin = r.home_score > r.away_score;
            const awayWin = r.away_score > r.home_score;
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-card border border-border shadow-card p-5"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{new Date(r.match_date).toLocaleDateString()}</span>
                  <span className="font-bold uppercase tracking-widest">FT</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-3">
                  <div className={`text-right font-display font-bold text-lg sm:text-xl ${homeWin ? "text-primary" : ""}`}>{r.home_team}</div>
                  <div className="text-center font-display font-extrabold text-3xl sm:text-4xl">{r.home_score} - {r.away_score}</div>
                  <div className={`text-left font-display font-bold text-lg sm:text-xl ${awayWin ? "text-primary" : ""}`}>{r.away_team}</div>
                </div>
                {(r.scorers || r.motm) && (
                  <div className="mt-4 pt-4 border-t border-border space-y-1 text-xs text-muted-foreground">
                    {r.scorers && <p>⚽ {r.scorers}</p>}
                    {r.motm && (
                      <p className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 text-primary" />
                        {lang === "bn" ? "ম্যাচসেরা: " : "MOTM: "}
                        <span className="font-semibold text-foreground">{r.motm}</span>
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
