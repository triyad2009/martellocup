import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2, LogIn, LogOut, Lock, TrendingUp, TrendingDown, Wallet, Plus,
  FileDown, ReceiptText, ListChecks, LayoutDashboard, X, Upload, Check, XCircle,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CameraShutter } from "@/components/portal/CameraShutter";
import { useSiteLogo, useTournamentSettings } from "@/lib/settings";

export const Route = createFileRoute("/portal")({
  ssr: false,
  component: PortalPage,
});

const TOKEN_KEY = "martello_portal_token_v1";
const CRED_KEY = "martello_portal_cred_v1";

type Credential = { id: string; label: string; username: string; role: "viewer" | "manager" | "treasurer" };
type Income = {
  id: string; amount: number; source_name: string; source_type: string;
  collected_by: string | null; method: string; note: string | null;
  receipt_url: string | null; entry_date: string; created_at: string;
  source_submission_id: string | null;
};
type Slip = { id: string; file_url: string; file_type: string | null };
type Expense = {
  id: string; title: string; category: string; amount: number; vendor: string | null;
  description: string | null; entry_date: string; status: "pending" | "approved" | "rejected";
  decided_at: string | null; decision_note: string | null; created_at: string;
  slips: Slip[];
};

function PortalPage() {
  const [token, setToken] = useState<string | null>(null);
  const [cred, setCred] = useState<Credential | null>(null);
  const [checking, setChecking] = useState(true);
  const [shutterShow, setShutterShow] = useState(false);
  const [shutterDone, setShutterDone] = useState(true);

  // Restore + validate token
  useEffect(() => {
    (async () => {
      try {
        const t = localStorage.getItem(TOKEN_KEY);
        const c = localStorage.getItem(CRED_KEY);
        if (t && c) {
          const { data } = await supabase.rpc("portal_validate_token", { _token: t });
          if ((data as any)?.ok) {
            setToken(t);
            setCred(JSON.parse(c));
          } else {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(CRED_KEY);
          }
        }
      } catch {}
      setChecking(false);
    })();
  }, []);

  const onLoggedIn = (t: string, c: Credential) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(CRED_KEY, JSON.stringify(c));
    setToken(t);
    setCred(c);
    setShutterDone(false);
    setShutterShow(true);
    setTimeout(() => setShutterShow(false), 1400);
    setTimeout(() => setShutterDone(true), 1900);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CRED_KEY);
    setToken(null);
    setCred(null);
  };

  if (checking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <CameraShutter show={shutterShow} onDone={() => setShutterDone(true)} />
      {!token || !cred ? (
        <LoginScreen onLoggedIn={onLoggedIn} />
      ) : (
        shutterDone && <Dashboard token={token} cred={cred} onLogout={logout} />
      )}
    </>
  );
}

/* ------------------- Login Screen ------------------- */

function LoginScreen({ onLoggedIn }: { onLoggedIn: (t: string, c: Credential) => void }) {
  const LOGO = useSiteLogo();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("portal_login", {
      _username: username.trim(), _password: password, _user_agent: navigator.userAgent,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    const res = data as any;
    if (!res?.ok) return toast.error("Invalid username or password");
    onLoggedIn(res.token, res.credential);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-black via-zinc-900 to-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-card/90 backdrop-blur-xl border-2 border-primary/30 shadow-2xl overflow-hidden"
      >
        <div className="relative h-32 bg-gradient-to-br from-primary/30 via-amber-500/20 to-red-600/30 flex items-center justify-center">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)",
          }} />
          <div className="relative flex flex-col items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/40 blur-xl" />
              <img src={LOGO} alt="Martello" className="relative h-16 w-16 rounded-full ring-4 ring-primary/50 object-cover" />
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-[0.3em] mb-2">
              <Lock className="h-3 w-3" /> RESTRICTED
            </div>
            <h1 className="font-display text-2xl font-bold">Finance Portal</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Admin-issued credentials only. Unauthorized entry is logged.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <input
              value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Username" autoComplete="username"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none font-mono"
            />
            <input
              value={password} onChange={(e) => setPassword(e.target.value)}
              type="password" placeholder="Password" autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none font-mono"
            />
            <button
              type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow-red hover:bg-primary-glow disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Unlock Portal
            </button>
          </form>

          <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
            Session expires in 24 hours
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------- Dashboard ------------------- */

