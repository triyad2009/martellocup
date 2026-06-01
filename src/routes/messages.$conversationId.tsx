import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Send, Paperclip, Mic, Image as ImageIcon, Video as VideoIcon, Square, Loader2, X, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/messages/$conversationId")({
  component: ChatThreadPage,
});

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  media_url: string | null;
  media_type: "text" | "image" | "video" | "audio" | "file";
  file_name: string | null;
  created_at: string;
};

type Profile = {
  user_id: string;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
};

function ChatThreadPage() {
  const { conversationId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [other, setOther] = useState<Profile | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Voice recording state
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data: conv } = await supabase.from("conversations").select("*").eq("id", conversationId).maybeSingle();
    if (!conv) { navigate({ to: "/messages" }); return; }
    const otherId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
    const { data: prof } = await supabase.from("profiles")
      .select("user_id, display_name, full_name, avatar_url, email").eq("user_id", otherId).maybeSingle();
    setOther(prof as Profile | null);

    const { data: msgs } = await supabase.from("messages").select("*")
      .eq("conversation_id", conversationId).order("created_at", { ascending: true });
    setMessages((msgs ?? []) as Message[]);
  }, [conversationId, user, navigate]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel(`chat-${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => { setMessages((prev) => [...prev, payload.new as Message]); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [conversationId, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendText = async () => {
    if (!text.trim() || !user || sending) return;
    setSending(true);
    const body = text.trim();
    setText("");
    await supabase.from("messages").insert({
      conversation_id: conversationId, sender_id: user.id,
      content: body, media_type: "text",
    });
    setSending(false);
  };

  const uploadAndSend = async (file: Blob, mediaType: Message["media_type"], fileName?: string) => {
    if (!user) return;
    setUploading(true);
    try {
      const ext = fileName?.split(".").pop() ?? (mediaType === "audio" ? "webm" : "bin");
      const path = `${user.id}/chat/${conversationId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      await supabase.from("messages").insert({
        conversation_id: conversationId, sender_id: user.id,
        media_url: pub.publicUrl, media_type: mediaType, file_name: fileName ?? null,
      });
    } catch (e: any) {
      alert(`Upload failed: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>, kind: "image" | "video" | "file") => {
    const f = e.target.files?.[0];
    if (!f) return;
    e.target.value = "";
    uploadAndSend(f, kind, f.name);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadAndSend(blob, "audio", `voice-${Date.now()}.webm`);
      };
      mr.start();
      recorderRef.current = mr;
      setRecording(true);
      setRecordTime(0);
      recordTimerRef.current = window.setInterval(() => setRecordTime((t) => t + 1), 1000);
    } catch (e: any) {
      alert(`Microphone access denied: ${e.message}`);
    }
  };

  const stopRecording = (cancel = false) => {
    if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      if (cancel) { chunksRef.current = []; recorderRef.current.onstop = () => recorderRef.current?.stream.getTracks().forEach((t) => t.stop()); }
      recorderRef.current.stop();
    }
    setRecording(false);
  };

  if (loading || !user) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const otherName = other?.display_name || other?.full_name || other?.email || "User";

  return (
    <div className="fixed inset-x-0 top-16 bottom-0 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2.5 border-b border-border bg-card/80 backdrop-blur-md">
        <Link to="/messages" className="p-1.5 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {other?.avatar_url
          ? <img src={other.avatar_url} alt={otherName} className="h-10 w-10 rounded-full object-cover" />
          : <div className="h-10 w-10 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold">{otherName[0]?.toUpperCase()}</div>}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{otherName}</p>
          <p className="text-xs text-muted-foreground">{other?.email}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-12">কথা শুরু করুন 👋</div>
        )}
        {messages.map((m) => {
          const own = m.sender_id === user.id;
          return (
            <div key={m.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-2xl px-3 py-2 ${own ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
                {m.media_type === "text" && <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>}
                {m.media_type === "image" && m.media_url && (
                  <img src={m.media_url} alt="" className="rounded-lg max-h-72 max-w-full" />
                )}
                {m.media_type === "video" && m.media_url && (
                  <video src={m.media_url} controls className="rounded-lg max-h-72 max-w-full" />
                )}
                {m.media_type === "audio" && m.media_url && (
                  <audio src={m.media_url} controls className="max-w-full" />
                )}
                {m.media_type === "file" && m.media_url && (
                  <a href={m.media_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm underline">
                    <Paperclip className="h-4 w-4" /> {m.file_name ?? "Download file"}
                  </a>
                )}
                <p className={`text-[10px] mt-1 ${own ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-card p-2 safe-bottom">
        {uploading && (
          <div className="flex items-center gap-2 px-2 pb-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
          </div>
        )}
        {recording ? (
          <div className="flex items-center gap-2 px-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-full bg-destructive/10 border border-destructive/30">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-mono">{Math.floor(recordTime / 60)}:{String(recordTime % 60).padStart(2, "0")}</span>
              <span className="text-xs text-muted-foreground">Recording...</span>
            </div>
            <button onClick={() => stopRecording(true)} className="h-10 w-10 rounded-full border border-border flex items-center justify-center" aria-label="Cancel">
              <X className="h-5 w-5" />
            </button>
            <button onClick={() => stopRecording(false)} className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-glow-red" aria-label="Send voice">
              <Send className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-1.5">
            <div className="flex items-center">
              <button onClick={() => imgInputRef.current?.click()} className="h-10 w-10 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground" aria-label="Image">
                <ImageIcon className="h-5 w-5" />
              </button>
              <button onClick={() => videoInputRef.current?.click()} className="h-10 w-10 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground" aria-label="Video">
                <VideoIcon className="h-5 w-5" />
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="h-10 w-10 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground" aria-label="File">
                <Paperclip className="h-5 w-5" />
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(); } }}
              placeholder="Aa"
              rows={1}
              className="flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary max-h-32"
            />
            {text.trim() ? (
              <button onClick={sendText} disabled={sending} className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-glow-red disabled:opacity-50" aria-label="Send">
                <Send className="h-5 w-5" />
              </button>
            ) : (
              <button onClick={startRecording} className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-glow-red" aria-label="Voice">
                <Mic className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e, "image")} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => onFile(e, "video")} />
        <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => onFile(e, "file")} />
      </div>
    </div>
  );
}
