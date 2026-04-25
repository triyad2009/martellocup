import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowDown, MapPin, Trophy, Users, Goal, Calendar } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Countdown } from "@/components/Countdown";
import { useTournamentSettings } from "@/lib/settings";

export const Route = createFileRoute("/")({
  component: Index,
});

const LOGO_URL = "https://i.postimg.cc/sxgdMH6c/FB-IMG-1776993011009.jpg";
const FALLBACK_START = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

function Index() {
  return (
    <>
      <Hero />
      <StatsBar />
      <Placeholder />
    </>
  );
}

function Hero() {
  const { t } = useI18n();
  const { settings } = useTournamentSettings();
  const startDate = settings ? new Date(settings.tournament_start) : FALLBACK_START;
  const heroLogo = settings?.hero_logo_url || LOGO_URL;
  const seasonText = settings?.season_name || t("hero.season");
  const locationText = settings?.location || t("hero.location");

  return (
    <section className="relative min-h-[calc(100vh-7rem)] overflow-hidden bg-gradient-hero animate-gradient flex items-center">
      {/* Background watermark logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.img
          src={heroLogo}
          alt=""
          aria-hidden="true"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.95, 1.05, 0.95], opacity: 0.12 }}
          transition={{ scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 1.2 } }}
          className="w-[80vw] max-w-[700px] aspect-square object-contain blur-[2px] mix-blend-screen"
        />
      </div>

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

          {/* Countdown */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10"
          >
            <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white/60 mb-4">
              {t("hero.countdown")}
            </p>
            <Countdown target={startDate} />
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
  const stats = [
    { v: 8, label: t("stats.teams"), icon: Users },
    { v: 16, label: t("stats.matches"), icon: Calendar },
    { v: 0, label: t("stats.goals"), icon: Goal },
    { v: 176, label: t("stats.players"), icon: Trophy },
  ];
  return (
    <section className="bg-card border-y border-border py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
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

function Placeholder() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-10"
      >
        <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">More Coming Soon</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Live ticker, upcoming matches, results, points table preview, news, gallery, sponsors and full admin panel are next on the build roadmap.
        </p>
      </motion.div>
    </section>
  );
}
