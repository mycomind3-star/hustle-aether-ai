import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { niche, platform, tone } = await req.json();
    if (!niche) {
      return new Response(JSON.stringify({ error: "niche is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const prompt = `You are a viral content strategist. Generate marketing content for niche: "${niche}"
Platform focus: ${platform || "Instagram + TikTok + Twitter"}
Tone: ${tone || "bold, helpful, conversion-focused"}

Return ONLY valid JSON:
{
  "hooks": ["10 scroll-stopping opening lines"],
  "post_ideas": [
    { "platform": "Instagram", "title": "string", "format": "Reel|Carousel|Story", "concept": "string", "cta": "string", "hashtags": ["#tag", "#tag"] },
    { "platform": "TikTok", "title": "string", "format": "Trend|Tutorial|POV", "concept": "string", "cta": "string", "hashtags": ["#tag"] },
    { "platform": "Twitter/X", "title": "string", "format": "Thread|Single", "concept": "string", "cta": "string", "hashtags": [] },
    { "platform": "LinkedIn", "title": "string", "format": "Story|Insight", "concept": "string", "cta": "string", "hashtags": ["#tag"] },
    { "platform": "YouTube Shorts", "title": "string", "format": "Tutorial|Reaction", "concept": "string", "cta": "string", "hashtags": ["#tag"] }
  ],
  "email_subjects": ["5 high-open-rate subject lines"],
  "viral_angles": ["3 contrarian or surprising takes"],
  "content_calendar_week": [
    { "day": "Mon", "post": "string" },
    { "day": "Tue", "post": "string" },
    { "day": "Wed", "post": "string" },
    { "day": "Thu", "post": "string" },
    { "day": "Fri", "post": "string" },
    { "day": "Sat", "post": "string" },
    { "day": "Sun", "post": "string" }
  ]
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) throw new Error(`AI call failed: ${aiRes.status} ${await aiRes.text()}`);
    const aiJson = await aiRes.json();
    const data = JSON.parse(aiJson.choices?.[0]?.message?.content || "{}");

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-content-ideas error", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
