import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Trophy } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/fixtures")({
  component: FixturesPage,
});

const FIXTURES = [
  { no: 1, round: { bn: "গ্রুপ পর্ব", en: "Group Stage" }, home: "Eagles FC", away: "Tigers United", date: "2025-05-10", time: "16:00", venue: "Gayanbari Ground", status: "upcoming" },
  { no: 2, round: { bn: "গ্রুপ পর্ব", en: "Group Stage" }, home: "Sundarban Warriors", away: "Coastal Kings", date: "2025-05-10", time: "18:30", venue: "Gabura Field", status: "upcoming" },
  { no: 3, round: { bn: "গ্রুপ পর্ব", en: "Group Stage" }, home: "Royal Stars", away: "Atlas Boys", date: "2025-05-11", time: "16:00", venue: "Gayanbari Ground", status: "upcoming" },
  { no: 4, round: { bn: "গ্রুপ পর্ব", en: "Group Stage" }, home: "Lions XI", away: "Phoenix FC", date: "2025-05-11", time: "18:30", venue: "Shyamnagar Stadium", status: "upcoming" },
  { no: 5, round: { bn: "কোয়ার্টার ফাইনাল", en: "Quarter Final" }, home: "TBD", away: "TBD", date: "2025-05-15", time: "16:00", venue: "Gayanbari Ground", status: "upcoming" },
  { no: 6, round: { bn: "ফাইনাল", en: "Final" }, home: "TBD", away: "TBD", date: "2025-05-25", time: "17:00", venue: "Gayanbari Ground", status: "upcoming" },
];

function FixturesPage() {
  const { lang } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <Calendar className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">
          {lang === "bn" ? "ফিক্সচার" : "Fixtures"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {lang === "bn" ? "সকল আসন্ন এবং সম্পন্ন ম্যাচ" : "All upcoming and scheduled matches"}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIXTURES.map((m, i) => (
          <motion.div
            key={m.no}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl bg-card border border-border shadow-card p-5 hover:shadow-elevated transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {m.round[lang]}
              </span>
              <span className="text-xs font-bold text-muted-foreground">#{m.no}</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-3 mb-4">
              <div className="text-center">
                <div className="h-12 w-12 mx-auto rounded-full bg-gradient-primary text-white flex items-center justify-center font-display font-bold text-sm shadow-glow-red mb-2">
                  {m.home.slice(0, 2).toUpperCase()}
                </div>
                <p className="text-sm font-semibold leading-tight">{m.home}</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-muted-foreground">VS</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 mx-auto rounded-full bg-dark text-white flex items-center justify-center font-display font-bold text-sm mb-2">
                  {m.away.slice(0, 2).toUpperCase()}
                </div>
                <p className="text-sm font-semibold leading-tight">{m.away}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground border-t border-border pt-3">
              <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {m.date}</div>
              <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {m.time}</div>
              <div className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3" /> {m.venue}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-gradient-to-br from-primary/10 to-card border border-primary/20 p-6 text-center">
        <Trophy className="h-10 w-10 text-primary mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {lang === "bn"
            ? "সম্পূর্ণ সময়সূচী অ্যাডমিন প্যানেল থেকে আপডেট হবে।"
            : "Full schedule will be updated from the Admin Panel."}
        </p>
      </div>
    </div>
  );
}
