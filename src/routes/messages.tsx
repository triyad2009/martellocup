import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/messages")({
  component: MessagesListPage,
});

type Conv = {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
};

type Profile = {
  user_id: string;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
};

function MessagesListPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [lastMsgs, setLastMsgs] = useState<Record<string, { content: string | null; media_type: string }>>({});

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false });
    const list = (data ?? []) as Conv[];
    setConvs(list);

    const otherIds = list.map((c) => c.user1_id === user.id ? c.user2_id : c.user1_id);
    if (otherIds.length > 0) {
      const { data: profs } = await supabase.from("profiles")
        .select("user_id, display_name, full_name, avatar_url, email").in("user_id", otherIds);
      const map: Record<string, Profile> = {};
      (profs ?? []).forEach((p: any) => { map[p.user_id] = p; });
      setProfiles(map);
    }

    // last messages
    if (list.length > 0) {
      const convIds = list.map((c) => c.id);
      const { data: msgs } = await supabase.from("messages")
        .select("conversation_id, content, media_type, created_at")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false });
      const lm: Record<string, { content: string | null; media_type: string }> = {};
      (msgs ?? []).forEach((m: any) => {
        if (!lm[m.conversation_id]) lm[m.conversation_id] = { content: m.content, media_type: m.media_type };
      });
      setLastMsgs(lm);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("conv-list-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => load())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, load]);

  if (loading || !user) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-red">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Messages</h1>
            <p className="text-sm text-muted-foreground">আপনার চ্যাট</p>
          </div>
        </div>
        <Link to="/friends" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-semibold hover:border-primary">
          <Users className="h-4 w-4" /> Friends
        </Link>
      </motion.div>

      {convs.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground mb-3">এখনো কোনো চ্যাট নেই।</p>
          <Link to="/friends" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold">
            <Users className="h-4 w-4" /> Find Friends
          </Link>
        </div>
      )}

      <div className="space-y-1">
        {convs.map((c) => {
          const otherId = c.user1_id === user.id ? c.user2_id : c.user1_id;
          const p = profiles[otherId];
          const name = p?.display_name || p?.full_name || p?.email || "User";
          const lm = lastMsgs[c.id];
          const preview = lm
            ? (lm.media_type === "text" ? (lm.content ?? "") : `📎 ${lm.media_type}`)
            : "";
          return (
            <Link key={c.id} to="/messages/$conversationId" params={{ conversationId: c.id }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
              {p?.avatar_url
                ? <img src={p.avatar_url} alt={name} className="h-12 w-12 rounded-full object-cover" />
                : <div className="h-12 w-12 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold">{name[0]?.toUpperCase()}</div>}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm truncate">{name}</p>
                  <p className="text-[10px] text-muted-foreground shrink-0">{formatDistanceToNow(new Date(c.last_message_at), { addSuffix: false })}</p>
                </div>
                <p className="text-xs text-muted-foreground truncate">{preview || "নতুন চ্যাট"}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