type TabId = "overview" | "income" | "expenses" | "transactions" | "export";

function Dashboard({ token, cred, onLogout }: { token: string; cred: Credential; onLogout: () => void }) {
  const [tab, setTab] = useState<TabId>("overview");
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useTournamentSettings();
  const LOGO = useSiteLogo();

  const refresh = async () => {
    setLoading(true);
    const [inc, exp] = await Promise.all([
      supabase.rpc("portal_list_income", { _token: token }),
      supabase.rpc("portal_list_expenses", { _token: token }),
    ]);
    if (inc.error) toast.error(inc.error.message);
    if (exp.error) toast.error(exp.error.message);
    setIncome((inc.data ?? []) as unknown as Income[]);
    setExpenses((exp.data ?? []) as unknown as Expense[]);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [token]);

  const totalIncome = useMemo(() => income.reduce((s, i) => s + Number(i.amount || 0), 0), [income]);
  const totalApprovedExpense = useMemo(
    () => expenses.filter((e) => e.status === "approved").reduce((s, e) => s + Number(e.amount || 0), 0),
    [expenses],
  );
  const totalPending = useMemo(
    () => expenses.filter((e) => e.status === "pending").reduce((s, e) => s + Number(e.amount || 0), 0),
    [expenses],
  );
  const balance = totalIncome - totalApprovedExpense;

  const tabs: { id: TabId; label: string; icon: typeof Wallet }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "income", label: "Income", icon: TrendingUp },
    { id: "expenses", label: "Expenses", icon: ReceiptText },
    { id: "transactions", label: "Transactions", icon: ListChecks },
    { id: "export", label: "Export PDF", icon: FileDown },
  ];

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-background via-background to-zinc-950/40">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src={LOGO} alt="" className="h-10 w-10 rounded-lg ring-2 ring-primary/40 object-cover" />
            <div className="min-w-0">
              <div className="font-display font-bold text-lg leading-none">Finance Portal</div>
              <div className="text-xs text-muted-foreground mt-1 truncate">
                {settings?.season_name || "Martello Cup"} · Signed in as <span className="text-primary font-semibold">{cred.label}</span> ({cred.role})
              </div>
            </div>
          </div>
          <button onClick={onLogout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 text-sm font-semibold">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tb) => {
            const active = tab === tb.id;
            return (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${
                  active ? "bg-primary text-primary-foreground border-primary shadow-glow-red" : "bg-card border-border hover:border-primary"
                }`}>
                <tb.icon className="h-4 w-4" /> {tb.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-16 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {tab === "overview" && (
                <OverviewTab totalIncome={totalIncome} totalExpense={totalApprovedExpense} pending={totalPending} balance={balance} income={income} expenses={expenses} />
              )}
              {tab === "income" && <IncomeTab token={token} income={income} onChange={refresh} />}
              {tab === "expenses" && <ExpensesTab token={token} cred={cred} expenses={expenses} onChange={refresh} />}
              {tab === "transactions" && <TransactionsTab income={income} expenses={expenses} />}
              {tab === "export" && <ExportTab income={income} expenses={expenses} settings={settings} logoUrl={LOGO} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

/* ------------------- Overview ------------------- */

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: any; tone: "income" | "expense" | "balance" | "pending" }) {
  const toneMap = {
    income: "from-green-500/20 to-emerald-500/10 text-green-400 border-green-500/30",
    expense: "from-red-500/20 to-orange-500/10 text-red-400 border-red-500/30",
    balance: "from-primary/20 to-amber-500/10 text-primary border-primary/40",
    pending: "from-yellow-500/20 to-amber-500/10 text-yellow-400 border-yellow-500/30",
  }[tone];
  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${toneMap} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase font-bold tracking-wider opacity-80">{label}</span>
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-display text-3xl font-black tabular-nums">৳ {value}</div>
    </div>
  );
}

function OverviewTab({ totalIncome, totalExpense, pending, balance, income, expenses }: {
  totalIncome: number; totalExpense: number; pending: number; balance: number; income: Income[]; expenses: Expense[];
}) {
  const fmt = (n: number) => n.toLocaleString("en-BD");
  const byMonth = useMemo(() => {
    const map = new Map<string, { inc: number; exp: number }>();
    income.forEach((r) => {
      const k = r.entry_date.slice(0, 7);
      const cur = map.get(k) ?? { inc: 0, exp: 0 };
      cur.inc += Number(r.amount);
      map.set(k, cur);
    });
    expenses.filter((e) => e.status === "approved").forEach((r) => {
      const k = r.entry_date.slice(0, 7);
      const cur = map.get(k) ?? { inc: 0, exp: 0 };
      cur.exp += Number(r.amount);
      map.set(k, cur);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [income, expenses]);

  const maxVal = Math.max(1, ...byMonth.flatMap(([, v]) => [v.inc, v.exp]));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Income" value={fmt(totalIncome)} icon={TrendingUp} tone="income" />
        <StatCard label="Total Expense" value={fmt(totalExpense)} icon={TrendingDown} tone="expense" />
        <StatCard label="Net Balance" value={fmt(balance)} icon={Wallet} tone="balance" />
        <StatCard label="Pending Requests" value={fmt(pending)} icon={ReceiptText} tone="pending" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display font-bold mb-4">Monthly Breakdown</h3>
        {byMonth.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <div className="space-y-3">
            {byMonth.map(([month, v]) => (
              <div key={month}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>{month}</span>
                  <span className="text-muted-foreground">Net ৳ {fmt(v.inc - v.exp)}</span>
                </div>
                <div className="flex gap-1 h-6 rounded overflow-hidden bg-muted">
                  <div className="bg-green-500" style={{ width: `${(v.inc / maxVal) * 100}%` }} title={`Income ৳${fmt(v.inc)}`} />
                  <div className="bg-red-500" style={{ width: `${(v.exp / maxVal) * 100}%` }} title={`Expense ৳${fmt(v.exp)}`} />
                </div>
                <div className="flex gap-4 text-[10px] mt-1 text-muted-foreground">
                  <span>↑ ৳ {fmt(v.inc)}</span>
                  <span>↓ ৳ {fmt(v.exp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------- Income Tab ------------------- */

function IncomeTab({ token, income, onChange }: { token: string; income: Income[]; onChange: () => void }) {
  const [show, setShow] = useState(false);
  const [f, setF] = useState({
    amount: "", source_name: "", collected_by: "", method: "cash",
    note: "", receipt_url: "", entry_date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!f.amount || !f.source_name) return toast.error("Amount & source required");
    setSaving(true);
    const { data, error } = await supabase.rpc("portal_add_income", {
      _token: token, _amount: Number(f.amount), _source_name: f.source_name,
      _collected_by: f.collected_by || null, _method: f.method, _note: f.note || null,
      _receipt_url: f.receipt_url || null, _entry_date: f.entry_date,
    } as any);
    setSaving(false);
    if (error || !(data as any)?.ok) return toast.error(error?.message || "Failed");
    toast.success("Income added");
    setShow(false);
    setF({ amount: "", source_name: "", collected_by: "", method: "cash", note: "", receipt_url: "", entry_date: new Date().toISOString().slice(0, 10) });
    onChange();
  };

  const fmt = (n: number) => Number(n).toLocaleString("en-BD");

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-xl font-bold">Income Ledger</h3>
        <button onClick={() => setShow(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold">
          <Plus className="h-4 w-4" /> Add Income
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Source</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Collected By</th>
              <th className="px-3 py-2 text-left">Method</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-left">Note</th>
            </tr>
          </thead>
          <tbody>
            {income.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-3 py-2 text-xs whitespace-nowrap">{r.entry_date}</td>
                <td className="px-3 py-2">{r.source_name}</td>
                <td className="px-3 py-2">
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    r.source_type === "manual" ? "bg-blue-500/20 text-blue-400" : "bg-primary/20 text-primary"
                  }`}>{r.source_type}</span>
                </td>
                <td className="px-3 py-2 text-xs">{r.collected_by ?? "—"}</td>
                <td className="px-3 py-2 text-xs">{r.method}</td>
                <td className="px-3 py-2 text-right font-bold text-green-400">৳ {fmt(r.amount)}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground truncate max-w-[220px]">
                  {r.receipt_url && <a href={r.receipt_url} target="_blank" rel="noreferrer" className="text-primary underline mr-2">Receipt</a>}
                  {r.note}
                </td>
              </tr>
            ))}
            {income.length === 0 && (
              <tr><td colSpan={7} className="text-center py-6 text-muted-foreground">No income yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {show && (
        <Modal onClose={() => setShow(false)} title="Add Income Entry">
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Amount (৳)"><input type="number" step="0.01" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} className={inputCls} /></Field>
              <Field label="Entry Date"><input type="date" value={f.entry_date} onChange={(e) => setF({ ...f, entry_date: e.target.value })} className={inputCls} /></Field>
              <Field label="Source Name (donor / sponsor)"><input value={f.source_name} onChange={(e) => setF({ ...f, source_name: e.target.value })} className={inputCls} /></Field>
              <Field label="Collected By"><input value={f.collected_by} onChange={(e) => setF({ ...f, collected_by: e.target.value })} className={inputCls} /></Field>
              <Field label="Method">
                <select value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })} className={inputCls}>
                  {["cash", "bkash", "nagad", "rocket", "bank", "online", "other"].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Receipt Image (optional)">
                <FileUploadInput onUploaded={(url) => setF({ ...f, receipt_url: url })} value={f.receipt_url} />
              </Field>
            </div>
            <Field label="Note"><textarea value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} rows={2} className={inputCls} /></Field>
            <button onClick={submit} disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save Income
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ------------------- Expenses Tab ------------------- */

function ExpensesTab({ token, cred, expenses, onChange }: { token: string; cred: Credential; expenses: Expense[]; onChange: () => void }) {
  const [show, setShow] = useState(false);
  const [detail, setDetail] = useState<Expense | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [f, setF] = useState({
    title: "", category: "misc", amount: "", vendor: "", description: "",
    entry_date: new Date().toISOString().slice(0, 10), slips: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  const canDecide = cred.role === "treasurer" || cred.role === "manager";
  const filtered = filter === "all" ? expenses : expenses.filter((e) => e.status === filter);
  const fmt = (n: number) => Number(n).toLocaleString("en-BD");

  const submit = async () => {
    if (!f.title || !f.amount) return toast.error("Title & amount required");
    setSaving(true);
    const { data, error } = await supabase.rpc("portal_submit_expense", {
      _token: token, _title: f.title, _category: f.category, _amount: Number(f.amount),
      _vendor: f.vendor || null, _description: f.description || null,
      _entry_date: f.entry_date, _slip_urls: f.slips,
    } as any);
    setSaving(false);
    if (error || !(data as any)?.ok) return toast.error(error?.message || "Failed");
    toast.success("Expense submitted");
    setShow(false);
    setF({ title: "", category: "misc", amount: "", vendor: "", description: "", entry_date: new Date().toISOString().slice(0, 10), slips: [] });
    onChange();
  };

  const decide = async (id: string, decision: "approved" | "rejected") => {
    const note = decision === "rejected" ? window.prompt("Reason?") ?? "" : "";
    const { error } = await supabase.rpc("portal_decide_expense", {
      _token: token, _expense_id: id, _decision: decision, _note: note,
    });
    if (error) return toast.error(error.message);
    toast.success(`Expense ${decision}`);
    onChange();
    setDetail(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize ${
                filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
              }`}>{s}</button>
          ))}
        </div>
        <button onClick={() => setShow(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold">
          <Plus className="h-4 w-4" /> New Expense Request
        </button>
      </div>

      <div className="grid gap-3">
        {filtered.map((e) => (
          <div key={e.id} onClick={() => setDetail(e)}
            className="cursor-pointer rounded-xl border border-border bg-card p-4 hover:border-primary transition-colors">
            <div className="flex justify-between items-start gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold">{e.title}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    e.status === "approved" ? "bg-green-500/20 text-green-400" :
                    e.status === "rejected" ? "bg-red-500/20 text-red-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>{e.status}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted">{e.category}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{e.vendor && `${e.vendor} · `}{e.description}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{e.entry_date} · {e.slips.length} slip(s)</p>
              </div>
              <div className="text-right">
                <div className="font-display text-xl font-black text-red-400">৳ {fmt(e.amount)}</div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">No expenses in this view.</div>
        )}
      </div>

      {show && (
        <Modal onClose={() => setShow(false)} title="Submit Expense Request">
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Title"><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} placeholder="e.g. Buy 20 footballs" /></Field>
              <Field label="Amount (৳)"><input type="number" step="0.01" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} className={inputCls} /></Field>
              <Field label="Category">
                <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={inputCls}>
                  {["equipment", "food", "transport", "prize", "venue", "printing", "misc"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Entry Date"><input type="date" value={f.entry_date} onChange={(e) => setF({ ...f, entry_date: e.target.value })} className={inputCls} /></Field>
              <Field label="Vendor / Shop Name"><input value={f.vendor} onChange={(e) => setF({ ...f, vendor: e.target.value })} className={inputCls} /></Field>
            </div>
            <Field label="Description / Justification">
              <textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={3} className={inputCls} />
            </Field>
            <Field label="Shop Slips (upload photos/PDF, one at a time)">
              <MultiFileUpload urls={f.slips} onChange={(urls) => setF({ ...f, slips: urls })} />
            </Field>
            <button onClick={submit} disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ReceiptText className="h-4 w-4" />} Submit for Approval
            </button>
          </div>
        </Modal>
      )}

      {detail && (
        <Modal onClose={() => setDetail(null)} title={detail.title}>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground text-xs">Amount</span><div className="font-bold">৳ {fmt(detail.amount)}</div></div>
              <div><span className="text-muted-foreground text-xs">Status</span><div className="font-bold capitalize">{detail.status}</div></div>
              <div><span className="text-muted-foreground text-xs">Category</span><div>{detail.category}</div></div>
              <div><span className="text-muted-foreground text-xs">Date</span><div>{detail.entry_date}</div></div>
              <div className="col-span-2"><span className="text-muted-foreground text-xs">Vendor</span><div>{detail.vendor || "—"}</div></div>
              <div className="col-span-2"><span className="text-muted-foreground text-xs">Description</span><div className="whitespace-pre-wrap">{detail.description || "—"}</div></div>
              {detail.decision_note && <div className="col-span-2"><span className="text-muted-foreground text-xs">Decision Note</span><div>{detail.decision_note}</div></div>}
            </div>
            {detail.slips.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">Shop Slips</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {detail.slips.map((s) => (
                    <a key={s.id} href={s.file_url} target="_blank" rel="noreferrer"
                      className="block aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                      <img src={s.file_url} alt="slip" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {canDecide && detail.status === "pending" && (
              <div className="flex gap-2 pt-3">
                <button onClick={() => decide(detail.id, "approved")}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white font-bold">
                  <Check className="h-4 w-4" /> Approve
                </button>
                <button onClick={() => decide(detail.id, "rejected")}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white font-bold">
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ------------------- Transactions Tab ------------------- */

function TransactionsTab({ income, expenses }: { income: Income[]; expenses: Expense[] }) {
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const inc = income.map((r) => ({ date: r.entry_date, kind: "IN" as const, label: r.source_name, category: r.source_type, amount: Number(r.amount), status: "recorded" }));
    const exp = expenses.map((r) => ({ date: r.entry_date, kind: "OUT" as const, label: r.title + (r.vendor ? ` · ${r.vendor}` : ""), category: r.category, amount: Number(r.amount), status: r.status }));
    return [...inc, ...exp].sort((a, b) => b.date.localeCompare(a.date))
      .filter((r) => !q || r.label.toLowerCase().includes(q.toLowerCase()) || r.category.toLowerCase().includes(q.toLowerCase()));
  }, [income, expenses, q]);
  const fmt = (n: number) => n.toLocaleString("en-BD");

  return (
    <div className="space-y-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
        className="w-full sm:w-64 px-3 py-2 rounded-lg bg-background border border-border" />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-2 text-xs whitespace-nowrap">{r.date}</td>
                <td className="px-3 py-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${r.kind === "IN" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{r.kind}</span>
                </td>
                <td className="px-3 py-2 truncate max-w-[280px]">{r.label}</td>
                <td className="px-3 py-2 text-xs">{r.category}</td>
                <td className="px-3 py-2 text-xs capitalize">{r.status}</td>
                <td className={`px-3 py-2 text-right font-bold ${r.kind === "IN" ? "text-green-400" : "text-red-400"}`}>
                  {r.kind === "IN" ? "+" : "−"} ৳ {fmt(r.amount)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">No matches.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------- Export PDF Tab ------------------- */

function ExportTab({ income, expenses, settings, logoUrl }: {
  income: Income[]; expenses: Expense[]; settings: any; logoUrl: string;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    try {
      const fromD = from ? new Date(from) : null;
      const toD = to ? new Date(to) : null;
      const inRange = (d: string) => {
        const t = new Date(d).getTime();
        if (fromD && t < fromD.getTime()) return false;
        if (toD && t > toD.getTime() + 86400000) return false;
        return true;
      };
      const inc = income.filter((r) => inRange(r.entry_date));
      const exp = expenses.filter((r) => inRange(r.entry_date));
      const totalIn = inc.reduce((s, r) => s + Number(r.amount), 0);
      const totalOut = exp.filter((e) => e.status === "approved").reduce((s, r) => s + Number(r.amount), 0);

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();

      // Load logo as data URL
      try {
        const resp = await fetch(logoUrl);
        const blob = await resp.blob();
        const dataUrl: string = await new Promise((res) => {
          const fr = new FileReader();
          fr.onload = () => res(fr.result as string);
          fr.readAsDataURL(blob);
        });
        doc.addImage(dataUrl, "JPEG", 40, 30, 55, 55);
      } catch {}

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Martello Cup", 110, 55);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(settings?.season_name || "Finance Report", 110, 72);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 110, 86);
      if (from || to) doc.text(`Range: ${from || "start"} → ${to || "today"}`, 110, 98);

      // Summary boxes
      let y = 120;
      doc.setDrawColor(220);
      doc.setFillColor(230, 245, 233); doc.rect(40, y, 160, 50, "F");
      doc.setTextColor(20, 100, 40); doc.setFontSize(9); doc.text("TOTAL INCOME", 50, y + 18);
      doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.text(`BDT ${totalIn.toLocaleString()}`, 50, y + 38);

      doc.setFillColor(253, 226, 226); doc.rect(210, y, 160, 50, "F");
      doc.setTextColor(150, 30, 30); doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.text("TOTAL EXPENSE", 220, y + 18);
      doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.text(`BDT ${totalOut.toLocaleString()}`, 220, y + 38);

      doc.setFillColor(255, 244, 220); doc.rect(380, y, pageW - 420, 50, "F");
      doc.setTextColor(150, 100, 20); doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.text("NET BALANCE", 390, y + 18);
      doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.text(`BDT ${(totalIn - totalOut).toLocaleString()}`, 390, y + 38);

      doc.setTextColor(0);
      y += 70;

      // Income table
      autoTable(doc, {
        startY: y,
        head: [["Date", "Source", "Type", "Method", "Collected By", "Amount (BDT)"]],
        body: inc.map((r) => [r.entry_date, r.source_name, r.source_type, r.method, r.collected_by || "-", Number(r.amount).toLocaleString()]),
        headStyles: { fillColor: [30, 100, 45] },
        styles: { fontSize: 8 },
        margin: { left: 40, right: 40 },
        didDrawPage: () => {
          doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 100, 45);
          doc.text("Income Ledger", 40, (doc as any).lastAutoTable?.startY ? y - 8 : y - 8);
        },
      });

      // Expenses table
      const afterInc = (doc as any).lastAutoTable.finalY + 20;
      autoTable(doc, {
        startY: afterInc + 12,
        head: [["Date", "Title", "Vendor", "Category", "Status", "Amount (BDT)"]],
        body: exp.map((r) => [r.entry_date, r.title, r.vendor || "-", r.category, r.status, Number(r.amount).toLocaleString()]),
        headStyles: { fillColor: [150, 40, 40] },
        styles: { fontSize: 8 },
        margin: { left: 40, right: 40 },
        didDrawPage: () => {
          doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(150, 40, 40);
          doc.text("Expenses", 40, afterInc);
        },
      });

      // Footer on every page
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8); doc.setTextColor(150);
        doc.text(`Martello Cup Finance Report · Page ${i} / ${pageCount}`, pageW / 2, doc.internal.pageSize.getHeight() - 20, { align: "center" });
      }

      doc.save(`martello-finance-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF downloaded");
    } catch (e: any) {
      toast.error(e.message || "PDF failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <h3 className="font-display text-xl font-bold flex items-center gap-2">
            <FileDown className="h-5 w-5 text-primary" /> Branded PDF Report
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Includes Martello logo, summary totals, full income ledger and expense breakdown.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="From (optional)"><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} /></Field>
          <Field label="To (optional)"><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} /></Field>
        </div>
        <button onClick={generate} disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-60 shadow-glow-red">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          Generate & Download PDF
        </button>
      </div>
    </div>
  );
}

/* ------------------- Helpers ------------------- */

const inputCls = "w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-muted-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card">
          <h3 className="font-display text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4">{children}</div>
      </motion.div>
    </div>
  );
}

function FileUploadInput({ onUploaded, value }: { onUploaded: (url: string) => void; value: string }) {
  const [busy, setBusy] = useState(false);
  const upload = async (f: File) => {
    setBusy(true);
    const path = `portal/${Date.now()}-${f.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage.from("media").upload(path, f, { upsert: true });
    if (error) { toast.error(error.message); setBusy(false); return; }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    onUploaded(data.publicUrl);
    setBusy(false);
  };
  return (
    <div className="flex items-center gap-2">
      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background cursor-pointer text-sm hover:border-primary">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        <span>{value ? "Replace" : "Upload"}</span>
        <input type="file" className="hidden" accept="image/*,application/pdf"
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </label>
      {value && <a href={value} target="_blank" rel="noreferrer" className="text-xs text-primary underline truncate max-w-[160px]">View</a>}
    </div>
  );
}

function MultiFileUpload({ urls, onChange }: { urls: string[]; onChange: (u: string[]) => void }) {
  const [busy, setBusy] = useState(false);
  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    const next = [...urls];
    for (const f of Array.from(files)) {
      const path = `portal/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${f.name.replace(/\s+/g, "_")}`;
      const { error } = await supabase.storage.from("media").upload(path, f, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from("media").getPublicUrl(path);
        next.push(data.publicUrl);
      } else {
        toast.error(error.message);
      }
    }
    onChange(next);
    setBusy(false);
  };
  return (
    <div className="space-y-2">
      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background cursor-pointer text-sm hover:border-primary">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        <span>Add slips (image/PDF)</span>
        <input type="file" className="hidden" multiple accept="image/*,application/pdf"
          onChange={(e) => upload(e.target.files)} />
      </label>
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {urls.map((u, i) => (
            <div key={i} className="relative">
              <a href={u} target="_blank" rel="noreferrer" className="block h-16 w-16 rounded-md overflow-hidden border border-border bg-muted">
                <img src={u} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
              </a>
              <button type="button" onClick={() => onChange(urls.filter((_, idx) => idx !== i))}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
