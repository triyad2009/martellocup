import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, MapPin, Trophy, Users, Goal, Calendar, Sparkles, Newspaper, ArrowRight, MessageCircle, Ticket, Shirt, Heart, UserPlus, Image as ImageIcon, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Countdown } from "@/components/Countdown";
import { useTournamentSettings } from "@/lib/settings";
import { useSingletonRow, useTable } from "@/lib/content";
import { SponsorShowcase } from "@/components/SponsorShowcase";

export const Route = createFileRoute("/")({
  component: Index,
});

const FALLBACK_START = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

function Index() {
  return (
    <>
      <Hero />
      <StatsBar />
      <HighlightsSection />
      <SponsorShowcase />
    </>
  );
}

function Hero() {
  const { t, lang } = useI18n();
  const { settings } = useTournamentSettings();
  const startDate = settings ? new Date(settings.tournament_start) : FALLBACK_START;
  const seasonText = settings?.season_name || t("hero.season");
  const locationText = settings?.location || t("hero.location");

  const [started, setStarted] = useState(false);
  useEffect(() => {
    const check = () => Date.now() >= startDate.getTime();
    if (check()) {
      setStarted(true);
      return;
    }
    const id = setInterval(() => {
      if (check()) {
        setStarted(true);
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [startDate]);

  return (
    <section className="relative min-h-[calc(100vh-7rem)] overflow-hidden bg-gradient-hero animate-gradient flex items-center">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10 blur-2xl"
            style={{
              width: `${100 + i * 30}px`,
              height: `${100 + i * 30}px`,
              left: `${(i * 13) % 90}%`,
              top: `${(i * 17) % 80}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Floating trophy/ball icons */}
      <motion.div
        className="absolute top-20 right-[8%] text-white/10 hidden md:block"
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Trophy className="h-32 w-32" />
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-[5%] text-white/10 hidden md:block"
        animate={{ y: [0, 20, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <Goal className="h-28 w-28" />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 w-full">
        <div className="text-center text-white">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold tracking-widest mb-6"
          >
            ⚽ {seasonText}
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-display text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-glow-red"
          >
            {t("hero.title")}
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-lg sm:text-2xl font-display tracking-wide text-white/90"
          >
            {t("hero.tagline")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-3 flex items-center justify-center gap-2 text-sm text-white/70"
          >
            <MapPin className="h-4 w-4" />
            <span>{locationText}</span>
          </motion.div>

          {/* Countdown / Started banner */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10"
          >
            {started ? (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="inline-flex flex-col items-center gap-3"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success/20 border border-success/40 backdrop-blur-md text-success-foreground text-xs font-bold tracking-widest">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  {lang === "bn" ? "লাইভ" : "LIVE NOW"}
                </div>
                <motion.h2
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-glow-red"
                >
                  Martello Cup Started
                </motion.h2>
                <p className="text-white/80 text-sm sm:text-base">
                  {lang === "bn" ? "টুর্নামেন্ট শুরু হয়ে গেছে — উপভোগ করুন!" : "The tournament has begun — enjoy the matches!"}
                </p>
              </motion.div>
            ) : (
              <>
                <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white/60 mb-4">
                  {t("hero.countdown")}
                </p>
                <Countdown target={startDate} />
              </>
            )}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <motion.a
              href="/fixtures"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary hover:bg-primary-glow text-primary-foreground font-bold px-7 py-3.5 rounded-xl shadow-glow-red animate-pulse-glow inline-flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              {t("hero.cta.fixtures")}
            </motion.a>
            <motion.a
              href="/registration"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-white/40 hover:border-white hover:bg-white/10 text-white font-bold px-7 py-3.5 rounded-xl backdrop-blur-md inline-flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              {t("hero.cta.register")}
            </motion.a>
            <motion.a
              href="/feed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold px-7 py-3.5 rounded-xl shadow-lg inline-flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {lang === "bn" ? "সোশ্যাল ফিড" : "Social Feed"}
            </motion.a>

          </motion.div>

        </div>

        {/* Scroll arrow */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute left-1/2 -translate-x-1/2 bottom-4 text-white/60"
        >
          <ArrowDown className="h-6 w-6" />
        </motion.div>
      </div>
    </section>
  );
}

function StatsBar() {
  const { t } = useI18n();
  const { row } = useSingletonRow<{ teams_count: number; matches_count: number; goals_count: number; players_count: number }>("hero_stats");
  const stats = [
    { v: row?.teams_count ?? 0, label: t("stats.teams"), icon: Users },
    { v: row?.matches_count ?? 0, label: t("stats.matches"), icon: Calendar },
    { v: row?.goals_count ?? 0, label: t("stats.goals"), icon: Goal },
    { v: row?.players_count ?? 0, label: t("stats.players"), icon: Trophy },
  ];
  return (
    <section className="bg-card border-y border-border py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-white mb-3 shadow-glow-red">
              <s.icon className="h-6 w-6" />
            </div>
            <div className="font-display text-4xl font-bold text-foreground">{s.v}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HighlightsSection() {
  const { lang } = useI18n();
  const { rows: news } = useTable<any>("news", { order: "published_date", ascending: false });
  const { rows: fixtures } = useTable<any>("fixtures", { order: "match_date", ascending: true });
  const upcoming = fixtures.filter((f) => new Date(f.match_date) >= new Date(new Date().toDateString())).slice(0, 3);
  const latestNews = news.slice(0, 3);

  if (latestNews.length === 0 && upcoming.length === 0) {
    const features = [
      { icon: UserPlus, to: "/registration", title: lang === "bn" ? "দল রেজিস্ট্রেশন" : "Team Registration", desc: lang === "bn" ? "অনলাইনে দল নিবন্ধন ও পেমেন্ট" : "Register your team online with payment" },
      { icon: Ticket, to: "/tickets", title: lang === "bn" ? "টিকিট কিনুন" : "Buy Tickets", desc: lang === "bn" ? "টিয়ার বেছে নিন, স্লিপ ডাউনলোড করুন" : "Pick a tier, download your slip" },
      { icon: Shirt, to: "/jersey", title: lang === "bn" ? "জার্সি শপ" : "Jersey Shop", desc: lang === "bn" ? "অফিসিয়াল জার্সি অর্ডার" : "Order official jerseys" },
      { icon: MessageCircle, to: "/feed", title: lang === "bn" ? "সোশ্যাল ফিড" : "Social Feed", desc: lang === "bn" ? "পোস্ট, লাইক, কমেন্ট" : "Post, like, comment" },
      { icon: Heart, to: "/sponsors", title: lang === "bn" ? "স্পন্সর হোন" : "Become a Sponsor", desc: lang === "bn" ? "Gold / Silver / Bronze প্যাকেজ" : "Gold / Silver / Bronze packages" },
      { icon: Users, to: "/members", title: lang === "bn" ? "সদস্যবৃন্দ" : "Members", desc: lang === "bn" ? "Martello Cup টিম পরিচিতি" : "Meet the Martello Cup team" },
      { icon: ImageIcon, to: "/gallery", title: lang === "bn" ? "গ্যালারি" : "Gallery", desc: lang === "bn" ? "ছবি ও ভিডিও সংগ্রহ" : "Photos and videos" },
      { icon: Trophy, to: "/points-table", title: lang === "bn" ? "পয়েন্ট টেবিল" : "Points Table", desc: lang === "bn" ? "লাইভ স্ট্যান্ডিং" : "Live standings" },
    ];
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold tracking-widest uppercase text-primary">
              {lang === "bn" ? "সাইটে যা যা করতে পারবেন" : "What you can do here"}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            {lang === "bn" ? "Martello Cup এর সবকিছু এক জায়গায়" : "Everything Martello Cup, in one place"}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.to}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={f.to}
                className="group block h-full rounded-2xl bg-card border border-border hover:border-primary p-4 sm:p-5 shadow-card hover:shadow-glow-red transition-all"
              >
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-primary text-white flex items-center justify-center mb-3 shadow-glow-red group-hover:scale-110 transition-transform">
                  <f.icon className="h-5 w-5" />
                </div>
                <p className="font-display font-bold text-sm sm:text-base leading-tight">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{f.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  const uiLang: "bn" | "en" = lang === "en" ? "en" : "bn";

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid lg:grid-cols-2 gap-8">
      {upcoming.length > 0 && (
        <div>
          <SectionHeader icon={<Calendar className="h-5 w-5" />} title={lang === "bn" ? "আসন্ন ম্যাচ" : "Upcoming Matches"} to="/fixtures" lang={uiLang} />
          <div className="space-y-3">
            {upcoming.map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-xl bg-card border border-border shadow-card p-4">
                <div className="grid grid-cols-3 items-center gap-2">
                  <p className="text-right font-bold truncate">{f.home_team}</p>
                  <p className="text-center text-xs text-muted-foreground font-bold">VS</p>
                  <p className="text-left font-bold truncate">{f.away_team}</p>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {new Date(f.match_date).toLocaleDateString()} {f.match_time && `· ${f.match_time}`} {f.venue && `· ${f.venue}`}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      {latestNews.length > 0 && (
        <div>
          <SectionHeader icon={<Newspaper className="h-5 w-5" />} title={lang === "bn" ? "সর্বশেষ সংবাদ" : "Latest News"} to="/news" lang={uiLang} />
          <div className="space-y-3">
            {latestNews.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-xl bg-card border border-border shadow-card p-4 flex gap-3">
                {n.cover_url && <img src={n.cover_url} alt="" className="h-16 w-16 rounded-lg object-cover shrink-0" />}
                <div className="min-w-0">
                  <p className="font-display font-bold leading-snug line-clamp-2">{lang === "bn" ? n.title_bn : n.title_en}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.published_date).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function SectionHeader({ icon, title, to, lang }: { icon: React.ReactNode; title: string; to: string; lang: "bn" | "en" }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display text-2xl font-bold inline-flex items-center gap-2">
        <span className="text-primary">{icon}</span> {title}
      </h2>
      <Link to={to} className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
        {lang === "bn" ? "সব" : "View all"} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
