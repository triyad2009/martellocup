import { Link } from "@tanstack/react-router";
import { Facebook, Youtube, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSiteLogo } from "@/lib/settings";
import { DeveloperCreditButton } from "./DeveloperCredit";
import { SilverFooterCarousel } from "./SilverFooterCarousel";

export function Footer() {
  const { t } = useI18n();
  const logo = useSiteLogo();
  return (
    <footer className="bg-gradient-dark text-dark-foreground mt-20">
      <SilverFooterCarousel />
      <div className="mx-auto max-w-7xl 2xl:max-w-[1500px] px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg overflow-hidden ring-2 ring-primary/40 shadow-glow-red bg-card">
                <img
                  src={logo}
                  alt="Martello Cup"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="font-display font-bold flex items-center gap-1.5">MARTELLO</div>
                <div className="font-display text-xs text-primary-glow">CUP · SEASON 10</div>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{t("footer.aboutText")}</p>
            <div className="flex gap-3 mt-4">
              {[Facebook, Youtube, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-primary-glow">{t("footer.quick")}</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/fixtures", k: "nav.fixtures" },
                { to: "/results", k: "nav.results" },
                { to: "/points-table", k: "nav.points" },
                { to: "/teams", k: "nav.teams" },
                { to: "/players", k: "nav.players" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-white/70 hover:text-primary-glow transition-colors">
                    {t(l.k)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-primary-glow">{t("footer.info")}</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/news", k: "nav.news" },
                { to: "/gallery", k: "nav.gallery" },
                { to: "/sponsors", k: "nav.sponsors" },
                { to: "/about", k: "nav.about" },
                { to: "/registration", k: "nav.registration" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-white/70 hover:text-primary-glow transition-colors">
                    {t(l.k)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-primary-glow">{t("footer.contact")}</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary-glow shrink-0" />
                <span>{t("hero.location")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-glow" />
                <span>+880 1XXX-XXXXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-glow" />
                <span>info@martellocup.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>{t("footer.rights")}</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-primary-glow">{t("footer.privacy")}</Link>
            <Link to="/" className="hover:text-primary-glow">{t("footer.terms")}</Link>
          </div>
        </div>
      </div>

      {/* Fixed developer credit at bottom */}
      <div className="bg-black/40 py-3 border-t border-white/5">
        <DeveloperCreditButton />
      </div>
    </footer>
  );
}
