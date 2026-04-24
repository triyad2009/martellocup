import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { User, Goal as GoalIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/players")({
  component: PlayersPage,
});

const PLAYERS = [
  { name: "Karim Ahmed", team: "Eagles FC", pos: "FW", jersey: 9, goals: 5 },
  { name: "Rafiq Mia", team: "Eagles FC", pos: "MF", jersey: 8, goals: 2 },
  { name: "Shahriar Khan", team: "Royal Stars", pos: "FW", jersey: 10, goals: 6 },
  { name: "Asif Rahman", team: "Atlas Boys", pos: "FW", jersey: 11, goals: 4 },
  { name: "Imran Hossain", team: "Sundarban Warriors", pos: "GK", jersey: 1, goals: 0 },
  { name: "Tonu Das", team: "Lions XI", pos: "MF", jersey: 7, goals: 3 },
  { name: "Sumon Ali", team: "Tigers United", pos: "FW", jersey: 9, goals: 3 },
  { name: "Faruk Hassan", team: "Coastal Kings", pos: "DF", jersey: 4, goals: 1 },
  { name: "Nayem Islam", team: "Phoenix FC", pos: "MF", jersey: 6, goals: 1 },
  { name: "Sajid Mahmud", team: "Royal Stars", pos: "DF", jersey: 5, goals: 0 },
  { name: "Hridoy Khan", team: "Eagles FC", pos: "GK", jersey: 1, goals: 0 },
  { name: "Mizan Patwary", team: "Lions XI", pos: "FW", jersey: 9, goals: 2 },
];

const posColor: Record<string, string> = {
  GK: "bg-warning/15 text-warning border-warning/30",
  DF: "bg-info/15 text-info border-info/30",
  MF: "bg-success/15 text-success border-success/30",
  FW: "bg-primary/15 text-primary border-primary/30",
};

function PlayersPage() {
  const { lang } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <User className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">
          {lang === "bn" ? "খেলোয়াড়" : "Players"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {lang === "bn" ? "টুর্নামেন্টের সকল খেলোয়াড়" : "All tournament players"}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLAYERS.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl bg-card border border-border shadow-card p-4 flex items-center gap-4"
          >
            <div className="relative shrink-0">
              <div className="h-16 w-16 rounded-full bg-gradient-primary text-white flex items-center justify-center font-display font-bold text-xl shadow-glow-red">
                {p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-dark text-white h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center border-2 border-card">
                {p.jersey}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display font-bold text-base leading-tight truncate">{p.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{p.team}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${posColor[p.pos]}`}>{p.pos}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <GoalIcon className="h-3 w-3" /> {p.goals}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
