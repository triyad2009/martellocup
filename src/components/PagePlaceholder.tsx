import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Construction, ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type Props = {
  titleBn: string;
  titleEn: string;
  descBn?: string;
  descEn?: string;
  icon?: React.ReactNode;
};

export function PagePlaceholder({ titleBn, titleEn, descBn, descEn, icon }: Props) {
  const { lang } = useI18n();
  const title = lang === "bn" ? titleBn : titleEn;
  const desc =
    lang === "bn"
      ? descBn ?? "এই পেজটি শীঘ্রই আসছে। আমরা এটি তৈরি করছি।"
      : descEn ?? "This page is coming soon. We're working on it.";

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center"
      >
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-6"
        >
          {icon ?? <Construction className="h-10 w-10" />}
        </motion.div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">{title}</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">{desc}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold shadow-glow-red hover:bg-primary-glow transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {lang === "bn" ? "হোমে ফিরুন" : "Back to Home"}
        </Link>
      </motion.div>
    </div>
  );
}
