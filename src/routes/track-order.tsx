import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Package, Check, X, Truck, Clock, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/track-order")({
  component: TrackOrderPage,
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s.id === "string" ? s.id : undefined }),
  head: () => ({
    meta: [
      { title: "Track Order · Martello Cup" },
      { name: "description", content: "Track your Martello Cup jersey order status using your order ID." },
    ],
  }),
});

type Order = {
  id: string;
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

function TrackOrderPage() {
  const { lang } = useI18n();
  const T = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const search = Route.useSearch();
  const [orderId, setOrderId] = useState(search.id || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (id: string) => {
    setError(null);
    setOrder(null);
    const trimmed = id.trim();
    if (!trimmed) {
      setError(T("অর্ডার আইডি লিখুন", "Please enter an order ID"));
      return;
    }
    setLoading(true);
    const { data, error: e } = await (supabase as any)
      .from("jersey_orders")
      .select("id,product_name,customer_name,customer_phone,size,quantity,jersey_print_name,jersey_number,total_amount,status,payment_method,rejection_reason,admin_notes,delivery_address,created_at,updated_at")
      .eq("id", trimmed)
      .maybeSingle();
    setLoading(false);
    if (e || !data) {
      setError(T("কোনো অর্ডার পাওয়া যায়নি। আইডি চেক করুন।", "No order found. Please check the ID."));
      return;
    }
    setOrder(data as Order);
  };

  useEffect(() => {
    if (search.id) lookup(search.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.id]);

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
            {T("অর্ডার ট্র্যাক করুন", "Track Your Order")}
          </h1>
          <p className="opacity-90 mt-2 text-sm">
            {T("অর্ডার আইডি দিয়ে স্ট্যাটাস ও আপডেট দেখুন", "Enter your order ID to see status & updates")}
          </p>
        </div>
      </section>

      <section className="container max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
          <label className="text-sm font-semibold mb-2 block">{T("অর্ডার আইডি", "Order ID")}</label>
          <div className="flex gap-2">
            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookup(orderId)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background font-mono text-xs"
            />
            <button
              onClick={() => lookup(orderId)}
              disabled={loading}
              className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm inline-flex items-center gap-1.5 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {T("খুঁজুন", "Find")}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-destructive font-medium">{error}</p>}
        </div>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-card space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-xl">{order.product_name}</h2>
                <p className="text-xs text-muted-foreground font-mono mt-0.5 break-all">#{order.id}</p>
              </div>
              {(() => {
                const info = statusInfo(order.status);
                const Icon = info.icon;
                return (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase shrink-0 ${info.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {info.label}
                  </span>
                );
              })()}
            </div>

            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-border pt-4">
              <p><span className="text-muted-foreground">{T("নাম", "Name")}:</span> <span className="font-semibold">{order.customer_name}</span></p>
              <p><span className="text-muted-foreground">{T("ফোন", "Phone")}:</span> <span className="font-semibold">{order.customer_phone}</span></p>
              <p><span className="text-muted-foreground">{T("সাইজ", "Size")}:</span> <span className="font-semibold">{order.size} × {order.quantity}</span></p>
              <p><span className="text-muted-foreground">{T("পেমেন্ট", "Payment")}:</span> <span className="font-semibold uppercase">{order.payment_method}</span></p>
              <p>
                <span className="text-muted-foreground">{T("জার্সি প্রিন্ট", "Jersey Print")}:</span>{" "}
                <span className="font-mono font-bold uppercase">{order.jersey_print_name}</span>
                {order.jersey_number != null && <> · #{order.jersey_number}</>}
              </p>
              <p><span className="text-muted-foreground">{T("সর্বমোট", "Total")}:</span> <span className="font-bold text-primary">৳ {order.total_amount}</span></p>
              <p className="sm:col-span-2"><span className="text-muted-foreground">{T("ঠিকানা", "Address")}:</span> {order.delivery_address}</p>
              <p className="sm:col-span-2 text-xs text-muted-foreground">
                {T("অর্ডার করা হয়েছে", "Ordered")}: {fmtDate(order.created_at)}
                {order.updated_at !== order.created_at && (
                  <> · {T("আপডেট", "Updated")}: {fmtDate(order.updated_at)}</>
                )}
              </p>
            </div>

            {order.admin_notes && (
              <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
                <p className="text-xs font-bold text-primary uppercase mb-1.5 inline-flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {T("এডমিন বার্তা", "Message from Admin")}
                </p>
                <p className="text-sm whitespace-pre-wrap">{order.admin_notes}</p>
              </div>
            )}

            {order.rejection_reason && (
              <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4">
                <p className="text-xs font-bold text-destructive uppercase mb-1.5">
                  {T("প্রত্যাখ্যানের কারণ", "Rejection Reason")}
                </p>
                <p className="text-sm">{order.rejection_reason}</p>
              </div>
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
}
