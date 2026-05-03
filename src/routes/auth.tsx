import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, Loader2, Trophy } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const tx = {
  loginTitle: { bn: "লগইন করুন", en: "Sign In" },
  signupTitle: { bn: "অ্যাকাউন্ট তৈরি করুন", en: "Create Account" },
  loginSub: { bn: "আপনার অ্যাকাউন্টে প্রবেশ করুন", en: "Welcome back to Martello Cup" },
  signupSub: { bn: "মার্টেলো কাপে যোগ দিন", en: "Join the Martello Cup community" },
  name: { bn: "পূর্ণ নাম", en: "Full Name" },
  email: { bn: "ইমেইল", en: "Email" },
  password: { bn: "পাসওয়ার্ড", en: "Password" },
  signin: { bn: "প্রবেশ করুন", en: "Sign In" },
  signup: { bn: "নিবন্ধন করুন", en: "Sign Up" },
  loading: { bn: "অপেক্ষা করুন...", en: "Please wait..." },
  noAccount: { bn: "অ্যাকাউন্ট নেই?", en: "Don't have an account?" },
  hasAccount: { bn: "ইতিমধ্যে অ্যাকাউন্ট আছে?", en: "Already have an account?" },
  createOne: { bn: "তৈরি করুন", en: "Sign up" },
  signinNow: { bn: "লগইন করুন", en: "Sign in" },
  back: { bn: "← হোমে ফিরুন", en: "← Back to Home" },
  errFields: { bn: "সমস্ত ক্ষেত্র পূরণ করুন", en: "Please fill all fields" },
  errShort: { bn: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে", en: "Password must be at least 6 characters" },
} as const;

function AuthPage() {
  const { lang } = useI18n();
  const t = (k: keyof typeof tx) => tx[k][lang === "en" ? "en" : "bn"];
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!email || !password || (mode === "signup" && !name)) {
      setErr(t("errFields"));
      return;
    }
    if (password.length < 6) {
      setErr(t("errShort"));
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { display_name: name },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (e: any) {
      setErr(e?.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow-red mb-4"
          >
            <Trophy className="h-8 w-8 text-white" />
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <h1 className="font-display text-3xl font-bold">
                {mode === "login" ? t("loginTitle") : t("signupTitle")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === "login" ? t("loginSub") : t("signupSub")}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl bg-card border border-border shadow-elevated p-6 space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <InputField
                  icon={<UserIcon className="h-4 w-4" />}
                  label={t("name")}
                  value={name}
                  onChange={setName}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <InputField
            icon={<Mail className="h-4 w-4" />}
            label={t("email")}
            type="email"
            value={email}
            onChange={setEmail}
          />

          <InputField
            icon={<Lock className="h-4 w-4" />}
            label={t("password")}
            type="password"
            value={password}
            onChange={setPassword}
          />

          {err && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive p-3 text-sm"
            >
              {err}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-glow-red hover:bg-primary-glow disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("loading")}
              </>
            ) : mode === "login" ? (
              <>
                <LogIn className="h-4 w-4" />
                {t("signin")}
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                {t("signup")}
              </>
            )}
          </motion.button>

          <p className="text-center text-sm text-muted-foreground pt-2">
            {mode === "login" ? t("noAccount") : t("hasAccount")}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setErr(null);
              }}
              className="text-primary font-semibold hover:underline"
            >
              {mode === "login" ? t("createOne") : t("signinNow")}
            </button>
          </p>
        </form>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            {t("back")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function InputField({
  icon, label, value, onChange, type = "text",
}: {
  icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-foreground mb-1.5">{label}</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>
    </label>
  );
}
