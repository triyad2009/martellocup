import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { UserPlus, Check, X, Search, MessageCircle, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/friends")({
  component: FriendsPage,
});

type Profile = {
  user_id: string;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
};

type Friendship = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
};

function FriendsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"friends" | "admins" | "requests" | "search">("friends");
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [adminIds, setAdminIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const loadFriendships = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("friendships")
      .select("*")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
    setFriendships((data ?? []) as Friendship[]);
    const ids = new Set<string>();
    (data ?? []).forEach((f: Friendship) => {
      ids.add(f.requester_id);
      ids.add(f.receiver_id);
    });
    ids.delete(user.id);
    if (ids.size > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name, full_name, avatar_url, email")
        .in("user_id", Array.from(ids));
      const map: Record<string, Profile> = {};
      (profs ?? []).forEach((p: any) => { map[p.user_id] = p; });
      setProfiles((prev) => ({ ...prev, ...map }));
    }
  }, [user]);

  const loadAdmins = useCallback(async () => {
    if (!user) return;
    const { data } = await (supabase as any).rpc("list_admin_user_ids");
    const ids = ((data ?? []) as { user_id: string }[]).map((r) => r.user_id).filter((id) => id !== user.id);
    setAdminIds(ids);
    if (ids.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name, full_name, avatar_url, email")
        .in("user_id", ids);
      const map: Record<string, Profile> = {};
      (profs ?? []).forEach((p: any) => { map[p.user_id] = p; });
      setProfiles((prev) => ({ ...prev, ...map }));
    }
  }, [user]);

  useEffect(() => { loadFriendships(); loadAdmins(); }, [loadFriendships, loadAdmins]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("friendships-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => loadFriendships())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, loadFriendships]);

  const search = async () => {
    if (!query.trim() || !user) return;
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, full_name, avatar_url, email")
      .or(`display_name.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .neq("user_id", user.id)
      .limit(20);
    setSearchResults((data ?? []) as Profile[]);
  };

  const sendRequest = async (otherId: string) => {
    if (!user) return;
    setBusy(otherId);
    await supabase.from("friendships").insert({ requester_id: user.id, receiver_id: otherId, status: "pending" });
    await loadFriendships();
    setBusy(null);
  };

  const respond = async (id: string, status: "accepted" | "rejected") => {
    setBusy(id);
    if (status === "rejected") {
      await supabase.from("friendships").delete().eq("id", id);
    } else {
      await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
    }
    await loadFriendships();
    setBusy(null);
  };

  const openChat = async (otherId: string) => {
    const { data, error } = await supabase.rpc("get_or_create_conversation", { other_user: otherId });
    if (error || !data) { alert(error?.message ?? "Failed"); return; }
    navigate({ to: "/messages/$conversationId", params: { conversationId: data as string } });
  };

  if (loading || !user) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const accepted = friendships.filter((f) => f.status === "accepted");
  const incoming = friendships.filter((f) => f.status === "pending" && f.receiver_id === user.id);
  const outgoing = friendships.filter((f) => f.status === "pending" && f.requester_id === user.id);

  const friendshipFor = (otherId: string) => friendships.find((f) =>
    (f.requester_id === user.id && f.receiver_id === otherId) ||
    (f.receiver_id === user.id && f.requester_id === otherId)
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-red">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Friends</h1>
          <p className="text-sm text-muted-foreground">বন্ধু খুঁজুন, রিকুয়েস্ট পাঠান, চ্যাট শুরু করুন</p>
        </div>
      </motion.div>

      <div className="flex gap-1 p-1 rounded-xl bg-muted mb-4 overflow-x-auto">
        <TabBtn active={tab === "friends"} onClick={() => setTab("friends")} label={`Friends (${accepted.length})`} />
        <TabBtn active={tab === "admins"} onClick={() => setTab("admins")} label={`Admins (${adminIds.length})`} />
        <TabBtn active={tab === "requests"} onClick={() => setTab("requests")} label={`Requests (${incoming.length})`} />
        <TabBtn active={tab === "search"} onClick={() => setTab("search")} label="Find People" />
      </div>

      {tab === "admins" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2 px-1">
            🛡 এডমিনদের সাথে রিকুয়েস্ট ছাড়াই সরাসরি চ্যাট করা যাবে।
          </p>
          {adminIds.length === 0 && <Empty text="কোনো এডমিন নেই।" />}
          {adminIds.map((id) => {
            const p = profiles[id];
            return (
              <UserRow key={id} profile={p} otherId={id} badge="ADMIN"
                action={
                  <button onClick={() => openChat(id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow">
                    <MessageCircle className="h-4 w-4" /> Chat
                  </button>
                } />
            );
          })}
        </div>
      )}

      {tab === "friends" && (
        <div className="space-y-2">
          {accepted.length === 0 && <Empty text="এখনো কোনো বন্ধু নেই — Find People থেকে খুঁজুন।" />}
          {accepted.map((f) => {
            const otherId = f.requester_id === user.id ? f.receiver_id : f.requester_id;
            const p = profiles[otherId];
            return (
              <UserRow key={f.id} profile={p} otherId={otherId}
                action={
                  <button onClick={() => openChat(otherId)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow">
                    <MessageCircle className="h-4 w-4" /> Chat
                  </button>
                } />
            );
          })}
        </div>
      )}

      {tab === "requests" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-2">Incoming ({incoming.length})</h3>
            {incoming.length === 0 && <Empty text="কোনো নতুন রিকুয়েস্ট নেই।" />}
            {incoming.map((f) => {
              const p = profiles[f.requester_id];
              return (
                <UserRow key={f.id} profile={p} otherId={f.requester_id} action={
                  <div className="flex gap-1.5">
                    <button disabled={busy === f.id} onClick={() => respond(f.id, "accepted")} className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary-glow disabled:opacity-50">
                      <Check className="h-4 w-4" />
                    </button>
                    <button disabled={busy === f.id} onClick={() => respond(f.id, "rejected")} className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border hover:bg-muted disabled:opacity-50">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                } />
              );
            })}
          </div>
          {outgoing.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-muted-foreground mb-2 mt-4">Sent ({outgoing.length})</h3>
              {outgoing.map((f) => {
                const p = profiles[f.receiver_id];
                return <UserRow key={f.id} profile={p} otherId={f.receiver_id} action={<span className="text-xs text-muted-foreground italic">pending…</span>} />;
              })}
            </div>
          )}
        </div>
      )}

      {tab === "search" && (
        <div>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="নাম বা ইমেইল লিখুন..."
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button onClick={search} className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">Search</button>
          </div>
          <div className="space-y-2">
            {searchResults.length === 0 && query && <Empty text="কোনো ইউজার পাওয়া যায়নি।" />}
            {searchResults.map((p) => {
              const existing = friendshipFor(p.user_id);
              return (
                <UserRow key={p.user_id} profile={p} otherId={p.user_id} action={
                  existing ? (
                    existing.status === "accepted" ? (
                      <button onClick={() => openChat(p.user_id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                        <MessageCircle className="h-4 w-4" /> Chat
                      </button>
                    ) : <span className="text-xs text-muted-foreground italic">{existing.requester_id === user.id ? "sent" : "pending"}</span>
                  ) : (
                    <button disabled={busy === p.user_id} onClick={() => sendRequest(p.user_id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground disabled:opacity-50">
                      <UserPlus className="h-4 w-4" /> Add
                    </button>
                  )
                } />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`flex-1 min-w-fit px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${active ? "bg-background shadow-card text-primary" : "text-muted-foreground hover:text-foreground"}`}>
      {label}
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="py-8 text-center text-sm text-muted-foreground">{text}</div>;
}

function UserRow({ profile, otherId, action, badge }: { profile?: Profile; otherId: string; action: React.ReactNode; badge?: string }) {
  const name = profile?.display_name || profile?.full_name || profile?.email || "User";
  const initial = name[0]?.toUpperCase() ?? "U";
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt={name} className="h-11 w-11 rounded-full object-cover" />
      ) : (
        <div className="h-11 w-11 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold">{initial}</div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-sm truncate">{name}</p>
          {badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary tracking-wider">{badge}</span>}
        </div>
        <p className="text-xs text-muted-foreground truncate">{profile?.email ?? otherId.slice(0, 8)}</p>
      </div>
      {action}
    </div>
  );
}
