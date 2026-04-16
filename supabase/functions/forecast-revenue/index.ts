import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a realistic revenue forecasting AI. Given a user's hustle idea, skills, and time commitment, return a JSON object (no markdown, no code fences) with this structure:

{
  "forecast": {
    "idea_name": "Name of the hustle",
    "month_1": { "revenue_low": 0, "revenue_high": 100, "milestone": "Set up accounts and first clients", "key_actions": ["action1", "action2"] },
    "month_3": { "revenue_low": 500, "revenue_high": 1500, "milestone": "...", "key_actions": ["...", "..."] },
    "month_6": { "revenue_low": 2000, "revenue_high": 5000, "milestone": "...", "key_actions": ["...", "..."] },
    "month_12": { "revenue_low": 5000, "revenue_high": 15000, "milestone": "...", "key_actions": ["...", "..."] }
  },
  "startup_costs": [{ "item": "Tool/service", "cost": "$X/mo", "essential": true }],
  "risk_factors": ["risk1", "risk2", "risk3"],
  "success_probability": 72,
  "fastest_path_to_first_dollar": "Specific actionable advice to earn the first dollar ASAP",
  "scaling_strategy": "How to 10x after month 6"
}

Be realistic and specific. Use real tool names, real platforms. Adjust for experience level.`;

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

    const { idea, hours_per_week, initial_budget } = await req.json();

    const { data: profile } = await supabase
      .from("profiles")
      .select("niche_interests, experience_level, risk_level")
      .eq("id", user.id)
      .single();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userPrompt = `Forecast revenue for this hustle idea:
- Idea: ${idea || "General online business"}
- Hours per week available: ${hours_per_week || 10}
- Initial budget: ${initial_budget || "$0-100"}
- User skills/interests: ${(profile?.niche_interests || []).join(", ") || "general"}
- Experience level: ${profile?.experience_level || "beginner"}
- Risk tolerance: ${profile?.risk_level || "medium"}

Give a realistic 12-month revenue forecast with specific milestones and actions.`;

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
        forecast: {
          idea_name: idea || "Online Business",
          month_1: { revenue_low: 0, revenue_high: 200, milestone: "Launch and first customers", key_actions: ["Set up presence", "Find first 3 clients"] },
          month_3: { revenue_low: 500, revenue_high: 2000, milestone: "Consistent income stream", key_actions: ["Optimize pricing", "Build referral system"] },
          month_6: { revenue_low: 2000, revenue_high: 5000, milestone: "Scaling operations", key_actions: ["Automate workflows", "Expand offerings"] },
          month_12: { revenue_low: 5000, revenue_high: 15000, milestone: "Full-time potential", key_actions: ["Hire help", "Launch premium tier"] },
        },
        startup_costs: [{ item: "Domain & hosting", cost: "$15/mo", essential: true }],
        risk_factors: ["Market saturation", "Time commitment", "Learning curve"],
        success_probability: 65,
        fastest_path_to_first_dollar: "Offer your service on Fiverr or Upwork today.",
        scaling_strategy: "Productize your service and build a team.",
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("forecast-revenue error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
