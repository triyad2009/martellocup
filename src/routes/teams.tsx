import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTable } from "@/lib/content";

export const Route = createFileRoute("/teams")({
  head: () => ({
    meta: [
      { title: "Teams & Squads · Martello Cup Season 10" },
      { name: "description", content: "All participating teams, coaches and squads of Martello Cup Season 10 (The Tenth Tide)." },
      { property: "og:title", content: "Martello Cup Teams — Season 10" },
      { property: "og:description", content: "Meet every team competing in Martello Cup Season 10." },
      { property: "og:url", content: "https://martellocup.lovable.app/teams" },
    ],
    links: [{ rel: "canonical", href: "https://martellocup.lovable.app/teams" }],
  }),
  component: TeamsPage,
});

type Team = {
  id: string;
  name_bn: string;
  name_en: string;
  group_name: string | null;
  coach: string | null;
  player_count: number;
  color_from: string;
  color_to: string;
  logo_url: string | null;
};

function TeamsPage() {
  const { lang } = useI18n();
  const { rows, loading } = useTable<Team>("teams");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <Users className="h-7 w-7" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-2">
          {lang === "bn" ? "দল সমূহ" : "Teams"}
        </h1>
        <p className="text-muted-foreground">{lang === "bn" ? "অংশগ্রহণকারী দলগুলো" : "Participating teams"}</p>
      </motion.div>

      {loading ? (
        <p className="text-center text-muted-foreground py-10">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-10 text-center">
          <Users className="h-10 w-10 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">{lang === "bn" ? "এডমিন থেকে দল যোগ করুন।" : "Add teams from the admin panel."}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rows.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="rounded-2xl overflow-hidden border border-border shadow-card bg-card"
            >
              <div
                className="h-28 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${t.color_from}, ${t.color_to})` }}
              >
                {t.logo_url ? (
                  <img src={t.logo_url} alt="" className="h-20 w-20 object-contain" />
                ) : (
                  <span className="font-display text-4xl text-white font-bold">
                    {(lang === "bn" ? t.name_bn : t.name_en)[0]}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold text-xl">{lang === "bn" ? t.name_bn : t.name_en}</h3>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                  {t.group_name && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{t.group_name}</span>}
                  <span>👥 {t.player_count} {lang === "bn" ? "খেলোয়াড়" : "players"}</span>
                </div>
                {t.coach && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {lang === "bn" ? "কোচ: " : "Coach: "}
                    <span className="font-semibold text-foreground">{t.coach}</span>
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
