import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles, X, Send, Loader2, Bot, Paperclip, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { uploadMedia } from "@/lib/content";
import { toast } from "sonner";

type Attachment = { url: string; type: "image" | "video" | "file"; name?: string };
type Msg = {
  role: "user" | "assistant";
  content: string;
  navigate?: string | null;
  images?: string[];
  attachments?: Attachment[];
};

export function AIAssistant() {
  const { lang } = useI18n();
  const uiLang = lang === "en" ? "en" : "bn";
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        uiLang === "bn"
          ? "নমস্কার! আমি Martello Cup এর AI সহকারী। সাইটে কী করা যায়, কীভাবে করতে হয় — যেকোনো প্রশ্ন করুন।"
          : "Hi! I'm the Martello Cup AI helper. Ask me what you can do on this site or how to do it.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          lang: uiLang,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.text || "...", navigate: data.navigate ?? null },
      ]);
    } catch (e: any) {
      toast.error(e?.message || (uiLang === "bn" ? "ত্রুটি" : "Error"));
    } finally {
      setBusy(false);
    }
  };

  const suggestions = uiLang === "bn"
    ? ["টিকিট কীভাবে কিনব?", "দল রেজিস্ট্রেশন", "Social Feed কোথায়?"]
    : ["How to buy a ticket?", "Register a team", "Where is the Feed?"];

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: open ? 0 : 1, opacity: open ? 0 : 1 }}
        transition={{ type: "spring", damping: 14 }}
        className="fixed bottom-5 right-5 z-50 group"
        aria-label="AI Assistant"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-amber-500 to-yellow-400 blur-lg opacity-70 group-hover:opacity-100 transition" />
        <div className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-primary via-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-2xl border border-white/20">
          <Sparkles className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-background animate-pulse" />
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full sm:w-[420px] sm:m-5 h-[85vh] sm:h-[640px] sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl overflow-hidden bg-card border border-border shadow-2xl flex flex-col"
            >
              {/* Premium gradient header */}
              <div className="relative bg-gradient-to-br from-primary via-rose-600 to-amber-500 text-white p-4 pb-5">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
                <div className="relative flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/30">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-lg leading-tight">Martello AI</p>
                    <p className="text-xs text-white/80 inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      {uiLang === "bn" ? "অনলাইন · সাহায্যের জন্য প্রস্তুত" : "Online · ready to help"}
                    </p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"
                    aria-label="close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background to-muted/30">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-card border border-border rounded-bl-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      {m.navigate && (
                        <button
                          onClick={() => {
                            navigate({ to: m.navigate! as any });
                            setOpen(false);
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-amber-500 text-white text-xs font-bold shadow-md"
                        >
                          {uiLang === "bn" ? "এই পেজে যান" : "Go to page"} →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {busy && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground border border-border transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-border bg-card">
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-background pl-4 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-primary/40">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder={uiLang === "bn" ? "প্রশ্ন লিখুন..." : "Ask anything about the site..."}
                    className="flex-1 bg-transparent outline-none text-sm py-1.5"
                  />
                  <button
                    onClick={send}
                    disabled={busy || !input.trim()}
                    className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-amber-500 text-white flex items-center justify-center disabled:opacity-50 shadow-md"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                  {uiLang === "bn" ? "শুধু এই ওয়েবসাইটের জন্য সহায়তা" : "Helps only with this website"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
