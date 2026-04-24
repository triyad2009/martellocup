import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Ticket, Construction } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/tickets")({
  component: TicketsPage,
});

function TicketsPage() {
  const { lang } = useI18n();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-6">
          <Ticket className="h-10 w-10" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">
          {lang === "bn" ? "টিকিট" : "Tickets"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {lang === "bn"
            ? "টিকিট বিক্রয় শীঘ্রই চালু হবে। অ্যাডমিন প্যানেল থেকে চালু করা যাবে।"
            : "Ticket sales will begin soon. Admins can enable this from the panel."}
        </p>
        <div className="rounded-2xl bg-card border-2 border-dashed border-border p-8">
          <Construction className="h-10 w-10 text-warning mx-auto mb-3" />
          <p className="font-semibold">{lang === "bn" ? "শীঘ্রই আসছে" : "Coming Soon"}</p>
        </div>
      </motion.div>
    </div>
  );
}
