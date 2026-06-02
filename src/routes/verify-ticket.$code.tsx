import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Ticket, ScanLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useUserRoles } from "@/lib/roles";
import { toast } from "sonner";

export const Route = createFileRoute("/verify-ticket/$code")({
  component: VerifyTicketPage,
  head: ({ params }) => ({
    meta: [
      { title: `Verify Ticket ${params.code} · Martello Cup` },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Lookup = {
  id: string;
  ticket_code: string;
  payer_name: string;
  ticket_tier_name: string | null;
  amount: number | null;
  status: string;
  used_at: string | null;
  created_at: string;
};

function VerifyTicketPage() {
  const { code } = Route.useParams();
  const { user } = useAuth();
  const { isAdmin, has } = useUserRoles();
  const canRedeem =
    isAdmin || has("match_manager") || has("media_manager") || has("content_manager");

  const [ticket, setTicket] = useState<Lookup | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).rpc("lookup_ticket", { _code: code });
    if (error) {
      toast.error(error.message);
      setNotFound(true);
    } else if (!data || data.length === 0) {
      setNotFound(true);
    } else {
      setTicket(data[0] as Lookup);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [code]);

  const redeem = async () => {
    setRedeeming(true);
    const { data, error } = await (supabase as any).rpc("redeem_ticket", { _code: code });
    setRedeeming(false);
    if (error) { toast.error(error.message); return; }
    const r = data as any;
    if (r?.ok) {
      toast.success(`✅ Ticket accepted — ${r.payer_name}`);
      await load();
    } else if (r?.reason === "already_used") {
      toast.error(`⚠ Already used at ${new Date(r.used_at).toLocaleString()}`);
      await load();
    } else if (r?.reason === "not_found") {
      toast.error("Ticket not found");
    } else if (r?.reason === "not_approved") {
      toast.error(`Ticket is ${r.status}, not approved`);
    } else if (r?.reason === "forbidden") {
      toast.error("Not authorized — admin/moderator only");
    } else {
      toast.error("Cannot redeem ticket");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !ticket) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive mb-4">
          <XCircle className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">❌ Invalid Ticket</h1>
        <p className="text-muted-foreground text-sm mb-1">Code: <span className="font-mono">{code}</span></p>
        <p className="text-sm text-destructive font-semibold">This ticket does not exist in our system.</p>
      </div>
    );
  }

  const isUsed = !!ticket.used_at;
  const isApproved = ticket.status === "approved";
  const status: "valid" | "used" | "pending" | "rejected" = isUsed
    ? "used"
    : isApproved
    ? "valid"
    : (ticket.status as any);

  const palette = {
    valid: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/30", Icon: CheckCircle2, label: "VALID TICKET" },
    used: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/30", Icon: AlertTriangle, label: "ALREADY USED" },
    pending: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", Icon: Ticket, label: "PENDING APPROVAL" },
    rejected: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30", Icon: XCircle, label: "REJECTED" },
  }[status] ?? { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", Icon: Ticket, label: ticket.status.toUpperCase() };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border-2 ${palette.border} ${palette.bg} p-6 mb-5 text-center`}>
        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-card ${palette.text} mb-3`}>
          <palette.Icon className="h-9 w-9" />
        </div>
        <h1 className={`font-display text-2xl font-extrabold ${palette.text}`}>{palette.label}</h1>
        <p className="font-mono text-sm tracking-widest mt-1">{ticket.ticket_code}</p>
      </motion.div>

      <div className="rounded-2xl bg-card border border-border shadow-card p-5 space-y-3">
        <Row k="Holder" v={ticket.payer_name} />
        {ticket.ticket_tier_name && <Row k="Type" v={ticket.ticket_tier_name} />}
        {ticket.amount != null && <Row k="Amount" v={`৳ ${ticket.amount}`} />}
        <Row k="Issued" v={new Date(ticket.created_at).toLocaleString()} />
        {ticket.used_at && <Row k="Used at" v={new Date(ticket.used_at).toLocaleString()} />}
      </div>

      {canRedeem && isApproved && !isUsed && (
        <button
          onClick={redeem}
          disabled={redeeming}
          className="w-full mt-5 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow-red disabled:opacity-60"
        >
          {redeeming ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
          Mark as Used
        </button>
      )}

      {!user && (
        <p className="text-center text-xs text-muted-foreground mt-5">
          Admin/moderator? <Link to="/auth" className="text-primary font-semibold">Sign in</Link> to redeem.
        </p>
      )}

      {canRedeem && (
        <Link
          to="/scan-tickets"
          className="mt-3 w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:border-primary font-semibold text-sm"
        >
          <ScanLine className="h-4 w-4" /> Scan another ticket
        </Link>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-border text-sm last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold text-right truncate">{v}</span>
    </div>
  );
}
