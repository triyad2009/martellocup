import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Handshake, Crown, Star, ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/sponsors")({
  component: SponsorsPage,
});

const TIERS = [
  { tier: "Title", labelBn: "টাইটেল স্পনসর", labelEn: "Title Sponsor", icon: Crown, color: "from-warning to-primary", names: ["Martello Group"] },
  { tier: "Gold", labelBn: "গোল্ড স্পনসর", labelEn: "Gold Sponsors", icon: Star, color: "from-warning to-warning", names: ["Coastal Bank", "Sundarban Foods"] },
  { tier: "Silver", labelBn: "সিলভার স্পনসর", labelEn: "Silver Sponsors", icon: Star, color: "from-muted-foreground to-foreground", names: ["Riyad Tech", "Gabura Telecom", "City Pharma"] },
];

function SponsorsPage() {
  const { lang } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <Handshake className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">
          {lang === "bn" ? "আমাদের স্পনসর" : "Our Sponsors"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {lang === "bn" ? "যাদের সমর্থনে এই টুর্নামেন্ট সম্ভব হচ্ছে" : "Powering Martello Cup with their generous support"}
        </p>
      </motion.div>

      <div className="space-y-10">
        {TIERS.map((tier, ti) => (
          <motion.section
            key={tier.tier}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: ti * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <tier.icon className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold uppercase tracking-wider">
                {lang === "bn" ? tier.labelBn : tier.labelEn}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>
            <div className={`grid ${tier.tier === "Title" ? "grid-cols-1" : tier.tier === "Gold" ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"} gap-4`}>
              {tier.names.map((n, i) => (
                <motion.div
                  key={n}
                  whileHover={{ scale: 1.04, y: -3 }}
                  className={`rounded-2xl bg-card border-2 border-border ${tier.tier === "Title" ? "shadow-glow-red border-warning/40 p-10" : "p-6"} text-center`}
                >
                  <div className={`mx-auto rounded-2xl bg-gradient-to-br ${tier.color} text-white flex items-center justify-center font-display font-bold ${tier.tier === "Title" ? "h-24 w-24 text-3xl" : "h-16 w-16 text-xl"} mb-3`}>
                    {n.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </div>
                  <p className={`font-display font-bold ${tier.tier === "Title" ? "text-2xl" : "text-base"}`}>{n}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 rounded-2xl bg-gradient-to-br from-primary/10 to-card border-2 border-primary/30 p-8 text-center"
      >
        <h3 className="font-display text-2xl font-bold mb-2">
          {lang === "bn" ? "স্পনসর হতে চান?" : "Become a Sponsor"}
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          {lang === "bn"
            ? "আপনার ব্র্যান্ডকে হাজারো ফুটবল ভক্তের সামনে তুলে ধরুন।"
            : "Showcase your brand to thousands of football fans."}
        </p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold shadow-glow-red hover:bg-primary-glow"
        >
          {lang === "bn" ? "যোগাযোগ করুন" : "Get in Touch"}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </motion.div>
    </div>
  );
}
