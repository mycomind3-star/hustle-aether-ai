import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { product, audience, costBase } = await req.json();
    if (!product) {
      return new Response(JSON.stringify({ error: "product is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const prompt = `You are a pricing strategist. Analyze pricing for: "${product}"
Target audience: ${audience || "general consumers"}
Base cost / time investment: ${costBase || "unknown"}

Return ONLY valid JSON:
{
  "recommended_price": "$XX",
  "price_range": { "low": "$X", "sweet_spot": "$X", "premium": "$X" },
  "psychological_anchor": "string (e.g. $49 vs $50 reasoning)",
  "tiers": [
    { "name": "Starter", "price": "$X", "features": ["..."], "target": "string" },
    { "name": "Pro", "price": "$X", "features": ["..."], "target": "string" },
    { "name": "Premium", "price": "$X", "features": ["..."], "target": "string" }
  ],
  "competitor_avg": "$XX",
  "value_justification": ["3 short bullet points"],
  "discount_strategy": "string",
  "upsell_ideas": ["3 ideas"],
  "warning": "one common pricing mistake to avoid"
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

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      throw new Error(`AI call failed: ${aiRes.status} ${errText}`);
    }
    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content || "{}";
    const data = JSON.parse(content);

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("optimize-pricing error", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
