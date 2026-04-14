import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BLUEPRINT_PROMPT = `You are an elite side-hustle strategist. Based on the user's answers, generate a personalized money-making blueprint.

Return a JSON object (no markdown, no code fences) with this exact structure:
{
  "hustle_name": "A catchy name for their ideal hustle",
  "tagline": "One-line description of the opportunity",
  "match_score": 85,
  "income_potential": "$X,XXX/mo",
  "time_to_first_dollar": "X days",
  "week_1_plan": ["Day 1-2: ...", "Day 3-4: ...", "Day 5-6: ...", "Day 7: ..."],
  "tools": [{"name": "Tool Name", "cost": "Free/$X/mo"}],
  "revenue_streams": [{"stream": "Stream name", "percentage": 50}],
  "pro_tip": "One insider tip that makes this 10x more effective"
}

Be ultra-specific with real tool names, realistic dollar amounts, and actionable steps. The hustle should be realistic and achievable based on their constraints.`;

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

    const { answers } = await req.json();
    if (!answers || typeof answers !== "object") {
      return new Response(JSON.stringify({ error: "Answers required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Get user profile for extra context
    const { data: profile } = await supabase
      .from("profiles")
      .select("niche_interests, experience_level")
      .eq("id", user.id)
      .single();

    const niches = (profile?.niche_interests || []).join(", ") || "general";
    const exp = profile?.experience_level || "beginner";

    const userPrompt = `Generate a hustle blueprint for someone with these preferences:
- Available time: ${answers.time || "moderate"}
- Starting budget: ${answers.budget || "low"}
- Strongest skills: ${answers.skills || "general"}
- Monthly income goal: ${answers.goal || "growth"}
- Experience level: ${exp}
- Interests: ${niches}

Make it specific to their exact situation. Include only tools and strategies that match their budget and time constraints.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: BLUEPRINT_PROMPT },
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

    let blueprint;
    try {
      blueprint = JSON.parse(content);
    } catch {
      blueprint = {
        hustle_name: "Custom Side Hustle",
        tagline: "Your personalized strategy is being refined",
        match_score: 75,
        income_potential: "$500-2,000/mo",
        time_to_first_dollar: "7-14 days",
        week_1_plan: ["Research your niche", "Set up basic tools", "Create first piece of content", "Launch and iterate"],
        tools: [{ name: "Canva", cost: "Free" }],
        revenue_streams: [{ stream: "Primary Income", percentage: 100 }],
        pro_tip: "Consistency beats perfection. Start before you're ready.",
      };
    }

    return new Response(JSON.stringify({ blueprint }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("hustle-dna error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
