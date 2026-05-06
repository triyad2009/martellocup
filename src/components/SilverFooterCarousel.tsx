import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

type Sponsor = {
  id: string;
  name: string;
  logo_url: string | null;
};

const PAGE_SIZE = 6;

export function SilverFooterCarousel() {
  const { lang } = useI18n();
  const [rows, setRows] = useState<Sponsor[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    supabase
      .from("sponsors")
      .select("id,name,logo_url")
      .eq("tier", "silver")
      .eq("status", "approved")
      .order("sort_order")
      .then(({ data }) => setRows((data ?? []) as Sponsor[]));
  }, []);

  useEffect(() => {
    if (rows.length <= PAGE_SIZE) return;
    const id = setInterval(() => {
      setPage((p) => (p + 1) % Math.ceil(rows.length / PAGE_SIZE));
    }, 4000);
    return () => clearInterval(id);
  }, [rows.length]);

  if (rows.length === 0) return null;

  const start = page * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);
  // pad with rotation if last page is short
  const padded =
    visible.length < PAGE_SIZE && rows.length > PAGE_SIZE
      ? [...visible, ...rows.slice(0, PAGE_SIZE - visible.length)]
      : visible;

  return (
    <div className="bg-black/30 border-t border-white/5 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/30" />
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
            <Award className="h-3 w-3" />
            {lang === "bn" ? "সিলভার স্পন্সর" : "Silver Sponsors"}
          </span>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/30" />
        </div>
        <div
          key={page}
          className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 animate-in fade-in duration-700"
        >
          {padded.map((s) => (
            <Link
              key={`${s.id}-${page}`}
              to="/sponsors"
              hash={s.id}
              className="group rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 p-3 sm:p-4 flex items-center justify-center aspect-[4/3] transition-all"
              title={s.name}
            >
              {s.logo_url ? (
                <img
                  src={s.logo_url}
                  alt={s.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform"
                />
              ) : (
                <span className="text-white/70 font-bold text-sm text-center line-clamp-2">
                  {s.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
