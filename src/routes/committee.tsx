import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Crown, Shield, Trophy, Sparkles, Star, Users, Calendar, FileText } from "lucide-react";
import { Season10Badge } from "@/components/Season10Badge";
import { useSiteLogo } from "@/lib/settings";

export const Route = createFileRoute("/committee")({
  head: () => ({
    meta: [
      { title: "Season 10 Organizing Committee — Martello Cup 2026" },
      { name: "description", content: "The official Martello Cup 2026 (Season 10) Organizing Committee — departments, executives and general members." },
      { property: "og:title", content: "Martello Cup 2026 — Organizing Committee" },
      { property: "og:description", content: "Meet the Season 10 Organizing Council: Operations, Tournament, Finance & Sponsorship, Creative & Media." },
    ],
  }),
  component: CommitteePage,
});

type Dept = {
  key: string;
  name_bn: string;
  name_en: string;
  color: string;      // tailwind gradient from
  color2: string;     // to
  ring: string;       // ring color hex
  icon: typeof Crown;
  executive: string;
  deputies: string[];
};

const DEPARTMENTS: Dept[] = [
  {
    key: "ops",
    name_bn: "অপারেশনস ডিপার্টমেন্ট",
    name_en: "Operations Department",
    color: "from-emerald-500", color2: "to-teal-600",
    ring: "#10b981",
    icon: Shield,
    executive: "মো: ইমরান হোসাইন",
    deputies: ["হাফিজুল ইসলাম লিটন", "হাসিবুল হাসান শান্ত", "আহম্মদ ফয়সাল ইমরান", "গোলাম আজবাহার বাপ্পি"],
  },
  {
    key: "tm",
    name_bn: "টুর্নামেন্ট ম্যানেজমেন্ট ডিপার্টমেন্ট",
    name_en: "Tournament Management Department",
    color: "from-amber-500", color2: "to-orange-600",
    ring: "#f59e0b",
    icon: Trophy,
    executive: "ইস্রাফিল হোসাইন লিটন",
    deputies: ["সালাউদ্দিন সাগর", "সুমন হোসেন", "ফয়সাল মাহমুদ", "সাব্বির হোসাইন"],
  },
  {
    key: "fin",
    name_bn: "ফিন্যান্স এন্ড স্পন্সরশিপ ডিপার্টমেন্ট",
    name_en: "Finance & Sponsorship Department",
    color: "from-sky-500", color2: "to-blue-700",
    ring: "#0ea5e9",
    icon: Sparkles,
    executive: "জি.এম. রবিউল ইসলাম",
    deputies: ["ফয়সাল বাদশা", "সোহেল রানা", "রাসেল আহমেদ", "ইমন হোসেন লিংকন"],
  },
  {
    key: "media",
    name_bn: "ক্রিয়েটিভ এন্ড মিডিয়া ডিপার্টমেন্ট",
    name_en: "Creative & Media Department",
    color: "from-rose-500", color2: "to-pink-700",
    ring: "#ef4444",
    icon: Star,
    executive: "তাসনিমুল এহসান ফাহাদ",
    deputies: ["সালাউদ্দিন আহমেদ শোভন", "হাসানুল বান্না শুভ", "ইমাম হাসান", "তাহসিনুল্লাহ রিয়াদ"],
  },
];

const GENERAL_MEMBERS = [
  "নাসির হোসেন","তোহামিম আল রাজ","জি. ওসমান","রিয়াসাত আলী","আবুজার গেফারী রোজেন",
  "সাদিক হোসেন","তাহফিমুল জয়","ইব্রাহিম খলিল উজ্জ্বল","বাচ্চু","তায়জেল বাদশা",
  "সাজ্জাদুল ইমাম সাদিক","শাহজালাল হোসেন","হাফিজুল ইসলাম","জীবন","বাদশা",
  "ইশরাক","সম্রাট","আরিফুল","সাকিব","শাহীন",
  "আবু উবায়দা শাওন","রুহান","আরিফুল","আহসান","শামীম হোসেন",
];

const SIGNATORIES = [
  { name: "দিদারুল ইসলাম রাজু", title: "অগ্রদূত, মার্টেলো" },
  { name: "আবু সাঈদ পলাশ", title: "এক্সি. মেম্বার, মার্টেলো এডহক কমিটি" },
  { name: "ফয়সাল মাহমুদ লিপু", title: "এক্সি. মেম্বার, মার্টেলো এডহক কমিটি" },
];

