import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, ExternalLink, Crown, Medal, X as CloseIcon, Facebook, Instagram, Youtube,
  Phone, Mail, ChevronRight, Loader2, Plus, Check,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { MediaUpload } from "@/components/MediaUpload";
import { PaymentFlow } from "@/components/PaymentFlow";
import { toast } from "sonner";
import { SponsorShowcase } from "@/components/SponsorShowcase";

export const Route = createFileRoute("/sponsors")({
  component: SponsorsPage,
  head: () => ({
    meta: [
      { title: "Sponsors · Martello Cup" },
      { name: "description", content: "Our Gold, Silver and Bronze sponsors and how to become one." },
    ],
  }),
});

type Sponsor = {
  id: string;
  name: string;
  tier: string;
  logo_url: string | null;
  banner_url: string | null;
  website_url: string | null;
  description_bn: string;
  description_en: string;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  contact_phone: string | null;
  contact_email: string | null;
};

type Pkg = {
  id: string;
  tier: string;
  price: number;
  benefits_bn: string;
  benefits_en: string;
  is_active: boolean;
};

const TIER_META: Record<string, { bn: string; en: string; icon: typeof Crown; grad: string; ring: string }> = {
  gold: { bn: "গোল্ড স্পন্সর", en: "Gold Sponsors", icon: Crown, grad: "from-yellow-500 to-amber-500", ring: "border-yellow-500/40" },
  silver: { bn: "সিলভার স্পন্সর", en: "Silver Sponsors", icon: Medal, grad: "from-slate-400 to-slate-500", ring: "border-slate-400/40" },
  bronze: { bn: "ব্রোঞ্জ স্পন্সর", en: "Bronze Sponsors", icon: Award, grad: "from-orange-500 to-orange-700", ring: "border-orange-500/40" },
};

