import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Check, Facebook, Youtube, Instagram } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSingletonRow } from "@/lib/content";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Martello Cup" },
      { name: "description", content: "Contact the Martello Cup team for tournament, registration, ticket, sponsorship and general enquiries." },
    ],
    links: [{ rel: "canonical", href: `https://martellocup.mvp.bd/contact` }],
  }),
  component: ContactPage,
});

type ContactInfo = {
  phone: string;
  email: string;
  address_bn: string;
  address_en: string;
  facebook_url: string;
  youtube_url: string;
  instagram_url: string;
};

function ContactPage() {
  const { lang } = useI18n();
  const { row } = useSingletonRow<ContactInfo>("contact_info");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    setBusy(false);
    setDone(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <Mail className="h-7 w-7" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-2">{lang === "bn" ? "যোগাযোগ" : "Contact"}</h1>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {row?.phone && <InfoCard icon={<Phone className="h-5 w-5" />} label={lang === "bn" ? "ফোন" : "Phone"} value={row.phone} href={`tel:${row.phone}`} />}
          {row?.email && <InfoCard icon={<Mail className="h-5 w-5" />} label="Email" value={row.email} href={`mailto:${row.email}`} />}
          {row && (lang === "bn" ? row.address_bn : row.address_en) && (
            <InfoCard icon={<MapPin className="h-5 w-5" />} label={lang === "bn" ? "ঠিকানা" : "Address"} value={lang === "bn" ? row.address_bn : row.address_en} />
          )}
          {row && (row.facebook_url || row.youtube_url || row.instagram_url) && (
            <div className="rounded-2xl bg-card border border-border shadow-card p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-bold">{lang === "bn" ? "সোশ্যাল" : "Social"}</p>
              <div className="flex gap-2">
                {row.facebook_url && <Social url={row.facebook_url} icon={<Facebook className="h-4 w-4" />} />}
                {row.youtube_url && <Social url={row.youtube_url} icon={<Youtube className="h-4 w-4" />} />}
                {row.instagram_url && <Social url={row.instagram_url} icon={<Instagram className="h-4 w-4" />} />}
              </div>
            </div>
          )}
        </div>

        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border shadow-card p-5 space-y-3">
          {done ? (
            <div className="text-center py-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground mb-3">
                <Check className="h-7 w-7" />
              </div>
              <p className="font-semibold">{lang === "bn" ? "বার্তা পাঠানো হয়েছে!" : "Message sent!"}</p>
            </div>
          ) : (
            <>
              <Input label={lang === "bn" ? "নাম" : "Name"} value={name} onChange={setName} required />
              <Input label="Email" value={email} onChange={setEmail} type="email" required />
              <Input label={lang === "bn" ? "বিষয়" : "Subject"} value={subject} onChange={setSubject} required />
              <label className="block">
                <span className="text-sm font-medium block mb-1">{lang === "bn" ? "বার্তা" : "Message"}</span>
                <textarea rows={4} required value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background" />
              </label>
              <button type="submit" disabled={busy} className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow-red disabled:opacity-60">
                <Send className="h-4 w-4" />
                {busy ? "..." : lang === "bn" ? "পাঠান" : "Send"}
              </button>
            </>
          )}
        </motion.form>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const content = (
    <div className="rounded-2xl bg-card border border-border shadow-card p-5 flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{label}</p>
        <p className="font-semibold truncate">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href}>{content}</a> : content;
}

function Social({ url, icon }: { url: string; icon: React.ReactNode }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-lg bg-primary/10 text-primary inline-flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
      {icon}
    </a>
  );
}

function Input({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-medium block mb-1">{label}</span>
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background" />
    </label>
  );
}
