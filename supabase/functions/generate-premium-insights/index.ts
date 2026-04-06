import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const INSIGHTS_PROMPT = `You are an elite financial strategist and AI business analyst. Generate premium market intelligence.

Return a JSON object (no markdown, no code fences) with this exact structure:
{
  "market_trends": [
    { "title": "...", "description": "...", "opportunity_score": 85, "category": "AI Tools|Crypto|E-commerce|Freelancing|SaaS", "timeframe": "short|medium|long" }
  ],
  "revenue_predictions": [
    { "niche": "...", "current_avg": "$X/mo", "predicted_30d": "$X/mo", "confidence": 82, "reasoning": "..." }
  ],
  "competitor_gaps": [
    { "market": "...", "gap_description": "...", "estimated_value": "$X/mo", "difficulty": "easy|medium|hard", "tools_needed": ["..."] }
  ],
  "ai_strategy": {
    "title": "...",
    "summary": "...",
    "steps": ["...", "...", "..."],
    "estimated_roi": "...",
    "tools": ["..."]
  },
  "hot_tip": {
    "title": "...",
    "description": "...",
    "urgency": "act_now|this_week|this_month"
  }
}

Generate 3 market trends, 3 revenue predictions, 3 competitor gaps, 1 AI strategy, and 1 hot tip.
Make everything ultra-specific with real tool names, dollar amounts, and actionable steps.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Auth required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check tier — must be basic or premium
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier, niche_interests, risk_level, experience_level")
      .eq("id", user.id)
      .single();

    const tier = profile?.subscription_tier || "free";
    if (tier === "free") {
      return new Response(JSON.stringify({ error: "Premium subscription required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const niches = (profile?.niche_interests || []).join(", ") || "AI tools, side hustles";
    const risk = profile?.risk_level || "medium";
    const exp = profile?.experience_level || "beginner";

    const userPrompt = `Generate premium insights for a ${exp}-level subscriber interested in: ${niches}. Risk tolerance: ${risk}. Date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: INSIGHTS_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI error: ${aiResponse.status} ${errText}`);
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "{}";

    // Strip markdown fences if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let insights;
    try {
      insights = JSON.parse(content);
    } catch {
      insights = {
        market_trends: [],
        revenue_predictions: [],
        competitor_gaps: [],
        ai_strategy: { title: "AI Strategy", summary: content.substring(0, 200), steps: [], estimated_roi: "N/A", tools: [] },
        hot_tip: { title: "Tip", description: "Check back soon for fresh insights.", urgency: "this_week" },
      };
    }

    return new Response(JSON.stringify({ insights, generated_at: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("premium-insights error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
