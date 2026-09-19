import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTable } from "@/lib/content";

export const Route = createFileRoute("/players")({
  head: () => ({
    meta: [
      { title: "Martello Cup Players — Season 10" },
      { name: "description", content: "Explore player information and participating football players in Martello Cup Season 10." },
    ],
    links: [{ rel: "canonical", href: `https://martellocup.mvp.bd/players` }],
  }),
  component: PlayersPage,
});

type Player = {
  id: string;
  name: string;
  team: string | null;
  position: string | null;
  jersey: number | null;
  goals: number;
  photo_url: string | null;
};

const posColor: Record<string, string> = {
  GK: "bg-warning/15 text-warning border-warning/40",
  DF: "bg-info/15 text-info border-info/40",
  MF: "bg-primary/15 text-primary border-primary/40",
  FW: "bg-success/15 text-success border-success/40",
};

function PlayersPage() {
  const { lang } = useI18n();
  const { rows, loading } = useTable<Player>("players");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <User className="h-7 w-7" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-2">
          {lang === "bn" ? "খেলোয়াড়" : "Players"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "bn" ? "টুর্নামেন্টে অংশগ্রহণকারী খেলোয়াড়রা" : "Players competing in the tournament"}
        </p>
      </motion.div>

      {loading ? (
        <p className="text-center text-muted-foreground py-10">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-10 text-center">
          <User className="h-10 w-10 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">{lang === "bn" ? "এডমিন থেকে খেলোয়াড় যোগ করুন।" : "Add players from the admin panel."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {rows.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-card border border-border shadow-card overflow-hidden text-center"
            >
              <div className="relative h-28 bg-gradient-primary flex items-center justify-center">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-4xl text-white font-bold">{p.name[0]}</span>
                )}
                {p.jersey != null && (
                  <span className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white text-primary font-display font-bold text-sm inline-flex items-center justify-center shadow">
                    {p.jersey}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="font-display font-bold truncate">{p.name}</p>
                {p.team && <p className="text-[11px] text-muted-foreground truncate">{p.team}</p>}
                <div className="mt-2 flex items-center justify-center gap-2 text-xs">
                  {p.position && (
                    <span className={`px-1.5 py-0.5 rounded border font-bold ${posColor[p.position] ?? "bg-muted"}`}>
                      {p.position}
                    </span>
                  )}
                  <span className="text-muted-foreground">⚽ {p.goals}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
