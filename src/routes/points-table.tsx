import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { TrendingUp, Trophy } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/points-table")({
  component: PointsPage,
});

const TABLE = [
  { pos: 1, team: "Royal Stars", p: 3, w: 3, d: 0, l: 0, gf: 8, ga: 2, pts: 9, form: ["W","W","W"] },
  { pos: 2, team: "Eagles FC", p: 3, w: 2, d: 1, l: 0, gf: 6, ga: 3, pts: 7, form: ["W","D","W"] },
  { pos: 3, team: "Sundarban Warriors", p: 3, w: 1, d: 2, l: 0, gf: 4, ga: 3, pts: 5, form: ["D","W","D"] },
  { pos: 4, team: "Lions XI", p: 3, w: 1, d: 1, l: 1, gf: 5, ga: 4, pts: 4, form: ["W","L","D"] },
  { pos: 5, team: "Tigers United", p: 3, w: 1, d: 0, l: 2, gf: 3, ga: 5, pts: 3, form: ["L","W","L"] },
  { pos: 6, team: "Coastal Kings", p: 3, w: 0, d: 2, l: 1, gf: 2, ga: 4, pts: 2, form: ["D","L","D"] },
  { pos: 7, team: "Atlas Boys", p: 3, w: 0, d: 1, l: 2, gf: 3, ga: 6, pts: 1, form: ["L","D","L"] },
  { pos: 8, team: "Phoenix FC", p: 3, w: 0, d: 1, l: 2, gf: 1, ga: 5, pts: 1, form: ["L","D","L"] },
];

const formColor = (r: string) =>
  r === "W" ? "bg-success text-success-foreground" : r === "D" ? "bg-warning text-white" : "bg-destructive text-destructive-foreground";

function PointsPage() {
  const { lang } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <TrendingUp className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">
          {lang === "bn" ? "পয়েন্ট তালিকা" : "Points Table"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {lang === "bn" ? "ম্যাচ ফলাফল থেকে স্বয়ংক্রিয়ভাবে গণনা করা" : "Auto-calculated from match results"}
        </p>
      </motion.div>

      <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark text-dark-foreground">
              <tr>
                <th className="px-3 py-3 text-left font-display">#</th>
                <th className="px-3 py-3 text-left font-display sticky left-0 bg-dark">{lang === "bn" ? "দল" : "Team"}</th>
                <th className="px-2 py-3 font-display">P</th>
                <th className="px-2 py-3 font-display text-success">W</th>
                <th className="px-2 py-3 font-display text-warning">D</th>
                <th className="px-2 py-3 font-display text-destructive">L</th>
                <th className="px-2 py-3 font-display">GF</th>
                <th className="px-2 py-3 font-display">GA</th>
                <th className="px-2 py-3 font-display">GD</th>
                <th className="px-3 py-3 font-display text-primary">Pts</th>
                <th className="px-3 py-3 font-display text-left">{lang === "bn" ? "ফর্ম" : "Form"}</th>
              </tr>
            </thead>
            <tbody>
              {TABLE.map((t, i) => (
                <motion.tr
                  key={t.team}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className={`border-t border-border ${
                    t.pos === 1 ? "bg-warning/10" : t.pos === 2 ? "bg-muted/40" : ""
                  } hover:bg-muted/60`}
                >
                  <td className="px-3 py-3 font-bold">
                    {t.pos === 1 && <Trophy className="inline h-4 w-4 text-warning mr-1" />}
                    {t.pos}
                  </td>
                  <td className="px-3 py-3 font-semibold sticky left-0 bg-inherit">{t.team}</td>
                  <td className="px-2 py-3 text-center">{t.p}</td>
                  <td className="px-2 py-3 text-center text-success font-semibold">{t.w}</td>
                  <td className="px-2 py-3 text-center text-warning font-semibold">{t.d}</td>
                  <td className="px-2 py-3 text-center text-destructive font-semibold">{t.l}</td>
                  <td className="px-2 py-3 text-center">{t.gf}</td>
                  <td className="px-2 py-3 text-center">{t.ga}</td>
                  <td className="px-2 py-3 text-center font-semibold">{t.gf - t.ga > 0 ? `+${t.gf - t.ga}` : t.gf - t.ga}</td>
                  <td className="px-3 py-3 text-center font-display font-bold text-primary text-base">{t.pts}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      {t.form.map((r, j) => (
                        <span key={j} className={`h-5 w-5 rounded-full text-[10px] font-bold flex items-center justify-center ${formColor(r)}`}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
