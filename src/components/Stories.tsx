import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { uploadMedia } from "@/lib/content";
import { toast } from "sonner";

type Story = {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  expires_at: string;
};

type Profile = { user_id: string; display_name: string | null; avatar_url: string | null; email: string | null };

export function StoriesBar() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [openUser, setOpenUser] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("stories")
      .select("*")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    const list = (data ?? []) as Story[];
    setStories(list);
    const ids = Array.from(new Set(list.map((s) => s.user_id)));
    if (ids.length) {
      const { data: pr } = await supabase.from("profiles").select("user_id,display_name,avatar_url,email").in("user_id", ids);
      const map: Record<string, Profile> = {};
      (pr ?? []).forEach((p: any) => { map[p.user_id] = p; });
      setProfiles(map);
    } else { setProfiles({}); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  // Group by user (latest 1 cover per user; viewer cycles all of their stories)
  const grouped: { user_id: string; latest: Story; all: Story[] }[] = [];
  const seen = new Set<string>();
  for (const s of stories) {
    if (seen.has(s.user_id)) continue;
    seen.add(s.user_id);
    grouped.push({ user_id: s.user_id, latest: s, all: stories.filter((x) => x.user_id === s.user_id) });
  }

  const handleUpload = async (f: File | null) => {
    if (!f || !user) return;
    setUploading(true);
    try {
      const url = await uploadMedia(f, "stories");
      const type = f.type.startsWith("video/") ? "video" : "image";
      const { error } = await supabase.from("stories").insert({ user_id: user.id, media_url: url, media_type: type });
      if (error) throw error;
      toast.success("Story posted!");
      await load();
    } catch (e: any) { toast.error(e.message || "Upload failed"); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (!user) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-3 overflow-hidden">
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {/* My story / add */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center gap-1 shrink-0 group"
        >
          <div className="relative h-16 w-16 rounded-full ring-2 ring-dashed ring-primary p-0.5 group-hover:scale-105 transition-transform">
            <div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <Plus className="h-6 w-6 text-primary" />}
            </div>
          </div>
          <span className="text-[10px] font-semibold truncate max-w-[64px]">Your story</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
        />

        {grouped.map(({ user_id, latest }) => {
          const p = profiles[user_id];
          const name = p?.display_name || p?.email?.split("@")[0] || "User";
          return (
            <button
              key={user_id}
              onClick={() => setOpenUser(user_id)}
              className="flex flex-col items-center gap-1 shrink-0 group"
            >
              <div className="relative h-16 w-16 rounded-full bg-gradient-to-tr from-primary via-amber-500 to-pink-500 p-[2px] group-hover:scale-105 transition-transform">
                <div className="h-full w-full rounded-full bg-card p-[2px] overflow-hidden">
                  {latest.media_type === "video" ? (
                    <video src={latest.media_url} className="h-full w-full object-cover rounded-full" muted />
                  ) : (
                    <img src={latest.media_url} alt="" className="h-full w-full object-cover rounded-full" />
                  )}
                </div>
              </div>
              <span className="text-[10px] font-semibold truncate max-w-[64px]">{name}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {openUser && (
          <StoryViewer
            stories={stories.filter((s) => s.user_id === openUser)}
            profile={profiles[openUser]}
            onClose={() => setOpenUser(null)}
            onNextUser={() => {
              const idx = grouped.findIndex((g) => g.user_id === openUser);
              const next = grouped[idx + 1];
              setOpenUser(next ? next.user_id : null);
            }}
            onPrevUser={() => {
              const idx = grouped.findIndex((g) => g.user_id === openUser);
              const prev = grouped[idx - 1];
              if (prev) setOpenUser(prev.user_id);
            }}
            currentUserId={user.id}
            onDeleted={load}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StoryViewer({
  stories, profile, onClose, onNextUser, onPrevUser, currentUserId, onDeleted,
}: {
  stories: Story[]; profile?: Profile;
  onClose: () => void; onNextUser: () => void; onPrevUser: () => void;
  currentUserId: string; onDeleted: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const current = stories[idx];
  const isVideo = current?.media_type === "video";

  useEffect(() => {
    if (isVideo) return; // video auto-advances via onEnded
    setProgress(0);
    const start = Date.now();
    const dur = 5000;
    const t = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setProgress(p);
      if (p >= 1) {
        clearInterval(t);
        if (idx < stories.length - 1) setIdx(idx + 1);
        else onNextUser();
      }
    }, 50);
    return () => clearInterval(t);
  }, [idx, isVideo, stories.length]);

  if (!current) return null;
  const name = profile?.display_name || profile?.email?.split("@")[0] || "User";
  const canDelete = current.user_id === currentUserId;

  const advance = () => idx < stories.length - 1 ? setIdx(idx + 1) : onNextUser();
  const back = () => idx > 0 ? setIdx(idx - 1) : onPrevUser();

  const deleteStory = async () => {
    if (!confirm("Delete this story?")) return;
    const { error } = await supabase.from("stories").delete().eq("id", current.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); onDeleted(); onClose(); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      <div className="relative w-full max-w-md h-full sm:max-h-[90vh] sm:h-[90vh] sm:rounded-2xl overflow-hidden bg-black">
        {/* Progress bars */}
        <div className="absolute top-2 inset-x-2 z-20 flex gap-1">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white transition-all" style={{
                width: i < idx ? "100%" : i === idx ? `${progress * 100}%` : "0%",
              }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-5 inset-x-3 z-20 flex items-center gap-2 text-white">
          <Link to="/u/$userId" params={{ userId: current.user_id }} className="flex items-center gap-2 min-w-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-primary text-white text-xs flex items-center justify-center font-bold">{name[0]?.toUpperCase()}</div>
            )}
            <span className="font-semibold text-sm truncate">{name}</span>
            <span className="text-xs opacity-70">{new Date(current.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {canDelete && (
              <button onClick={deleteStory} className="p-2 rounded-full bg-black/30 hover:bg-black/60" aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-full bg-black/30 hover:bg-black/60" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Media */}
        <div className="h-full w-full flex items-center justify-center">
          {isVideo ? (
            <video
              key={current.id}
              src={current.media_url}
              autoPlay playsInline controls={false}
              onEnded={advance}
              className="max-h-full max-w-full"
            />
          ) : (
            <img src={current.media_url} alt="" className="max-h-full max-w-full object-contain" />
          )}
        </div>

        {/* Caption */}
        {current.caption && (
          <div className="absolute bottom-6 inset-x-4 text-center text-white text-sm bg-black/40 backdrop-blur px-3 py-2 rounded-xl">
            {current.caption}
          </div>
        )}

        {/* Tap zones */}
        <button onClick={back} className="absolute left-0 top-0 bottom-0 w-1/3 z-10" aria-label="Previous">
          <ChevronLeft className="h-6 w-6 text-white/0" />
        </button>
        <button onClick={advance} className="absolute right-0 top-0 bottom-0 w-2/3 z-10" aria-label="Next">
          <ChevronRight className="h-6 w-6 text-white/0" />
        </button>
      </div>
    </motion.div>
  );
}
