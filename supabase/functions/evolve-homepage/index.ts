import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Auth: admin or cron
    const authHeader = req.headers.get("Authorization");
    let isAuthorized = false;
    if (authHeader?.startsWith("Bearer ")) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData } = await supabase.auth.getClaims(token);
      if (claimsData?.claims) {
        const { data: roleData } = await supabase
          .from("user_roles").select("role")
          .eq("user_id", claimsData.claims.sub).eq("role", "admin").maybeSingle();
        isAuthorized = !!roleData;
      }
    }
    const isCron = !authHeader;
    if (!isAuthorized && !isCron) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Gather performance data
    const last7days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [metricsRes, variantsRes, eventsRes, subsRes] = await Promise.all([
      adminClient.from("daily_metrics").select("*").gte("date", last7days.split("T")[0]).order("date", { ascending: false }),
      adminClient.from("homepage_variants").select("*").eq("is_active", true).eq("is_archived", false),
      adminClient.from("interaction_events").select("event_type, variant_id, created_at").gte("created_at", last7days),
      adminClient.from("subscribers").select("id", { count: "exact" }).eq("is_active", true),
    ]);

    const metrics = metricsRes.data || [];
    const variants = variantsRes.data || [];
    const events = eventsRes.data || [];
    const totalSubs = subsRes.count || 0;

    // Compute per-variant performance
    const variantStats: Record<string, { impressions: number; clicks: number }> = {};
    for (const e of events) {
      if (e.variant_id) {
        if (!variantStats[e.variant_id]) variantStats[e.variant_id] = { impressions: 0, clicks: 0 };
        if (e.event_type === "page_view") variantStats[e.variant_id].impressions++;
        if (e.event_type === "button_click" || e.event_type === "signup") variantStats[e.variant_id].clicks++;
      }
    }

    // Build analysis context
    const variantSummary = variants.map((v: any) => {
      const stats = variantStats[v.id] || { impressions: 0, clicks: 0 };
      const ctr = stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(1) : "0";
      return `[${v.section_type}] "${v.variant_text}" — Impressions: ${v.impressions + stats.impressions}, CTR: ${ctr}%, Score: ${v.performance_score}`;
    }).join("\n");

    const metricsSummary = metrics.slice(0, 7).map((m: any) =>
      `${m.date}: Views=${m.page_views}, Signups=${m.new_signups}, Conv=${m.conversion_rate}%`
    ).join("\n");

    const prompt = `You are a world-class conversion rate optimizer and copywriting genius for a money-making AI newsletter called "AetherHustle AI".

CURRENT PERFORMANCE DATA (last 7 days):
${metricsSummary || "No metrics data yet — this is a fresh start."}

Total active subscribers: ${totalSubs}

CURRENT HOMEPAGE VARIANTS AND PERFORMANCE:
${variantSummary || "Default variants with no data yet."}

TASK: Analyze this data and generate improved homepage copy variants. Focus on:
1. Higher-converting hero headlines (dramatic, specific dollar amounts, urgency)
2. Better hero subtexts (benefit-focused, social proof, FOMO)
3. Eye-catching badge texts
4. More compelling CTA button texts
5. Powerful testimonials with realistic names and earnings
6. Better pricing section headlines

For EACH suggestion, output a JSON object. Return a JSON array of objects with these fields:
- section_type: one of "hero_headline", "hero_subtext", "hero_badge", "cta_text", "testimonial", "pricing_headline"
- variant_text: the new copy
- variant_metadata: additional JSON data (for hero_headline: {line1, line2, line3}, for testimonial: {name, role, avatar, revenue})
- reasoning: brief explanation of why this will convert better

Generate exactly 2 new variants per section type (12 total). Make them bold, specific, and conversion-optimized.

Return ONLY a valid JSON array, no markdown fences.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a JSON-only response bot. Return only valid JSON arrays." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let rawContent = aiData.choices?.[0]?.message?.content || "[]";

    // Clean markdown fences if present
    rawContent = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let suggestions: any[];
    try {
      suggestions = JSON.parse(rawContent);
    } catch {
      console.error("Failed to parse AI response:", rawContent.substring(0, 500));
      suggestions = [];
    }

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return new Response(JSON.stringify({ message: "No valid suggestions generated", raw: rawContent.substring(0, 200) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Archive lowest-performing variants per section (keep top 3 active per type)
    const sectionGroups: Record<string, any[]> = {};
    for (const v of variants) {
      if (!sectionGroups[v.section_type]) sectionGroups[v.section_type] = [];
      sectionGroups[v.section_type].push(v);
    }

    for (const [section, sectionVars] of Object.entries(sectionGroups)) {
      if (sectionVars.length >= 5) {
        // Archive the 2 lowest scoring
        const sorted = sectionVars.sort((a: any, b: any) => (a.performance_score || 0) - (b.performance_score || 0));
        for (const toArchive of sorted.slice(0, 2)) {
          await adminClient.from("homepage_variants").update({
            is_archived: true,
            is_active: false,
            last_updated: new Date().toISOString(),
          }).eq("id", toArchive.id);
        }
      }
    }

    // Insert new variants
    const newVariants = [];
    for (const s of suggestions) {
      if (!s.section_type || !s.variant_text) continue;
      const { data: inserted } = await adminClient.from("homepage_variants").insert({
        section_type: s.section_type,
        variant_text: s.variant_text,
        variant_metadata: s.variant_metadata || {},
        performance_score: 50,
        is_active: true,
        created_by: "ai_evolution",
      }).select().single();
      if (inserted) newVariants.push(inserted);
    }

    // Update variant performance scores based on data
    for (const [variantId, stats] of Object.entries(variantStats)) {
      const s = stats as { impressions: number; clicks: number };
      if (s.impressions > 0) {
        const ctr = (s.clicks / s.impressions) * 100;
        const score = Math.min(100, Math.max(0, ctr * 10 + 30));
        await adminClient.from("homepage_variants").update({
          impressions: s.impressions,
          conversions: s.clicks,
          performance_score: score,
          last_updated: new Date().toISOString(),
        }).eq("id", variantId);
      }
    }

    // Log the evolution run
    await adminClient.from("automation_logs").insert({
      run_type: "full_pipeline",
      status: "completed",
      metadata: {
        type: "homepage_evolution",
        new_variants: newVariants.length,
        archived: Object.values(sectionGroups).reduce((sum, g) => sum + Math.max(0, g.length - 3), 0),
        suggestions: suggestions.map((s: any) => ({ section: s.section_type, text: s.variant_text?.substring(0, 50), reasoning: s.reasoning })),
      },
      completed_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({
      evolved: true,
      new_variants: newVariants.length,
      suggestions: suggestions.length,
      details: suggestions.map((s: any) => ({
        section: s.section_type,
        text: s.variant_text?.substring(0, 80),
        reasoning: s.reasoning,
      })),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evolve-homepage error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
