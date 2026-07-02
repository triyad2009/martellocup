import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Copy, Check, KeyRound, ShieldOff, ShieldCheck, ExternalLink } from "lucide-react";

type Cred = {
  id: string;
  label: string;
  username: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
};

function randomStr(len: number, chars: string) {
  let out = "";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}

export function PortalCredentialsManager({ lang }: { lang: "bn" | "en" }) {
  const T = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const [rows, setRows] = useState<Cred[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [role, setRole] = useState<"viewer" | "manager" | "treasurer">("manager");
  const [creating, setCreating] = useState(false);
  const [issued, setIssued] = useState<{ username: string; password: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("portal_credentials")
      .select("id,label,username,role,is_active,last_login_at,created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Cred[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!label.trim()) return toast.error(T("লেবেল দিন", "Enter a label"));
    setCreating(true);
    const username = "mp_" + randomStr(6, "abcdefghjkmnpqrstuvwxyz23456789");
    const password = randomStr(14, "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#");
    const { data, error } = await supabase.rpc("admin_create_portal_credential", {
      _label: label.trim(), _username: username, _password: password, _role: role,
    });
    setCreating(false);
    if (error) return toast.error(error.message);
    if (!(data as any)?.ok) return toast.error(T("তৈরি ব্যর্থ", "Failed"));
    setIssued({ username, password });
    setLabel("");
    load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.rpc("admin_set_portal_credential_active", { _id: id, _active: active });
    if (error) toast.error(error.message);
    else load();
  };

  const copy = async (val: string, field: string) => {
    await navigator.clipboard.writeText(val);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            {T("ফিনান্স পোর্টাল ক্রেডেনশিয়াল", "Finance Portal Credentials")}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {T("যাদের পোর্টালে ঢুকতে হবে তাদের জন্য ইউজারনেম + পাসওয়ার্ড তৈরি করুন।",
               "Issue username + password for anyone who needs finance portal access.")}
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/portal" target="_blank" rel="noreferrer"
             className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:border-primary">
            <ExternalLink className="h-4 w-4" /> {T("পোর্টাল খুলুন", "Open Portal")}
          </a>
          <button onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold">
            <Plus className="h-4 w-4" /> {T("নতুন", "New")}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <input value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder={T("লেবেল যেমন: কোষাধ্যক্ষ রাকিব", "Label e.g. Treasurer Rakib")}
              className="px-3 py-2 rounded-lg bg-background border border-border sm:col-span-2" />
            <select value={role} onChange={(e) => setRole(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-background border border-border">
              <option value="viewer">{T("দর্শক", "Viewer")}</option>
              <option value="manager">{T("ম্যানেজার", "Manager")}</option>
              <option value="treasurer">{T("কোষাধ্যক্ষ", "Treasurer")}</option>
            </select>
          </div>
          <button disabled={creating} onClick={create}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-60">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {T("তৈরি করুন", "Generate")}
          </button>
        </div>
      )}

      {issued && (
        <div className="rounded-xl border-2 border-primary bg-primary/10 p-4 space-y-3">
          <p className="text-sm font-bold text-primary">
            {T("⚠️ এই তথ্য আর দেখানো হবে না — এখনই কপি করে নিরাপদে দিন।",
               "⚠️ These credentials will not be shown again — copy now.")}
          </p>
          {(["username", "password"] as const).map((f) => (
            <div key={f} className="flex items-center gap-2 bg-background rounded-lg p-2">
              <span className="text-xs uppercase text-muted-foreground w-20">{f}</span>
              <code className="flex-1 font-mono text-sm break-all">{issued[f]}</code>
              <button onClick={() => copy(issued[f], f)}
                className="p-2 rounded-md hover:bg-muted">
                {copiedField === f ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          ))}
          <button onClick={() => setIssued(null)} className="text-xs text-muted-foreground hover:text-foreground underline">
            {T("বন্ধ করুন", "Dismiss")}
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">{T("লেবেল", "Label")}</th>
                <th className="px-3 py-2 text-left">Username</th>
                <th className="px-3 py-2 text-left">{T("ভূমিকা", "Role")}</th>
                <th className="px-3 py-2 text-left">{T("শেষ লগইন", "Last Login")}</th>
                <th className="px-3 py-2 text-left">{T("অবস্থা", "Status")}</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-3 py-2">{r.label}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.username}</td>
                  <td className="px-3 py-2 capitalize">{r.role}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {r.last_login_at ? new Date(r.last_login_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.is_active
                      ? <span className="inline-flex items-center gap-1 text-green-500 text-xs font-semibold"><ShieldCheck className="h-3.5 w-3.5" />Active</span>
                      : <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-semibold"><ShieldOff className="h-3.5 w-3.5" />Revoked</span>}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => toggleActive(r.id, !r.is_active)}
                      className="text-xs px-3 py-1 rounded-md border border-border hover:border-primary">
                      {r.is_active ? T("রিভোক", "Revoke") : T("রি-অ্যাক্টিভেট", "Reactivate")}
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground text-sm">
                  {T("কোনো ক্রেডেনশিয়াল নেই।", "No credentials yet.")}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
