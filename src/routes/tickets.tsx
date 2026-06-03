import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Ticket } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PaymentFlow } from "@/components/PaymentFlow";
import { LoginGate } from "@/components/LoginGate";

export const Route = createFileRoute("/tickets")({
  component: TicketsPage,
});

function TicketsPage() {
  const { lang } = useI18n();
  return (
    <LoginGate>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
            <Ticket className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            {lang === "bn" ? "টিকিট কিনুন" : "Buy Tickets"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {lang === "bn"
              ? "নিচের ধাপ অনুসরণ করে পেমেন্ট সম্পন্ন করুন। এডমিন যাচাই করার পর টিকিট নিশ্চিত করা হবে।"
              : "Follow the steps below to complete your payment. Tickets are confirmed after admin verification."}
          </p>
        </motion.div>

        <PaymentFlow submissionType="ticket" />
      </div>
    </LoginGate>
  );
}
