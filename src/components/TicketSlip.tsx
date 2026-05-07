import { useRef } from "react";
import { Download, Printer, CheckCircle2 } from "lucide-react";

const LOGO_URL = "https://i.postimg.cc/sxgdMH6c/FB-IMG-1776993011009.jpg";

type Props = {
  ticketCode: string;
  payerName: string;
  payerPhone: string;
  tierName?: string | null;
  amount?: number | null;
  date?: string;
};

export function TicketSlip({ ticketCode, payerName, payerPhone, tierName, amount, date }: Props) {
  const slipRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const html = slipRef.current?.outerHTML;
    if (!html) return;
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>Martello Cup Ticket ${ticketCode}</title>
      <meta charset="utf-8"/>
      <style>
        *{box-sizing:border-box;font-family:system-ui,sans-serif}
        body{margin:0;padding:24px;background:#f5f5f5}
        .slip{max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.12);border:2px dashed #cbd5e1}
        .top{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff}
        .brand{font-weight:800;font-size:18px;letter-spacing:.5px}
        .logo{width:46px;height:46px;border-radius:10px;object-fit:cover;border:2px solid rgba(255,255,255,.6)}
        .body{padding:22px}
        .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #e5e7eb;font-size:14px}
        .row span:first-child{color:#64748b}
        .row span:last-child{font-weight:700;color:#0f172a}
        .code{margin-top:18px;padding:18px;border:2px solid #dc2626;border-radius:12px;text-align:center;background:#fef2f2}
        .code small{display:block;font-size:11px;letter-spacing:2px;color:#b91c1c;font-weight:700;margin-bottom:8px}
        .code strong{display:block;font-family:monospace;font-size:28px;letter-spacing:6px;color:#0f172a}
        .foot{padding:14px 22px;background:#f8fafc;font-size:11px;color:#64748b;text-align:center;border-top:1px solid #e5e7eb}
      </style></head><body>${html}</body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 300);
  };

  const handleDownload = () => {
    const html = slipRef.current?.outerHTML;
    if (!html) return;
    const full = `<!doctype html><html><head><meta charset="utf-8"/><title>Ticket ${ticketCode}</title>
      <style>body{font-family:system-ui;padding:24px;background:#f5f5f5}
      .slip{max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:2px dashed #cbd5e1}
      .top{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff}
      .brand{font-weight:800}.logo{width:46px;height:46px;border-radius:10px}
      .body{padding:22px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #e5e7eb;font-size:14px}
      .row span:first-child{color:#64748b}.row span:last-child{font-weight:700}
      .code{margin-top:18px;padding:18px;border:2px solid #dc2626;border-radius:12px;text-align:center;background:#fef2f2}
      .code small{display:block;font-size:11px;letter-spacing:2px;color:#b91c1c;font-weight:700;margin-bottom:8px}
      .code strong{display:block;font-family:monospace;font-size:28px;letter-spacing:6px}
      .foot{padding:14px 22px;background:#f8fafc;font-size:11px;color:#64748b;text-align:center}
      </style></head><body>${html}</body></html>`;
    const blob = new Blob([full], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Martello-Cup-Ticket-${ticketCode}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div ref={slipRef} className="slip max-w-xl mx-auto bg-card border-2 border-dashed border-border rounded-2xl overflow-hidden shadow-card">
        <div className="top flex items-center justify-between p-5 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
          <div>
            <div className="text-[10px] tracking-[0.3em] opacity-90">OFFICIAL TICKET</div>
            <div className="brand font-display font-extrabold text-xl">MARTELLO CUP</div>
          </div>
          <img src={LOGO_URL} alt="Martello Cup" className="logo h-12 w-12 rounded-lg object-cover border-2 border-white/60" />
        </div>
        <div className="body p-6 space-y-2">
          <div className="row flex justify-between py-2 border-b border-dashed border-border text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-bold">{payerName}</span>
          </div>
          <div className="row flex justify-between py-2 border-b border-dashed border-border text-sm">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-bold">{payerPhone}</span>
          </div>
          {tierName && (
            <div className="row flex justify-between py-2 border-b border-dashed border-border text-sm">
              <span className="text-muted-foreground">Type</span>
              <span className="font-bold">{tierName}</span>
            </div>
          )}
          {amount != null && (
            <div className="row flex justify-between py-2 border-b border-dashed border-border text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold">৳ {amount}</span>
            </div>
          )}
          {date && (
            <div className="row flex justify-between py-2 border-b border-dashed border-border text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-bold">{new Date(date).toLocaleDateString()}</span>
            </div>
          )}
          <div className="code mt-4 p-5 border-2 border-primary rounded-xl text-center bg-primary/5">
            <small className="block text-[10px] tracking-[0.25em] text-primary font-bold mb-2">TICKET CODE</small>
            <strong className="block font-mono text-2xl tracking-[0.4em] text-foreground">{ticketCode}</strong>
          </div>
          <div className="flex items-center justify-center gap-1.5 pt-3 text-xs text-success font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Verified · Show this at the gate
          </div>
        </div>
        <div className="foot p-3 bg-muted/40 text-center text-[10px] text-muted-foreground border-t border-border">
          Football · Connectivity · Happiness — martellocup.lovable.app
        </div>
      </div>

      <div className="flex gap-2 max-w-xl mx-auto mt-4 print:hidden">
        <button onClick={handleDownload} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:bg-muted text-sm font-semibold">
          <Download className="h-4 w-4" /> Download
        </button>
        <button onClick={handlePrint} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-glow text-sm font-bold">
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>
    </div>
  );
}
