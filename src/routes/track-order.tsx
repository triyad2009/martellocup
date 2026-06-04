import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Package, Check, X, Truck, Clock, MessageSquare, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { OrderSlip } from "@/components/OrderSlip";

export const Route = createFileRoute("/track-order")({
  component: TrackOrderPage,
  validateSearch: (s: Record<string, unknown>) => ({
    id: typeof s.id === "string" ? s.id : undefined,
    code: typeof s.code === "string" ? s.code : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Track Order · Martello Cup" },
      { name: "description", content: "Track your Martello Cup jersey order or team registration status." },
    ],
  }),
});

type JerseyOrder = {
  kind: "jersey";
  id: string;
  tracking_code: string | null;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  size: string;
  quantity: number;
  jersey_print_name: string;
  jersey_number: number | null;
  total_amount: number;
  status: string;
  payment_method: string;
  rejection_reason: string | null;
  admin_notes: string | null;
  delivery_address: string;
  created_at: string;
  updated_at: string;
};

type Registration = {
  kind: "registration";
  id: string;
  tracking_code: string | null;
  team_name: string;
  short_name: string | null;
  category: string | null;
  captain_name: string;
  coach_name: string;
  coach_phone: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
};

type Result = JerseyOrder | Registration | null;

function TrackOrderPage() {
  const { lang } = useI18n();
  const T = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const search = Route.useSearch();
  const [query, setQuery] = useState(search.code || search.id || "");
  const [result, setResult] = useState<Result>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (input: string) => {
    setError(null);
    setResult(null);
    const trimmed = input.trim();
    if (!trimmed) {
      setError(T("কোড বা আইডি লিখুন", "Please enter a code or ID"));
      return;
    }
    setLoading(true);

    try {
      const upper = trimmed.toUpperCase();
      if (upper.startsWith("JRS-")) {
        const { data } = await (supabase as any).rpc("lookup_jersey_order", { _code: upper });
        if (data?.found) { setResult({ kind: "jersey", ...(data as any) }); return; }
      } else if (upper.startsWith("REG-")) {
        const { data } = await (supabase as any).rpc("lookup_registration", { _code: upper });
        if (data?.found) { setResult({ kind: "registration", ...(data as any) }); return; }
      } else {
        const { data } = await (supabase as any).rpc("scan_any_code", { _code: trimmed });
        if (data?.found) { setResult({ kind: data.kind, ...(data as any) }); return; }
      }
      setError(T("কিছু পাওয়া যায়নি। কোড চেক করুন।", "Nothing found. Please check the code."));

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initial = search.code || search.id;
    if (initial) lookup(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.code, search.id]);

  const statusInfo = (s: string) => {
    switch (s) {
      case "approved": return { icon: Check, color: "text-success bg-success/15", label: T("অনুমোদিত", "Approved") };
      case "delivered": return { icon: Truck, color: "text-primary bg-primary/15", label: T("ডেলিভার্ড", "Delivered") };
      case "rejected": return { icon: X, color: "text-destructive bg-destructive/15", label: T("প্রত্যাখ্যাত", "Rejected") };
      default: return { icon: Clock, color: "text-amber-600 bg-amber-500/15", label: T("পেন্ডিং", "Pending") };
    }
  };

  const fmtDate = (s: string) => {
    try { return new Date(s).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB"); } catch { return s; }
  };

  return (
    <div className="bg-background min-h-[calc(100vh-200px)]">
      <section className="bg-gradient-primary text-white py-10 sm:py-14">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <Package className="h-10 w-10 mx-auto mb-2 opacity-90" />
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold">
            {T("অর্ডার / নিবন্ধন ট্র্যাক করুন", "Track Order / Registration")}
          </h1>
          <p className="opacity-90 mt-2 text-sm">
            {T("ট্র্যাকিং কোড দিয়ে স্ট্যাটাস দেখুন", "Enter tracking code to see status")}
          </p>
        </div>
      </section>

      <section className="container max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
          <label className="text-sm font-semibold mb-2 block">
            {T("ট্র্যাকিং কোড", "Tracking Code")}{" "}
            <span className="text-xs text-muted-foreground font-normal">(JRS-… / REG-…)</span>
          </label>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookup(query)}
              placeholder="JRS-12345-67890"
              className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background font-mono text-sm"
            />
            <button
              onClick={() => lookup(query)}
              disabled={loading}
              className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm inline-flex items-center gap-1.5 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {T("খুঁজুন", "Find")}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-destructive font-medium">{error}</p>}
        </div>

        {result && result.kind === "jersey" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-5">
            {result.tracking_code && (
              <OrderSlip
                kind="jersey"
                trackingCode={result.tracking_code}
                title={result.product_name}
                subtitle={`${result.jersey_print_name}${result.jersey_number != null ? ` · #${result.jersey_number}` : ""}`}
                rows={[
                  { k: T("নাম", "Name"), v: result.customer_name },
                  { k: T("ফোন", "Phone"), v: result.customer_phone },
                  { k: T("সাইজ", "Size"), v: `${result.size} × ${result.quantity}` },
                  { k: T("সর্বমোট", "Total"), v: `৳ ${result.total_amount}` },
                  { k: T("পেমেন্ট", "Payment"), v: result.payment_method.toUpperCase() },
                ]}
                status={result.status}
              />
            )}
            {(result.admin_notes || result.rejection_reason) && (
              <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
                {result.admin_notes && (
                  <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
                    <p className="text-xs font-bold text-primary uppercase mb-1.5 inline-flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {T("এডমিন বার্তা", "Message from Admin")}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{result.admin_notes}</p>
                  </div>
                )}
                {result.rejection_reason && (
                  <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-xs font-bold text-destructive uppercase mb-1.5">
                      {T("প্রত্যাখ্যানের কারণ", "Rejection Reason")}
                    </p>
                    <p className="text-sm">{result.rejection_reason}</p>
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-center text-muted-foreground">
              {T("আপডেট", "Last update")}: {fmtDate((result as any).updated_at || result.created_at)}
            </p>
          </motion.div>
        )}

        {result && result.kind === "registration" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-5">
            {result.tracking_code && (
              <OrderSlip
                kind="registration"
                trackingCode={result.tracking_code}
                title={result.team_name}
                subtitle={result.category ? result.category.toUpperCase() : undefined}
                rows={[
                  { k: T("অধিনায়ক", "Captain"), v: result.captain_name },
                  { k: T("কোচ", "Coach"), v: result.coach_name },
                  { k: T("ফোন", "Phone"), v: result.coach_phone },
                ]}
                status={result.status}
              />
            )}
            {result.rejection_reason && (
              <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-4">
                <p className="text-xs font-bold text-destructive uppercase mb-1.5">
                  {T("প্রত্যাখ্যানের কারণ", "Rejection Reason")}
                </p>
                <p className="text-sm">{result.rejection_reason}</p>
              </div>
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
}
