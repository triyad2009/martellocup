import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Loader2, Save, Ticket, Shirt, Heart, ClipboardList, ChevronRight, Camera, ArrowLeft, CheckCircle2, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { uploadMedia } from "@/lib/content";
import { toast } from "sonner";
import { TicketSlip } from "@/components/TicketSlip";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
};

function T(lang: string, bn: string, en: string) {
  return lang === "bn" ? bn : en;
}

function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { lang } = useI18n();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"home" | "tickets" | "jerseys" | "sponsors" | "registrations">("home");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      setProfile(data as ProfileRow);
      setLoading(false);
    })();
  }, [user]);

  if (authLoading || loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <User className="h-14 w-14 mx-auto text-primary mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">{T(lang, "লগইন করুন", "Sign In")}</h1>
        <Link to="/auth" className="inline-block mt-3 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold">
          {T(lang, "লগইন", "Sign In")}
        </Link>
      </div>
    );
  }

  const isComplete = !!(profile?.full_name && profile?.phone && profile?.email && profile?.avatar_url);

  const save = async (patch: Partial<ProfileRow>) => {
    setSaving(true);
    const next = { ...(profile ?? { user_id: user.id }), ...patch } as ProfileRow;
    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      display_name: next.full_name ?? next.display_name,
      full_name: next.full_name,
      email: next.email ?? user.email,
      phone: next.phone,
      avatar_url: next.avatar_url,
    } as any, { onConflict: "user_id" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setProfile(next);
    toast.success(T(lang, "সংরক্ষিত", "Saved"));
  };

  if (!isComplete) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 py-8 sm:py-12">
        <ProfileForm
          lang={lang}
          email={user.email ?? ""}
          profile={profile}
          saving={saving}
          onSave={save}
        />
      </div>
    );
  }

  if (view !== "home") {
    return (
      <div className="mx-auto max-w-3xl px-3 sm:px-6 py-6 sm:py-10">
        <button onClick={() => setView("home")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4" /> {T(lang, "ফিরুন", "Back")}
        </button>
        {view === "tickets" && <MyTickets userId={user.id} lang={lang} />}
        {view === "jerseys" && <MyJerseys userId={user.id} lang={lang} />}
        {view === "sponsors" && <MySponsors userId={user.id} lang={lang} />}
        {view === "registrations" && <MyRegistrations userId={user.id} lang={lang} />}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-6 py-6 sm:py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-border p-5 sm:p-6 mb-5 flex items-center gap-4">
        <img src={profile?.avatar_url ?? ""} alt="" className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover ring-2 ring-primary shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{T(lang, "স্বাগতম", "Welcome")}</p>
          <h1 className="font-display text-xl sm:text-2xl font-bold truncate">{profile?.full_name}</h1>
          <p className="text-xs text-muted-foreground truncate">{profile?.email} · {profile?.phone}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { id: "tickets", icon: Ticket, label: T(lang, "টিকিট", "Tickets") },
          { id: "jerseys", icon: Shirt, label: T(lang, "জার্সি", "Jerseys") },
          { id: "sponsors", icon: Heart, label: T(lang, "স্পন্সর", "Sponsors") },
          { id: "registrations", icon: ClipboardList, label: T(lang, "দল", "Teams") },
        ].map((it) => (
          <button key={it.id} onClick={() => setView(it.id as any)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary hover:shadow-glow-red transition-all">
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <it.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold">{it.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold">{T(lang, "প্রোফাইল", "Profile")}</h2>
        </div>
        <ProfileForm lang={lang} email={user.email ?? ""} profile={profile} saving={saving} onSave={save} compact />
      </div>
    </div>
  );
}

/* ---------------- Profile form ---------------- */

function ProfileForm({
  lang, email, profile, saving, onSave, compact = false,
}: {
  lang: string;
  email: string;
  profile: ProfileRow | null;
  saving: boolean;
  onSave: (p: Partial<ProfileRow>) => Promise<void>;
  compact?: boolean;
}) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [emailVal] = useState(profile?.email ?? email);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);

  const handleFile = async (f: File | null) => {
    if (!f) return;
    setUploading(true);
    try {
      const url = await uploadMedia(f, "avatars");
      setAvatarUrl(url);
    } catch (e: any) { toast.error(e.message); }
    setUploading(false);
  };

  return (
    <div>
      {!compact && (
        <div className="text-center mb-5">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-red mb-3">
            <User className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-1">{T(lang, "প্রোফাইল সম্পন্ন করুন", "Complete Your Profile")}</h1>
          <p className="text-sm text-muted-foreground">
            {T(lang, "প্রোফাইল কমপ্লিট হলে আপনার সব আবেদন ও কেনাকাটা দেখতে পাবেন।", "Complete your profile to view all your orders and applications.")}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2">
          <label className="cursor-pointer relative group">
            <div className="h-24 w-24 rounded-full bg-muted border-2 border-dashed border-border overflow-hidden flex items-center justify-center">
              {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : <Camera className="h-6 w-6 text-muted-foreground" />}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <input type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          </label>
          {uploading && <p className="text-xs text-muted-foreground">{T(lang, "আপলোড হচ্ছে...", "Uploading...")}</p>}
        </div>

        <Field label={T(lang, "পুরো নাম", "Full Name")} required>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background" />
        </Field>
        <Field label={T(lang, "ফোন নাম্বার", "Phone Number")} required>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background" />
        </Field>
        <Field label={T(lang, "ইমেইল (ভেরিফাইড)", "Email (Verified)")}>
          <input value={emailVal} disabled
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-muted text-muted-foreground" />
        </Field>

        <button
          onClick={() => onSave({ full_name: fullName, phone, avatar_url: avatarUrl, email: emailVal })}
          disabled={saving || !fullName || !phone || !avatarUrl}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow-red disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {T(lang, "সংরক্ষণ", "Save")}
        </button>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1.5">{label} {required && <span className="text-destructive">*</span>}</span>
      {children}
    </label>
  );
}

/* ---------------- Status helpers ---------------- */

function StatusPill({ status, lang }: { status: string; lang: string }) {
  const map: Record<string, { c: string; bn: string; en: string; Icon: any }> = {
    approved: { c: "bg-success/15 text-success", bn: "অনুমোদিত", en: "Approved", Icon: CheckCircle2 },
    rejected: { c: "bg-destructive/15 text-destructive", bn: "বাতিল", en: "Rejected", Icon: XCircle },
    pending: { c: "bg-warning/15 text-warning", bn: "অপেক্ষমাণ", en: "Pending", Icon: Clock },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded-full ${s.c}`}>
      <s.Icon className="h-3 w-3" /> {lang === "bn" ? s.bn : s.en}
    </span>
  );
}

/* ---------------- My Tickets ---------------- */

function MyTickets({ userId, lang }: { userId: string; lang: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("payment_submissions").select("*")
        .eq("user_id", userId).eq("submission_type", "ticket")
        .order("created_at", { ascending: false });
      setRows(data ?? []); setLoading(false);
    })();
  }, [userId]);

  if (loading) return <Loader />;
  if (rows.length === 0) return <Empty lang={lang} icon={Ticket} text={T(lang, "কোনো টিকিট নেই", "No tickets yet")} />;

  const open = rows.find((r) => r.id === openId);
  if (open && open.status === "approved" && open.ticket_code) {
    return (
      <div>
        <button onClick={() => setOpenId(null)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4" /> {T(lang, "তালিকায় ফিরুন", "Back to list")}
        </button>
        <TicketSlip
          ticketCode={open.ticket_code}
          payerName={open.payer_name}
          payerPhone={open.payer_phone}
          tierName={open.ticket_tier_name}
          amount={open.amount}
          date={open.updated_at ?? open.created_at}
        />
      </div>
    );
  }

  return (
    <Section title={T(lang, "আমার টিকিট", "My Tickets")} icon={Ticket}>
      <div className="space-y-3">
        {rows.map((r) => (
          <button key={r.id} onClick={() => setOpenId(r.id)} disabled={r.status !== "approved"}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary text-left disabled:opacity-80 disabled:hover:border-border">
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Ticket className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold truncate">{r.ticket_tier_name ?? T(lang, "টিকিট", "Ticket")}</p>
                <StatusPill status={r.status} lang={lang} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">৳ {r.amount} · {new Date(r.created_at).toLocaleDateString()}</p>
              {r.status === "approved" && r.ticket_code && (
                <p className="text-xs text-success mt-1 font-mono font-bold">{r.ticket_code}</p>
              )}
              {r.status === "rejected" && r.rejection_reason && (
                <p className="text-xs text-destructive mt-1">{r.rejection_reason}</p>
              )}
            </div>
            {r.status === "approved" && <ChevronRight className="h-5 w-5 text-primary shrink-0" />}
          </button>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- My Jerseys ---------------- */

function MyJerseys({ userId, lang }: { userId: string; lang: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("jersey_orders").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      setRows(data ?? []); setLoading(false);
    })();
  }, [userId]);
  if (loading) return <Loader />;
  if (rows.length === 0) return <Empty lang={lang} icon={Shirt} text={T(lang, "কোনো জার্সি অর্ডার নেই", "No jersey orders")} />;

  return (
    <Section title={T(lang, "আমার জার্সি", "My Jerseys")} icon={Shirt}>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-semibold">{r.product_name}</p>
              <StatusPill status={r.status} lang={lang} />
            </div>
            <p className="text-xs text-muted-foreground">
              {T(lang, "সাইজ", "Size")}: {r.size} · {T(lang, "পরিমাণ", "Qty")}: {r.quantity} · ৳ {r.total_amount}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {T(lang, "নাম", "Name")}: {r.jersey_print_name}{r.jersey_number ? ` #${r.jersey_number}` : ""}
            </p>
            {r.admin_notes && <p className="text-xs mt-2 p-2 rounded-md bg-muted">{r.admin_notes}</p>}
            {r.rejection_reason && <p className="text-xs mt-2 text-destructive">{r.rejection_reason}</p>}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- My Sponsors ---------------- */

function MySponsors({ userId, lang }: { userId: string; lang: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("sponsors").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      setRows(data ?? []); setLoading(false);
    })();
  }, [userId]);
  if (loading) return <Loader />;
  if (rows.length === 0) return <Empty lang={lang} icon={Heart} text={T(lang, "কোনো স্পন্সর আবেদন নেই", "No sponsor applications")} />;

  return (
    <Section title={T(lang, "আমার স্পন্সর আবেদন", "My Sponsor Applications")} icon={Heart}>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="p-4 rounded-xl border border-border flex items-center gap-3">
            {r.logo_url && <img src={r.logo_url} className="h-12 w-12 rounded-lg object-cover" alt="" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold truncate">{r.name}</p>
                <StatusPill status={r.status} lang={lang} />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{r.tier} · ৳ {r.amount_paid ?? "-"}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- My Registrations ---------------- */

function MyRegistrations({ userId, lang }: { userId: string; lang: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("registrations").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      setRows(data ?? []); setLoading(false);
    })();
  }, [userId]);
  if (loading) return <Loader />;
  if (rows.length === 0) return <Empty lang={lang} icon={ClipboardList} text={T(lang, "কোনো দল নিবন্ধন নেই", "No team registrations")} />;

  return (
    <Section title={T(lang, "আমার দল নিবন্ধন", "My Team Registrations")} icon={ClipboardList}>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-semibold">{r.team_name}</p>
              <StatusPill status={r.status} lang={lang} />
            </div>
            <p className="text-xs text-muted-foreground">
              {T(lang, "কোচ", "Coach")}: {r.coach_name} · {Array.isArray(r.players_data) ? r.players_data.length : 0} {T(lang, "খেলোয়াড়", "players")}
            </p>
            {r.rejection_reason && <p className="text-xs mt-2 text-destructive">{r.rejection_reason}</p>}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Helpers ---------------- */

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card border border-border p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg sm:text-xl font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Loader() {
  return <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>;
}

function Empty({ lang: _l, icon: Icon, text }: { lang: string; icon: any; text: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}
