import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_PAGES = [
  { path: "/", name: "Home" },
  { path: "/fixtures", name: "Fixtures" },
  { path: "/results", name: "Results" },
  { path: "/points-table", name: "Points Table" },
  { path: "/teams", name: "Teams" },
  { path: "/players", name: "Players" },
  { path: "/news", name: "News" },
  { path: "/gallery", name: "Gallery" },
  { path: "/sponsors", name: "Sponsors" },
  { path: "/jersey", name: "Jersey Shop" },
  { path: "/tickets", name: "Tickets" },
  { path: "/registration", name: "Team Registration" },
  { path: "/feed", name: "Social Feed" },
  { path: "/feed/new", name: "Create a Post" },
  { path: "/members", name: "Members" },
  { path: "/profile", name: "User Profile" },
  { path: "/track-order", name: "Track Order" },
  { path: "/about", name: "About" },
  { path: "/contact", name: "Contact" },
  { path: "/auth", name: "Login / Sign up" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, lang = "bn", attachments = [], mode = "chat" } =
      await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data: kb } = await sb
      .from("ai_knowledge")
      .select("question,answer_bn,answer_en,category,route,media_urls")
      .eq("is_active", true)
      .order("sort_order");

    const kbText = (kb ?? [])
      .map((k: any) => {
        const media = (k.media_urls ?? []).filter(Boolean);
        return `- Q: ${k.question}
  Category: ${k.category || "general"}
  A(${lang}): ${lang === "bn" ? k.answer_bn : k.answer_en}${k.route ? `\n  Route: ${k.route}` : ""}${media.length ? `\n  Media: ${media.join(" | ")}` : ""}`;
      })
      .join("\n");

    const pagesText = SITE_PAGES.map((p) => `${p.path} → ${p.name}`).join("\n");

    // ---- TRAIN MODE: parse admin instruction → KB rows ----
    if (mode === "train") {
      const trainSystem = `You are a knowledge-base extractor for the Martello Cup website assistant.
Convert the admin's instruction into one or more knowledge entries.
Return STRICT JSON in this exact shape (no markdown):
{ "entries": [
  { "question": "...", "answer_bn": "...", "answer_en": "...", "category": "general|venue|tickets|registration|jersey|sponsor|feed|payment|profile|other", "route": "/optional-path-or-empty" }
] }
- "answer_bn" must be Bangla, "answer_en" must be English.
- Keep answers concise and helpful.
- If the admin attached images, assume those are reference media for the topic; mention them naturally in answers.
- If admin provides multiple distinct facts, create multiple entries.`;

      const trainResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: trainSystem },
            ...messages,
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (!trainResp.ok) {
        const t = await trainResp.text();
        return new Response(JSON.stringify({ error: "AI gateway error", detail: t }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const td = await trainResp.json();
      let entries: any[] = [];
      try {
        const parsed = JSON.parse(td.choices?.[0]?.message?.content || "{}");
        entries = Array.isArray(parsed.entries) ? parsed.entries : [];
      } catch { /* ignore */ }
      return new Response(JSON.stringify({ entries }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- CHAT MODE ----
    const systemPrompt = `You are the Martello Cup website helper. You ONLY answer questions about how to use this website — what it offers and how users can do things here. Do NOT answer general/world questions. If asked something off-topic, politely refuse and steer back to the site.

Respond in ${lang === "bn" ? "Bangla" : "English"} (match user). Be concise, friendly, premium-tone.

When the user asks to go to/open a page, end your reply with a single line:
NAVIGATE: /path
(Use one of the listed paths exactly. Only emit NAVIGATE when the user clearly wants to go somewhere.)

When the user asks to SEE a picture/photo/venue/map and the matching admin-trained knowledge has Media URLs, end your reply with a separate line:
IMAGES: url1 | url2 | url3
(Only include this when relevant media exist in the knowledge base.)

AVAILABLE PAGES:
${pagesText}

ADMIN-TRAINED KNOWLEDGE (use Media URLs when user asks to see things):
${kbText || "(none yet)"}

CORE WEBSITE CAPABILITIES:
- Browse fixtures, results, points table, teams, players, news, gallery
- Register a team (Registration page) with payment
- Buy tickets and get a downloadable slip with a 15-digit code from Profile after approval
- Buy jerseys
- Apply as sponsor (Gold/Silver/Bronze) with payment + admin approval
- Use Social Feed: post text/image/video, like, comment (login required)
- Profile: track all your tickets, jerseys, sponsor & team applications
- Promo codes available at jersey/ticket/sponsor checkout
- Multi-language: Bangla / English / Satkhira dialect`;

    // Build messages with multimodal support: last user message can include attachments
    const apiMessages: any[] = [{ role: "system", content: systemPrompt }];
    const userMsgs = [...messages];
    const last = userMsgs[userMsgs.length - 1];
    if (last && last.role === "user" && Array.isArray(attachments) && attachments.length > 0) {
      const parts: any[] = [{ type: "text", text: last.content || "" }];
      for (const a of attachments) {
        if (a?.url) parts.push({ type: "image_url", image_url: { url: a.url } });
      }
      userMsgs[userMsgs.length - 1] = { role: "user", content: parts };
    }
    apiMessages.push(...userMsgs);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit, try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: "AI gateway error", detail: t }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    let navigate: string | null = null;
    let images: string[] = [];
    let cleaned = text.replace(/NAVIGATE:\s*(\/[^\s]*)/g, (_: string, p: string) => {
      navigate = p; return "";
    });
    cleaned = cleaned.replace(/IMAGES:\s*([^\n]+)/g, (_: string, p: string) => {
      images = p.split("|").map((s: string) => s.trim()).filter(Boolean);
      return "";
    }).trim();

    return new Response(JSON.stringify({ text: cleaned, navigate, images }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
