import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/teams")({
  component: TeamsPage,
});

const TEAMS = [
  { name: "Eagles FC", group: "A", coach: "Mr. Rahman", players: 18, color: "from-primary to-primary-glow" },
  { name: "Tigers United", group: "A", coach: "Mr. Karim", players: 17, color: "from-warning to-primary" },
  { name: "Royal Stars", group: "A", coach: "Mr. Hossain", players: 18, color: "from-info to-primary" },
  { name: "Sundarban Warriors", group: "A", coach: "Mr. Sumon", players: 19, color: "from-success to-info" },
  { name: "Coastal Kings", group: "B", coach: "Mr. Faruk", players: 18, color: "from-info to-success" },
  { name: "Atlas Boys", group: "B", coach: "Mr. Asif", players: 16, color: "from-warning to-destructive" },
  { name: "Lions XI", group: "B", coach: "Mr. Tonu", players: 18, color: "from-primary to-warning" },
  { name: "Phoenix FC", group: "B", coach: "Mr. Imran", players: 17, color: "from-destructive to-primary" },
];

function TeamsPage() {
  const { lang } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">
          {lang === "bn" ? "অংশগ্রহণকারী দল" : "Participating Teams"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {lang === "bn" ? "মার্টেলো কাপ ২০২৫ এর ৮টি দল" : "8 teams competing in Martello Cup 2025"}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {TEAMS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -6, rotate: -1 }}
            className="rounded-2xl bg-card border border-border shadow-card p-5 text-center hover:shadow-elevated transition-shadow"
          >
            <div className={`h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br ${t.color} text-white flex items-center justify-center font-display font-bold text-2xl shadow-glow-red mb-3`}>
              {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <h3 className="font-display font-bold text-base leading-tight">{t.name}</h3>
            <div className="mt-2 text-xs text-muted-foreground">
              {lang === "bn" ? "গ্রুপ" : "Group"} {t.group}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{t.players} {lang === "bn" ? "জন" : "players"}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
