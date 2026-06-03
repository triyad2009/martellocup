import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lock, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Loader2 } from "lucide-react";

/** Wraps a page that requires sign-in. Shows a friendly login prompt instead of redirecting. */
export function LoginGate({ children, title, message }: { children: React.ReactNode; title?: string; message?: string }) {
  const { user, loading } = useAuth();
  const { lang } = useI18n();
  const T = (bn: string, en: string) => (lang === "bn" ? bn : en);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center bg-card border border-border rounded-2xl shadow-elevated p-8"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">
            {title ?? T("লগইন প্রয়োজন", "Login Required")}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {message ?? T(
              "এই কাজ করার জন্য আগে রেজিস্ট্রেশন বা লগইন করুন।",
              "Please sign in or create an account to continue.",
            )}
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow-red hover:bg-primary-glow"
          >
            <LogIn className="h-4 w-4" />
            {T("লগইন / রেজিস্ট্রেশন", "Sign In / Sign Up")}
          </Link>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
