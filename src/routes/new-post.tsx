import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Image as ImageIcon, Video, X, Loader2, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { uploadMedia } from "@/lib/content";
import { toast } from "sonner";

export const Route = createFileRoute("/new-post")({
  component: NewPostPage,
  head: () => ({
    meta: [
      { title: "নতুন পোস্ট · New Post · Martello Cup" },
      { name: "description", content: "Create a new post for the Martello Cup community feed." },
    ],
  }),
});

function NewPostPage() {
  const { user, loading } = useAuth();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"text" | "image" | "video">("text");
  const [busy, setBusy] = useState(false);
  const [posting, setPosting] = useState(false);

  const tt = (bn: string, en: string) => (lang === "en" ? en : bn);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  }

  const pickFile = async (file: File, type: "image" | "video") => {
    setBusy(true);
    try {
      const url = await uploadMedia(file, "feed");
      setMediaUrl(url); setMediaType(type);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async () => {
    if (!text.trim() && !mediaUrl) {
      toast.error(tt("কিছু লিখুন বা মিডিয়া যোগ করুন", "Write something or add media"));
      return;
    }
    setPosting(true);
    const { error } = await supabase.from("feed_posts").insert({
      user_id: user.id,
      content: text.trim() || null,
      media_url: mediaUrl,
      media_type: mediaUrl ? mediaType : "text",
      caption: mediaUrl ? (caption.trim() || null) : null,
    });
    setPosting(false);
    if (error) toast.error(error.message);
    else {
      toast.success(tt("পোস্ট হয়েছে!", "Posted!"));
      navigate({ to: "/feed" });
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-5">
        <Link to="/feed" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> {tt("ফিডে ফিরুন", "Back to Feed")}
        </Link>
        <button
          onClick={submit}
          disabled={posting || busy}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-glow-red disabled:opacity-50"
        >
          {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {tt("পোস্ট", "Post")}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border shadow-elevated overflow-hidden"
      >
        <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 via-amber-500/5 to-transparent flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold shadow-glow-red">
            {(user.user_metadata?.display_name || user.email || "U")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm">
              {user.user_metadata?.display_name || user.email}
            </p>
            <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" /> {tt("নতুন পোস্ট তৈরি", "Creating a new post")}
            </p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={tt("কী চলছে আজ? লিংক দিলে সেটা সুন্দর প্রিভিউ হিসেবে দেখাবে...", "What's happening? Paste a link and it'll show as a preview...")}
            rows={6}
            autoFocus
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary text-base"
          />

          {mediaUrl && (
            <div className="relative rounded-xl overflow-hidden border border-border">
              {mediaType === "image" ? (
                <img src={mediaUrl} alt="" className="w-full max-h-96 object-contain bg-muted" />
              ) : (
                <video src={mediaUrl} controls className="w-full max-h-96 bg-black" />
              )}
              {caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 to-transparent p-3 text-white text-sm pointer-events-none">
                  {caption}
                </div>
              )}
              <button
                type="button"
                onClick={() => { setMediaUrl(null); setCaption(""); setMediaType("text"); }}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white inline-flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {mediaUrl && (
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={tt("ছবি/ভিডিওর ক্যাপশন (অপশনাল)", "Caption for the media (optional)")}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm"
            />
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const isVideo = f.type.startsWith("video/");
              pickFile(f, isVideo ? "video" : "image");
            }}
          />

          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
            <span className="text-xs font-semibold text-muted-foreground mr-1">
              {tt("যোগ করুন:", "Add:")}
            </span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background hover:border-primary text-sm font-semibold disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4 text-primary" />}
              {tt("ছবি", "Photo")}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background hover:border-primary text-sm font-semibold disabled:opacity-60"
            >
              <Video className="h-4 w-4 text-primary" />
              {tt("ভিডিও", "Video")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
