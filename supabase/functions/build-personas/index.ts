import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { product, market } = await req.json();
    if (!product) {
      return new Response(JSON.stringify({ error: "product is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const prompt = `You are a senior market researcher specializing in psychographic customer profiling.
Build 3 distinct, hyper-detailed buyer personas for: "${product}"
Market context: ${market || "general consumer"}

Return ONLY valid JSON:
{
  "personas": [
    {
      "name": "realistic full name",
      "archetype": "1-3 word label (e.g. 'Burned-Out Founder')",
      "avatar_emoji": "single emoji that fits",
      "demographics": {
        "age": "range",
        "occupation": "string",
        "income": "string",
        "location": "string",
        "family": "string"
      },
      "psychographics": {
        "values": ["3 core values"],
        "fears": ["3 deep fears"],
        "desires": ["3 deep desires"],
        "identity": "how they want to be seen by others"
      },
      "day_in_life": "2-3 sentences describing a typical morning/struggle",
      "pain_points": ["5 specific frustrations with current options"],
      "buying_triggers": ["4 events/emotions that push them to buy"],
      "objections": [
        { "objection": "string", "underlying_fear": "string", "how_to_overcome": "string" }
      ],
      "where_they_hang_out": ["5 specific platforms/communities/podcasts"],
      "trusted_voices": ["3 influencers/authors/brands they listen to"],
      "language_they_use": ["5 exact phrases they say (for ad copy)"],
      "willingness_to_pay": "$X-$Y range with reasoning",
      "preferred_format": "course/coaching/SaaS/community/etc and why",
      "marketing_message": "the single sentence that would make them click"
    }
  ],
  "shared_insights": {
    "biggest_market_gap": "string",
    "underserved_segment": "string",
    "fastest_path_to_trust": "string"
  }
}

Make personas distinct, vivid, and psychologically rich. No generic fluff.`;

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
    console.error("build-personas error", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
