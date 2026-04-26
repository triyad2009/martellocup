import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTable } from "@/lib/content";

export const Route = createFileRoute("/sponsors")({
  component: SponsorsPage,
});

type Sponsor = {
  id: string;
  name: string;
  tier: string;
  logo_url: string | null;
  website_url: string | null;
};

const TIER_LABELS: Record<string, { bn: string; en: string; grad: string }> = {
  title: { bn: "টাইটেল স্পন্সর", en: "Title Sponsor", grad: "from-warning to-primary" },
  gold: { bn: "গোল্ড স্পন্সর", en: "Gold Sponsors", grad: "from-warning/80 to-warning" },
  silver: { bn: "সিলভার স্পন্সর", en: "Silver Sponsors", grad: "from-muted-foreground/60 to-muted-foreground" },
  bronze: { bn: "ব্রোঞ্জ স্পন্সর", en: "Bronze Sponsors", grad: "from-orange-400 to-orange-600" },
  partner: { bn: "অংশীদার", en: "Partners", grad: "from-info to-primary" },
};

function SponsorsPage() {
  const { lang } = useI18n();
  const { rows, loading } = useTable<Sponsor>("sponsors");

  const tiers = ["title", "gold", "silver", "bronze", "partner"] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <Award className="h-7 w-7" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-2">
          {lang === "bn" ? "স্পন্সর" : "Sponsors"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "bn" ? "যাদের সহযোগিতায় এই আয়োজন" : "Made possible by our partners"}
        </p>
      </motion.div>

      {loading ? (
        <p className="text-center text-muted-foreground py-10">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-10 text-center">
          <Award className="h-10 w-10 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">{lang === "bn" ? "এডমিন থেকে স্পন্সর যোগ করুন।" : "Add sponsors from the admin panel."}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {tiers.map((tier) => {
            const items = rows.filter((s) => s.tier === tier);
            if (items.length === 0) return null;
            const meta = TIER_LABELS[tier];
            return (
              <motion.section key={tier} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${meta.grad}`} />
                  <h2 className="font-display text-xl font-bold">{lang === "bn" ? meta.bn : meta.en}</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((s) => (
                    <motion.a
                      key={s.id}
                      href={s.website_url ?? "#"}
                      target={s.website_url ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="rounded-2xl bg-card border border-border shadow-card p-5 text-center"
                    >
                      <div className="h-20 mb-3 flex items-center justify-center">
                        {s.logo_url ? (
                          <img src={s.logo_url} alt={s.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Award className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-semibold text-sm">{s.name}</p>
                      {s.website_url && <ExternalLink className="h-3 w-3 mx-auto mt-1 text-muted-foreground" />}
                    </motion.a>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 rounded-2xl bg-gradient-primary text-white p-6 sm:p-8 text-center"
      >
        <h3 className="font-display text-2xl font-bold mb-2">
          {lang === "bn" ? "স্পন্সর হতে চান?" : "Want to become a sponsor?"}
        </h3>
        <p className="text-white/90 mb-4 text-sm">
          {lang === "bn" ? "আমাদের সাথে যোগাযোগ করুন।" : "Get in touch with us."}
        </p>
        <Link to="/contact" className="inline-block px-5 py-2.5 rounded-xl bg-white text-primary font-bold shadow">
          {lang === "bn" ? "যোগাযোগ" : "Contact"}
        </Link>
      </motion.div>
    </div>
  );
}
