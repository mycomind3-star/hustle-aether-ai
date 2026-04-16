import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a startup business plan writer. Given a user's profile, hustle idea, and context, create a concise one-page business plan. Return a JSON object (no markdown, no code fences):

{
  "business_name": "Suggested business name",
  "tagline": "One-line pitch (max 10 words)",
  "problem": "The problem you solve (2 sentences max)",
  "solution": "Your unique solution (2 sentences max)",
  "target_market": "Who you serve (1 sentence)",
  "revenue_model": "How you make money (1-2 sentences)",
  "competitive_edge": "Your unfair advantage (1 sentence)",
  "month_1_goals": ["Goal 1", "Goal 2", "Goal 3"],
  "month_3_goals": ["Goal 1", "Goal 2", "Goal 3"],
  "month_6_goals": ["Goal 1", "Goal 2"],
  "key_metrics": ["Metric 1 to track", "Metric 2", "Metric 3"],
  "startup_budget": "$X",
  "revenue_target_6mo": "$X/mo",
  "tools_stack": ["Tool 1", "Tool 2", "Tool 3"],
  "one_sentence_vision": "Where this business is in 2 years (1 sentence)"
}

Be specific, realistic, and actionable. Use real tool/platform names.`;

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

    const { idea } = await req.json();

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, niche_interests, experience_level, risk_level")
      .eq("id", user.id)
      .single();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userPrompt = `Create a one-page business plan for:
- Idea: ${idea || "AI-powered online business"}
- Creator: ${profile?.full_name || "Entrepreneur"}
- Skills/Interests: ${(profile?.niche_interests || []).join(", ") || "general business"}
- Experience: ${profile?.experience_level || "beginner"}
- Risk tolerance: ${profile?.risk_level || "medium"}
- Date: April 2026`;

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
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "{}";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      result = {
        business_name: idea || "My Hustle",
        tagline: "AI-powered income on your terms",
        problem: "People struggle to find reliable online income streams.",
        solution: "A focused, AI-assisted service targeting an underserved niche.",
        target_market: "Small businesses and solopreneurs needing digital help.",
        revenue_model: "Service-based with recurring retainer clients.",
        competitive_edge: "Speed of delivery powered by AI tools.",
        month_1_goals: ["Validate idea", "Get 2 beta clients", "Set up online presence"],
        month_3_goals: ["Hit $1K/mo", "Build referral pipeline", "Automate delivery"],
        month_6_goals: ["Scale to $3K/mo", "Hire first contractor"],
        key_metrics: ["Monthly revenue", "Client retention rate", "Hours per client"],
        startup_budget: "$50",
        revenue_target_6mo: "$3,000/mo",
        tools_stack: ["ChatGPT", "Canva", "Notion"],
        one_sentence_vision: "A lean, profitable micro-agency generating $10K/mo within 18 months.",
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-business-plan error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
