import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Trash2, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { PaymentFlow } from "@/components/PaymentFlow";

export const Route = createFileRoute("/registration")({
  component: RegistrationPage,
});

type Player = {
  name: string;
  jersey: string;
  position: "GK" | "DF" | "MF" | "FW";
  dob: string;
};

const POSITIONS: Player["position"][] = ["GK", "DF", "MF", "FW"];

const tx = {
  title: { bn: "দল নিবন্ধন", en: "Team Registration" },
  subtitle: {
    bn: "মার্টেলো কাপে অংশগ্রহণের জন্য আপনার দল নিবন্ধন করুন।",
    en: "Register your team to participate in Martello Cup.",
  },
  team: { bn: "দলের তথ্য", en: "Team Information" },
  teamName: { bn: "দলের নাম", en: "Team Name" },
  shortName: { bn: "সংক্ষিপ্ত নাম", en: "Short Name" },
  category: { bn: "বিভাগ", en: "Category" },
  catOpen: { bn: "ওপেন", en: "Open" },
  catYouth: { bn: "যুব (অনূর্ধ্ব ১৮)", en: "Youth (U18)" },
  catVeteran: { bn: "ভেটেরান (৩৫+)", en: "Veteran (35+)" },
  description: { bn: "দলের পরিচিতি", en: "Team Description" },
  contact: { bn: "যোগাযোগের তথ্য", en: "Contact Information" },
  coachName: { bn: "কোচের নাম", en: "Coach Name" },
  coachPhone: { bn: "কোচের ফোন", en: "Coach Phone" },
  coachEmail: { bn: "কোচের ইমেইল", en: "Coach Email" },
  address: { bn: "ঠিকানা", en: "Address" },
  captain: { bn: "অধিনায়কের নাম", en: "Captain Name" },
  players: { bn: "খেলোয়াড় (সর্বনিম্ন ১১)", en: "Players (min 11)" },
  addPlayer: { bn: "খেলোয়াড় যোগ করুন", en: "Add Player" },
  playerName: { bn: "নাম", en: "Name" },
  jersey: { bn: "জার্সি #", en: "Jersey #" },
  position: { bn: "পজিশন", en: "Position" },
  dob: { bn: "জন্ম তারিখ", en: "Date of Birth" },
  agreeTerms: {
    bn: "আমি টুর্নামেন্টের নিয়মাবলী মেনে নিচ্ছি এবং প্রদত্ত তথ্য সঠিক বলে নিশ্চিত করছি।",
    en: "I agree to the tournament rules and confirm the information provided is accurate.",
  },
  submit: { bn: "নিবন্ধন জমা দিন", en: "Submit Registration" },
  submitting: { bn: "জমা দেওয়া হচ্ছে...", en: "Submitting..." },
  successTitle: { bn: "নিবন্ধন সফল হয়েছে!", en: "Registration Successful!" },
  successDesc: {
    bn: "আপনার নিবন্ধন গ্রহণ করা হয়েছে। অনুমোদনের জন্য অপেক্ষা করুন। আপনার নিবন্ধন আইডি:",
    en: "Your registration has been received. Please wait for approval. Your registration ID:",
  },
  newReg: { bn: "নতুন নিবন্ধন", en: "New Registration" },
  errMin: { bn: "কমপক্ষে ১১ জন খেলোয়াড় যোগ করুন", en: "Add at least 11 players" },
  errRequired: { bn: "প্রয়োজনীয় ক্ষেত্রগুলি পূরণ করুন", en: "Please fill required fields" },
  errSubmit: { bn: "জমা দিতে ব্যর্থ", en: "Failed to submit" },
};

const emptyPlayer = (): Player => ({ name: "", jersey: "", position: "MF", dob: "" });

