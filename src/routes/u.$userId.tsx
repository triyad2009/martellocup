import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, User as UserIcon, MessageSquare, UserPlus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { renderMentions } from "@/components/MentionInput";
import { toast } from "sonner";

export const Route = createFileRoute("/u/$userId")({
  component: UserFeedPage,
});

type Profile = { user_id: string; display_name: string | null; avatar_url: string | null; email: string | null };

function UserFeedPage() {
  const { userId } = Route.useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ownPosts, setOwnPosts] = useState<any[]>([]);
  const [taggedPosts, setTaggedPosts] = useState<any[]>([]);
  const [tab, setTab] = useState<"own" | "tagged">("own");
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<"none" | "pending_out" | "pending_in" | "friends">("none");

  const load = async () => {
    setLoading(true);
    const [{ data: pr }, { data: own }, { data: tagged }] = await Promise.all([
      supabase.from("profiles").select("user_id,display_name,avatar_url,email").eq("user_id", userId).maybeSingle(),
      supabase.from("feed_posts").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("feed_posts").select("*").contains("tagged_user_ids", [userId]).order("created_at", { ascending: false }),
    ]);
    setProfile(pr as Profile);
    setOwnPosts(own ?? []);
    setTaggedPosts((tagged ?? []).filter((p: any) => p.user_id !== userId));

    if (user && user.id !== userId) {
      const { data: fr } = await supabase
        .from("friendships")
        .select("*")
        .or(`and(requester_id.eq.${user.id},receiver_id.eq.${userId}),and(requester_id.eq.${userId},receiver_id.eq.${user.id})`)
        .maybeSingle();
      if (!fr) setFriendStatus("none");
      else if (fr.status === "accepted") setFriendStatus("friends");
      else if (fr.requester_id === user.id) setFriendStatus("pending_out");
      else setFriendStatus("pending_in");
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId, user?.id]);

  const sendFriendReq = async () => {
    if (!user) return;
    const { error } = await supabase.from("friendships").insert({ requester_id: user.id, receiver_id: userId, status: "pending" });
    if (error) toast.error(error.message);
    else { toast.success("Friend request sent"); setFriendStatus("pending_out"); }
  };

  const startChat = async () => {
    if (!user) return;
    const { data, error } = await (supabase as any).rpc("get_or_create_conversation", { other_user: userId });
    if (error) { toast.error(error.message); return; }
    window.location.assign(`/messages/${data}`);
  };

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  if (!profile) return <div className="mx-auto max-w-md py-20 text-center text-muted-foreground">User not found.</div>;

  const name = profile.display_name || profile.email?.split("@")[0] || "User";
  const initial = name[0]?.toUpperCase() || "U";
  const isMe = user?.id === userId;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-10">
      <Link to="/feed" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="h-4 w-4" /> Feed
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-primary/15 via-amber-500/5 to-transparent border border-border p-5 mb-5 flex items-center gap-4">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-primary" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-gradient-primary text-white text-2xl font-bold flex items-center justify-center">{initial}</div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold truncate">{name}</h1>
          <p className="text-xs text-muted-foreground truncate">@{name.replace(/\s+/g, "_")}</p>
          <p className="text-xs text-muted-foreground mt-1">{ownPosts.length} posts · {taggedPosts.length} tagged</p>
        </div>
        {!isMe && user && (
          <div className="flex flex-col gap-1.5">
            {friendStatus === "friends" && (
              <button onClick={startChat} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" /> Message
              </button>
            )}
            {friendStatus === "none" && (
              <button onClick={sendFriendReq} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold inline-flex items-center gap-1">
                <UserPlus className="h-3.5 w-3.5" /> Add
              </button>
            )}
            {friendStatus === "pending_out" && (
              <span className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground inline-flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Requested
              </span>
            )}
            {friendStatus === "pending_in" && (
              <Link to="/friends" className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                Respond
              </Link>
            )}
          </div>
        )}
      </motion.div>

      <div className="flex gap-2 mb-4 border-b border-border">
        <TabBtn active={tab === "own"} onClick={() => setTab("own")} label={`Posts (${ownPosts.length})`} />
        <TabBtn active={tab === "tagged"} onClick={() => setTab("tagged")} label={`Tagged (${taggedPosts.length})`} />
      </div>

      <div className="space-y-4">
        {(tab === "own" ? ownPosts : taggedPosts).length === 0 ? (
          <p className="text-center text-muted-foreground py-10 text-sm">
            {tab === "own" ? "No posts yet." : "No tagged posts."}
          </p>
        ) : (
          (tab === "own" ? ownPosts : taggedPosts).map((p) => <MiniPost key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
      {label}
    </button>
  );
}

function MiniPost({ post }: { post: any }) {
  return (
    <article className="rounded-2xl bg-card border border-border overflow-hidden">
      {post.content && (
        <p className="px-4 pt-3 pb-2 text-sm whitespace-pre-wrap break-words">{renderMentions(post.content)}</p>
      )}
      {post.media_url && post.media_type === "image" && (
        <img src={post.media_url} alt="" className="w-full max-h-96 object-contain bg-muted" />
      )}
      {post.media_url && post.media_type === "video" && (
        <video src={post.media_url} controls className="w-full max-h-96 bg-black" />
      )}
      <p className="px-4 py-2 text-[11px] text-muted-foreground border-t border-border">{new Date(post.created_at).toLocaleString()}</p>
    </article>
  );
}
