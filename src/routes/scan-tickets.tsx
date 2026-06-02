import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { ScanLine, Loader2, Shield, ArrowLeft, Camera, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useUserRoles } from "@/lib/roles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/scan-tickets")({
  component: ScanTicketsPage,
  head: () => ({
    meta: [{ title: "Scan Tickets · Martello Cup" }, { name: "robots", content: "noindex" }],
  }),
});

type Result = {
  kind: "success" | "already" | "invalid" | "error";
  message: string;
  payer?: string;
  tier?: string;
  code?: string;
};

function ScanTicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, has, loading: roleLoading } = useUserRoles();
  const navigate = useNavigate();
  const canScan = isAdmin || has("match_manager") || has("media_manager") || has("content_manager");

  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<Result | null>(null);
  const [recent, setRecent] = useState<Result[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastCodeRef = useRef<string | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      const s = scannerRef.current;
      if (s) {
        s.stop().catch(() => {}).then(() => s.clear());
      }
    };
  }, []);

  const handleDecoded = async (text: string) => {
    // Debounce same code within 3s
    const now = Date.now();
    if (lastCodeRef.current === text && now - lastTimeRef.current < 3000) return;
    lastCodeRef.current = text;
    lastTimeRef.current = now;

    // Extract code: accept URL or raw code
    let code = text.trim();
    try {
      const u = new URL(text);
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.indexOf("verify-ticket");
      if (idx >= 0 && parts[idx + 1]) code = decodeURIComponent(parts[idx + 1]);
    } catch {
      // not a URL — use raw
    }

    const { data, error } = await (supabase as any).rpc("redeem_ticket", { _code: code });
    let res: Result;
    if (error) {
      res = { kind: "error", message: error.message, code };
    } else {
      const r = data as any;
      if (r?.ok) {
        res = { kind: "success", message: "✅ Accepted", payer: r.payer_name, tier: r.tier, code };
        // beep
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
          g.gain.setValueAtTime(0.15, ctx.currentTime);
          o.start(); o.stop(ctx.currentTime + 0.15);
        } catch {}
      } else if (r?.reason === "already_used") {
        res = { kind: "already", message: `⚠ Already used at ${new Date(r.used_at).toLocaleString()}`, payer: r.payer_name, tier: r.tier, code };
      } else if (r?.reason === "not_found") {
        res = { kind: "invalid", message: "❌ Invalid ticket — not in system", code };
      } else if (r?.reason === "not_approved") {
        res = { kind: "invalid", message: `❌ Ticket is ${r.status}, not approved`, code };
      } else if (r?.reason === "forbidden") {
        res = { kind: "error", message: "Not authorized", code };
      } else {
        res = { kind: "error", message: "Unknown error", code };
      }
    }

    setLastResult(res);
    setRecent((rs) => [res, ...rs].slice(0, 10));
    if (res.kind === "invalid" || res.kind === "already") {
      // Alert sound for failure
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.frequency.value = 220; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.2, ctx.currentTime);
        o.start(); o.stop(ctx.currentTime + 0.35);
      } catch {}
      if (typeof window !== "undefined" && "alert" in window) {
        // Browser alert as user requested
        setTimeout(() => window.alert(`${res.message}\nCode: ${res.code ?? "-"}`), 100);
      }
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
        () => { /* ignore frame errors */ },
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
  };

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
        <p className="text-sm text-muted-foreground">Only admins and moderators can scan tickets.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-5">
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Admin
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
          <ScanLine className="h-3.5 w-3.5" /> TICKET SCANNER
        </div>
      </div>

      <h1 className="font-display text-2xl font-bold mb-1">Scan QR Ticket</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Point camera at ticket QR. Each ticket can be used only once.
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
            <p className="text-[11px] opacity-70 text-center px-6">
              Requires HTTPS + camera permission
            </p>
          </div>
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
          lastResult.kind === "success" ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700" :
          lastResult.kind === "already" ? "bg-amber-500/10 border-amber-500/40 text-amber-700" :
          "bg-destructive/10 border-destructive/40 text-destructive"
        }`}>
          <div className="flex items-center gap-2 font-bold">
            {lastResult.kind === "success" && <CheckCircle2 className="h-5 w-5" />}
            {lastResult.kind === "already" && <AlertTriangle className="h-5 w-5" />}
            {(lastResult.kind === "invalid" || lastResult.kind === "error") && <XCircle className="h-5 w-5" />}
            {lastResult.message}
          </div>
          {(lastResult.payer || lastResult.code) && (
            <div className="text-xs mt-1 opacity-90">
              {lastResult.payer && <span className="font-semibold">{lastResult.payer}</span>}
              {lastResult.tier && <span> · {lastResult.tier}</span>}
              {lastResult.code && <span className="font-mono ml-2">[{lastResult.code}]</span>}
            </div>
          )}
        </div>
      )}

      {recent.length > 1 && (
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Recent Scans</h3>
          <ul className="space-y-1.5">
            {recent.slice(1).map((r, i) => (
              <li key={i} className={`text-xs px-3 py-2 rounded-lg border flex items-center gap-2 ${
                r.kind === "success" ? "border-emerald-500/30 bg-emerald-500/5" :
                r.kind === "already" ? "border-amber-500/30 bg-amber-500/5" :
                "border-destructive/30 bg-destructive/5"
              }`}>
                {r.kind === "success" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> :
                 r.kind === "already" ? <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" /> :
                 <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                <span className="truncate">{r.payer ?? "—"} · <span className="font-mono">{r.code}</span></span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
