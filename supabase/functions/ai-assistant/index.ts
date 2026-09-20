import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_PAGES = [
  { path: "/", name: "Home" }, { path: "/fixtures", name: "Fixtures" },
  { path: "/results", name: "Results" }, { path: "/points-table", name: "Points Table" },
  { path: "/teams", name: "Teams" }, { path: "/players", name: "Players" },
  { path: "/news", name: "News" }, { path: "/gallery", name: "Gallery" },
  { path: "/sponsors", name: "Sponsors" }, { path: "/jersey", name: "Jersey Shop" },
  { path: "/tickets", name: "Tickets" }, { path: "/registration", name: "Team Registration" },
  { path: "/feed", name: "Social Feed" }, { path: "/feed/new", name: "Create a Post" },
  { path: "/members", name: "Members" }, { path: "/profile", name: "User Profile" },
  { path: "/track-order", name: "Track Order" }, { path: "/about", name: "About" },
  { path: "/contact", name: "Contact" }, { path: "/auth", name: "Login / Sign up" },
];

async function callOpenAI(input: any, apiKey: string) {
  const resp = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.6-luna",
      input,
      store: false,
    }),
  });
  const body = await resp.text();
  let data: any;
  try { data = JSON.parse(body); } catch { data = {}; }
  if (!resp.ok) {
    throw new Error(data?.error?.message || `OpenAI API error (${resp.status})`);
  }
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (payload: any, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { messages = [], lang = "bn", attachments = [], mode = "chat" } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY missing" }, 500);

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    let user: any = null;

    if (mode === "train") {
      if (!token) return json({ error: "Unauthorized" }, 401);
      const { data: userData, error: userErr } = await sb.auth.getUser(token);
      user = userData?.user;
      if (userErr || !user) return json({ error: "Unauthorized" }, 401);

      const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", user.id);
      const isAdmin = (roles ?? []).some((r: any) => r.role === "super_admin" || r.role === "admin");
      if (!isAdmin) return json({ error: "Forbidden" }, 403);
    }

    const { data: kb } = await sb
      .from("ai_knowledge")
      .select("question,answer_bn,answer_en,category,route,media_urls")
      .eq("is_active", true)
      .order("sort_order");

    const kbText = (kb ?? []).map((k: any) => {
      const media = (k.media_urls ?? []).filter(Boolean);
      return `- Q: ${k.question}
  Category: ${k.category || "general"}
  A(${lang}): ${lang === "bn" ? k.answer_bn : k.answer_en}${k.route ? `\n  Route: ${k.route}` : ""}${media.length ? `\n  Media: ${media.join(" | ")}` : ""}`;
    }).join("\n");

    const pagesText = SITE_PAGES.map((p) => `${p.path} → ${p.name}`).join("\n");

    if (mode === "train") {
      const trainSystem = `You are a knowledge-base extractor for the Martello Cup website assistant.
Convert the admin's instruction into one or more knowledge entries.
Return STRICT JSON only, with this exact shape:
{"entries":[{"question":"...","answer_bn":"...","answer_en":"...","category":"general|venue|tickets|registration|jersey|sponsor|feed|payment|profile|other","route":"/optional-path-or-empty"}]}
- answer_bn must be Bangla and answer_en must be English.
- Keep answers concise and helpful.
- If admin provides multiple distinct facts, create multiple entries.`;
      const input = [
        { role: "developer", content: [{ type: "input_text", text: trainSystem }] },
        ...messages.map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: [{ type: "input_text", text: String(m.content ?? "") }],
        })),
      ];
      const data = await callOpenAI(input, OPENAI_API_KEY);
      const raw = data.output_text ?? "";
      let entries: any[] = [];
      try {
        const parsed = JSON.parse(raw);
        entries = Array.isArray(parsed.entries) ? parsed.entries : [];
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            const parsed = JSON.parse(match[0]);
            entries = Array.isArray(parsed.entries) ? parsed.entries : [];
          } catch {}
        }
      }
      return json({ entries });
    }

    const systemPrompt = `You are the Martello Cup website helper. You ONLY answer questions about how to use this website — what it offers and how users can do things here. Do NOT answer general/world questions. If asked something off-topic, politely refuse and steer back to the site.
Respond in ${lang === "bn" ? "Bangla" : "English"} (match user). Be concise, friendly, premium-tone.
When the user asks to go to/open a page, end your reply with a single line:
NAVIGATE: /path
Use one listed path exactly. Only emit NAVIGATE when the user clearly wants to go somewhere.
When the user asks to SEE a picture/photo/venue/map and matching admin-trained knowledge has Media URLs, end with:
IMAGES: url1 | url2 | url3
Only include this when relevant media exist.
AVAILABLE PAGES:
${pagesText}
ADMIN-TRAINED KNOWLEDGE:
${kbText || "(none yet)"}
CORE WEBSITE CAPABILITIES:
- Browse fixtures, results, points table, teams, players, news, gallery
- Register a team with payment
- Buy tickets and get a downloadable slip with a 15-digit code from Profile after approval
- Buy jerseys
- Apply as sponsor with payment + admin approval
- Use Social Feed: post text/image/video, like, comment (login required)
- Profile: track tickets, jerseys, sponsor and team applications
- Promo codes available at jersey/ticket/sponsor checkout
- Multi-language: Bangla / English / Satkhira dialect`;

    const input: any[] = [
      { role: "developer", content: [{ type: "input_text", text: systemPrompt }] },
    ];

    for (const m of messages) {
      input.push({
        role: m.role === "assistant" ? "assistant" : "user",
        content: [{ type: "input_text", text: String(m.content ?? "") }],
      });
    }

    const lastUser = input[input.length - 1];
    if (lastUser?.role === "user" && Array.isArray(attachments) && attachments.length > 0) {
      const parts: any[] = [{ type: "input_text", text: String(messages[messages.length - 1]?.content ?? "") }];
      for (const a of attachments) {
        if (a?.type === "image" && a?.url) {
          parts.push({ type: "input_image", image_url: a.url });
        }
      }
      input[input.length - 1] = { role: "user", content: parts };
    }

    const data = await callOpenAI(input, OPENAI_API_KEY);
    const text = data.output_text ?? "";
    let navigate: string | null = null;
    let images: string[] = [];

    let cleaned = text.replace(/NAVIGATE:\s*(\/[^\s]*)/g, (_: string, p: string) => {
      navigate = p;
      return "";
    });
    cleaned = cleaned.replace(/IMAGES:\s*([^\n]+)/g, (_: string, p: string) => {
      images = p.split("|").map((s: string) => s.trim()).filter(Boolean);
      return "";
    }).trim();

    return json({ text: cleaned, navigate, images });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});