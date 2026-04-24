import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const { lang } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    // Placeholder: Admin Panel will hook this to a contact_messages table.
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    setDone(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <MessageCircle className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">
          {lang === "bn" ? "যোগাযোগ" : "Contact Us"}
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {[
            { icon: Phone, label: lang === "bn" ? "ফোন" : "Phone", value: "+880 1XXX-XXXXXX" },
            { icon: Mail, label: lang === "bn" ? "ইমেইল" : "Email", value: "info@martellocup.com" },
            { icon: MapPin, label: lang === "bn" ? "ঠিকানা" : "Address", value: lang === "bn" ? "গাইনবাড়ী, গাবুরা, শ্যামনগর, সাতক্ষীরা" : "Gainbari, Gabura, Shyamnagar, Satkhira" },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl bg-card border border-border shadow-card p-5 flex items-start gap-3"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{c.label}</p>
                <p className="font-semibold text-sm break-words">{c.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-card p-6 sm:p-8 space-y-4"
        >
          {done ? (
            <div className="text-center py-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-bold mb-1">
                {lang === "bn" ? "ধন্যবাদ!" : "Thank you!"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {lang === "bn" ? "আপনার বার্তা গ্রহণ করা হয়েছে।" : "Your message has been received."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label={lang === "bn" ? "নাম" : "Name"} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Input label={lang === "bn" ? "ইমেইল" : "Email"} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
              </div>
              <Input label={lang === "bn" ? "বিষয়" : "Subject"} value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} required />
              <label className="block">
                <span className="block text-sm font-medium mb-1.5">{lang === "bn" ? "বার্তা" : "Message"}</span>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-glow-red hover:bg-primary-glow disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {lang === "bn" ? "পাঠান" : "Send Message"}
              </motion.button>
            </>
          )}
        </motion.form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  );
}
