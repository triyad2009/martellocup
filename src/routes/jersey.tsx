import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shirt, ChevronRight, ChevronLeft, Loader2, Ruler, Check, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useTable } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { PaymentFlow } from "@/components/PaymentFlow";
import { LoginGate } from "@/components/LoginGate";
import { OrderSlip } from "@/components/OrderSlip";

export const Route = createFileRoute("/jersey")({
  component: JerseyPage,
  head: () => ({
    meta: [
      { title: "Jersey Registration · Martello Cup" },
      {
        name: "description",
        content:
          "Order your official Martello Cup jersey — choose size, custom name & number, and pay securely.",
      },
    ],
  }),
});

type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  delivery_charge: number;
  available_sizes: string[];
  size_chart: Record<string, { chest?: string; length?: string }> | null;
  is_active: boolean;
  cod_enabled: boolean;
};

const DEFAULT_SIZE_CHART: Record<string, { chest: string; length: string }> = {
  S: { chest: "36-38\"", length: "27\"" },
  M: { chest: "38-40\"", length: "28\"" },
  L: { chest: "40-42\"", length: "29\"" },
  XL: { chest: "42-44\"", length: "30\"" },
  XXL: { chest: "44-46\"", length: "31\"" },
};

function JerseyPage() {
  const { lang } = useI18n();
  const T = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const { rows: products, loading } = useTable<Product>("jersey_products", {
    order: "sort_order",
    ascending: true,
    filter: (q) => q.eq("is_active", true),
  });

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState<string>("");
  const [printName, setPrintName] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [qty, setQty] = useState(1);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", address: "" });
  const [notes, setNotes] = useState("");
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [creating, setCreating] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [codSuccess, setCodSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // reset selection if product list changes
  useEffect(() => {
    if (product && !products.find((p) => p.id === product.id)) {
      setProduct(null);
      setStep(0);
    }
  }, [products, product]);

  const total = product ? product.price * qty + product.delivery_charge : 0;

  const submitOrder = async () => {
    setError(null);
    if (!product || !size) {
      setError(T("সাইজ নির্বাচন করুন", "Please select a size"));
      return;
    }
    if (!printName.trim()) {
      setError(T("জার্সিতে যে নাম প্রিন্ট হবে দিন", "Enter the name to print"));
      return;
    }
    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      setError(T("নাম, ফোন ও ঠিকানা পূরণ করুন", "Fill name, phone & address"));
      return;
    }
    setCreating(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const { data, error: insErr } = await (supabase as any)
      .from("jersey_orders")
      .insert({
        user_id: authUser?.id ?? null,
        product_id: product.id,
        product_name: product.name,
        customer_name: customer.name.trim(),
        customer_phone: customer.phone.trim(),
        customer_email: customer.email.trim() || null,
        delivery_address: customer.address.trim(),
        jersey_print_name: printName.trim(),
        jersey_number: jerseyNumber ? parseInt(jerseyNumber, 10) : null,
        size,
        quantity: qty,
        unit_price: product.price,
        delivery_charge: product.delivery_charge,
        total_amount: total,
        notes: notes.trim() || null,
        payment_method: product.cod_enabled && paymentMethod === "cod" ? "cod" : "online",
      })
      .select("id, tracking_code")
      .single();
    setCreating(false);
    if (insErr || !data) {
      setError(insErr?.message || "Failed to create order");
      return;
    }
    setOrderId(data.id);
    setTrackingCode((data as any).tracking_code || null);
    setOrderAmount(total);
    if (product.cod_enabled && paymentMethod === "cod") {
      setCodSuccess(true);
    }
    setStep(2);
  };

  return (
    <LoginGate>
    <div className="bg-background">
      <section className="relative bg-gradient-primary text-white py-12 sm:py-16">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <Shirt className="h-12 w-12 mx-auto mb-3 opacity-90" />
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold mb-3">
            {T("জার্সি রেজিস্ট্রেশন", "Jersey Registration")}
          </h1>
          <p className="opacity-90 max-w-xl mx-auto">
            {T(
              "আপনার অফিসিয়াল Martello Cup জার্সি অর্ডার করুন — সাইজ, নাম ও নম্বর কাস্টমাইজ সহ।",
              "Order your official Martello Cup jersey with custom name, number & size.",
            )}
          </p>
          <a
            href="/track-order"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full backdrop-blur"
          >
            <Search className="h-3.5 w-3.5" />
            {T("অর্ডার ট্র্যাক করুন", "Track your order")}
          </a>
        </div>
      </section>

      <section className="container max-w-4xl mx-auto px-4 py-10">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
          {[
            T("জার্সি বাছাই", "Pick Jersey"),
            T("বিস্তারিত", "Details"),
            T("পেমেন্ট", "Payment"),
          ].map((label, i) => (
            <div key={i} className="flex-1 flex items-center">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  step >= i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {step > i ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < 2 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > i ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: choose jersey */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {loading ? (
              <div className="flex justify-center py-16 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
                <Shirt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold">
                  {T("জার্সি শীঘ্রই আসছে", "Jerseys coming soon")}
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setProduct(p);
                      setSize(p.available_sizes[0] || "M");
                      setStep(1);
                    }}
                    className="group text-left rounded-2xl bg-card border-2 border-border hover:border-primary hover:shadow-elegant transition-all overflow-hidden"
                  >
                    <div className="aspect-square bg-muted overflow-hidden">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Shirt className="h-20 w-20 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-lg">{p.name}</h3>
                      {p.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {p.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-display font-bold text-2xl text-primary">
                          ৳ {p.price}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          + ৳{p.delivery_charge} {T("ডেলিভারি", "delivery")}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 1: details */}
        {step === 1 && product && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-card"
          >
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border">
              <div className="h-20 w-20 rounded-xl bg-muted overflow-hidden shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Shirt className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-lg">{product.name}</h3>
                <p className="text-sm text-primary font-bold">৳ {product.price}</p>
              </div>
              <button
                onClick={() => setStep(0)}
                className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:border-primary"
              >
                {T("পরিবর্তন", "Change")}
              </button>
            </div>

            {/* Size */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">{T("সাইজ", "Size")} *</label>
                <button
                  onClick={() => setShowSizeChart((v) => !v)}
                  className="text-xs inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Ruler className="h-3.5 w-3.5" />
                  {T("সাইজ চার্ট", "Size Chart")}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.available_sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-[3rem] px-4 py-2.5 rounded-lg border-2 font-bold text-sm transition-all ${
                      size === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {showSizeChart && (
                <div className="mt-3 rounded-xl bg-muted p-3 text-xs">
                  <table className="w-full">
                    <thead className="text-muted-foreground">
                      <tr>
                        <th className="text-left py-1">{T("সাইজ", "Size")}</th>
                        <th className="text-left py-1">{T("চেস্ট", "Chest")}</th>
                        <th className="text-left py-1">{T("লেংথ", "Length")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.available_sizes.map((s) => {
                        const chart = product.size_chart?.[s] || DEFAULT_SIZE_CHART[s];
                        return (
                          <tr key={s} className="border-t border-border/50">
                            <td className="py-1.5 font-bold">{s}</td>
                            <td className="py-1.5">{chart?.chest || "—"}</td>
                            <td className="py-1.5">{chart?.length || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Custom print */}
            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold mb-1.5 block">
                  {T("জার্সিতে নাম", "Name on Jersey")} *
                </label>
                <input
                  value={printName}
                  onChange={(e) => setPrintName(e.target.value.slice(0, 16))}
                  placeholder={T("যেমন: RAHIM", "e.g. RAHIM")}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background uppercase tracking-wider"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">
                  {T("নম্বর", "Number")}
                </label>
                <input
                  value={jerseyNumber}
                  onChange={(e) =>
                    setJerseyNumber(e.target.value.replace(/\D/g, "").slice(0, 2))
                  }
                  placeholder="10"
                  inputMode="numeric"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background font-mono text-center text-lg font-bold"
                />
              </div>
            </div>

            {/* Qty */}
            <div className="mb-5">
              <label className="text-sm font-semibold mb-1.5 block">
                {T("পরিমাণ", "Quantity")}
              </label>
              <div className="inline-flex items-center rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-2 hover:bg-muted font-bold"
                >
                  −
                </button>
                <span className="px-5 font-bold">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(20, qty + 1))}
                  className="px-4 py-2 hover:bg-muted font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Customer */}
            <div className="space-y-3 mb-5">
              <h4 className="font-display font-bold">{T("ডেলিভারি তথ্য", "Delivery Info")}</h4>
              <input
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder={T("আপনার নাম *", "Your name *")}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background"
              />
              <input
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                placeholder={T("ফোন নাম্বার *", "Phone number *")}
                inputMode="tel"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background"
              />
              <input
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                placeholder={T("ইমেইল (ঐচ্ছিক — অর্ডার আপডেট পেতে)", "Email (optional — for order updates)")}
                inputMode="email"
                type="email"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background"
              />
              <textarea
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                placeholder={T("সম্পূর্ণ ঠিকানা *", "Full delivery address *")}
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={T("অতিরিক্ত নোট (ঐচ্ছিক)", "Additional notes (optional)")}
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background"
              />
            </div>

            {/* Summary */}
            <div className="rounded-xl bg-muted p-4 mb-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span>{T("জার্সি", "Jersey")} × {qty}</span>
                <span className="font-mono">৳ {product.price * qty}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{T("ডেলিভারি চার্জ", "Delivery charge")}</span>
                <span className="font-mono">৳ {product.delivery_charge}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 mt-1.5 font-display font-bold text-base">
                <span>{T("মোট", "Total")}</span>
                <span className="text-primary">৳ {total}</span>
              </div>
            </div>

            {/* Payment method */}
            {product.cod_enabled && (
              <div className="mb-4">
                <label className="text-sm font-semibold mb-2 block">
                  {T("পেমেন্ট পদ্ধতি", "Payment Method")} *
                </label>
                <div className="grid sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("online")}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                  >
                    <p className="font-bold text-sm">{T("অনলাইন পেমেন্ট", "Online Payment")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{T("bKash / Nagad / ব্যাংক", "bKash / Nagad / Bank")}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                  >
                    <p className="font-bold text-sm">{T("ক্যাশ অন ডেলিভারি", "Cash on Delivery")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{T("পণ্য পেয়ে নগদে পরিশোধ", "Pay in cash on delivery")}</p>
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="mb-3 text-sm text-destructive font-medium text-center">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setStep(0)}
                disabled={creating}
                className="px-4 py-2.5 rounded-lg border border-border hover:bg-muted text-sm font-semibold inline-flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                {T("ফিরুন", "Back")}
              </button>
              <button
                onClick={submitOrder}
                disabled={creating}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-glow text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                {product.cod_enabled && paymentMethod === "cod"
                  ? T("অর্ডার নিশ্চিত করুন", "Confirm Order")
                  : T("পেমেন্টে যান", "Continue to Payment")}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: ticket-style slip + payment / COD confirmation */}
        {step === 2 && orderId && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center">
              <div className="inline-flex h-14 w-14 rounded-full bg-success/15 text-success items-center justify-center mb-3">
                <Check className="h-7 w-7" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-1">
                {T("অর্ডার সফল হয়েছে!", "Order Placed!")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {T(
                  "নিচের স্লিপ ডাউনলোড করে রাখুন — QR স্ক্যান করে স্ট্যাটাস দেখা যাবে।",
                  "Download this slip — scan the QR anytime to check status.",
                )}
              </p>
            </div>

            {trackingCode && product && (
              <OrderSlip
                kind="jersey"
                trackingCode={trackingCode}
                title={product.name}
                subtitle={`${printName}${jerseyNumber ? ` · #${jerseyNumber}` : ""}`}
                rows={[
                  { k: T("নাম", "Name"), v: customer.name },
                  { k: T("ফোন", "Phone"), v: customer.phone },
                  { k: T("সাইজ", "Size"), v: `${size} × ${qty}` },
                  { k: T("সর্বমোট", "Total"), v: `৳ ${orderAmount}` },
                  { k: T("পেমেন্ট", "Payment"), v: codSuccess ? "COD" : "Online" },
                ]}
                status={codSuccess ? "pending" : "pending"}
              />
            )}

            {codSuccess ? (
              <div className="rounded-2xl bg-card border border-border p-5 text-center shadow-card">
                <p className="text-sm text-muted-foreground mb-3">
                  {T(
                    "আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।",
                    "We'll contact you shortly to confirm.",
                  )}
                </p>
                <Link
                  to="/track-order"
                  search={{ code: trackingCode ?? undefined } as any}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-glow"
                >
                  <Search className="h-4 w-4" />
                  {T("অর্ডার ট্র্যাক করুন", "Track this order")}
                </Link>
              </div>
            ) : (
              <PaymentFlow
                submissionType="jersey"
                amount={orderAmount}
                jerseyOrderId={orderId}
              />
            )}
          </motion.div>
        )}
      </section>
    </div>
    </LoginGate>
  );
}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {T(
                    "আপনার ক্যাশ অন ডেলিভারি অর্ডার নেওয়া হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।",
                    "Your Cash on Delivery order has been received. We'll contact you shortly to confirm.",
                  )}
                </p>
                <div className="rounded-xl bg-muted p-4 inline-block text-left text-sm space-y-1.5">
                  <p>
                    <span className="text-muted-foreground">{T("অর্ডার আইডি", "Order ID")}:</span>{" "}
                    <button
                      onClick={() => navigator.clipboard?.writeText(orderId)}
                      className="font-mono font-bold text-xs break-all hover:text-primary"
                      title={T("কপি করুন", "Click to copy")}
                    >
                      {orderId}
                    </button>
                  </p>
                  <p><span className="text-muted-foreground">{T("পরিশোধযোগ্য", "Pay on delivery")}:</span> <span className="font-bold text-primary">৳ {orderAmount}</span></p>
                  <p className="text-xs text-muted-foreground pt-1 border-t border-border mt-2">
                    {T("এই আইডি সংরক্ষণ করুন। স্ট্যাটাস দেখতে পারবেন:", "Save this ID. Check status anytime at:")}
                  </p>
                </div>
                <div className="mt-4">
                  <a
                    href={`/track-order?id=${orderId}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-glow"
                  >
                    <Search className="h-4 w-4" />
                    {T("অর্ডার ট্র্যাক করুন", "Track this order")}
                  </a>
                </div>
              </div>
            ) : (
              <PaymentFlow
                submissionType="jersey"
                amount={orderAmount}
                jerseyOrderId={orderId}
              />
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
}
