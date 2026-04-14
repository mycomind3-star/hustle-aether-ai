import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an elite market opportunity analyst. Scan for real, current money-making opportunities and return a JSON object (no markdown, no code fences) with this structure:

{
  "opportunities": [
    {
      "title": "Short punchy title",
      "category": "AI Tools|E-commerce|Content|Freelancing|Crypto|SaaS|Automation|Investing",
      "urgency": "hot|warm|emerging",
      "potential_income": "$X-Y/mo",
      "difficulty": "easy|medium|hard",
      "time_investment": "X hrs/week",
      "description": "2-3 sentence explanation of the opportunity",
      "action_steps": ["Step 1", "Step 2", "Step 3"],
      "tools_needed": ["Tool 1", "Tool 2"],
      "why_now": "Why this opportunity exists RIGHT NOW",
      "competition_level": "low|medium|high",
      "match_score": 85
    }
  ],
  "market_pulse": {
    "trending_up": ["trend1", "trend2", "trend3"],
    "declining": ["trend1", "trend2"],
    "wildcard": "One surprising opportunity most people are missing"
  }
}

Return exactly 5 opportunities. Rank by match_score (highest first). Be ultra-specific with real platforms, tools, and realistic income ranges. Tailor opportunities to the user's skills and interests.`;

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("niche_interests, experience_level, risk_level")
      .eq("id", user.id)
      .single();

    const niches = (profile?.niche_interests || []).join(", ") || "general online business";
    const exp = profile?.experience_level || "beginner";
    const risk = profile?.risk_level || "medium";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userPrompt = `Find the top 5 money-making opportunities for someone with:
- Interests/niches: ${niches}
- Experience level: ${exp}
- Risk tolerance: ${risk}
- Current date context: April 2026

Focus on opportunities that are actionable THIS WEEK. Prioritize low-competition, high-potential plays. Include at least one "hidden gem" that most people aren't talking about yet.`;

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
        opportunities: [{
          title: "AI Content Creation Agency",
          category: "AI Tools",
          urgency: "hot",
          potential_income: "$2,000-8,000/mo",
          difficulty: "medium",
          time_investment: "10-15 hrs/week",
          description: "Start an AI-powered content creation service for small businesses.",
          action_steps: ["Set up your service offering", "Find 3 beta clients", "Deliver and iterate"],
          tools_needed: ["ChatGPT", "Canva", "Notion"],
          why_now: "Small businesses are desperate for AI-enhanced content but don't know how.",
          competition_level: "medium",
          match_score: 80,
        }],
        market_pulse: {
          trending_up: ["AI automation", "Short-form video", "Digital products"],
          declining: ["Generic dropshipping", "Basic freelance writing"],
          wildcard: "AI voice cloning for personalized audio products",
        },
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scan-opportunities error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
