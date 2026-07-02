import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, ClipboardList, Loader2, Search, UserPlus, UserMinus,
  Settings as SettingsIcon, Wallet, Receipt, Plus, Trash2, Save, Check, X, Ticket,
  BarChart3, Users, User as UserIcon, CalendarDays, Trophy, ListOrdered, Newspaper, Image as ImageIcon, Heart, Info, Phone, Shirt, Package, Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useUserRoles, type AppRole } from "@/lib/roles";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  HeroStatsManager, TeamsManager, PlayersManager, FixturesManager, ResultsManager,
  PointsManager, NewsManager, GalleryManager, SponsorsManager, AboutManager, ContactManager,
  JerseyProductsManager, JerseyOrdersManager, MembersManager, SponsorPackagesManager, PromoCodesManager,
  AIKnowledgeManager,
} from "@/components/admin/ContentManagers";
import { PortalCredentialsManager } from "@/components/admin/PortalCredentialsManager";
import { KeyRound } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const ROLE_OPTIONS: AppRole[] = [
  "super_admin", "admin", "content_manager", "match_manager", "media_manager", "viewer",
];

type ProfileRow = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type RoleRow = { user_id: string; role: AppRole };

type TabId =
  | "settings" | "hero" | "teams" | "players" | "fixtures" | "results" | "points"
  | "news" | "gallery" | "sponsors" | "sponsor_packages" | "promo_codes" | "about" | "contact" | "members"
  | "registrations" | "tiers" | "methods" | "payments"
  | "jerseys" | "jersey_orders" | "ai" | "portal_creds" | "roles";

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isSuperAdmin, loading: roleLoading } = useUserRoles();
  const { lang } = useI18n();
  const uiLang: "bn" | "en" = lang === "en" ? "en" : "bn";
  const [tab, setTab] = useState<TabId>("settings");

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Shield className="h-14 w-14 mx-auto text-primary mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">
          {lang === "bn" ? "লগইন প্রয়োজন" : "Login Required"}
        </h1>
        <Link to="/auth" className="inline-block mt-3 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold">
          {lang === "bn" ? "লগইন করুন" : "Sign In"}
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Shield className="h-14 w-14 mx-auto text-destructive mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">
          {lang === "bn" ? "প্রবেশাধিকার নেই" : "Access Denied"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {lang === "bn" ? "শুধুমাত্র এডমিনদের জন্য।" : "This area is for admins only."}
        </p>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: typeof Shield }[] = [
    { id: "settings", label: lang === "bn" ? "সেটিংস" : "Settings", icon: SettingsIcon },
    { id: "hero", label: lang === "bn" ? "হিরো" : "Hero", icon: BarChart3 },
    { id: "teams", label: lang === "bn" ? "দল" : "Teams", icon: Users },
    { id: "players", label: lang === "bn" ? "খেলোয়াড়" : "Players", icon: UserIcon },
    { id: "fixtures", label: lang === "bn" ? "ফিক্সচার" : "Fixtures", icon: CalendarDays },
    { id: "results", label: lang === "bn" ? "ফলাফল" : "Results", icon: Trophy },
    { id: "points", label: lang === "bn" ? "পয়েন্ট" : "Points", icon: ListOrdered },
    { id: "news", label: lang === "bn" ? "সংবাদ" : "News", icon: Newspaper },
    { id: "gallery", label: lang === "bn" ? "গ্যালারি" : "Gallery", icon: ImageIcon },
    { id: "sponsors", label: lang === "bn" ? "স্পন্সর" : "Sponsors", icon: Heart },
    { id: "sponsor_packages", label: lang === "bn" ? "স্পন্সর প্যাকেজ" : "Sponsor Packages", icon: Package },
    { id: "promo_codes", label: lang === "bn" ? "প্রোমো কোড" : "Promo Codes", icon: Ticket },
    { id: "about", label: lang === "bn" ? "আমাদের সম্পর্কে" : "About", icon: Info },
    { id: "contact", label: lang === "bn" ? "যোগাযোগ" : "Contact", icon: Phone },
    { id: "members", label: lang === "bn" ? "সদস্য" : "Members", icon: Users },
    { id: "registrations", label: lang === "bn" ? "নিবন্ধন" : "Registrations", icon: ClipboardList },
    { id: "tiers", label: lang === "bn" ? "টিকিট" : "Tickets", icon: Ticket },
    { id: "methods", label: lang === "bn" ? "পেমেন্ট মেথড" : "Payment Methods", icon: Wallet },
    { id: "payments", label: lang === "bn" ? "পেমেন্ট জমা" : "Payments", icon: Receipt },
    { id: "jerseys", label: lang === "bn" ? "জার্সি" : "Jerseys", icon: Shirt },
    { id: "jersey_orders", label: lang === "bn" ? "জার্সি অর্ডার" : "Jersey Orders", icon: Package },
    { id: "ai", label: lang === "bn" ? "AI সহকারী" : "AI Assistant", icon: Sparkles },
    ...(isSuperAdmin ? [{ id: "roles" as TabId, label: lang === "bn" ? "ভূমিকা" : "Roles", icon: Shield }] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide mb-3">
            <Shield className="h-3.5 w-3.5" />
            {isSuperAdmin ? (lang === "bn" ? "সুপার এডমিন" : "SUPER ADMIN") : (lang === "bn" ? "এডমিন" : "ADMIN")}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            {lang === "bn" ? "এডমিন প্যানেল" : "Admin Panel"}
          </h1>
        </div>
        <Link to="/scan-tickets" className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-bold shadow-glow-red text-sm">
          <Ticket className="h-4 w-4" /> {lang === "bn" ? "টিকিট স্ক্যান" : "Scan Tickets"}
        </Link>
      </motion.div>

      {/* Tabs — mobile: 2-col grid; desktop: horizontal scroll */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-6">
        {tabs.map((tb) => {
          const active = tab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`inline-flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-glow-red"
                  : "bg-card border-border hover:border-primary"
              }`}
            >
              <tb.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{tb.label}</span>
            </button>
          );
        })}
      </div>

      {tab === "settings" && <SettingsManager lang={uiLang} />}
      {tab === "hero" && <HeroStatsManager lang={uiLang} />}
      {tab === "teams" && <TeamsManager lang={uiLang} />}
      {tab === "players" && <PlayersManager lang={uiLang} />}
      {tab === "fixtures" && <FixturesManager lang={uiLang} />}
      {tab === "results" && <ResultsManager lang={uiLang} />}
      {tab === "points" && <PointsManager lang={uiLang} />}
      {tab === "news" && <NewsManager lang={uiLang} />}
      {tab === "gallery" && <GalleryManager lang={uiLang} />}
      {tab === "sponsors" && <SponsorsManager lang={uiLang} />}
      {tab === "sponsor_packages" && <SponsorPackagesManager lang={uiLang} />}
      {tab === "promo_codes" && <PromoCodesManager lang={uiLang} />}
      {tab === "about" && <AboutManager lang={uiLang} />}
      {tab === "contact" && <ContactManager lang={uiLang} />}
      {tab === "members" && <MembersManager lang={uiLang} />}
      {tab === "registrations" && <RegistrationsManager lang={uiLang} />}
      {tab === "tiers" && <TicketTiersManager lang={uiLang} />}
      {tab === "methods" && <PaymentMethodsManager lang={uiLang} />}
      {tab === "payments" && <PaymentsManager lang={uiLang} />}
      {tab === "jerseys" && <JerseyProductsManager lang={uiLang} />}
      {tab === "jersey_orders" && <JerseyOrdersManager lang={uiLang} />}
      {tab === "ai" && <AIKnowledgeManager lang={uiLang} />}
      {tab === "roles" && isSuperAdmin && <RolesManager lang={uiLang} currentUserId={user.id} />}
    </div>
  );
}