function RegistrationPage() {
  const { lang } = useI18n();
  const t = (k: keyof typeof tx) => tx[k][lang];

  const [form, setForm] = useState({
    team_name: "",
    short_name: "",
    category: "open",
    description: "",
    coach_name: "",
    coach_phone: "",
    coach_email: "",
    address: "",
    captain_name: "",
  });
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: 11 }, emptyPlayer)
  );
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const updateField = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const updatePlayer = (i: number, patch: Partial<Player>) =>
    setPlayers((p) => p.map((pl, idx) => (idx === i ? { ...pl, ...patch } : pl)));

  const addPlayer = () => setPlayers((p) => [...p, emptyPlayer()]);
  const removePlayer = (i: number) =>
    setPlayers((p) => (p.length > 11 ? p.filter((_, idx) => idx !== i) : p));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.team_name || !form.coach_name || !form.coach_phone || !form.captain_name) {
      setError(t("errRequired"));
      return;
    }
    const validPlayers = players.filter((p) => p.name.trim());
    if (validPlayers.length < 11) {
      setError(t("errMin"));
      return;
    }
    if (!agree) {
      setError(t("errRequired"));
      return;
    }

    setSubmitting(true);
    const { data, error: dbError } = await supabase
      .from("registrations")
      .insert({
        ...form,
        players_data: validPlayers,
        status: "pending",
      })
      .select("id")
      .single();
    setSubmitting(false);

    if (dbError || !data) {
      setError(t("errSubmit") + ": " + (dbError?.message ?? ""));
      return;
    }
    setDone(data.id);
  };

  if (done) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 18 }}
          className="max-w-md w-full text-center bg-card rounded-2xl shadow-elevated border border-border p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-success text-success-foreground mb-4"
          >
            <CheckCircle2 className="h-10 w-10" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold mb-2">{t("successTitle")}</h2>
          <p className="text-muted-foreground mb-4">{t("successDesc")}</p>
          <code className="block bg-muted text-foreground font-mono text-sm rounded-lg px-3 py-2 break-all">
            {done}
          </code>

          <div className="mt-6 text-left">
            <h3 className="font-display font-bold text-lg mb-2">
              {lang === "bn" ? "নিবন্ধন ফি পেমেন্ট" : "Registration Fee Payment"}
            </h3>
            <PaymentFlow submissionType="registration" registrationId={done} />
          </div>

          <button
            onClick={() => {
              setDone(null);
              setForm({
                team_name: "", short_name: "", category: "open", description: "",
                coach_name: "", coach_phone: "", coach_email: "", address: "", captain_name: "",
              });
              setPlayers(Array.from({ length: 11 }, emptyPlayer));
              setAgree(false);
            }}
            className="mt-6 px-5 py-2.5 rounded-lg border border-border font-semibold hover:bg-muted"
          >
            {t("newReg")}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <Users className="h-8 w-8" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">{t("subtitle")}</p>
      </motion.div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Team info */}
        <Card title={t("team")}>
          <Field label={t("teamName")} required>
            <Input value={form.team_name} onChange={(v) => updateField("team_name", v)} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("shortName")}>
              <Input value={form.short_name} onChange={(v) => updateField("short_name", v)} maxLength={6} />
            </Field>
            <Field label={t("category")}>
              <Select
                value={form.category}
                onChange={(v) => updateField("category", v)}
                options={[
                  { value: "open", label: t("catOpen") },
                  { value: "youth", label: t("catYouth") },
                  { value: "veteran", label: t("catVeteran") },
                ]}
              />
            </Field>
          </div>
          <Field label={t("description")}>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
        </Card>

        {/* Contact info */}
        <Card title={t("contact")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("coachName")} required>
              <Input value={form.coach_name} onChange={(v) => updateField("coach_name", v)} />
            </Field>
            <Field label={t("captain")} required>
              <Input value={form.captain_name} onChange={(v) => updateField("captain_name", v)} />
            </Field>
            <Field label={t("coachPhone")} required>
              <Input value={form.coach_phone} onChange={(v) => updateField("coach_phone", v)} type="tel" />
            </Field>
            <Field label={t("coachEmail")}>
              <Input value={form.coach_email} onChange={(v) => updateField("coach_email", v)} type="email" />
            </Field>
          </div>
          <Field label={t("address")}>
            <Input value={form.address} onChange={(v) => updateField("address", v)} />
          </Field>
        </Card>

        {/* Players */}
        <Card title={`${t("players")} (${players.filter((p) => p.name.trim()).length})`}>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {players.map((p, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border border-border bg-muted/30 p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      #{i + 1}
                    </span>
                    {players.length > 11 && (
                      <button
                        type="button"
                        onClick={() => removePlayer(i)}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label={t("playerName")} compact>
                      <Input value={p.name} onChange={(v) => updatePlayer(i, { name: v })} />
                    </Field>
                    <Field label={t("dob")} compact>
                      <Input
                        type="date"
                        value={p.dob}
                        onChange={(v) => updatePlayer(i, { dob: v })}
                      />
                    </Field>
                    <Field label={t("jersey")} compact>
                      <Input
                        type="number"
                        value={p.jersey}
                        onChange={(v) => updatePlayer(i, { jersey: v })}
                      />
                    </Field>
                    <Field label={t("position")} compact>
                      <Select
                        value={p.position}
                        onChange={(v) => updatePlayer(i, { position: v as Player["position"] })}
                        options={POSITIONS.map((pos) => ({ value: pos, label: pos }))}
                      />
                    </Field>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <button
              type="button"
              onClick={addPlayer}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:text-primary text-muted-foreground font-semibold transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t("addPlayer")}
            </button>
          </div>
        </Card>

        {/* Terms */}
        <label className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border cursor-pointer">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 h-5 w-5 rounded accent-primary"
          />
          <span className="text-sm text-foreground leading-snug">{t("agreeTerms")}</span>
        </label>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive p-3 text-sm"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-glow-red hover:bg-primary-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("submitting")}
            </>
          ) : (
            <>
              <ShieldCheck className="h-5 w-5" />
              {t("submit")}
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl bg-card border border-border shadow-card p-5 sm:p-6"
    >
      <h2 className="font-display text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}

function Field({
  label, required, compact, children,
}: {
  label: string; required?: boolean; compact?: boolean; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={`block ${compact ? "text-xs" : "text-sm"} font-medium text-foreground mb-1.5`}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

function Input({
  value, onChange, type = "text", maxLength,
}: {
  value: string; onChange: (v: string) => void; type?: string; maxLength?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
    />
  );
}

function Select({
  value, onChange, options,
}: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
