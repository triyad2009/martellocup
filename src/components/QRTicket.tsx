import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import * as htmlToImage from "html-to-image";
import { Download, CheckCircle2, Loader2 } from "lucide-react";

const LOGO_URL = "https://i.postimg.cc/sxgdMH6c/FB-IMG-1776993011009.jpg";

type Props = {
  ticketCode: string;
  payerName: string;
  payerPhone: string;
  tierName?: string | null;
  amount?: number | null;
  date?: string;
  used?: boolean;
};

export function QRTicket({ ticketCode, payerName, payerPhone, tierName, amount, date, used }: Props) {
  const slipRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify-ticket/${ticketCode}`
      : `https://martellocup.lovable.app/verify-ticket/${ticketCode}`;

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
      a.download = `Martello-Cup-Ticket-${ticketCode}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div
        ref={slipRef}
        className="relative bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-dashed border-slate-300"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        {/* Top stub */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-br from-red-600 to-red-800 text-white">
          <div>
            <div className="text-[10px] tracking-[0.3em] opacity-90">OFFICIAL TICKET</div>
            <div className="font-extrabold text-xl tracking-tight">MARTELLO CUP</div>
            <div className="text-[10px] tracking-widest opacity-80 mt-0.5">FOOTBALL · CONNECTIVITY · HAPPINESS</div>
          </div>
          <img
            src={LOGO_URL}
            alt="Martello Cup"
            crossOrigin="anonymous"
            className="h-14 w-14 rounded-lg object-cover border-2 border-white/60"
          />
        </div>

        {/* Notch separator */}
        <div className="relative h-4 bg-white">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-100 border-r-2 border-dashed border-slate-300" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-100 border-l-2 border-dashed border-slate-300" />
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-300" />
        </div>

        {/* Body: details + QR side-by-side */}
        <div className="px-5 pb-5 pt-2 grid grid-cols-[1fr_auto] gap-4 items-center">
          <div className="space-y-1.5 text-sm">
            <Row k="Name" v={payerName} />
            <Row k="Phone" v={payerPhone} />
            {tierName && <Row k="Type" v={tierName} />}
            {amount != null && <Row k="Amount" v={`৳ ${amount}`} />}
            {date && <Row k="Date" v={new Date(date).toLocaleDateString()} />}
            <div className="pt-2">
              <div className="text-[10px] tracking-[0.25em] text-red-700 font-bold">TICKET CODE</div>
              <div className="font-mono text-lg font-extrabold tracking-[0.25em]">{ticketCode}</div>
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
              Scan at gate to verify
            </div>
          </div>
        </div>

        {used && (
          <div className="px-5 py-2 bg-amber-100 border-t border-amber-300 text-amber-900 text-xs font-bold text-center">
            ⚠ THIS TICKET HAS ALREADY BEEN USED
          </div>
        )}

        {!used && (
          <div className="px-5 py-2 bg-emerald-50 border-t border-emerald-200 text-emerald-700 text-xs font-semibold text-center inline-flex items-center justify-center gap-1 w-full">
            <CheckCircle2 className="h-3.5 w-3.5" /> Verified · Show this at the gate
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
          {downloading ? "Generating..." : "Download Ticket (PNG)"}
        </button>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 py-1 border-b border-dashed border-slate-200">
      <span className="text-slate-500">{k}</span>
      <span className="font-bold text-slate-900 text-right truncate">{v}</span>
    </div>
  );
}