/* -------------------- Tournament Settings -------------------- */

function SettingsManager({ lang }: { lang: "bn" | "en" }) {
  const [row, setRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("tournament_settings").select("*").limit(1).maybeSingle();
    setRow(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!row) return;
    setSaving(true);
    const { error } = await supabase
      .from("tournament_settings")
      .update({
        season_name: row.season_name,
        tagline: row.tagline,
        location: row.location,
        tournament_start: row.tournament_start,
        hero_logo_url: row.hero_logo_url,
      })
      .eq("id", row.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(lang === "bn" ? "সেভ হয়েছে" : "Saved");
  };

  if (loading) return <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>;
  if (!row) return <p className="text-muted-foreground">No settings row.</p>;

  // datetime-local needs YYYY-MM-DDTHH:MM
  const dtLocal = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <section className="rounded-2xl bg-card border border-border shadow-card p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold">
          {lang === "bn" ? "টুর্নামেন্ট সেটিংস" : "Tournament Settings"}
        </h2>
      </div>

      <Field label={lang === "bn" ? "সিজন নাম / ট্যাগলাইন" : "Season Name / Tagline"}>
        <input className="w-full px-3 py-2.5 rounded-lg border border-border bg-background"
          value={row.season_name ?? ""} onChange={(e) => setRow({ ...row, season_name: e.target.value })} />
      </Field>
      <Field label={lang === "bn" ? "মূল লেখা" : "Hero Title"}>
        <input className="w-full px-3 py-2.5 rounded-lg border border-border bg-background"
          value={row.tagline ?? ""} onChange={(e) => setRow({ ...row, tagline: e.target.value })} />
      </Field>
      <Field label={lang === "bn" ? "স্থান" : "Location"}>
        <input className="w-full px-3 py-2.5 rounded-lg border border-border bg-background"
          value={row.location ?? ""} onChange={(e) => setRow({ ...row, location: e.target.value })} />
      </Field>
      <Field label={lang === "bn" ? "শুরুর তারিখ ও সময়" : "Tournament Start (Date & Time)"}>
        <input type="datetime-local"
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background"
          value={dtLocal(row.tournament_start)}
          onChange={(e) => setRow({ ...row, tournament_start: new Date(e.target.value).toISOString() })} />
      </Field>
      <Field label={lang === "bn" ? "ওয়েবসাইট লোগো URL (Navbar, Footer, Tickets, Auth — সব জায়গায় ব্যবহৃত)" : "Website Logo URL (used in Navbar, Footer, Tickets, Auth — everywhere)"}>
        <input className="w-full px-3 py-2.5 rounded-lg border border-border bg-background"
          value={row.hero_logo_url ?? ""} onChange={(e) => setRow({ ...row, hero_logo_url: e.target.value || null })}
          placeholder="https://..." />
      </Field>

      <button
        onClick={save}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold shadow-glow-red disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {lang === "bn" ? "সেভ করুন" : "Save"}
      </button>
    </section>
  );
}

