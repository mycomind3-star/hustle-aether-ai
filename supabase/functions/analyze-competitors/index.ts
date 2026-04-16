import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an elite competitive intelligence analyst. Analyze a niche/business idea and return a JSON object (no markdown, no code fences) with this structure:

{
  "niche": "The niche analyzed",
  "market_size": "$X billion",
  "growth_rate": "X% annually",
  "top_players": [
    {
      "name": "Company/creator name",
      "strength": "What they do well",
      "weakness": "Their vulnerability",
      "estimated_revenue": "$X/mo",
      "audience_size": "X followers/users"
    }
  ],
  "market_gaps": [
    {
      "gap": "Specific unmet need",
      "opportunity_size": "small|medium|large",
      "difficulty_to_fill": "easy|medium|hard",
      "suggested_approach": "How to exploit this gap"
    }
  ],
  "positioning_strategies": [
    {
      "strategy": "Strategy name",
      "description": "How to execute",
      "differentiation": "What makes you stand out",
      "example": "Real-world example of this working"
    }
  ],
  "entry_barriers": ["barrier1", "barrier2"],
  "unfair_advantages": ["advantage a beginner could build quickly"],
  "verdict": {
    "attractiveness_score": 78,
    "best_angle": "The single best way to enter this market",
    "avoid": "The biggest mistake newcomers make"
  }
}

Return 3-5 top players, 3-4 market gaps, and 2-3 positioning strategies. Be ultra-specific with real names and data.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Auth required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { niche } = await req.json();
    if (!niche || typeof niche !== "string" || niche.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Please provide a niche to analyze" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("experience_level, risk_level")
      .eq("id", user.id)
      .single();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userPrompt = `Analyze the competitive landscape for: "${niche.trim()}"

Context about the person asking:
- Experience: ${profile?.experience_level || "beginner"}
- Risk tolerance: ${profile?.risk_level || "medium"}
- Date: April 2026

Identify the top players, market gaps, and positioning strategies. Focus on actionable intelligence that helps a ${profile?.experience_level || "beginner"} enter and compete effectively.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${aiResponse.status} ${errText}`);
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "{}";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      result = {
        niche: niche.trim(),
        market_size: "Unknown",
        growth_rate: "Growing",
        top_players: [{ name: "Various competitors", strength: "Established presence", weakness: "Slow to innovate", estimated_revenue: "Varies", audience_size: "Varies" }],
        market_gaps: [{ gap: "Personalized AI-powered solutions", opportunity_size: "large", difficulty_to_fill: "medium", suggested_approach: "Use AI to deliver customized experiences" }],
        positioning_strategies: [{ strategy: "Niche Down", description: "Focus on an underserved sub-segment", differentiation: "Hyper-specific expertise", example: "Instead of general fitness, target remote workers with desk-job pain" }],
        entry_barriers: ["Established players", "Marketing budget needed"],
        unfair_advantages: ["Speed of execution", "Personal brand authenticity"],
        verdict: { attractiveness_score: 70, best_angle: "Find the underserved sub-niche and dominate it.", avoid: "Trying to compete head-on with established players." },
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-competitors error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
