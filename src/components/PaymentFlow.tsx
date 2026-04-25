import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, ChevronLeft, Copy, Loader2, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

type Method = {
  id: string;
  name: string;
  logo_url: string | null;
  account_number: string;
  instructions: string | null;
};

type Tier = {
  id: string;
  name: string;
  description: string | null;
  price: number;
};

type Props = {
  submissionType: "ticket" | "registration";
  amount?: number;
  registrationId?: string;
  onSuccess?: () => void;
};

export function PaymentFlow({ submissionType, amount, registrationId, onSuccess }: Props) {
  const { lang } = useI18n();
  const [methods, setMethods] = useState<Method[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [tier, setTier] = useState<Tier | null>(null);
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(submissionType === "ticket" ? 0 : 1);
  const [selected, setSelected] = useState<Method | null>(null);
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [txId, setTxId] = useState("");
  const [last4, setLast4] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase
        .from("payment_methods")
        .select("id,name,logo_url,account_number,instructions")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      submissionType === "ticket"
        ? supabase
            .from("ticket_tiers")
            .select("id,name,description,price")
            .eq("is_active", true)
            .order("sort_order", { ascending: true })
        : Promise.resolve({ data: [] as Tier[] }),
    ]).then(([m, t]) => {
      setMethods((m.data ?? []) as Method[]);
      setTiers((t.data ?? []) as Tier[]);
      setLoading(false);
    });
  }, [submissionType]);

  const effectiveAmount = tier?.price ?? amount;

  const T = (bn: string, en: string) => (lang === "bn" ? bn : en);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      /* ignore */
    }
  };

  const submit = async () => {
    setError(null);
    if (!selected) return;
    if (!payerName.trim() || !payerPhone.trim()) {
      setError(T("নাম ও ফোন নাম্বার দিন", "Please enter name and phone"));
      return;
    }
    if (!/^\d{4}$/.test(last4)) {
      setError(T("সেন্ডার নাম্বারের শেষ ৪ ডিজিট দিন", "Enter last 4 digits of sender number"));
      return;
    }
    setSubmitting(true);
    const { error: insErr } = await supabase.from("payment_submissions").insert({
      submission_type: submissionType,
      payment_method_id: selected.id,
      payment_method_name: selected.name,
      amount: amount ?? null,
      payer_name: payerName.trim(),
      payer_phone: payerPhone.trim(),
      transaction_id: txId.trim() || null,
      sender_last4: last4,
      registration_id: registrationId ?? null,
    });
    setSubmitting(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setStep(4);
    onSuccess?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
        <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-semibold">
          {T("পেমেন্ট মেথড শীঘ্রই যুক্ত হবে", "Payment methods coming soon")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-card">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 flex items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 3 && (
              <div className={`flex-1 h-0.5 mx-2 ${step > s ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: select method */}
        {step === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="font-display font-bold text-lg mb-4">
              {T("পেমেন্ট মেথড নির্বাচন করুন", "Select Payment Method")}
            </h3>
            <div className="grid gap-3">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelected(m);
                    setCopied(false);
                    setError(null);
                    setStep(2);
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-accent transition-all text-left"
                >
                  {m.logo_url ? (
                    <img src={m.logo_url} alt={m.name} className="h-12 w-12 rounded-lg object-cover bg-muted" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gradient-primary text-white flex items-center justify-center font-bold">
                      {m.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.account_number}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: instructions */}
        {step === 2 && selected && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              {selected.logo_url && (
                <img src={selected.logo_url} alt="" className="h-8 w-8 rounded object-cover" />
              )}
              {selected.name}
            </h3>

            <div className="rounded-xl bg-muted p-4 mb-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                {T("পেমেন্ট নাম্বার", "Payment Number")}
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-xl">{selected.account_number}</span>
                <button
                  onClick={() => copy(selected.account_number)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-glow"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? T("কপি হয়েছে", "Copied") : T("কপি", "Copy")}
                </button>
              </div>
            </div>

            {amount != null && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-4 text-center">
                <p className="text-xs text-muted-foreground">{T("পরিমাণ", "Amount")}</p>
                <p className="font-display font-bold text-2xl text-primary">৳ {amount}</p>
              </div>
            )}

            <div className="rounded-xl bg-card border border-border p-4 mb-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {T("সেন্ড মানির নিয়ম", "Send Money Instructions")}
              </p>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {selected.instructions || defaultInstructions(selected.name, selected.account_number, lang)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-lg border border-border hover:bg-muted text-sm font-semibold inline-flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                {T("ফিরুন", "Back")}
              </button>
              <button
                onClick={() => {
                  if (!copied) {
                    setError(T("আগে নাম্বারটি কপি করুন", "Please copy the number first"));
                    return;
                  }
                  setError(null);
                  setStep(3);
                }}
                disabled={!copied}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-glow text-sm font-bold inline-flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {T("পরবর্তী", "Next")}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {!copied && (
              <p className="mt-3 text-xs text-muted-foreground text-center">
                {T("পরবর্তী ধাপে যেতে নাম্বারটি কপি করুন", "Copy the number to continue")}
              </p>
            )}
            {error && step === 2 && (
              <p className="mt-2 text-sm text-destructive font-medium text-center">{error}</p>
            )}
          </motion.div>
        )}

        {/* Step 3: details */}
        {step === 3 && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="font-display font-bold text-lg mb-4">
              {T("বিস্তারিত দিন", "Submit Details")}
            </h3>

            <div className="space-y-3">
              <Field label={T("আপনার নাম", "Your Name")} required>
                <input
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background"
                />
              </Field>
              <Field label={T("ফোন নাম্বার", "Phone Number")} required>
                <input
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  inputMode="tel"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background"
                />
              </Field>
              <Field label={T("ট্রানজেকশন আইডি (ঐচ্ছিক)", "Transaction ID (Optional)")}>
                <input
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background"
                />
              </Field>
              <Field label={T("আপনার নাম্বারের শেষ ৪ ডিজিট", "Last 4 digits of your number")} required>
                <input
                  value={last4}
                  onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  inputMode="numeric"
                  maxLength={4}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background font-mono tracking-widest"
                  placeholder="••••"
                />
              </Field>
            </div>

            {error && (
              <p className="mt-3 text-sm text-destructive font-medium">{error}</p>
            )}

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setStep(2)}
                disabled={submitting}
                className="px-4 py-2.5 rounded-lg border border-border hover:bg-muted text-sm font-semibold inline-flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                {T("ফিরুন", "Back")}
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-glow text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {T("সাবমিট করুন", "Submit")}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: success */}
        {step === 4 && (
          <motion.div
            key="s4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success mb-4">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">
              {T("জমা হয়েছে!", "Submitted!")}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {T(
                "এডমিন যাচাই করে আপনাকে নিশ্চিত করবে।",
                "Admin will verify and confirm shortly.",
              )}
            </p>
            <button
              onClick={() => {
                setStep(1);
                setSelected(null);
                setPayerName("");
                setPayerPhone("");
                setTxId("");
                setLast4("");
              }}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-semibold"
            >
              {T("নতুন পেমেন্ট", "New Payment")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

function defaultInstructions(name: string, number: string, lang: "bn" | "en"): string {
  const n = name.toLowerCase();
  const isBkash = n.includes("bkash") || n.includes("বিকাশ");
  const isNagad = n.includes("nagad") || n.includes("নগদ");
  const isRocket = n.includes("rocket") || n.includes("রকেট");
  const provider = isBkash ? "bKash" : isNagad ? "Nagad" : isRocket ? "Rocket" : name;

  if (lang === "bn") {
    return [
      `১) ${provider} অ্যাপ অথবা *247# ডায়াল করুন।`,
      `২) "Send Money" নির্বাচন করুন।`,
      `৩) প্রাপকের নাম্বার দিন: ${number}`,
      `৪) পরিমাণ লিখুন এবং রেফারেন্সে আপনার নাম দিন।`,
      `৫) আপনার ${provider} পিন দিয়ে কনফার্ম করুন।`,
      `৬) ট্রানজেকশন আইডি (TrxID) সংগ্রহ করুন এবং পরবর্তী ধাপে দিন।`,
    ].join("\n");
  }
  return [
    `1) Open the ${provider} app or dial *247#.`,
    `2) Choose "Send Money".`,
    `3) Enter recipient number: ${number}`,
    `4) Type the amount and add your name as reference.`,
    `5) Confirm with your ${provider} PIN.`,
    `6) Copy the Transaction ID (TrxID) and submit it in the next step.`,
  ].join("\n");
}