function CommitteePage() {
  const logo = useSiteLogo();
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={logo} alt="Martello" className="h-12 w-12 rounded-xl ring-2 ring-amber-400/60 shadow-glow-gold" />
            <Season10Badge />
          </div>
          <motion.h1
            initial={{ letterSpacing: "0.2em", opacity: 0 }} animate={{ letterSpacing: "0.02em", opacity: 1 }}
            transition={{ duration: 1 }}
            className="font-display font-black text-4xl sm:text-6xl md:text-7xl bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
          >
            মার্টেলো কাপ ২০২৬
          </motion.h1>
          <p className="mt-3 text-sm sm:text-base text-white/70 max-w-2xl mx-auto">
            দশম আসর সফল ও সার্থকভাবে সম্পন্ন করার লক্ষ্যে গঠিত মার্টেলো অর্গানাইজিং কাউন্সিল
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <FileText className="h-3 w-3" /> সূত্র: এমসিটি/নোটিশ/২০২৬/০০১
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <Calendar className="h-3 w-3" /> ১৯ জুন, ২০২৬
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-200">
              <Users className="h-3 w-3" /> Since 2009
            </span>
          </div>
        </motion.header>

        {/* Departments — 2 col on desktop, stacked on mobile */}
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
          {DEPARTMENTS.map((d, i) => (
            <motion.div
              key={d.key}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08 }}
              className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-sm"
            >
              {/* accent bar */}
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${d.color} ${d.color2}`} />
              {/* glow on hover */}
              <div className={`absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${d.color} ${d.color2} blur-xl`} style={{ zIndex: -1 }} />

              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${d.color} ${d.color2} flex items-center justify-center shadow-lg`}
                    style={{ boxShadow: `0 8px 30px -8px ${d.ring}` }}
                  >
                    <d.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display font-bold text-lg sm:text-xl leading-tight truncate">
                      {d.name_bn}
                    </h2>
                    <p className="text-[10px] sm:text-xs text-white/50 tracking-widest uppercase">{d.name_en}</p>
                  </div>
                </div>

                {/* Executive */}
                <div className="mb-4 rounded-xl p-4 border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Crown className="h-3.5 w-3.5" style={{ color: d.ring }} />
                    <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase">Executive · এক্সিকিউটিভ</span>
                  </div>
                  <div className="font-display font-bold text-lg" style={{ color: d.ring }}>
                    {d.executive}
                  </div>
                </div>

                {/* Deputies */}
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-white/60 uppercase mb-2">Deputy Executives · ডেপুটি এক্সিকিউটিভ</div>
                  <ul className="grid gap-1.5">
                    {d.deputies.map((n, idx) => (
                      <li key={n + idx} className="flex items-center gap-2 text-sm">
                        <span
                          className="h-5 w-5 shrink-0 rounded-md text-[10px] font-bold flex items-center justify-center"
                          style={{ background: `${d.ring}22`, color: d.ring }}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-white/90">{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* General Members */}
        <motion.section
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-10 sm:mt-14 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-sm overflow-hidden"
        >
          <div className="px-5 sm:px-6 py-5 border-b border-white/10 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">জেনারেল মেম্বার</h2>
              <p className="text-[10px] sm:text-xs text-white/50 tracking-widest uppercase">General Members · {GENERAL_MEMBERS.length} জন</p>
            </div>
          </div>
          <div className="p-5 sm:p-6 grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {GENERAL_MEMBERS.map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 10) * 0.02 }}
                className="group relative flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-amber-400/40 hover:bg-white/[0.06] transition"
              >
                <span className="h-6 w-6 shrink-0 rounded-md text-[10px] font-bold flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-rose-500/20 text-amber-200 border border-white/10">
                  {i + 1}
                </span>
                <span className="text-xs sm:text-sm text-white/90 truncate group-hover:text-white">{n}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Signatories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-10 sm:mt-14"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] text-amber-300/80 uppercase">
              <span className="h-px w-8 bg-amber-300/40" /> অনুমোদন <span className="h-px w-8 bg-amber-300/40" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {SIGNATORIES.map((s, i) => (
              <div key={i} className="rounded-xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.06] to-transparent p-5 text-center">
                <div className="h-14 flex items-end justify-center mb-3">
                  <svg viewBox="0 0 120 40" className="h-full text-amber-300/80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d={`M5 30 Q 20 ${5 + i * 4}, 40 25 T 80 20 T 115 ${28 - i * 3}`} />
                  </svg>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className="font-display font-bold text-base text-amber-200">{s.name}</div>
                  <div className="text-[11px] text-white/60 mt-1">{s.title}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Footer stamp */}
        <div className="mt-12 text-center text-[11px] text-white/40 tracking-widest">
          MARTELLO ORGANIZING COUNCIL · SINCE 2009 · SEASON 10
        </div>
      </div>
    </div>
  );
}