function SponsorsPage() {
  const { lang } = useI18n();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Sponsor | null>(null);
  const [applyOpen, setApplyOpen] = useState<Pkg | null>(null);

  useEffect(() => {
    Promise.all([
      supabase
        .from("sponsors")
        .select("*")
        .eq("status", "approved")
        .order("sort_order"),
      supabase.from("sponsor_packages").select("*").eq("is_active", true).order("price", { ascending: false }),
    ]).then(([s, p]) => {
      setSponsors((s.data ?? []) as Sponsor[]);
      setPackages((p.data ?? []) as Pkg[]);
      setLoading(false);
    });
  }, []);

  // Open detail from URL hash
  useEffect(() => {
    if (typeof window === "undefined" || sponsors.length === 0) return;
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const found = sponsors.find((s) => s.id === hash);
      if (found) setActive(found);
    }
  }, [sponsors]);

  const grouped = useMemo(() => {
    const g: Record<string, Sponsor[]> = { gold: [], silver: [], bronze: [] };
    sponsors.forEach((s) => {
      if (g[s.tier]) g[s.tier].push(s);
    });
    return g;
  }, [sponsors]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-4">
          <Award className="h-7 w-7" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-2">
          {lang === "bn" ? "আমাদের স্পন্সর" : "Our Sponsors"}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {lang === "bn"
            ? "যাদের সহযোগিতায় এই আয়োজন সম্ভব হয়েছে। আগ্রহী হলে নিচের যেকোনো প্যাকেজ থেকে স্পন্সর হতে পারেন।"
            : "The brands making this tournament possible. Pick a package below to become a sponsor."}
        </p>
      </motion.div>

      {/* Gold showcase */}
      <SponsorShowcase compact />

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        </div>
      ) : (
        <div className="space-y-12 mt-6">
          {(["silver", "bronze"] as const).map((tier) => {
            const items = grouped[tier];
            if (!items || items.length === 0) return null;
            const meta = TIER_META[tier];
            const Icon = meta.icon;
            return (
              <section key={tier}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${meta.grad} text-white shadow`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-2xl font-bold">{lang === "bn" ? meta.bn : meta.en}</h2>
                </div>
                <div className={`grid gap-4 ${tier === "silver" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6"}`}>
                  {items.map((s) => (
                    <motion.button
                      key={s.id}
                      onClick={() => setActive(s)}
                      whileHover={{ y: -4 }}
                      className={`rounded-2xl bg-card border-2 ${meta.ring} hover:border-primary shadow-card p-4 text-center transition-colors`}
                    >
                      <div className={`${tier === "silver" ? "h-20" : "h-14"} mb-2 flex items-center justify-center`}>
                        {s.logo_url ? (
                          <img src={s.logo_url} alt={s.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Award className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <p className={`font-semibold truncate ${tier === "silver" ? "text-sm" : "text-xs"}`}>{s.name}</p>
                    </motion.button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Become a sponsor */}
      {packages.length > 0 && (
        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              {lang === "bn" ? "স্পন্সর হোন" : "Become a Sponsor"}
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              {lang === "bn"
                ? "একটি প্যাকেজ বেছে নিন, তথ্য দিন ও পেমেন্ট করুন। এডমিন অনুমোদনের পর আপনার ব্র্যান্ড সাইটে প্রকাশ হবে।"
                : "Pick a package, submit your info & pay. After admin approval your brand goes live on the site."}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {packages.map((p) => {
              const meta = TIER_META[p.tier] ?? TIER_META.bronze;
              const Icon = meta.icon;
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl bg-card border-2 ${meta.ring} shadow-card p-6 flex flex-col`}
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${meta.grad} text-white shadow mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold capitalize">{p.tier}</h3>
                  <p className="font-display text-3xl font-black text-primary mt-2">৳ {p.price.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-3 whitespace-pre-line flex-1">
                    {(lang === "bn" ? p.benefits_bn : p.benefits_en) ||
                      (lang === "bn" ? "বিস্তারিত শীঘ্রই" : "Details coming soon")}
                  </p>
                  <button
                    onClick={() => setApplyOpen(p)}
                    className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-glow"
                  >
                    {lang === "bn" ? "আবেদন করুন" : "Apply Now"} <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 rounded-2xl bg-gradient-primary text-white p-6 sm:p-8 text-center"
      >
        <h3 className="font-display text-2xl font-bold mb-2">
          {lang === "bn" ? "প্রশ্ন আছে?" : "Have questions?"}
        </h3>
        <Link to="/contact" className="inline-block px-5 py-2.5 mt-2 rounded-xl bg-white text-primary font-bold shadow">
          {lang === "bn" ? "যোগাযোগ" : "Contact"}
        </Link>
      </motion.div>

      <AnimatePresence>
        {active && <SponsorDetail sponsor={active} onClose={() => { setActive(null); if (typeof window !== "undefined") history.replaceState(null, "", window.location.pathname); }} />}
      </AnimatePresence>
      <AnimatePresence>
        {applyOpen && <ApplyDialog pkg={applyOpen} onClose={() => setApplyOpen(null)} />}
      </AnimatePresence>
    </div>
  );
}

function SponsorDetail({ sponsor: s, onClose }: { sponsor: Sponsor; onClose: () => void }) {
  const { lang } = useI18n();
  const meta = TIER_META[s.tier] ?? TIER_META.bronze;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="relative h-44 sm:h-56 bg-muted">
          {s.banner_url ? (
            <img src={s.banner_url} alt={s.name} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${meta.grad}`} />
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
          <div className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r ${meta.grad} text-white text-[10px] font-black tracking-widest shadow-lg uppercase`}>
            {s.tier}
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4 mb-4">
            {s.logo_url && (
              <img src={s.logo_url} alt="" className="h-16 w-16 rounded-xl object-contain bg-white p-1.5 border border-border shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-2xl font-bold">{s.name}</h2>
              {s.website_url && (
                <a href={s.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary inline-flex items-center gap-1 mt-1">
                  <ExternalLink className="h-3.5 w-3.5" /> {s.website_url.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">
            {(lang === "bn" ? s.description_bn : s.description_en) ||
              (lang === "bn" ? "বিস্তারিত শীঘ্রই যুক্ত হবে।" : "Details coming soon.")}
          </p>

          {(s.facebook_url || s.instagram_url || s.youtube_url || s.contact_phone || s.contact_email) && (
            <div className="mt-5 pt-5 border-t border-border flex flex-wrap gap-2">
              {s.facebook_url && <Social href={s.facebook_url} icon={Facebook} />}
              {s.instagram_url && <Social href={s.instagram_url} icon={Instagram} />}
              {s.youtube_url && <Social href={s.youtube_url} icon={Youtube} />}
              {s.contact_phone && <Social href={`tel:${s.contact_phone}`} icon={Phone} label={s.contact_phone} />}
              {s.contact_email && <Social href={`mailto:${s.contact_email}`} icon={Mail} label={s.contact_email} />}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Social({ href, icon: Icon, label }: { href: string; icon: typeof Facebook; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:border-primary hover:bg-accent text-sm"
    >
      <Icon className="h-4 w-4" />
      {label && <span className="truncate max-w-[150px]">{label}</span>}
    </a>
  );
}

function ApplyDialog({ pkg, onClose }: { pkg: Pkg; onClose: () => void }) {
  const { lang } = useI18n();
  const T = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const [step, setStep] = useState<"form" | "pay" | "done">("form");
  const [submitting, setSubmitting] = useState(false);
  const [sponsorId, setSponsorId] = useState<string | null>(null);
  const [d, setD] = useState({
    name: "",
    description_bn: "",
    description_en: "",
    website_url: "",
    facebook_url: "",
    instagram_url: "",
    youtube_url: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    logo_url: "",
    banner_url: "",
  });
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!d.name.trim() || !d.contact_name.trim() || !d.contact_phone.trim()) {
      setErr(T("নাম, যোগাযোগ নাম ও ফোন আবশ্যক", "Name, contact name and phone are required"));
      return;
    }
    setSubmitting(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("sponsors")
      .insert({
        user_id: authUser?.id ?? null,
        name: d.name.trim(),
        tier: pkg.tier,
        status: "pending",
        description_bn: d.description_bn,
        description_en: d.description_en,
        website_url: d.website_url || null,
        facebook_url: d.facebook_url || null,
        instagram_url: d.instagram_url || null,
        youtube_url: d.youtube_url || null,
        contact_name: d.contact_name,
        contact_phone: d.contact_phone,
        contact_email: d.contact_email || null,
        logo_url: d.logo_url || null,
        banner_url: d.banner_url || null,
        amount_paid: pkg.price,
      } as any)
      .select("id")
      .single();
    setSubmitting(false);
    if (error || !data) {
      setErr(error?.message || "Submit failed");
      return;
    }
    setSponsorId(data.id);
    setStep("pay");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl shadow-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-display font-bold text-xl">
              {T(`স্পন্সর আবেদন — ${pkg.tier.toUpperCase()}`, `Sponsor Application — ${pkg.tier.toUpperCase()}`)}
            </h2>
            <p className="text-sm text-muted-foreground">৳ {pkg.price.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {step === "form" && (
            <div className="space-y-3">
              <Inp label={T("ব্র্যান্ড / কোম্পানির নাম *", "Brand / Company Name *")} value={d.name} onChange={(v) => setD({ ...d, name: v })} />
              <div className="grid sm:grid-cols-2 gap-3">
                <Inp label={T("যোগাযোগ ব্যক্তি *", "Contact Person *")} value={d.contact_name} onChange={(v) => setD({ ...d, contact_name: v })} />
                <Inp label={T("ফোন *", "Phone *")} value={d.contact_phone} onChange={(v) => setD({ ...d, contact_phone: v })} />
              </div>
              <Inp label={T("ইমেইল", "Email")} type="email" value={d.contact_email} onChange={(v) => setD({ ...d, contact_email: v })} />
              <Inp label="Website URL" value={d.website_url} onChange={(v) => setD({ ...d, website_url: v })} />
              <div className="grid sm:grid-cols-3 gap-3">
                <Inp label="Facebook" value={d.facebook_url} onChange={(v) => setD({ ...d, facebook_url: v })} />
                <Inp label="Instagram" value={d.instagram_url} onChange={(v) => setD({ ...d, instagram_url: v })} />
                <Inp label="YouTube" value={d.youtube_url} onChange={(v) => setD({ ...d, youtube_url: v })} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">{T("বিবরণ (বাংলা)", "Description (Bangla)")}</label>
                <textarea rows={3} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background"
                  value={d.description_bn} onChange={(e) => setD({ ...d, description_bn: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">{T("বিবরণ (English)", "Description (English)")}</label>
                <textarea rows={3} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background"
                  value={d.description_en} onChange={(e) => setD({ ...d, description_en: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">{T("লোগো", "Logo")}</label>
                <MediaUpload value={d.logo_url} onChange={(u) => setD({ ...d, logo_url: u ?? "" })} folder="sponsors" label="Logo" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">{T("ব্যানার (গোল্ডের জন্য)", "Banner (for Gold)")}</label>
                <MediaUpload value={d.banner_url} onChange={(u) => setD({ ...d, banner_url: u ?? "" })} folder="sponsors" label="Banner" />
              </div>

              {err && <p className="text-sm text-destructive font-medium">{err}</p>}

              <button onClick={submit} disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-60">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                {T("পেমেন্টে যান", "Continue to Payment")}
              </button>
            </div>
          )}

          {step === "pay" && sponsorId && (
            <PaymentFlow
              submissionType={"sponsor" as any}
              amount={pkg.price}
              sponsorId={sponsorId}
              onSuccess={() => setStep("done")}
            />
          )}

          {step === "done" && (
            <div className="text-center py-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success mb-4">
                <Check className="h-9 w-9" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">{T("ধন্যবাদ!", "Thank you!")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {T("পেমেন্ট জমা হয়েছে। এডমিন যাচাই ও অনুমোদনের পর আপনার ব্র্যান্ড সাইটে প্রকাশিত হবে।",
                  "Your payment is submitted. Once admin approves it, your brand goes live on the site.")}
              </p>
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold">
                {T("বন্ধ করুন", "Close")}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Inp({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-sm font-semibold mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background" />
    </div>
  );
}
