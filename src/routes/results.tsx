import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Award, Calendar } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/results")({
  component: ResultsPage,
});

const RESULTS = [
  { no: 1, home: "Eagles FC", hScore: 2, away: "Tigers United", aScore: 1, date: "2025-04-20", motm: "Karim Ahmed", scorers: ["Karim 23'", "Rafiq 67'", "Sumon 81'"] },
  { no: 2, home: "Sundarban Warriors", hScore: 0, away: "Coastal Kings", aScore: 0, date: "2025-04-19", motm: "Imran Hossain", scorers: [] },
  { no: 3, home: "Royal Stars", hScore: 3, away: "Atlas Boys", aScore: 2, date: "2025-04-18", motm: "Shahriar Khan", scorers: ["Shahriar x2", "Tonu 55'", "Asif 12', 78'"] },
];

function ResultsPage() {
  const { lang } = useI18n();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <Award className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">
          {lang === "bn" ? "ফলাফল" : "Results"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {lang === "bn" ? "সম্পন্ন ম্যাচসমূহের ফলাফল" : "Completed match results"}
        </p>
      </motion.div>

      <div className="space-y-4">
        {RESULTS.map((m, i) => {
          const homeWin = m.hScore > m.aScore;
          const awayWin = m.aScore > m.hScore;
          return (
            <motion.div
              key={m.no}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl bg-card border border-border shadow-card p-5 sm:p-6"
            >
              <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {m.date}</span>
                <span className="font-bold text-success">FT</span>
              </div>
              <div className="grid grid-cols-7 items-center gap-2">
                <div className={`col-span-3 text-right ${homeWin ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                  <p className="text-base sm:text-lg leading-tight">{m.home}</p>
                </div>
                <div className="col-span-1 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                    <span className="font-display text-2xl font-bold">{m.hScore}</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="font-display text-2xl font-bold">{m.aScore}</span>
                  </div>
                </div>
                <div className={`col-span-3 text-left ${awayWin ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                  <p className="text-base sm:text-lg leading-tight">{m.away}</p>
                </div>
              </div>
              {m.scorers.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                  ⚽ {m.scorers.join(" · ")}
                </div>
              )}
              <div className="mt-2 text-xs">
                <span className="text-muted-foreground">{lang === "bn" ? "ম্যাচসেরা: " : "MOTM: "}</span>
                <span className="font-semibold text-primary">{m.motm}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
