import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { product, audience, price, transformation } = await req.json();
    if (!product) {
      return new Response(JSON.stringify({ error: "product is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const prompt = `You are a world-class direct-response copywriter (Eugene Schwartz / Stefan Georgi level).
Write a high-converting sales page for: "${product}"
Target audience: ${audience || "general"}
Price: ${price || "TBD"}
Promised transformation: ${transformation || "solve the core pain"}

Return ONLY valid JSON:
{
  "headline": "magnetic 6-12 word promise",
  "subheadline": "1 sentence amplifying the headline",
  "lead_paragraph": "2-3 sentences agitating the pain",
  "problem_section": {
    "title": "string",
    "pain_points": ["5 visceral, specific pain points the reader feels"]
  },
  "solution_section": {
    "title": "string",
    "intro": "string",
    "mechanism": "the unique mechanism / why this works"
  },
  "benefits": [
    { "feature": "string", "benefit": "what they actually GET", "emotion": "how they'll FEEL" }
  ],
  "social_proof_angles": ["3 testimonial angles to collect"],
  "objection_crushers": [
    { "objection": "string", "response": "string" }
  ],
  "guarantee": "risk-reversal language",
  "scarcity_urgency": "ethical urgency hook",
  "cta_buttons": ["3 high-converting CTA button variations"],
  "faq": [
    { "q": "string", "a": "string" }
  ],
  "ps_line": "post-script that reinforces the offer"
}

Make it punchy, specific, conversion-obsessed. Use power words. Avoid generic fluff. Include numbers/specificity where possible.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Try again in a minute." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI call failed: ${aiRes.status} ${await aiRes.text()}`);
    }
    const aiJson = await aiRes.json();
    const data = JSON.parse(aiJson.choices?.[0]?.message?.content || "{}");

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-sales-page error", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
