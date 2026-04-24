import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Users as UsersIcon, ClipboardList, Calendar, Trophy,
  Image as ImageIcon, Newspaper, Award, Loader2, Search, UserPlus, UserMinus,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useUserRoles, type AppRole } from "@/lib/roles";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isSuperAdmin, loading: roleLoading } = useUserRoles();
  const { lang } = useI18n();

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide mb-3">
          <Shield className="h-3.5 w-3.5" />
          {isSuperAdmin ? (lang === "bn" ? "সুপার এডমিন" : "SUPER ADMIN") : (lang === "bn" ? "এডমিন" : "ADMIN")}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          {lang === "bn" ? "এডমিন প্যানেল" : "Admin Panel"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {lang === "bn" ? "টুর্নামেন্টের সকল কন্টেন্ট এখান থেকে নিয়ন্ত্রণ করুন" : "Manage all tournament content from here."}
        </p>
      </motion.div>

      {/* Quick action cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
        {[
          { icon: ClipboardList, label: lang === "bn" ? "নিবন্ধন" : "Registrations", to: "/admin" },
          { icon: Calendar, label: lang === "bn" ? "ফিক্সচার" : "Fixtures", to: "/admin" },
          { icon: Trophy, label: lang === "bn" ? "ম্যাচ ফলাফল" : "Match Results", to: "/admin" },
          { icon: UsersIcon, label: lang === "bn" ? "দল ও খেলোয়াড়" : "Teams & Players", to: "/admin" },
          { icon: Newspaper, label: lang === "bn" ? "সংবাদ" : "News", to: "/admin" },
          { icon: ImageIcon, label: lang === "bn" ? "গ্যালারি" : "Gallery", to: "/admin" },
          { icon: Award, label: lang === "bn" ? "স্পনসর" : "Sponsors", to: "/admin" },
          { icon: Shield, label: lang === "bn" ? "ভূমিকা" : "User Roles", to: "/admin" },
        ].map((c, i) => (
          <motion.div
            key={c.label + i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl bg-card border border-border shadow-card p-4 hover:border-primary hover:shadow-glow-red transition-all cursor-pointer"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-primary text-white flex items-center justify-center mb-2 shadow-glow-red">
              <c.icon className="h-5 w-5" />
            </div>
            <p className="font-semibold text-sm">{c.label}</p>
          </motion.div>
        ))}
      </div>

      <RegistrationsManager lang={lang} />

      {isSuperAdmin && (
        <div className="mt-10">
          <RolesManager lang={lang} currentUserId={user.id} />
        </div>
      )}
    </div>
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
            <div key={r.id} className="rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold truncate">{r.team_name}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {r.coach_name} · {r.coach_phone} · {Array.isArray(r.players_data) ? r.players_data.length : 0} {lang === "bn" ? "খেলোয়াড়" : "players"}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
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
          ))}
        </div>
      )}
    </section>
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
