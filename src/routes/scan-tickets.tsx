import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  ScanLine, Loader2, Shield, ArrowLeft, Camera, CheckCircle2, XCircle, AlertTriangle,
  Zap, ZapOff, History, Ticket, Shirt, Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useUserRoles } from "@/lib/roles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/scan-tickets")({
  component: ScanTicketsPage,
  head: () => ({
    meta: [{ title: "Scan · Martello Cup" }, { name: "robots", content: "noindex" }],
  }),
});

type Kind = "ticket" | "jersey" | "registration";

type Result = {
  kind: Kind;
  outcome: "success" | "already" | "info" | "invalid" | "error";
  message: string;
  name?: string;
  detail?: string;
  code?: string;
  ts: number;
};

const STORAGE_KEY = "mc.scan.history.v1";

function loadHistory(): Result[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveHistory(h: Result[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(h.slice(0, 50))); } catch {}
}

function beep(freq: number, dur = 0.15, gain = 0.18) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.value = freq; o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(gain, ctx.currentTime);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch {}
}

function ScanTicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, has, loading: roleLoading } = useUserRoles();
  const navigate = useNavigate();
  const canScan = isAdmin || has("match_manager") || has("media_manager") || has("content_manager");

  const [scanning, setScanning] = useState(false);
  const [torch, setTorch] = useState(false);
  const [lastResult, setLastResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastCodeRef = useRef<string | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => { setHistory(loadHistory()); }, []);

  useEffect(() => {
    return () => {
      const s = scannerRef.current;
      if (s) s.stop().catch(() => {}).then(() => s.clear());
    };
  }, []);

  const push = (r: Result) => {
    setLastResult(r);
    setHistory((h) => { const next = [r, ...h].slice(0, 50); saveHistory(next); return next; });
  };

  const handleDecoded = async (text: string) => {
    const now = Date.now();
    if (lastCodeRef.current === text && now - lastTimeRef.current < 2500) return;
    lastCodeRef.current = text; lastTimeRef.current = now;

    // Extract code: URL → last meaningful segment / ?code= / verify-ticket/...
    let code = text.trim();
    try {
      const u = new URL(text);
      const c = u.searchParams.get("code");
      if (c) code = c;
      else {
        const parts = u.pathname.split("/").filter(Boolean);
        const v = parts.indexOf("verify-ticket");
        if (v >= 0 && parts[v + 1]) code = decodeURIComponent(parts[v + 1]);
        else code = decodeURIComponent(parts[parts.length - 1] || code);
      }
    } catch {/* not a URL */}

    code = code.toUpperCase();

    // Unified lookup
    const { data, error } = await (supabase as any).rpc("scan_any_code", { _code: code });
    if (error) { push({ kind: "ticket", outcome: "error", message: error.message, code, ts: Date.now() }); beep(220, 0.35); return; }
    const r = data as any;

    if (!r?.found) {
      push({ kind: r?.kind || "ticket", outcome: "invalid", message: "❌ Code not found", code, ts: Date.now() });
      beep(220, 0.35);
      return;
    }

    if (r.kind === "ticket") {
      // Try redeem
      const { data: rd, error: re } = await (supabase as any).rpc("redeem_ticket", { _code: code });
      if (re) { push({ kind: "ticket", outcome: "error", message: re.message, code, ts: Date.now() }); return; }
      const x = rd as any;
      if (x?.ok) {
        push({ kind: "ticket", outcome: "success", message: "✅ Ticket accepted", name: x.payer_name, detail: x.tier, code, ts: Date.now() });
        beep(880, 0.15);
      } else if (x?.reason === "already_used") {
        push({ kind: "ticket", outcome: "already", message: `⚠ Already used · ${new Date(x.used_at).toLocaleString()}`, name: x.payer_name, detail: x.tier, code, ts: Date.now() });
        beep(440, 0.3);
      } else if (x?.reason === "not_approved") {
        push({ kind: "ticket", outcome: "invalid", message: `❌ Ticket is ${x.status}`, code, ts: Date.now() });
        beep(220, 0.35);
      } else {
        push({ kind: "ticket", outcome: "error", message: x?.reason || "Unknown error", code, ts: Date.now() });
      }
    } else if (r.kind === "jersey") {
      push({
        kind: "jersey", outcome: "info",
        message: `📦 Jersey Order — ${String(r.status).toUpperCase()}`,
        name: r.customer_name, detail: `${r.product_name} · ${r.size} ×${r.quantity} · ৳${r.total_amount}`,
        code, ts: Date.now(),
      });
      beep(660, 0.15);
    } else if (r.kind === "registration") {
      push({
        kind: "registration", outcome: "info",
        message: `🛡 Team Registration — ${String(r.status).toUpperCase()}`,
        name: r.team_name, detail: `${r.captain_name}${r.category ? ` · ${r.category}` : ""}`,
        code, ts: Date.now(),
      });
      beep(660, 0.15);
    }
  };

  const startScan = async () => {
    if (scanning) return;
    try {
      const s = new Html5Qrcode("qr-reader", {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      });
      scannerRef.current = s;
      await s.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
        (decoded) => { handleDecoded(decoded); },
        () => {/* ignore frame errors */},
      );
      setScanning(true);
    } catch (e: any) {
      toast.error(e.message || "Camera access failed. Allow camera permission and use HTTPS.");
    }
  };

  const stopScan = async () => {
    const s = scannerRef.current;
    if (!s) { setScanning(false); return; }
    try { await s.stop(); await s.clear(); } catch {}
    scannerRef.current = null;
    setScanning(false);
    setTorch(false);
  };

  const toggleTorch = async () => {
    const s = scannerRef.current as any;
    if (!s) return;
    try {
      await s.applyVideoConstraints({ advanced: [{ torch: !torch }] });
      setTorch((v) => !v);
    } catch {
      toast.error("Torch not supported on this device");
    }
  };

  const clearHistory = () => { setHistory([]); saveHistory([]); };

  if (authLoading || roleLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Shield className="h-12 w-12 mx-auto text-primary mb-3" />
        <h1 className="font-display text-xl font-bold mb-2">Sign in required</h1>
        <button onClick={() => navigate({ to: "/auth" })} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold">Sign In</button>
      </div>
    );
  }

  if (!canScan) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Shield className="h-12 w-12 mx-auto text-destructive mb-3" />
        <h1 className="font-display text-xl font-bold mb-2">Access Denied</h1>
        <p className="text-sm text-muted-foreground">Only admins and moderators can scan.</p>
      </div>
    );
  }

  const kindIcon = (k: Kind) => k === "ticket" ? Ticket : k === "jersey" ? Shirt : Users;

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-5">
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Admin
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
          <ScanLine className="h-3.5 w-3.5" /> UNIVERSAL SCANNER
        </div>
      </div>

      <h1 className="font-display text-2xl font-bold mb-1">Scan Anything</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Tickets · Jersey orders · Team registrations — auto-detect by code.
      </p>

      <div className="rounded-2xl bg-black overflow-hidden border-2 border-border aspect-square relative">
        <div id="qr-reader" className="w-full h-full" />
        {!scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white bg-black/60">
            <Camera className="h-10 w-10 opacity-80" />
            <button
              onClick={startScan}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow-red"
            >
              Start Camera
            </button>
            <p className="text-[11px] opacity-70 text-center px-6">Requires HTTPS + camera permission</p>
          </div>
        )}
        {scanning && (
          <button
            onClick={toggleTorch}
            className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-primary"
            title="Toggle flashlight"
          >
            {torch ? <ZapOff className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
          </button>
        )}
      </div>

      {scanning && (
        <button
          onClick={stopScan}
          className="w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:border-primary font-semibold text-sm"
        >
          Stop Camera
        </button>
      )}

      {lastResult && (
        <div className={`mt-5 rounded-2xl border-2 p-4 ${
          lastResult.outcome === "success" ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700" :
          lastResult.outcome === "already" ? "bg-amber-500/10 border-amber-500/40 text-amber-700" :
          lastResult.outcome === "info" ? "bg-sky-500/10 border-sky-500/40 text-sky-700" :
          "bg-destructive/10 border-destructive/40 text-destructive"
        }`}>
          <div className="flex items-center gap-2 font-bold">
            {lastResult.outcome === "success" && <CheckCircle2 className="h-5 w-5" />}
            {lastResult.outcome === "already" && <AlertTriangle className="h-5 w-5" />}
            {lastResult.outcome === "info" && <CheckCircle2 className="h-5 w-5" />}
            {(lastResult.outcome === "invalid" || lastResult.outcome === "error") && <XCircle className="h-5 w-5" />}
            {lastResult.message}
          </div>
          {(lastResult.name || lastResult.detail || lastResult.code) && (
            <div className="text-xs mt-1 opacity-90">
              {lastResult.name && <span className="font-semibold">{lastResult.name}</span>}
              {lastResult.detail && <span> · {lastResult.detail}</span>}
              {lastResult.code && <span className="font-mono ml-2">[{lastResult.code}]</span>}
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" /> Scan History ({history.length})
            </h3>
            <button onClick={clearHistory} className="text-xs text-muted-foreground hover:text-destructive font-semibold">Clear</button>
          </div>
          <ul className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
            {history.map((r, i) => {
              const Icon = kindIcon(r.kind);
              return (
                <li key={i} className={`text-xs px-3 py-2 rounded-lg border flex items-start gap-2 ${
                  r.outcome === "success" ? "border-emerald-500/30 bg-emerald-500/5" :
                  r.outcome === "already" ? "border-amber-500/30 bg-amber-500/5" :
                  r.outcome === "info" ? "border-sky-500/30 bg-sky-500/5" :
                  "border-destructive/30 bg-destructive/5"
                }`}>
                  <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-70" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{r.name ?? r.message}</p>
                    {r.detail && <p className="text-[10px] opacity-70 truncate">{r.detail}</p>}
                    <p className="text-[10px] opacity-60 font-mono truncate">{r.code} · {new Date(r.ts).toLocaleTimeString()}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
