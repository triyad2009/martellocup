import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  MessageCircle,
  Brain,
  Target,
  Gamepad2,
  Crown,
  Calendar,
  Loader2,
  Send,
  Upload,
  Check,
  X,
  Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { WC_COUNTRIES, findCountry } from "@/lib/fifa-countries";
import { getWorldCupFixtures, getLiveWorldCupScores, type WCMatch } from "@/lib/fifa.functions";

type Participant = {
  user_id: string;
  display_name: string;
  country_code: string;
  country_name: string;
  flag_emoji: string | null;
  photo_url: string | null;
  total_points: number;
};

type ChatMessage = {
  id: string;
  user_id: string;
  display_name: string;
  country_code: string;
  country_name: string;
  flag_emoji: string | null;
  photo_url: string | null;
  message: string;
  created_at: string;
};

type Tab = "fixtures" | "debate" | "quiz" | "predict" | "game" | "leaderboard";

export function FifaHub() {
  const { user } = useAuth();
  const { lang } = useI18n();
  const T = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const [tab, setTab] = useState<Tab>("fixtures");
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loadingParticipant, setLoadingParticipant] = useState(true);

  const loadMe = async () => {
    if (!user) {
      setLoadingParticipant(false);
      return;
    }
    const { data } = await supabase
      .from("wc_participants")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setParticipant(data as Participant | null);
    setLoadingParticipant(false);
  };

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "fixtures", label: T("ফিক্সচার", "Fixtures"), icon: Calendar },
    { id: "debate", label: T("ডিবেট চ্যাট", "Debate"), icon: MessageCircle },
    { id: "quiz", label: T("কুইজ", "Quiz"), icon: Brain },
    { id: "predict", label: T("প্রেডিক্ট", "Predict"), icon: Target },
    { id: "game", label: T("পেনাল্টি", "Game"), icon: Gamepad2 },
    { id: "leaderboard", label: T("লিডারবোর্ড", "Leaderboard"), icon: Crown },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-amber-700/20 to-slate-900" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <Trophy className="h-[500px] w-[500px] text-amber-500/20" />
        </motion.div>
        <div className="relative max-w-6xl mx-auto px-4 py-10 sm:py-14 text-center">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-widest mb-3">
              <Zap className="h-3 w-3" /> FIFA WORLD CUP 2026
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-300 bg-clip-text text-transparent">
              {T("বিশ্বকাপ আড্ডা", "WORLD CUP HUB")}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/70 max-w-2xl mx-auto">
              {T(
                "লাইভ স্কোর, ডিবেট চ্যাট, কুইজ, প্রেডিকশন আর পেনাল্টি গেম — সব এক জায়গায়।",
                "Live scores, debate chat, quiz, predictions and penalty game — all in one place.",
              )}
            </p>
          </motion.div>

          {participant && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20"
            >
              <span className="text-2xl">{participant.flag_emoji}</span>
              <div className="text-left">
                <div className="text-xs text-white/60">{T("আপনি", "You")}</div>
                <div className="font-bold text-sm">{participant.display_name}</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-amber-300 font-display font-black text-xl">
                {participant.total_points}
                <span className="text-xs text-white/60 font-normal ml-1">pts</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-slate-950/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-2 overflow-x-auto">
          <div className="flex gap-1 py-2 min-w-max">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition ${
                    active ? "text-amber-300" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                  {active && (
                    <motion.span
                      layoutId="fifa-tab"
                      className="absolute inset-0 -z-10 rounded-lg bg-amber-500/15 border border-amber-500/40"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        {!user ? (
          <LoginPrompt T={T} />
        ) : loadingParticipant ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          </div>
        ) : tab === "debate" || tab === "quiz" || tab === "predict" || tab === "game" ? (
          !participant ? (
            <JoinPanel onJoined={loadMe} />
          ) : tab === "debate" ? (
            <DebatePanel me={participant} />
          ) : tab === "quiz" ? (
            <QuizPanel me={participant} onPoints={loadMe} />
          ) : tab === "predict" ? (
            <PredictPanel me={participant} onPoints={loadMe} />
          ) : (
            <PenaltyPanel me={participant} onPoints={loadMe} />
          )
        ) : tab === "fixtures" ? (
          <FixturesPanel />
        ) : (
          <LeaderboardPanel />
        )}
      </div>
    </div>
  );
}

/* ----- LOGIN PROMPT ----- */
function LoginPrompt({ T }: { T: (bn: string, en: string) => string }) {
  return (
    <div className="max-w-md mx-auto text-center bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-8">
      <div className="text-5xl mb-3">🔒</div>
      <h2 className="text-xl font-bold mb-2">
        {T("লগইন করুন", "Sign in required")}
      </h2>
      <p className="text-sm text-white/60 mb-5">
        {T(
          "World Cup Hub-এ যোগ দিতে আগে লগইন বা রেজিস্ট্রেশন করুন।",
          "Please sign in or create an account to join the World Cup Hub.",
        )}
      </p>
      <a
        href="/auth"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400"
      >
        {T("লগইন / সাইন আপ", "Sign In / Sign Up")}
      </a>
    </div>
  );
}

/* ----- JOIN (Choose country + photo) ----- */
function JoinPanel({ onJoined }: { onJoined: () => void }) {
  const { user } = useAuth();
  const { lang } = useI18n();
  const T = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const [name, setName] = useState(
    (user?.user_metadata?.display_name as string) || (user?.email?.split("@")[0] ?? ""),
  );
  const [code, setCode] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const country = findCountry(code);

  const onFile = (f: File | null) => {
    setPhoto(f);
    if (f) setPhotoPreview(URL.createObjectURL(f));
    else setPhotoPreview("");
  };

  const submit = async () => {
    if (!user || !name.trim() || !country) {
      toast.error(T("সব ঘর পূরণ করুন", "Please fill all fields"));
      return;
    }
    setBusy(true);
    try {
      let photoUrl: string | null = null;
      if (photo) {
        const ext = photo.name.split(".").pop() || "jpg";
        const path = `wc-avatars/${user.id}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("media")
          .upload(path, photo, { contentType: photo.type, upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
        photoUrl = pub.publicUrl;
      }
      const { error } = await supabase.from("wc_participants").insert({
        user_id: user.id,
        display_name: name.trim(),
        country_code: country.code,
        country_name: lang === "bn" ? country.name_bn : country.name_en,
        flag_emoji: country.flag,
        photo_url: photoUrl,
      });
      if (error) throw error;
      toast.success(T("যোগদান সম্পন্ন!", "Joined!"));
      onJoined();
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6 sm:p-8"
    >
      <div className="text-center mb-6">
        <Trophy className="h-12 w-12 text-amber-400 mx-auto mb-3" />
        <h2 className="text-2xl font-display font-black">
          {T("ডিবেট-এ যোগ দিন", "Join the Debate")}
        </h2>
        <p className="text-sm text-white/60 mt-1">
          {T(
            "নাম, পছন্দের দল ও ছবি দিন — চ্যাট, কুইজ আর গেমে পয়েন্ট অর্জন করুন।",
            "Pick your team and start chatting, playing and earning points.",
          )}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1 text-white/70">
            {T("আপনার নাম", "Your Name")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2.5 focus:border-amber-500 outline-none"
            placeholder={T("নাম লিখুন", "Enter name")}
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1 text-white/70">
            {T("পছন্দের দল", "Pick your team")}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-900/50 rounded-lg border border-white/10">
            {WC_COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setCode(c.code)}
                className={`p-2 rounded-lg border text-center transition ${
                  code === c.code
                    ? "border-amber-400 bg-amber-500/20"
                    : "border-white/10 hover:border-white/30 bg-white/5"
                }`}
              >
                <div className="text-2xl">{c.flag}</div>
                <div className="text-[10px] mt-0.5 truncate">
                  {lang === "bn" ? c.name_bn : c.name_en}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1 text-white/70">
            {T("আপনার ছবি", "Your photo")}
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-white/20 rounded-lg hover:border-amber-400/50 text-sm">
              <Upload className="h-4 w-4" />
              {photo ? photo.name : T("ছবি আপলোড", "Upload photo")}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {photoPreview && (
              <img src={photoPreview} alt="" className="h-14 w-14 rounded-full object-cover border-2 border-amber-400" />
            )}
          </div>
        </div>

        <button
          disabled={busy || !name.trim() || !code}
          onClick={submit}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black tracking-wide disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
          {T("যোগ দিন", "Join Now")}
        </button>
      </div>
    </motion.div>
  );
}

/* ----- DEBATE CHAT ----- */
function DebatePanel({ me }: { me: Participant }) {
  const { lang } = useI18n();
  const T = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("wc_chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(200);
      setMessages((data || []) as ChatMessage[]);
    };
    load();
    const channel = supabase
      .channel("wc-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wc_chat_messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const m = text.trim();
    if (!m || sending) return;
    setSending(true);
    const { error } = await supabase.from("wc_chat_messages").insert({
      user_id: me.user_id,
      display_name: me.display_name,
      country_code: me.country_code,
      country_name: me.country_name,
      flag_emoji: me.flag_emoji,
      photo_url: me.photo_url,
      message: m,
    });
    if (error) toast.error(error.message);
    else setText("");
    setSending(false);
  };

  return (
    <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="font-bold flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-amber-400" />
          {T("গ্লোবাল ডিবেট রুম", "Global Debate Room")}
        </div>
        <div className="text-xs text-white/50">{messages.length} {T("মেসেজ", "messages")}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-white/40 py-12">
            {T("এখনো কোনো মেসেজ নেই — প্রথমটা আপনি দিন!", "No messages yet — be the first!")}
          </div>
        )}
        {messages.map((m) => {
          const mine = m.user_id === me.user_id;
          return (
            <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              {m.photo_url ? (
                <img src={m.photo_url} alt="" className="h-8 w-8 rounded-full object-cover border border-white/20 shrink-0" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-lg shrink-0">
                  {m.flag_emoji}
                </div>
              )}
              <div className={`max-w-[75%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                <div className="text-[10px] text-white/50 mb-0.5 flex items-center gap-1">
                  <span>{m.flag_emoji}</span>
                  <span className="font-semibold">{m.display_name}</span>
                  <span>· {m.country_name}</span>
                </div>
                <div
                  className={`rounded-2xl px-3 py-2 text-sm break-words ${
                    mine
                      ? "bg-amber-500 text-black rounded-br-sm"
                      : "bg-slate-800 text-white rounded-bl-sm"
                  }`}
                >
                  {m.message}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 p-2 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          maxLength={500}
          placeholder={T("মেসেজ লিখুন...", "Type a message...")}
          className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-amber-500 outline-none"
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          className="px-4 py-2 rounded-lg bg-amber-500 text-black font-bold disabled:opacity-50 inline-flex items-center gap-1"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ----- QUIZ ----- */
type Question = {
  id: string;
  question_bn: string;
  question_en: string;
  options: { bn: string; en: string }[];
  correct_index: number;
  points: number;
};

function QuizPanel({ me, onPoints }: { me: Participant; onPoints: () => void }) {
  const { lang } = useI18n();
  const T = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answered, setAnswered] = useState<Record<string, { ok: boolean; pts: number }>>({});
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [{ data: qs }, { data: att }] = await Promise.all([
        supabase.from("wc_quiz_questions").select("*").eq("is_active", true),
        supabase.from("wc_quiz_attempts").select("question_id,is_correct,points_earned").eq("user_id", me.user_id),
      ]);
      setQuestions((qs || []) as any);
      const map: Record<string, { ok: boolean; pts: number }> = {};
      (att || []).forEach((a: any) => (map[a.question_id] = { ok: a.is_correct, pts: a.points_earned }));
      setAnswered(map);
      setLoading(false);
    };
    load();
  }, [me.user_id]);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );

  const unanswered = questions.filter((q) => !answered[q.id]);
  const q = unanswered[current];

  if (!q) {
    return (
      <div className="max-w-md mx-auto text-center bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-8">
        <Trophy className="h-12 w-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-2">{T("সব প্রশ্ন শেষ!", "All done!")}</h3>
        <p className="text-sm text-white/60">
          {T("নতুন প্রশ্নের জন্য পরে আসুন।", "Come back later for more questions.")}
        </p>
        <div className="mt-4 text-3xl font-display font-black text-amber-300">
          {Object.values(answered).reduce((s, a) => s + a.pts, 0)} pts
        </div>
      </div>
    );
  }

  const submit = async () => {
    if (selected == null) return;
    const ok = selected === q.correct_index;
    const pts = ok ? q.points : 0;
    setRevealed(true);
    await supabase.from("wc_quiz_attempts").insert({
      user_id: me.user_id,
      question_id: q.id,
      is_correct: ok,
      points_earned: pts,
    });
    if (pts > 0) {
      await supabase.rpc("wc_award_points", { _points: pts });
      onPoints();
    }
    setAnswered((p) => ({ ...p, [q.id]: { ok, pts } }));
    if (ok) toast.success(T(`+${pts} পয়েন্ট!`, `+${pts} points!`));
    else toast.error(T("ভুল উত্তর", "Wrong answer"));
  };

  const next = () => {
    setSelected(null);
    setRevealed(false);
    setCurrent((c) => c + 1);
  };

  return (
    <motion.div
      key={q.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-white/60">
          {T("প্রশ্ন", "Question")} {current + 1}/{unanswered.length}
        </div>
        <div className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold">
          +{q.points} pts
        </div>
      </div>
      <h3 className="text-lg sm:text-xl font-bold mb-5">
        {lang === "bn" ? q.question_bn : q.question_en}
      </h3>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const isSel = selected === i;
          const isCorrect = revealed && i === q.correct_index;
          const isWrong = revealed && isSel && i !== q.correct_index;
          return (
            <button
              key={i}
              disabled={revealed}
              onClick={() => setSelected(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition flex items-center justify-between ${
                isCorrect
                  ? "border-green-500 bg-green-500/20"
                  : isWrong
                    ? "border-red-500 bg-red-500/20"
                    : isSel
                      ? "border-amber-400 bg-amber-500/15"
                      : "border-white/10 hover:border-white/30 bg-white/5"
              }`}
            >
              <span>{lang === "bn" ? opt.bn : opt.en}</span>
              {isCorrect && <Check className="h-5 w-5 text-green-400" />}
              {isWrong && <X className="h-5 w-5 text-red-400" />}
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex gap-2">
        {!revealed ? (
          <button
            disabled={selected == null}
            onClick={submit}
            className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-bold disabled:opacity-50"
          >
            {T("জমা দিন", "Submit")}
          </button>
        ) : (
          <button
            onClick={next}
            className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-bold"
          >
            {T("পরবর্তী →", "Next →")}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ----- PREDICT ----- */
function PredictPanel({ me, onPoints }: { me: Participant; onPoints: () => void }) {
  const { lang } = useI18n();
  const T = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const { data, isLoading } = useQuery({
    queryKey: ["wc-fixtures"],
    queryFn: () => getWorldCupFixtures(),
    staleTime: 5 * 60 * 1000,
  });
  const [predictions, setPredictions] = useState<Record<string, { h: string; a: string }>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    supabase
      .from("wc_predictions")
      .select("match_id")
      .eq("user_id", me.user_id)
      .then(({ data }) => {
        const map: Record<string, boolean> = {};
        (data || []).forEach((p: any) => (map[p.match_id] = true));
        setSaved(map);
      });
  }, [me.user_id]);

  const upcoming = useMemo(() => {
    if (!data?.matches) return [];
    return data.matches
      .filter((m) => m.home_score == null && m.away_score == null && m.date)
      .slice(0, 12);
  }, [data]);

  const submit = async (m: WCMatch) => {
    const p = predictions[m.id];
    if (!p?.h || !p?.a) return;
    const home = Math.max(0, Math.min(20, parseInt(p.h)));
    const away = Math.max(0, Math.min(20, parseInt(p.a)));
    const { error } = await supabase.from("wc_predictions").insert({
      user_id: me.user_id,
      match_id: m.id,
      home_team: m.home_team,
      away_team: m.away_team,
      home_score: home,
      away_score: away,
      match_date: m.date ? new Date(m.date).toISOString() : null,
      points_earned: 5, // base points for making prediction
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.rpc("wc_award_points", { _points: 5 });
    setSaved((s) => ({ ...s, [m.id]: true }));
    onPoints();
    toast.success(T("+5 পয়েন্ট! প্রেডিকশন সেভ হয়েছে।", "+5 points! Prediction saved."));
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/60 text-center">
        {T(
          "আসন্ন ম্যাচের স্কোর প্রেডিক্ট করুন — প্রতিটির জন্য +৫ পয়েন্ট।",
          "Predict upcoming matches — +5 points each.",
        )}
      </p>
      {upcoming.length === 0 && (
        <div className="text-center py-12 text-white/40">
          {T("কোনো আসন্ন ম্যাচ পাওয়া যায়নি।", "No upcoming matches found.")}
        </div>
      )}
      {upcoming.map((m) => (
        <div
          key={m.id}
          className="bg-white/5 backdrop-blur rounded-xl border border-white/10 p-3 flex items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <div className="text-xs text-white/50">{m.date} {m.time}</div>
            <div className="font-bold text-sm truncate">
              {m.home_team} <span className="text-white/40">vs</span> {m.away_team}
            </div>
          </div>
          {saved[m.id] ? (
            <div className="text-xs px-3 py-2 rounded-lg bg-green-500/20 text-green-400 font-bold">
              ✓ {T("সেভ", "Saved")}
            </div>
          ) : (
            <>
              <input
                type="number"
                min={0}
                max={20}
                placeholder="0"
                className="w-12 bg-slate-900 border border-white/20 rounded text-center py-1.5"
                onChange={(e) =>
                  setPredictions((p) => ({ ...p, [m.id]: { ...(p[m.id] || { h: "", a: "" }), h: e.target.value } }))
                }
              />
              <span className="text-white/40">-</span>
              <input
                type="number"
                min={0}
                max={20}
                placeholder="0"
                className="w-12 bg-slate-900 border border-white/20 rounded text-center py-1.5"
                onChange={(e) =>
                  setPredictions((p) => ({ ...p, [m.id]: { ...(p[m.id] || { h: "", a: "" }), a: e.target.value } }))
                }
              />
              <button
                onClick={() => submit(m)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold"
              >
                {T("সেভ", "Save")}
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/* ----- PENALTY GAME ----- */
function PenaltyPanel({ me, onPoints }: { me: Participant; onPoints: () => void }) {
  const { lang } = useI18n();
  const T = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const [shots, setShots] = useState(0);
  const [goals, setGoals] = useState(0);
  const [target, setTarget] = useState<number | null>(null); // 0,1,2 (left/center/right)
  const [keeper, setKeeper] = useState<number | null>(null);
  const [result, setResult] = useState<"goal" | "save" | null>(null);
  const [finished, setFinished] = useState(false);
  const MAX = 5;

  const shoot = (dir: number) => {
    if (target != null || finished) return;
    setTarget(dir);
    const k = Math.floor(Math.random() * 3);
    setKeeper(k);
    const isGoal = k !== dir;
    setResult(isGoal ? "goal" : "save");
    setTimeout(() => {
      const newShots = shots + 1;
      const newGoals = goals + (isGoal ? 1 : 0);
      setShots(newShots);
      setGoals(newGoals);
      setTarget(null);
      setKeeper(null);
      setResult(null);
      if (newShots >= MAX) {
        setFinished(true);
        // Award points
        const pts = newGoals * 3;
        if (pts > 0) {
          supabase.rpc("wc_award_points", { _points: pts }).then(() => {
            supabase.from("wc_game_scores").insert({
              user_id: me.user_id,
              game_type: "penalty",
              score: newGoals,
              points_earned: pts,
            }).then(() => onPoints());
          });
          toast.success(T(`+${pts} পয়েন্ট! ${newGoals}/${MAX} গোল`, `+${pts} points! ${newGoals}/${MAX} goals`));
        }
      }
    }, 1200);
  };

  const reset = () => {
    setShots(0);
    setGoals(0);
    setFinished(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
      <h3 className="text-xl font-display font-black text-center mb-1">
        {T("পেনাল্টি শুটআউট", "Penalty Shootout")}
      </h3>
      <p className="text-xs text-center text-white/60 mb-5">
        {T("প্রতি গোলে +৩ পয়েন্ট • ৫ শট", "+3 points per goal • 5 shots")}
      </p>

      <div className="flex justify-around mb-6 text-center">
        <div>
          <div className="text-xs text-white/60">{T("শট", "Shots")}</div>
          <div className="text-2xl font-black">{shots}/{MAX}</div>
        </div>
        <div>
          <div className="text-xs text-white/60">{T("গোল", "Goals")}</div>
          <div className="text-2xl font-black text-amber-400">{goals}</div>
        </div>
      </div>

      {/* Goal */}
      <div className="relative bg-gradient-to-b from-green-700 to-green-900 rounded-xl p-6 mb-5 overflow-hidden">
        <div className="grid grid-cols-3 gap-2 h-32 relative">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`border-2 border-white/40 rounded ${
                keeper === i ? "bg-yellow-500/40" : "bg-white/5"
              } flex items-end justify-center pb-2`}
            >
              {keeper === i && <span className="text-3xl">🧤</span>}
              {target === i && (
                <motion.span
                  initial={{ y: 60, scale: 0.5 }}
                  animate={{ y: 0, scale: 1 }}
                  className="text-3xl absolute"
                >
                  ⚽
                </motion.span>
              )}
            </div>
          ))}
        </div>
        {result && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute inset-0 flex items-center justify-center text-4xl font-display font-black ${
              result === "goal" ? "text-green-300" : "text-red-300"
            }`}
          >
            {result === "goal" ? T("গোল! ⚽", "GOAL! ⚽") : T("সেভ! 🧤", "SAVED! 🧤")}
          </motion.div>
        )}
      </div>

      {!finished ? (
        <div className="grid grid-cols-3 gap-2">
          {[
            { d: 0, l: "← " + T("বাম", "Left") },
            { d: 1, l: T("মাঝখানে", "Center") },
            { d: 2, l: T("ডান", "Right") + " →" },
          ].map((b) => (
            <button
              key={b.d}
              disabled={target != null}
              onClick={() => shoot(b.d)}
              className="py-3 rounded-xl bg-amber-500 text-black font-bold disabled:opacity-50 hover:bg-amber-400"
            >
              {b.l}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <div className="text-3xl font-display font-black mb-2 text-amber-300">
            {goals}/{MAX} {T("গোল", "goals")}
          </div>
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl bg-amber-500 text-black font-bold"
          >
            {T("আবার খেলুন", "Play again")}
          </button>
        </div>
      )}
    </div>
  );
}

/* ----- FIXTURES ----- */
function FixturesPanel() {
  const { lang } = useI18n();
  const T = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const { data, isLoading } = useQuery({
    queryKey: ["wc-fixtures"],
    queryFn: () => getWorldCupFixtures(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: live } = useQuery({
    queryKey: ["wc-live"],
    queryFn: () => getLiveWorldCupScores(),
    refetchInterval: 30000,
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );

  const matches = data?.matches || [];
  const liveIds = new Set((live?.matches || []).map((m) => m.id));

  if (!matches.length) {
    return (
      <div className="text-center py-20 text-white/60">
        {T("ম্যাচ তথ্য লোড করা যাচ্ছে না।", "Could not load match data.")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {(live?.matches || []).length > 0 && (
        <div className="bg-red-600/20 border border-red-500/50 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-2 text-red-300 font-bold text-sm mb-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            {T("লাইভ", "LIVE NOW")}
          </div>
          {live!.matches.map((m) => (
            <MatchRow key={m.id} m={m} live />
          ))}
        </div>
      )}
      {matches.map((m) => (
        <MatchRow key={m.id} m={m} live={liveIds.has(m.id)} />
      ))}
    </div>
  );
}

function MatchRow({ m, live }: { m: WCMatch; live?: boolean }) {
  return (
    <div className={`bg-white/5 backdrop-blur rounded-xl border ${live ? "border-red-500/40" : "border-white/10"} p-3`}>
      <div className="flex items-center justify-between text-xs text-white/50 mb-2">
        <span>{m.date} {m.time && `• ${m.time}`}</span>
        {live && <span className="text-red-400 font-bold animate-pulse">● LIVE</span>}
        {!live && m.status && <span>{m.status}</span>}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex items-center gap-2 justify-end text-right">
          <span className="font-bold text-sm truncate">{m.home_team}</span>
          {m.home_badge && <img src={m.home_badge} alt="" className="h-8 w-8 object-contain" />}
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-slate-900 font-display font-black text-lg min-w-[70px] text-center">
          {m.home_score ?? "-"} : {m.away_score ?? "-"}
        </div>
        <div className="flex items-center gap-2 justify-start text-left">
          {m.away_badge && <img src={m.away_badge} alt="" className="h-8 w-8 object-contain" />}
          <span className="font-bold text-sm truncate">{m.away_team}</span>
        </div>
      </div>
      {m.venue && <div className="text-[10px] text-white/40 text-center mt-1">📍 {m.venue}</div>}
    </div>
  );
}

/* ----- LEADERBOARD ----- */
function LeaderboardPanel() {
  const { lang } = useI18n();
  const T = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.rpc("wc_leaderboard", { _limit: 10 }).then(({ data }) => {
      setRows((data || []) as any[]);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );

  return (
    <div>
      <h2 className="text-2xl font-display font-black text-center mb-1">
        {T("🏆 টপ ১০ দল", "🏆 Top 10 Teams")}
      </h2>
      <p className="text-sm text-white/60 text-center mb-5">
        {T("সবচেয়ে বেশি পয়েন্ট অর্জনকারী দল", "Teams with most points")}
      </p>
      {rows.length === 0 ? (
        <div className="text-center py-12 text-white/40">
          {T("এখনো কেউ পয়েন্ট পায়নি।", "No points scored yet.")}
        </div>
      ) : (
        <div className="space-y-2 max-w-2xl mx-auto">
          {rows.map((r, i) => (
            <motion.div
              key={r.country_code}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                i === 0
                  ? "bg-gradient-to-r from-amber-500/30 to-yellow-500/10 border-amber-400"
                  : i === 1
                    ? "bg-slate-400/15 border-slate-400/40"
                    : i === 2
                      ? "bg-amber-700/15 border-amber-700/40"
                      : "bg-white/5 border-white/10"
              }`}
            >
              <div className="text-2xl font-display font-black w-8 text-center">
                {i + 1}
              </div>
              <div className="text-3xl">{r.flag_emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold">{r.country_name}</div>
                <div className="text-xs text-white/50">
                  {r.member_count} {T("সদস্য", "members")}
                </div>
              </div>
              <div className="text-amber-300 font-display font-black text-xl">
                {r.total_points}
                <span className="text-xs text-white/60 ml-1">pts</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
