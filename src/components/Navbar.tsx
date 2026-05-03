import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, LogIn, LogOut, Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useUserRoles } from "@/lib/roles";
import { DeveloperCreditButton } from "./DeveloperCredit";

const LOGO_URL = "https://i.postimg.cc/sxgdMH6c/FB-IMG-1776993011009.jpg";

const NAV = [
  { to: "/", key: "nav.home" },
  { to: "/fixtures", key: "nav.fixtures" },
  { to: "/results", key: "nav.results" },
  { to: "/points-table", key: "nav.points" },
  { to: "/teams", key: "nav.teams" },
  { to: "/players", key: "nav.players" },
  { to: "/registration", key: "nav.registration" },
  { to: "/tickets", key: "nav.tickets" },
  { to: "/jersey", key: "nav.jersey" },
  { to: "/gallery", key: "nav.gallery" },
  { to: "/news", key: "nav.news" },
  { to: "/sponsors", key: "nav.sponsors" },
  { to: "/about", key: "nav.about" },
  { to: "/contact", key: "nav.contact" },
  { to: "/members", key: "nav.members" },
  { to: "/feed", key: "nav.feed" },
] as const;

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRoles();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-card"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="relative h-10 w-10 rounded-lg overflow-hidden ring-2 ring-primary/40 shadow-glow-red bg-card">
                <img src={LOGO_URL} alt="Martello Cup" className="h-full w-full object-cover" />
              </div>
              <div className="block">
                <div className="font-display font-bold text-base sm:text-lg leading-none tracking-tight">
                  Martello <span className="text-primary">Cup</span>
                </div>
                <div className="hidden sm:block font-display text-[10px] text-muted-foreground leading-none mt-1 tracking-widest">
                  FOOTBALL · CONNECTIVITY · HAPPINESS
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden xl:flex items-center gap-1">
              {NAV.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
                  >
                    <span className={active ? "text-primary" : "text-foreground"}>
                      {t(item.key)}
                    </span>
                    {active && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute left-2 right-2 -bottom-0.5 h-0.5 bg-primary rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="ml-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-gradient-primary text-white text-sm font-bold shadow-glow-red"
                >
                  <Shield className="h-3.5 w-3.5" />
                  {t("nav.admin")}
                </Link>
              )}
            </nav>

            {/* Right cluster */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(lang === "bn" ? "en" : "bn")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-card hover:border-primary hover:text-primary transition-colors text-xs sm:text-sm font-semibold"
                aria-label="Toggle language"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className={lang === "bn" ? "text-primary" : ""}>BN</span>
                <span className="text-muted-foreground">|</span>
                <span className={lang === "en" ? "text-primary" : ""}>EN</span>
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenu((o) => !o)}
                    className="h-9 w-9 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold text-sm shadow-glow-red hover:scale-105 transition-transform"
                    aria-label="User menu"
                  >
                    {(user.user_metadata?.display_name || user.email || "U")[0].toUpperCase()}
                  </button>
                  <AnimatePresence>
                    {userMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          className="absolute right-0 top-11 z-50 w-56 rounded-xl bg-card border border-border shadow-elevated overflow-hidden"
                        >
                          <div className="p-3 border-b border-border bg-muted/40">
                            <p className="text-xs text-muted-foreground">
                              {lang === "bn" ? "লগইন করেছেন" : "Signed in as"}
                            </p>
                            <p className="text-sm font-semibold truncate">
                              {user.user_metadata?.display_name || user.email}
                            </p>
                          </div>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setUserMenu(false)}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted text-left text-primary font-semibold"
                            >
                              <Shield className="h-4 w-4" />
                              {t("nav.admin")}
                            </Link>
                          )}
                          <button
                            onClick={async () => {
                              setUserMenu(false);
                              await signOut();
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted text-left text-destructive"
                          >
                            <LogOut className="h-4 w-4" />
                            {lang === "bn" ? "লগআউট" : "Sign Out"}
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary-glow text-sm font-semibold shadow-glow-red"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  {lang === "bn" ? "লগইন" : "Sign In"}
                </Link>
              )}

              <button
                onClick={() => setOpen((o) => !o)}
                className="xl:hidden p-2 rounded-md hover:bg-muted"
                aria-label="Menu"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 xl:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-background shadow-elevated xl:hidden overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md overflow-hidden ring-2 ring-primary/40">
                    <img src={LOGO_URL} alt="Martello Cup" className="h-full w-full object-cover" />
                  </div>
                  <span className="font-display font-bold text-lg">MENU</span>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col py-2 flex-1">
                {NAV.map((item, i) => {
                  const active = location.pathname === item.to;
                  return (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        to={item.to}
                        className={`block px-6 py-3 text-base font-medium border-l-4 transition-colors ${
                          active
                            ? "border-primary text-primary bg-accent"
                            : "border-transparent hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        {t(item.key)}
                      </Link>
                    </motion.div>
                  );
                })}
                {isAdmin && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Link
                      to="/admin"
                      className={`flex items-center gap-2 px-6 py-3 text-base font-bold border-l-4 ${
                        location.pathname === "/admin"
                          ? "border-primary text-primary bg-accent"
                          : "border-primary/60 text-primary hover:bg-muted"
                      }`}
                    >
                      <Shield className="h-4 w-4" />
                      {t("nav.admin")}
                    </Link>
                  </motion.div>
                )}
                {!user && (
                  <div className="px-6 pt-4 mt-2 border-t border-border">
                    <Link
                      to="/auth"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold shadow-glow-red"
                    >
                      <LogIn className="h-4 w-4" />
                      {lang === "bn" ? "লগইন / সাইন আপ" : "Sign In / Sign Up"}
                    </Link>
                  </div>
                )}
                {user && (
                  <div className="px-6 pt-4 mt-2 border-t border-border space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                      <div className="h-10 w-10 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold">
                        {(user.user_metadata?.display_name || user.email || "U")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {lang === "bn" ? "লগইন করেছেন" : "Signed in"}
                        </p>
                        <p className="text-sm font-semibold truncate">
                          {user.user_metadata?.display_name || user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={async () => { await signOut(); }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 font-semibold"
                    >
                      <LogOut className="h-4 w-4" />
                      {lang === "bn" ? "লগআউট" : "Sign Out"}
                    </button>
                  </div>
                )}
              </nav>

              {/* Developer credit at the bottom of the menu */}
              <div className="mt-auto border-t border-border bg-gradient-dark py-3">
                <DeveloperCreditButton className="text-white/80" />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
