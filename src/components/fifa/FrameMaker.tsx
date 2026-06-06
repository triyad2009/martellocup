import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Download, Loader2, Trophy, Sparkles } from "lucide-react";
import { WC_COUNTRIES, findCountry } from "@/lib/fifa-countries";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

type Props = { open: boolean; onClose: () => void };

const SIZE = 1080;

export function FrameMaker({ open, onClose }: Props) {
  const { lang } = useI18n();
  const T = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const [code, setCode] = useState("ARG");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const country = findCountry(code)!;

  const onPick = (f: File | null) => {
    if (!f) return;
    setPhotoUrl(URL.createObjectURL(f));
  };

  const render = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setBusy(true);

    canvas.width = SIZE;
    canvas.height = SIZE;

    // Background gradient (team colors)
    const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    bg.addColorStop(0, country.color);
    bg.addColorStop(1, country.color2);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Diagonal stripes overlay
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#000";
    for (let i = -SIZE; i < SIZE * 2; i += 60) {
      ctx.fillRect(i, 0, 24, SIZE * 2);
    }
    ctx.restore();

    // Center photo circle
    const photoSize = 720;
    const cx = SIZE / 2;
    const cy = SIZE / 2 - 30;
    const r = photoSize / 2;

    // Photo
    if (photoUrl) {
      const img = await loadImage(photoUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      // cover fit
      const ratio = Math.max(photoSize / img.width, photoSize / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
      ctx.restore();
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fill();
      ctx.restore();
    }

    // Photo border ring (team color)
    ctx.lineWidth = 28;
    ctx.strokeStyle = country.color;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 8;
    ctx.strokeStyle = country.color2;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 32, 0, Math.PI * 2);
    ctx.stroke();

    // Flag image bottom-left
    try {
      const flagImg = await loadImage(`https://flagcdn.com/w320/${country.iso2}.png`);
      const fw = 220, fh = 140;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 20;
      ctx.drawImage(flagImg, 60, SIZE - fh - 60, fw, fh);
      ctx.restore();
      ctx.lineWidth = 4; ctx.strokeStyle = "#fff";
      ctx.strokeRect(60, SIZE - fh - 60, fw, fh);
    } catch { /* ignore flag load failure */ }

    // Header strip
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, SIZE, 140);
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 56px Oswald, Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FIFA WORLD CUP 2026", SIZE / 2, 90);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px Inter, sans-serif";
    ctx.fillText("MARTELLO CUP · SEASON 10", SIZE / 2, 124);

    // Footer strip with country + star
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, SIZE - 200, SIZE, 200);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 72px Oswald, Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(country.name_en.toUpperCase(), SIZE - 60, SIZE - 110);
    ctx.fillStyle = country.color;
    ctx.font = "bold 36px Inter, sans-serif";
    ctx.fillText(`⭐ ${country.star}`, SIZE - 60, SIZE - 60);

    setBusy(false);
  };

  useEffect(() => {
    if (open) render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, code, photoUrl]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((b) => {
      if (!b) return toast.error("Failed");
      const url = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = url; a.download = `martello-${country.code}-frame.png`; a.click();
      URL.revokeObjectURL(url);
      toast.success(T("ফ্রেম ডাউনলোড হয়েছে", "Frame downloaded"));
    }, "image/png");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950 border border-amber-500/40 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-red-700 via-amber-600 to-red-700 px-4 py-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 text-white font-bold">
                <Trophy className="h-5 w-5" />
                {T("বিশ্বকাপ ফ্রেম মেকার", "World Cup Frame Maker")}
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-full bg-black/30 text-white flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-white">
              {/* Preview */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
                <canvas ref={canvasRef} className="w-full h-full block" />
                {busy && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                  </div>
                )}
              </div>

              {/* Photo upload */}
              <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-white/20 hover:border-amber-400 cursor-pointer text-sm font-bold">
                <Upload className="h-4 w-4" />
                {photoUrl ? T("ছবি পরিবর্তন", "Change photo") : T("আপনার ছবি আপলোড", "Upload your photo")}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
              </label>

              {/* Country grid */}
              <div>
                <p className="text-xs font-bold text-white/70 mb-2">{T("পছন্দের দল", "Pick your team")}</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-2 bg-slate-900/60 rounded-xl border border-white/10">
                  {WC_COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setCode(c.code)}
                      className={`p-2 rounded-lg border text-center transition ${
                        code === c.code ? "border-amber-400 bg-amber-500/20" : "border-white/10 hover:border-white/30 bg-white/5"
                      }`}
                      style={code === c.code ? { boxShadow: `0 0 0 2px ${c.color}` } : undefined}
                    >
                      <div className="text-xl">{c.flag}</div>
                      <div className="text-[9px] mt-0.5 truncate">{lang === "bn" ? c.name_bn : c.name_en}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={download}
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black tracking-wide disabled:opacity-50"
              >
                <Download className="h-5 w-5" />
                {T("ফ্রেম ডাউনলোড", "Download Frame")}
                <Sparkles className="h-4 w-4" />
              </button>
              <p className="text-[11px] text-white/50 text-center">
                {T(
                  "ফ্রেমে দলের কালার, পতাকা ও তারকা প্লেয়ারের নাম থাকবে।",
                  "Frame includes team colors, flag and star player.",
                )}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
