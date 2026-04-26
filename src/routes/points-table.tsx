import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTable } from "@/lib/content";

export const Route = createFileRoute("/points-table")({
  component: PointsPage,
});

type Row = {
  id: string;
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  points: number;
  form: string | null;
};

const formColor = (r: string) =>
  r === "W" ? "bg-success text-success-foreground" : r === "D" ? "bg-muted" : "bg-destructive text-destructive-foreground";

function PointsPage() {
  const { lang } = useI18n();
  const { rows, loading } = useTable<Row>("points_table", { order: "position", ascending: true });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <BarChart3 className="h-7 w-7" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-2">
          {lang === "bn" ? "পয়েন্ট তালিকা" : "Points Table"}
        </h1>
      </motion.div>

      {loading ? (
        <p className="text-center text-muted-foreground py-10">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-10 text-center">
          <BarChart3 className="h-10 w-10 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">
            {lang === "bn" ? "এডমিন থেকে পয়েন্ট তালিকা যোগ করুন।" : "Add points table from the admin panel."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-card border border-border shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-3 py-3">#</th>
                <th className="text-left px-3 py-3">{lang === "bn" ? "দল" : "Team"}</th>
                <th className="px-2 py-3">P</th>
                <th className="px-2 py-3">W</th>
                <th className="px-2 py-3">D</th>
                <th className="px-2 py-3">L</th>
                <th className="px-2 py-3">GF</th>
                <th className="px-2 py-3">GA</th>
                <th className="px-2 py-3 font-bold">Pts</th>
                <th className="px-2 py-3 hidden sm:table-cell">{lang === "bn" ? "ফর্ম" : "Form"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className={`border-t border-border ${i < 2 ? "bg-primary/5" : ""}`}
                >
                  <td className="px-3 py-3 font-bold">{r.position}</td>
                  <td className="px-3 py-3 font-semibold">{r.team}</td>
                  <td className="px-2 py-3 text-center">{r.played}</td>
                  <td className="px-2 py-3 text-center">{r.won}</td>
                  <td className="px-2 py-3 text-center">{r.drawn}</td>
                  <td className="px-2 py-3 text-center">{r.lost}</td>
                  <td className="px-2 py-3 text-center">{r.goals_for}</td>
                  <td className="px-2 py-3 text-center">{r.goals_against}</td>
                  <td className="px-2 py-3 text-center font-display font-bold text-primary">{r.points}</td>
                  <td className="px-2 py-3 hidden sm:table-cell">
                    <div className="flex gap-1 justify-center">
                      {(r.form || "").split("").slice(-5).map((c, idx) => (
                        <span key={idx} className={`h-5 w-5 rounded text-[10px] font-bold inline-flex items-center justify-center ${formColor(c)}`}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
