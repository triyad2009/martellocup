import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import * as htmlToImage from "html-to-image";
import { Download, CheckCircle2, Loader2, Shirt, Users } from "lucide-react";
import { useSiteLogo } from "@/lib/settings";

type Kind = "jersey" | "registration";

type Row = { k: string; v: string };

type Props = {
  kind: Kind;
  trackingCode: string;
  title: string; // jersey product name / team name
  subtitle?: string; // print name / category
  rows: Row[]; // additional fields
  status?: string; // pending / approved / delivered / rejected
};

const ACCENT: Record<Kind, { from: string; to: string; label: string; Icon: typeof Shirt; tagline: string }> = {
  jersey: {
    from: "from-sky-600",
    to: "to-indigo-700",
    label: "JERSEY ORDER",
    Icon: Shirt,
    tagline: "OFFICIAL · MARTELLO CUP MERCH",
  },
  registration: {
    from: "from-emerald-600",
    to: "to-teal-700",
    label: "TEAM REGISTRATION",
    Icon: Users,
    tagline: "OFFICIAL · MARTELLO CUP TEAM",
  },
};

const STATUS_BANNER: Record<string, { cls: string; text: string }> = {
  pending: { cls: "bg-amber-100 border-amber-300 text-amber-900", text: "⏳ PENDING — awaiting admin approval" },
  approved: { cls: "bg-emerald-50 border-emerald-200 text-emerald-700", text: "✓ APPROVED" },
  delivered: { cls: "bg-blue-50 border-blue-200 text-blue-700", text: "📦 DELIVERED" },
  rejected: { cls: "bg-rose-100 border-rose-300 text-rose-800", text: "✗ REJECTED" },
};

export function OrderSlip({ kind, trackingCode, title, subtitle, rows, status }: Props) {
  const slipRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [downloading, setDownloading] = useState(false);
  const logo = useSiteLogo();
  const accent = ACCENT[kind];

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/track-order?code=${trackingCode}`
      : `https://martellocup.lovable.app/track-order?code=${trackingCode}`;

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, { width: 320, margin: 1, errorCorrectionLevel: "H" })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [verifyUrl]);

  const handleDownload = async () => {
    if (!slipRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(slipRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `Martello-Cup-${kind}-${trackingCode}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setDownloading(false);
    }
  };

  const banner = status ? STATUS_BANNER[status] : undefined;

  return (
    <div className="max-w-xl mx-auto">
      <div
        ref={slipRef}
        className="relative bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-dashed border-slate-300"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        <div className={`flex items-center justify-between px-5 py-4 bg-gradient-to-br ${accent.from} ${accent.to} text-white`}>
          <div>
            <div className="text-[10px] tracking-[0.3em] opacity-90">{accent.label}</div>
            <div className="font-extrabold text-xl tracking-tight">MARTELLO CUP</div>
            <div className="text-[10px] tracking-widest opacity-80 mt-0.5">{accent.tagline}</div>
          </div>
          <img
            src={logo}
            alt="Martello Cup"
            crossOrigin="anonymous"
            className="h-14 w-14 rounded-lg object-cover border-2 border-white/60"
          />
        </div>

        <div className="relative h-4 bg-white">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-100 border-r-2 border-dashed border-slate-300" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-100 border-l-2 border-dashed border-slate-300" />
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-300" />
        </div>

        <div className="px-5 pb-5 pt-2 grid grid-cols-[1fr_auto] gap-4 items-center">
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 pb-1">
              <accent.Icon className="h-4 w-4 text-slate-500" />
              <div>
                <div className="font-extrabold text-base leading-tight">{title}</div>
                {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
              </div>
            </div>
            {rows.map((r) => (
              <div key={r.k} className="flex justify-between gap-3 py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-500">{r.k}</span>
                <span className="font-bold text-slate-900 text-right truncate">{r.v}</span>
              </div>
            ))}
            <div className="pt-2">
              <div className={`text-[10px] tracking-[0.25em] font-bold ${kind === "jersey" ? "text-sky-700" : "text-emerald-700"}`}>
                TRACKING CODE
              </div>
              <div className="font-mono text-base font-extrabold tracking-[0.18em] break-all">{trackingCode}</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="p-2 bg-white border-2 border-slate-200 rounded-xl">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="h-32 w-32" />
              ) : (
                <div className="h-32 w-32 flex items-center justify-center bg-slate-100">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              )}
            </div>
            <div className="text-[9px] text-slate-500 text-center max-w-[140px] leading-tight">
              Scan to track status
            </div>
          </div>
        </div>

        {banner && (
          <div className={`px-5 py-2 border-t text-xs font-bold text-center ${banner.cls}`}>
            {banner.text}
          </div>
        )}

        {!banner && (
          <div className="px-5 py-2 bg-emerald-50 border-t border-emerald-200 text-emerald-700 text-xs font-semibold text-center inline-flex items-center justify-center gap-1 w-full">
            <CheckCircle2 className="h-3.5 w-3.5" /> Saved · Keep this for your records
          </div>
        )}

        <div className="px-5 py-2 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 text-center">
          martellocup.lovable.app
        </div>
      </div>

      <div className="mt-4 print:hidden">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary-glow font-bold shadow-glow-red disabled:opacity-60"
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {downloading ? "Generating..." : "Download Slip (PNG)"}
        </button>
      </div>
    </div>
  );
}
