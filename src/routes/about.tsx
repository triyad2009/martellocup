import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Info, Target, Eye, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const { lang } = useI18n();
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <Info className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">
          {lang === "bn" ? "আমাদের সম্পর্কে" : "About Us"}
        </h1>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl bg-card border border-border shadow-card p-6 sm:p-8 mb-6"
      >
        <h2 className="font-display text-2xl font-bold mb-3 text-primary">
          {lang === "bn" ? "মার্টেলো কাপ" : "Martello Cup"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {lang === "bn"
            ? "মার্টেলো কাপ গায়নবাড়ি, গাবুরা, শ্যামনগর, সাতক্ষীরার একটি প্রিমিয়ার ফুটবল টুর্নামেন্ট। ৮টি দল প্রতি বছর চ্যাম্পিয়ন হওয়ার জন্য প্রতিযোগিতা করে। স্থানীয় প্রতিভা থেকে শুরু করে অভিজ্ঞ খেলোয়াড় — সকলের জন্য একটি প্ল্যাটফর্ম।"
            : "Martello Cup is a premier football tournament held in Gayanbari, Gabura, Shyamnagar, Satkhira. Eight teams compete each year for the championship — a platform for local talent and veteran players alike."}
        </p>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {[
          { icon: Target, titleBn: "আমাদের লক্ষ্য", titleEn: "Our Mission", textBn: "স্থানীয় ফুটবল প্রতিভাকে আলোয় আনা এবং একটি বিশ্বমানের টুর্নামেন্টের অভিজ্ঞতা দেওয়া।", textEn: "To shine a light on local football talent and deliver a world-class tournament experience." },
          { icon: Eye, titleBn: "আমাদের ভিশন", titleEn: "Our Vision", textBn: "সাতক্ষীরাকে বাংলাদেশের ফুটবল মানচিত্রে একটি গুরুত্বপূর্ণ স্থান হিসেবে প্রতিষ্ঠিত করা।", textEn: "To establish Satkhira as a key destination on Bangladesh's football map." },
        ].map((c, i) => (
          <motion.div
            key={c.titleEn}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl bg-card border border-border shadow-card p-6"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
              <c.icon className="h-6 w-6" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">{lang === "bn" ? c.titleBn : c.titleEn}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{lang === "bn" ? c.textBn : c.textEn}</p>
          </motion.div>
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl bg-card border border-border shadow-card p-6 sm:p-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold">{lang === "bn" ? "কমিটি সদস্য" : "Committee Members"}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { name: "Mr. Abdul Karim", role: "President" },
            { name: "Mr. Rahman", role: "Vice President" },
            { name: "Mr. Hossain", role: "General Secretary" },
            { name: "Mr. Sumon Ali", role: "Treasurer" },
            { name: "Mr. Faruk", role: "Tournament Director" },
            { name: "Mr. Imran", role: "Media Coordinator" },
          ].map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-center p-3 rounded-xl bg-muted/50"
            >
              <div className="h-14 w-14 mx-auto rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold mb-2">
                {m.name.split(" ").map((w) => w[0]).join("").slice(-2)}
              </div>
              <p className="text-sm font-semibold leading-tight">{m.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{m.role}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