/* -------------------- Registrations -------------------- */

function RegistrationsManager({ lang }: { lang: "bn" | "en" }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("registrations").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(lang === "bn" ? "আপডেট হয়েছে" : "Updated"); load(); }
  };

  return (
    <section className="rounded-2xl bg-card border border-border shadow-card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold">
          {lang === "bn" ? "দল নিবন্ধন" : "Team Registrations"}
        </h2>
        <span className="ml-auto text-xs text-muted-foreground">{rows.length}</span>
      </div>

      {loading ? (
        <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          {lang === "bn" ? "কোনো নিবন্ধন নেই" : "No registrations yet."}
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <RegistrationCard key={r.id} r={r} lang={lang} setStatus={setStatus} />
          ))}
        </div>
      )}
    </section>
  );
}

function RegistrationCard({ r, lang, setStatus }: { r: any; lang: "bn" | "en"; setStatus: (id: string, status: string) => void }) {
  const [open, setOpen] = useState(false);
  const players: any[] = Array.isArray(r.players_data) ? r.players_data : [];
  const social = (r.social_links && typeof r.social_links === "object") ? r.social_links : {};
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold truncate">{r.team_name}</p>
            {r.short_name && <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-muted">{r.short_name}</span>}
            {r.category && <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">{r.category}</span>}
            <StatusBadge status={r.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {r.coach_name} · {r.coach_phone} · {players.length} {lang === "bn" ? "খেলোয়াড়" : "players"}
            {r.tracking_code && <> · <code className="text-primary">{r.tracking_code}</code></>}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setOpen((v) => !v)} className="text-xs px-3 py-1.5 rounded-md border border-border font-semibold">
            {open ? (lang === "bn" ? "বন্ধ" : "Hide") : (lang === "bn" ? "বিস্তারিত" : "Details")}
          </button>
          <button onClick={() => setStatus(r.id, "approved")} className="text-xs px-3 py-1.5 rounded-md bg-success text-success-foreground font-semibold">
            {lang === "bn" ? "অনুমোদন" : "Approve"}
          </button>
          <button onClick={() => setStatus(r.id, "rejected")} className="text-xs px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground font-semibold">
            {lang === "bn" ? "বাতিল" : "Reject"}
          </button>
          <button onClick={() => setStatus(r.id, "pending")} className="text-xs px-3 py-1.5 rounded-md border border-border font-semibold">
            {lang === "bn" ? "অপেক্ষমাণ" : "Pending"}
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-4 pt-4 border-t border-border grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-bold text-xs uppercase text-muted-foreground mb-1">{lang === "bn" ? "দলের তথ্য" : "Team Info"}</h4>
            <p><b>{lang === "bn" ? "ক্যাপ্টেন:" : "Captain:"}</b> {r.captain_name}</p>
            <p><b>{lang === "bn" ? "কোচ ইমেইল:" : "Coach email:"}</b> {r.coach_email || "—"}</p>
            <p><b>{lang === "bn" ? "ঠিকানা:" : "Address:"}</b> {r.address || "—"}</p>
            {r.description && <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{r.description}</p>}
            {Object.keys(social).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(social).map(([k, v]) => v ? (
                  <a key={k} href={String(v)} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded bg-muted hover:bg-primary hover:text-primary-foreground">{k} ↗</a>
                ) : null)}

              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {lang === "bn" ? "জমা:" : "Submitted:"} {new Date(r.created_at).toLocaleString()}
            </p>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase text-muted-foreground mb-1">
              {lang === "bn" ? "খেলোয়াড় তালিকা" : "Players"} ({players.length})
            </h4>
            {players.length === 0 ? (
              <p className="text-xs text-muted-foreground">—</p>
            ) : (
              <ul className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {players.map((p, i) => (
                  <li key={i} className="text-xs flex items-center justify-between gap-2 bg-muted/40 rounded px-2 py-1">
                    <span className="truncate">
                      <b>#{p.jersey_number || i + 1}</b> {p.name || p.player_name || "—"}
                      {p.position && <span className="text-muted-foreground"> · {p.position}</span>}
                    </span>
                    {p.phone && <span className="text-muted-foreground shrink-0">{p.phone}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-success/15 text-success",
    rejected: "bg-destructive/15 text-destructive",
    pending: "bg-muted text-muted-foreground",
  };
  return <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${map[status] ?? map.pending}`}>{status}</span>;
}

/* -------------------- Payment Methods -------------------- */

function PaymentMethodsManager({ lang }: { lang: "bn" | "en" }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({ name: "", logo_url: "", account_number: "", instructions: "" });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("payment_methods").select("*").order("sort_order");
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!draft.name.trim() || !draft.account_number.trim()) {
      toast.error(lang === "bn" ? "নাম ও নাম্বার আবশ্যক" : "Name and number required");
      return;
    }
    const { error } = await supabase.from("payment_methods").insert({
      name: draft.name.trim(),
      logo_url: draft.logo_url.trim() || null,
      account_number: draft.account_number.trim(),
      instructions: draft.instructions.trim() || null,
      sort_order: rows.length,
    });
    if (error) toast.error(error.message);
    else {
      setDraft({ name: "", logo_url: "", account_number: "", instructions: "" });
      toast.success(lang === "bn" ? "যোগ হয়েছে" : "Added");
      load();
    }
  };

  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from("payment_methods").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("payment_methods").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(lang === "bn" ? "মুছে ফেলা হয়েছে" : "Deleted"); load(); }
  };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl bg-card border border-border shadow-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold">
            {lang === "bn" ? "নতুন পেমেন্ট মেথড" : "New Payment Method"}
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input placeholder={lang === "bn" ? "নাম (যেমন bKash)" : "Name (e.g. bKash)"}
            className="px-3 py-2.5 rounded-lg border border-border bg-background"
            value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <input placeholder={lang === "bn" ? "একাউন্ট নাম্বার" : "Account number"}
            className="px-3 py-2.5 rounded-lg border border-border bg-background"
            value={draft.account_number} onChange={(e) => setDraft({ ...draft, account_number: e.target.value })} />
          <input placeholder={lang === "bn" ? "লোগো URL (ঐচ্ছিক)" : "Logo URL (optional)"}
            className="px-3 py-2.5 rounded-lg border border-border bg-background sm:col-span-2"
            value={draft.logo_url} onChange={(e) => setDraft({ ...draft, logo_url: e.target.value })} />
          <textarea placeholder={lang === "bn" ? "সেন্ড মানির নিয়ম" : "Send-money instructions"}
            rows={3}
            className="px-3 py-2.5 rounded-lg border border-border bg-background sm:col-span-2"
            value={draft.instructions} onChange={(e) => setDraft({ ...draft, instructions: e.target.value })} />
        </div>
        <button onClick={add}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold shadow-glow-red">
          <Plus className="h-4 w-4" /> {lang === "bn" ? "যোগ করুন" : "Add"}
        </button>
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-card p-5 sm:p-6">
        <h2 className="font-display text-xl font-bold mb-4">
          {lang === "bn" ? "সব মেথড" : "All Methods"} <span className="text-xs text-muted-foreground">({rows.length})</span>
        </h2>
        {loading ? (
          <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            {lang === "bn" ? "কোনো মেথড যোগ করা হয়নি" : "No methods added"}
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((m) => (
              <div key={m.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start gap-3">
                  {m.logo_url ? (
                    <img src={m.logo_url} alt="" className="h-12 w-12 rounded-lg object-cover bg-muted shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gradient-primary text-white flex items-center justify-center font-bold shrink-0">
                      {m.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm font-mono">{m.account_number}</p>
                    {m.instructions && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{m.instructions}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="inline-flex items-center gap-1 text-xs cursor-pointer">
                      <input type="checkbox" checked={m.is_active}
                        onChange={(e) => update(m.id, { is_active: e.target.checked })} />
                      {lang === "bn" ? "সক্রিয়" : "Active"}
                    </label>
                    <button onClick={() => remove(m.id)}
                      className="p-2 rounded-md text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------- Payment Submissions -------------------- */

function PaymentsManager({ lang }: { lang: "bn" | "en" }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("payment_submissions").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("payment_submissions").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(lang === "bn" ? "আপডেট হয়েছে" : "Updated"); load(); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("payment_submissions").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(lang === "bn" ? "মুছে ফেলা হয়েছে" : "Deleted"); load(); }
  };

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <section className="rounded-2xl bg-card border border-border shadow-card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Receipt className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold">
          {lang === "bn" ? "পেমেন্ট জমা" : "Payment Submissions"}
        </h2>
        <div className="ml-auto flex gap-1.5">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                filter === f ? "bg-primary text-primary-foreground" : "border border-border"
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          {lang === "bn" ? "কোনো জমা নেই" : "No submissions"}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold">{p.payer_name}</p>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-muted">
                      {p.submission_type}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>📞 {p.payer_phone} · {p.payment_method_name}</p>
                    <p>
                      {lang === "bn" ? "সেন্ডার শেষ ৪:" : "Sender last 4:"}{" "}
                      <span className="font-mono font-bold">{p.sender_last4}</span>
                      {p.transaction_id && <> · TxID: <span className="font-mono">{p.transaction_id}</span></>}
                    </p>
                    {p.amount && <p>৳ {p.amount}</p>}
                    <p className="opacity-60">{new Date(p.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap shrink-0">
                  <button onClick={() => setStatus(p.id, "approved")}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-success text-success-foreground font-semibold">
                    <Check className="h-3.5 w-3.5" /> {lang === "bn" ? "অনুমোদন" : "Approve"}
                  </button>
                  <button onClick={() => setStatus(p.id, "rejected")}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground font-semibold">
                    <X className="h-3.5 w-3.5" /> {lang === "bn" ? "বাতিল" : "Reject"}
                  </button>
                  <button onClick={() => remove(p.id)}
                    className="p-1.5 rounded-md text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* -------------------- Roles -------------------- */

function RolesManager({ lang, currentUserId }: { lang: "bn" | "en"; currentUserId: string }) {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [rolesByUser, setRolesByUser] = useState<Record<string, AppRole[]>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const [{ data: pr }, { data: rl }] = await Promise.all([
      supabase.from("profiles").select("user_id,email,display_name,avatar_url").order("created_at", { ascending: false }).limit(500),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    setProfiles((pr ?? []) as ProfileRow[]);
    const map: Record<string, AppRole[]> = {};
    (rl ?? []).forEach((r: RoleRow) => {
      map[r.user_id] = [...(map[r.user_id] ?? []), r.role];
    });
    setRolesByUser(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const grant = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) toast.error(error.message);
    else { toast.success(lang === "bn" ? "ভূমিকা যোগ হয়েছে" : "Role granted"); load(); }
  };

  const revoke = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) toast.error(error.message);
    else { toast.success(lang === "bn" ? "ভূমিকা সরানো হয়েছে" : "Role revoked"); load(); }
  };

  const filtered = profiles.filter((p) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (p.email ?? "").toLowerCase().includes(s) || (p.display_name ?? "").toLowerCase().includes(s);
  });

  return (
    <section className="rounded-2xl bg-card border border-border shadow-card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold">
          {lang === "bn" ? "ব্যবহারকারীর ভূমিকা" : "User Roles"}
        </h2>
        <div className="ml-auto relative">
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={lang === "bn" ? "ইমেইল বা নাম খুঁজুন" : "Search email or name"}
            className="pl-8 pr-3 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary w-56"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const userRoles = rolesByUser[p.user_id] ?? [];
            const isMe = p.user_id === currentUserId;
            return (
              <div key={p.user_id} className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold shrink-0">
                    {(p.display_name || p.email || "U")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">
                      {p.display_name || (lang === "bn" ? "নামহীন" : "Unnamed")}
                      {isMe && <span className="ml-2 text-[10px] uppercase text-primary">{lang === "bn" ? "আপনি" : "you"}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {userRoles.length === 0 && (
                    <span className="text-xs text-muted-foreground">{lang === "bn" ? "কোনো ভূমিকা নেই" : "No roles"}</span>
                  )}
                  {userRoles.map((r) => (
                    <span key={r} className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {r}
                      <button onClick={() => revoke(p.user_id, r)} className="hover:text-destructive" aria-label="remove">
                        <UserMinus className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_OPTIONS.filter((r) => !userRoles.includes(r)).map((r) => (
                    <button
                      key={r}
                      onClick={() => grant(p.user_id, r)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border border-border hover:border-primary hover:text-primary"
                    >
                      <UserPlus className="h-3 w-3" /> {r}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* -------------------- Ticket Tiers -------------------- */

function TicketTiersManager({ lang }: { lang: "bn" | "en" }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({ name: "", description: "", price: "" });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("ticket_tiers").select("*").order("sort_order");
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!draft.name.trim()) {
      toast.error(lang === "bn" ? "নাম আবশ্যক" : "Name required");
      return;
    }
    const { error } = await supabase.from("ticket_tiers").insert({
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      price: Number(draft.price) || 0,
      sort_order: rows.length,
    });
    if (error) toast.error(error.message);
    else { setDraft({ name: "", description: "", price: "" }); toast.success(lang === "bn" ? "যোগ হয়েছে" : "Added"); load(); }
  };

  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from("ticket_tiers").update(patch).eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("ticket_tiers").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(lang === "bn" ? "মুছে ফেলা হয়েছে" : "Deleted"); load(); }
  };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl bg-card border border-border shadow-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Ticket className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold">
            {lang === "bn" ? "নতুন টিকিটের ধরন" : "New Ticket Tier"}
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <input placeholder={lang === "bn" ? "নাম (যেমন General)" : "Name (e.g. General)"}
            className="px-3 py-2.5 rounded-lg border border-border bg-background"
            value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <input placeholder={lang === "bn" ? "মূল্য (৳)" : "Price (৳)"} type="number" inputMode="numeric"
            className="px-3 py-2.5 rounded-lg border border-border bg-background"
            value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
          <input placeholder={lang === "bn" ? "বিবরণ (ঐচ্ছিক)" : "Description (optional)"}
            className="px-3 py-2.5 rounded-lg border border-border bg-background"
            value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        </div>
        <button onClick={add}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold shadow-glow-red">
          <Plus className="h-4 w-4" /> {lang === "bn" ? "যোগ করুন" : "Add"}
        </button>
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-card p-5 sm:p-6">
        <h2 className="font-display text-xl font-bold mb-4">
          {lang === "bn" ? "সব ধরন" : "All Tiers"} <span className="text-xs text-muted-foreground">({rows.length})</span>
        </h2>
        {loading ? (
          <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            {lang === "bn" ? "কোনো টিকিটের ধরন নেই" : "No tiers added"}
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((t) => (
              <div key={t.id} className="rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{t.name}</p>
                    <span className="font-display font-bold text-primary">৳ {t.price}</span>
                    {!t.is_active && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-muted">{lang === "bn" ? "নিষ্ক্রিয়" : "off"}</span>}
                  </div>
                  {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label className="inline-flex items-center gap-1 text-xs cursor-pointer">
                    <input type="checkbox" checked={t.is_active}
                      onChange={(e) => update(t.id, { is_active: e.target.checked })} />
                    {lang === "bn" ? "সক্রিয়" : "Active"}
                  </label>
                  <button onClick={() => remove(t.id)}
                    className="p-2 rounded-md text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------- Helpers -------------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
    </label>
  );
}
