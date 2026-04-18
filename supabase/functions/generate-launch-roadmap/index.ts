import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { idea, hoursPerDay, experience } = await req.json();
    if (!idea) {
      return new Response(JSON.stringify({ error: "idea is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const prompt = `You are a startup launch coach. Build a 30-day launch roadmap for: "${idea}"
Hours/day available: ${hoursPerDay || 2}
Experience: ${experience || "beginner"}

Return ONLY valid JSON with EXACTLY 30 days grouped into 4 weeks:
{
  "headline": "string",
  "first_revenue_target_day": number (1-30),
  "weeks": [
    {
      "week": 1,
      "theme": "Foundation",
      "goal": "string",
      "days": [
        { "day": 1, "task": "string", "deliverable": "string", "time_estimate": "X hrs" },
        { "day": 2, "task": "string", "deliverable": "string", "time_estimate": "X hrs" },
        { "day": 3, "task": "string", "deliverable": "string", "time_estimate": "X hrs" },
        { "day": 4, "task": "string", "deliverable": "string", "time_estimate": "X hrs" },
        { "day": 5, "task": "string", "deliverable": "string", "time_estimate": "X hrs" },
        { "day": 6, "task": "string", "deliverable": "string", "time_estimate": "X hrs" },
        { "day": 7, "task": "Weekly review + plan", "deliverable": "string", "time_estimate": "1 hr" }
      ]
    },
    { "week": 2, "theme": "Build", "goal": "string", "days": [ /* days 8-14, same shape */ ] },
    { "week": 3, "theme": "Launch", "goal": "string", "days": [ /* days 15-21, same shape */ ] },
    { "week": 4, "theme": "Scale", "goal": "string", "days": [ /* days 22-30, 9 days */ ] }
  ],
  "key_milestones": [
    { "day": number, "milestone": "string" }
  ],
  "success_metrics": ["3 measurable KPIs to hit by day 30"]
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
    console.error("generate-launch-roadmap error", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
