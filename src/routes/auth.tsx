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

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">{lang === "bn" ? "অথবা" : "or"}</span></div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setBusy(true); setErr(null);
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${window.location.origin}/` },
              });
              if (error) { setErr(error.message); setBusy(false); }
            }}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border bg-background hover:bg-muted font-semibold text-sm disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            {lang === "bn" ? "Google দিয়ে চালিয়ে যান" : "Continue with Google"}
          </button>

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
