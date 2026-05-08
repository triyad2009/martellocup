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
    const { messages, lang = "bn" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data: kb } = await sb
      .from("ai_knowledge")
      .select("question,answer_bn,answer_en,category,route")
      .eq("is_active", true)
      .order("sort_order");

    const kbText = (kb ?? [])
      .map((k: any) => `- Q: ${k.question}\n  A(${lang}): ${lang === "bn" ? k.answer_bn : k.answer_en}${k.route ? `\n  Route: ${k.route}` : ""}`)
      .join("\n");

    const pagesText = SITE_PAGES.map((p) => `${p.path} → ${p.name}`).join("\n");

    const systemPrompt = `You are the Martello Cup website helper. You ONLY answer questions about how to use this website — what it offers and how users can do things here. Do NOT answer general/world questions. If asked something off-topic, politely refuse and steer back to the site.

Respond in ${lang === "bn" ? "Bangla" : "English"} (match user). Be concise, friendly, premium-tone.

When the user asks to go to/open a page, end your reply with a single line:
NAVIGATE: /path
(Use one of the listed paths exactly. Only emit NAVIGATE when the user clearly wants to go somewhere.)

AVAILABLE PAGES:
${pagesText}

ADMIN-TRAINED KNOWLEDGE:
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

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
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
    const cleaned = text.replace(/NAVIGATE:\s*(\/[^\s]*)/g, (_: string, p: string) => {
      navigate = p;
      return "";
    }).trim();

    return new Response(JSON.stringify({ text: cleaned, navigate }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
