import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Heart, Send, Loader2, Trash2, MailWarning, LogIn, Plus, ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useUserRoles } from "@/lib/roles";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/feed")({
  component: FeedPage,
  head: () => ({
    meta: [
      { title: "ফিড · Feed · Martello Cup" },
      { name: "description", content: "Martello Cup community social feed — share photos, videos and updates." },
    ],
  }),
});

function tt(lang: string, bn: string, en: string, sat?: string) {
  if (lang === "en") return en;
  if (lang === "sat") return sat ?? bn;
  return bn;
}

function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useUserRoles();
  const { lang } = useI18n();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  const emailVerified = user?.email_confirmed_at != null || (user as any)?.confirmed_at != null;

  const loadPosts = async () => {
    setLoading(true);
    const { data: ps } = await supabase.from("feed_posts").select("*").order("created_at", { ascending: false });
    setPosts(ps ?? []);
    const ids = Array.from(new Set((ps ?? []).map((p: any) => p.user_id)));
    if (ids.length) {
      const { data: prof } = await supabase.from("profiles").select("*").in("user_id", ids);
      const map: Record<string, any> = {};
      (prof ?? []).forEach((p: any) => { map[p.user_id] = p; });
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => { if (user && emailVerified) loadPosts(); }, [user, emailVerified]);

  if (authLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
      <Gate
        icon={<LogIn className="h-7 w-7 text-white" />}
        title={tt(lang, "ফিড দেখতে লগইন করুন", "Sign in to view the feed", "ফিড দ্যাখতে লগইন কইরো")}
        desc={tt(lang, "একাউন্ট তৈরি করুন বা লগইন করুন", "Create an account or sign in to participate")}
        cta={tt(lang, "লগইন / সাইন আপ", "Sign In / Sign Up")}
      />
    );
  }

  if (!emailVerified) {
    return (
      <Gate
        icon={<MailWarning className="h-7 w-7 text-white" />}
        title={tt(lang, "ইমেইল ভেরিফাই করুন", "Verify your email")}
        desc={tt(lang, "আপনার ইমেইলে পাঠানো লিংকে ক্লিক করে ভেরিফিকেশন সম্পন্ন করুন।", "Please confirm your email via the link we sent, then return to this page.")}
      >
        <button
          onClick={async () => {
            const { error } = await supabase.auth.resend({ type: "signup", email: user.email! });
            if (error) toast.error(error.message);
            else toast.success(tt(lang, "ইমেইল আবার পাঠানো হয়েছে", "Verification email resent"));
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-glow-red"
        >
          {tt(lang, "ইমেইল আবার পাঠান", "Resend Verification Email")}
        </button>
      </Gate>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow-red">
          <MessageSquare className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            {tt(lang, "কমিউনিটি ফিড", "Community Feed", "আঁলাপ-ঘর")}
          </h1>
          <p className="text-xs text-muted-foreground">{tt(lang, "ছবি, ভিডিও বা লেখা শেয়ার করুন", "Share photos, videos and updates")}</p>
        </div>
      </div>

      <Link
        to="/new-post"
        className="flex items-center gap-3 rounded-2xl bg-card border border-border shadow-card p-4 hover:border-primary hover:shadow-glow-red transition-all group"
      >
        <div className="h-11 w-11 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold shadow-glow-red shrink-0">
          {(user.user_metadata?.display_name || user.email || "U")[0].toUpperCase()}
        </div>
        <div className="flex-1 px-4 py-2.5 rounded-full bg-muted text-muted-foreground text-sm group-hover:bg-background group-hover:text-foreground transition-colors">
          {tt(lang, "মনের কথা শেয়ার করুন...", "Share what's on your mind...")}
        </div>
        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-glow-red">
          <Plus className="h-5 w-5" />
        </div>
      </Link>

      {loading ? (
        <Loader2 className="h-7 w-7 animate-spin text-primary mx-auto" />
      ) : posts.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">{tt(lang, "এখনো কোনো পোস্ট নেই — প্রথমটি আপনি করুন!", "No posts yet — be the first!")}</p>
      ) : (
        posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            author={profiles[p.user_id]}
            currentUserId={user.id}
            isAdmin={isAdmin}
            lang={lang}
            onChanged={loadPosts}
          />
        ))
      )}
    </div>
  );
}

function Gate({
  icon, title, desc, cta, children,
}: {
  icon: React.ReactNode; title: string; desc: string; cta?: string; children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow-red mb-4">{icon}</div>
      <h1 className="font-display text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground text-sm mb-5">{desc}</p>
      {cta && (
        <Link to="/auth" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-glow-red">
          <LogIn className="h-4 w-4" /> {cta}
        </Link>
      )}
      {children}
    </div>
  );
}

