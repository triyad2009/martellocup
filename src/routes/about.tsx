import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Info, Target, Eye, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSingletonRow, useTable } from "@/lib/content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Martello Cup — Season 10 (The Tenth Tide)" },
      { name: "description", content: "Learn about Martello Cup — the official Martello football tournament. Mission, vision, history and the Season 10 (The Tenth Tide) organizing team." },
      { property: "og:title", content: "About Martello Cup" },
      { property: "og:description", content: "The story, mission and vision behind Martello Cup Season 10." },
      { property: "og:url", content: "https://martellocup.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://martellocup.lovable.app/about" }],
  }),
  component: AboutPage,
});

type AboutRow = {
  description_bn: string;
  description_en: string;
  mission_bn: string;
  mission_en: string;
  vision_bn: string;
  vision_en: string;
};

type Member = {
  id: string;
  name: string;
  role_bn: string;
  role_en: string;
  photo_url: string | null;
};

function AboutPage() {
  const { lang } = useI18n();
  const { row } = useSingletonRow<AboutRow>("about_content");
  const { rows: members } = useTable<Member>("committee_members");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <Info className="h-7 w-7" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">
          {lang === "bn" ? "আমাদের সম্পর্কে" : "About Us"}
        </h1>
        {row && (
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {lang === "bn" ? row.description_bn : row.description_en}
          </p>
        )}
      </motion.div>

      {row && (
        <div className="grid sm:grid-cols-2 gap-5 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-card border border-border shadow-card p-6"
          >
            <Target className="h-8 w-8 text-primary mb-3" />
            <h2 className="font-display text-xl font-bold mb-2">
              {lang === "bn" ? "আমাদের মিশন" : "Our Mission"}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{lang === "bn" ? row.mission_bn : row.mission_en}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-card border border-border shadow-card p-6"
          >
            <Eye className="h-8 w-8 text-primary mb-3" />
            <h2 className="font-display text-xl font-bold mb-2">
              {lang === "bn" ? "আমাদের ভিশন" : "Our Vision"}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{lang === "bn" ? row.vision_bn : row.vision_en}</p>
          </motion.div>
        </div>
      )}

      {members.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="font-display text-2xl font-bold">{lang === "bn" ? "কমিটি সদস্য" : "Committee Members"}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl bg-card border border-border shadow-card p-4 text-center"
              >
                <div className="h-16 w-16 mx-auto rounded-full overflow-hidden bg-gradient-primary flex items-center justify-center text-white font-display font-bold text-xl mb-2">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.name} className="h-full w-full object-cover" />
                  ) : (
                    m.name[0]
                  )}
                </div>
                <p className="font-semibold text-sm truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground truncate">{lang === "bn" ? m.role_bn : m.role_en}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
