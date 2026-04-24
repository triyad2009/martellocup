import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Globe, Github, Linkedin, Facebook, Instagram, MessageCircle, Send, Mail, Youtube } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type LinkItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  bg: string;
  featured?: boolean;
  comingSoon?: boolean;
};

const LINKS: LinkItem[] = [
  { label: "Portfolio", href: "https://tr-com.lovable.app", icon: <Globe className="h-5 w-5" />, bg: "linear-gradient(135deg, #D4A017, #F5C842)", featured: true },
  { label: "GitHub", href: "https://github.com/tahsinullahriyad", icon: <Github className="h-5 w-5" />, bg: "#333333" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/tahsinullah-riyad-b16035304", icon: <Linkedin className="h-5 w-5" />, bg: "#0077B5" },
  { label: "Facebook", href: "https://www.facebook.com/tahsinullah.riyad.tr", icon: <Facebook className="h-5 w-5" />, bg: "#1877F2" },
  { label: "Instagram", href: "https://www.instagram.com/tahsinullah.riyad", icon: <Instagram className="h-5 w-5" />, bg: "linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)" },
  { label: "WhatsApp", href: "https://wa.me/qr/E44HZE4NNWUSF1", icon: <MessageCircle className="h-5 w-5" />, bg: "#25D366" },
  { label: "Twitter / X", href: "https://x.com/tahsinullar2k9", icon: <span className="font-bold">𝕏</span>, bg: "#000000" },
  { label: "Telegram", href: "https://t.me/tahsinullahriyad_tr", icon: <Send className="h-5 w-5" />, bg: "#0088CC" },
  { label: "Discord", href: "https://discord.com/users/tahsinullahriyad", icon: <span className="font-bold">D</span>, bg: "#5865F2" },
  { label: "Email", href: "mailto:info@tahsinullahriyad.world", icon: <Mail className="h-5 w-5" />, bg: "#D71920" },
  { label: "YouTube (Coming Soon)", href: "#", icon: <Youtube className="h-5 w-5" />, bg: "#666666", comingSoon: true },
];

export function DeveloperCreditButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <>
      <div className={`flex items-center justify-center gap-2 text-xs sm:text-sm ${className}`}>
        <span className="text-muted-foreground">{t("dev.label")}</span>
        <motion.button
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.05, filter: "brightness(1.15)" }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-dev animate-gradient text-white font-bold px-3 py-1 rounded-md shadow-glow-red animate-pulse-glow tracking-wide"
        >
          TAHSINULLAH RIYAD
        </motion.button>
      </div>

      <AnimatePresence>
        {open && <DevModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function DevModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "oklch(0.1 0.03 265 / 0.7)", backdropFilter: "blur(20px)" }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-dark border border-white/10 shadow-elevated p-6 sm:p-8"
      >
        <motion.button
          whileHover={{ rotate: 90, scale: 1.1 }}
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </motion.button>

        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, type: "spring", damping: 14 }}
            className="mx-auto h-24 w-24 rounded-full overflow-hidden ring-4 ring-[oklch(0.78_0.15_85)] shadow-glow-gold mb-3"
          >
            <img
              src="https://i.postimg.cc/ncLprrg3/IMG-20260217-124734020.jpg"
              alt="Tahsinullah Riyad"
              className="h-full w-full object-cover"
            />
          </motion.div>
          <motion.h2
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl font-bold text-white text-glow-red"
          >
            TAHSINULLAH RIYAD
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 mt-1 text-sm"
          >
            {t("dev.subtitle")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {LINKS.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.comingSoon ? undefined : link.href}
              target={link.comingSoon ? undefined : "_blank"}
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              whileHover={link.comingSoon ? {} : { scale: 1.03, y: -2 }}
              whileTap={link.comingSoon ? {} : { scale: 0.98 }}
              className={`flex items-center gap-3 px-4 rounded-xl text-white font-semibold shadow-card ${
                link.featured ? "py-4 text-lg ring-2 ring-[oklch(0.78_0.15_85)] shadow-glow-gold" : "py-3"
              } ${link.comingSoon ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              style={{ background: link.bg }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                {link.icon}
              </span>
              <span>{link.label}</span>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