// Detect URLs in text and render them as link previews / images.
const URL_RE = /(https?:\/\/[^\s<>"]+)/g;
function isImageUrl(u: string) {
  return /\.(png|jpe?g|gif|webp|svg|avif)(\?|#|$)/i.test(u);
}
function hostnameOf(u: string) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } }

function RichContent({ text }: { text: string }) {
  const parts = text.split(URL_RE);
  const urls = text.match(URL_RE) || [];
  return (
    <>
      <p className="px-4 pb-2 whitespace-pre-wrap text-sm break-words">
        {parts.map((p, i) =>
          URL_RE.test(p) ? (
            <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{p}</a>
          ) : (
            <span key={i}>{p}</span>
          )
        )}
      </p>
      {urls.length > 0 && (
        <div className="px-4 pb-3 space-y-2">
          {urls.slice(0, 3).map((u, i) =>
            isImageUrl(u) ? (
              <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-border bg-muted">
                <img src={u} alt="" className="w-full max-h-80 object-contain" />
              </a>
            ) : (
              <a
                key={i}
                href={u}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 hover:bg-muted hover:border-primary p-3 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{hostnameOf(u)}</p>
                  <p className="text-sm font-semibold truncate">{u}</p>
                </div>
              </a>
            )
          )}
        </div>
      )}
    </>
  );
}

function PostCard({
  post, author, currentUserId, isAdmin, lang, onChanged,
}: {
  post: any; author: any; currentUserId: string; isAdmin: boolean; lang: string; onChanged: () => void;
}) {
  const [likes, setLikes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [busy, setBusy] = useState(false);
  const [commentProfiles, setCommentProfiles] = useState<Record<string, any>>({});

  const load = async () => {
    const [{ data: ls }, { data: cs }] = await Promise.all([
      supabase.from("feed_likes").select("*").eq("post_id", post.id),
      supabase.from("feed_comments").select("*").eq("post_id", post.id).order("created_at", { ascending: true }),
    ]);
    setLikes(ls ?? []);
    setComments(cs ?? []);
    const ids = Array.from(new Set((cs ?? []).map((c: any) => c.user_id)));
    if (ids.length) {
      const { data: prof } = await supabase.from("profiles").select("*").in("user_id", ids);
      const map: Record<string, any> = {};
      (prof ?? []).forEach((p: any) => { map[p.user_id] = p; });
      setCommentProfiles(map);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [post.id]);

  const liked = likes.some((l) => l.user_id === currentUserId);

  const toggleLike = async () => {
    if (busy) return;
    setBusy(true);
    if (liked) {
      await supabase.from("feed_likes").delete().eq("post_id", post.id).eq("user_id", currentUserId);
    } else {
      await supabase.from("feed_likes").insert({ post_id: post.id, user_id: currentUserId });
    }
    await load();
    setBusy(false);
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    const { error } = await supabase.from("feed_comments").insert({
      post_id: post.id, user_id: currentUserId, content: commentText.trim(),
    });
    if (error) toast.error(error.message);
    else { setCommentText(""); load(); }
  };

  const deletePost = async () => {
    if (!confirm(tt(lang, "এই পোস্ট মুছবেন?", "Delete this post?"))) return;
    const { error } = await supabase.from("feed_posts").delete().eq("id", post.id);
    if (error) toast.error(error.message);
    else { toast.success(tt(lang, "মুছে ফেলা হয়েছে", "Deleted")); onChanged(); }
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from("feed_comments").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  const authorName = author?.display_name || author?.email?.split("@")[0] || "User";
  const authorInitial = authorName[0]?.toUpperCase() || "U";
  const canDelete = isAdmin || post.user_id === currentUserId;

  return (
    <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        {author?.avatar_url ? (
          <img src={author.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold">{authorInitial}</div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{authorName}</p>
          <p className="text-[11px] text-muted-foreground">{new Date(post.created_at).toLocaleString()}</p>
        </div>
        {canDelete && (
          <button onClick={deletePost} className="p-2 text-destructive hover:bg-destructive/10 rounded-md" aria-label="Delete post">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {post.content && <RichContent text={post.content} />}

      {post.media_url && post.media_type === "image" && (
        <div className="relative bg-muted">
          <img src={post.media_url} alt="" className="w-full max-h-[600px] object-contain" />
          {post.caption && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-sm">
              {post.caption}
            </div>
          )}
        </div>
      )}
      {post.media_url && post.media_type === "video" && (
        <div className="relative bg-black">
          <video src={post.media_url} controls className="w-full max-h-[600px]" />
          {post.caption && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-sm pointer-events-none">
              {post.caption}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 px-4 py-3 border-t border-border">
        <button
          onClick={toggleLike}
          className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${liked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} /> {likes.length}
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <MessageSquare className="h-4 w-4" /> {comments.length}
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border bg-muted/20"
          >
            <div className="p-4 space-y-3">
              {comments.length === 0 && (
                <p className="text-xs text-muted-foreground text-center">{tt(lang, "এখনো কোনো কমেন্ট নেই", "No comments yet")}</p>
              )}
              {comments.map((c) => {
                const cp = commentProfiles[c.user_id];
                const cn = cp?.display_name || cp?.email?.split("@")[0] || "User";
                const ci = cn[0]?.toUpperCase() || "U";
                const canDelC = isAdmin || c.user_id === currentUserId;
                return (
                  <div key={c.id} className="flex items-start gap-2">
                    {cp?.avatar_url ? (
                      <img src={cp.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-gradient-primary text-white text-xs flex items-center justify-center font-bold">{ci}</div>
                    )}
                    <div className="flex-1 min-w-0 rounded-lg bg-card border border-border px-3 py-2">
                      <p className="text-xs font-semibold">{cn}</p>
                      <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                    </div>
                    {canDelC && (
                      <button onClick={() => deleteComment(c.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded" aria-label="Delete comment">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center gap-2 pt-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addComment(); }}
                  placeholder={tt(lang, "কমেন্ট লিখুন...", "Write a comment...")}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
                <button onClick={addComment} className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-primary text-primary-foreground">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
