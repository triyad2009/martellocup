import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Profile = { user_id: string; display_name: string | null; email: string | null; avatar_url: string | null };

type Props = {
  value: string;
  onChange: (text: string, taggedUserIds: string[]) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  autoFocus?: boolean;
  multiline?: boolean;
};

export function MentionInput({ value, onChange, placeholder, rows = 4, className, autoFocus, multiline = true }: Props) {
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [taggedMap, setTaggedMap] = useState<Record<string, string>>({}); // displayName → userId
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (query == null) { setSuggestions([]); return; }
    const q = query.trim();
    (async () => {
      const sb: any = supabase;
      const builder = sb.from("profiles").select("user_id,display_name,email,avatar_url").limit(6);
      const { data } = q
        ? await builder.or(`display_name.ilike.%${q}%,email.ilike.%${q}%`)
        : await builder;
      setSuggestions((data ?? []) as Profile[]);
      setActiveIdx(0);
    })();
  }, [query]);

  const computeTagged = (text: string) => {
    const ids = new Set<string>();
    for (const [name, id] of Object.entries(taggedMap)) {
      const re = new RegExp(`@${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
      if (re.test(text)) ids.add(id);
    }
    return Array.from(ids);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const txt = e.target.value;
    onChange(txt, computeTagged(txt));
    // detect @query at caret
    const pos = (e.target as any).selectionStart ?? txt.length;
    const before = txt.slice(0, pos);
    const m = before.match(/@([\w\u0980-\u09FF.\- ]{0,30})$/);
    setQuery(m ? m[1] : null);
  };

  const pickSuggestion = (p: Profile) => {
    const el = ref.current;
    if (!el) return;
    const txt = value;
    const pos = (el as any).selectionStart ?? txt.length;
    const before = txt.slice(0, pos);
    const after = txt.slice(pos);
    const m = before.match(/@([\w\u0980-\u09FF.\- ]{0,30})$/);
    if (!m) return;
    const name = (p.display_name || p.email?.split("@")[0] || "user").replace(/\s+/g, "_");
    const newBefore = before.slice(0, before.length - m[0].length) + `@${name} `;
    const newText = newBefore + after;
    const newMap = { ...taggedMap, [name]: p.user_id };
    setTaggedMap(newMap);
    setQuery(null);
    onChange(newText, computeFromMap(newText, newMap));
    setTimeout(() => {
      el.focus();
      const c = newBefore.length;
      try { (el as any).setSelectionRange(c, c); } catch {}
    }, 0);
  };

  const computeFromMap = (text: string, map: Record<string, string>) => {
    const ids = new Set<string>();
    for (const [name, id] of Object.entries(map)) {
      const re = new RegExp(`@${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
      if (re.test(text)) ids.add(id);
    }
    return Array.from(ids);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0 || query == null) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault(); pickSuggestion(suggestions[activeIdx]);
    } else if (e.key === "Escape") { setQuery(null); }
  };

  const baseProps = {
    ref: ref as any,
    value,
    onChange: handleChange,
    onKeyDown: handleKey,
    placeholder,
    autoFocus,
    className: className ?? "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary",
  };

  return (
    <div className="relative">
      {multiline ? <textarea rows={rows} {...(baseProps as any)} /> : <input {...(baseProps as any)} />}
      {query != null && suggestions.length > 0 && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.map((p, i) => {
            const name = p.display_name || p.email?.split("@")[0] || "user";
            return (
              <button
                type="button"
                key={p.user_id}
                onClick={() => pickSuggestion(p)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm ${i === activeIdx ? "bg-muted" : "hover:bg-muted/60"}`}
              >
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-gradient-primary text-white text-xs flex items-center justify-center font-bold">{name[0]?.toUpperCase()}</div>
                )}
                <span className="font-semibold">@{name.replace(/\s+/g, "_")}</span>
                {p.email && <span className="text-xs text-muted-foreground truncate ml-auto">{p.email}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Utility for rendering text with mentions as links
export function renderMentions(text: string) {
  const parts = text.split(/(@[\w\u0980-\u09FF.\-_]+)/g);
  return parts.map((p, i) =>
    p.startsWith("@") ? (
      <span key={i} className="text-primary font-semibold">{p}</span>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}
