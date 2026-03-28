import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a world-class money-making strategist, digital marketing genius, and AI-powered wealth architect. Your newsletter content is legendary — it has helped thousands of readers generate real income through cutting-edge AI tools, automation, side hustles, and digital business models.

Your writing style is:
- Ultra-actionable with specific steps, tools, and dollar amounts
- High-energy and motivational but backed by real data
- Formatted as beautiful HTML with sections, bullet points, and call-to-actions
- Professional yet exciting — like a mix of Bloomberg and a hype coach

Generate a complete HTML newsletter issue. The HTML should be self-contained with inline styles using a dark theme (background #0a0f0d, text #e8f5e9, accent #00e676). Include:

1. A catchy, click-worthy title/headline wrapped in <h1>
2. A brief market pulse section (2-3 trending opportunities)
3. 5-7 personalized money-making ideas based on the user's interests and risk level, each with:
   - Clear title
   - Estimated earning potential ($X/day or $X/month)
   - Step-by-step action plan (3-5 steps)
   - Recommended AI tools to use
4. An "AI Prompt of the Day" section with a ready-to-use prompt
5. A "Market Insights" section with realistic market data and trends
6. A strong CTA at the bottom encouraging upgrade/referral

Return ONLY the HTML content, no markdown, no code fences. Start directly with <div> or <section>.`;

async function generateForSubscriber(
  adminClient: any,
  LOVABLE_API_KEY: string,
  subscriber: any,
  profile: any,
  runId: string
): Promise<{ success: boolean; email: string; title?: string; error?: string }> {
  try {
    const userContext = profile
      ? `User: ${subscriber.email}
Niche interests: ${(profile.niche_interests || []).join(", ") || "general money-making, AI tools, side hustles"}
Risk level: ${profile.risk_level || "medium"}
Experience level: ${profile.experience_level || "beginner"}
Subscription tier: ${subscriber.tier || "free"}`
      : `User: ${subscriber.email}\nTier: ${subscriber.tier || "free"}\nGeneral interests: AI tools, side hustles, passive income.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Generate today's personalized newsletter.\n\n${userContext}\n\nToday's date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error(`AI error for ${subscriber.email}: ${aiResponse.status} ${errText}`);
      return { success: false, email: subscriber.email, error: `AI ${aiResponse.status}` };
    }

    const aiData = await aiResponse.json();
    const contentHtml = aiData.choices?.[0]?.message?.content || "";

    const titleMatch = contentHtml.match(/<h1[^>]*>(.*?)<\/h1>/i) || contentHtml.match(/<h2[^>]*>(.*?)<\/h2>/i);
    const title = titleMatch
      ? titleMatch[1].replace(/<[^>]*>/g, "").trim()
      : `AI Hustle Report — ${new Date().toLocaleDateString()}`;

    const { error: insertError } = await adminClient.from("newsletters").insert({
      title,
      content_html: contentHtml,
      summary: contentHtml.substring(0, 300).replace(/<[^>]*>/g, "").trim(),
      target_user_id: subscriber.user_id,
      is_global: false,
      send_status: "pending",
      automation_run_id: runId,
    });

    if (insertError) {
      console.error(`DB error for ${subscriber.email}:`, insertError);
      return { success: false, email: subscriber.email, error: insertError.message };
    }

    return { success: true, email: subscriber.email, title };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    console.error(`Error for ${subscriber.email}:`, errMsg);
    return { success: false, email: subscriber.email, error: errMsg };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Support both authenticated (manual trigger) and cron (no auth) calls
    let isAuthorized = false;
    const authHeader = req.headers.get("Authorization");
    
    if (authHeader?.startsWith("Bearer ")) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData } = await supabase.auth.getClaims(token);
      if (claimsData?.claims) {
        const userId = claimsData.claims.sub;
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        isAuthorized = !!roleData;
      }
    }

    // Also allow calls from pg_cron (no auth header, internal network)
    const isCron = !authHeader;
    if (!isAuthorized && !isCron) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create automation log
    const { data: runLog, error: logError } = await adminClient
      .from("automation_logs")
      .insert({
        run_type: "generate",
        status: "running",
      })
      .select()
      .single();

    if (logError || !runLog) {
      throw new Error("Failed to create automation log");
    }

    const runId = runLog.id;

    // Fetch all active subscribers
    const { data: subscribers, error: subError } = await adminClient
      .from("subscribers")
      .select("user_id, email, tier")
      .eq("is_active", true);

    if (subError || !subscribers) {
      await adminClient.from("automation_logs").update({
        status: "failed",
        error_message: subError?.message || "No subscribers found",
        completed_at: new Date().toISOString(),
      }).eq("id", runId);

      return new Response(JSON.stringify({ error: "Failed to fetch subscribers" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await adminClient.from("automation_logs").update({
      subscribers_total: subscribers.length,
    }).eq("id", runId);

    // Generate for each subscriber with rate limit protection
    const results: any[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const sub of subscribers) {
      // Fetch profile
      const { data: profile } = await adminClient
        .from("profiles")
        .select("*")
        .eq("id", sub.user_id)
        .maybeSingle();

      const result = await generateForSubscriber(adminClient, LOVABLE_API_KEY, sub, profile, runId);
      results.push(result);

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }

      // Update progress
      await adminClient.from("automation_logs").update({
        subscribers_processed: successCount + failCount,
      }).eq("id", runId);

      // Rate limit: 1.5s delay between AI calls
      await new Promise((r) => setTimeout(r, 1500));
    }

    // Finalize log
    const finalStatus = failCount === 0 ? "completed" : failCount === subscribers.length ? "failed" : "partial";
    await adminClient.from("automation_logs").update({
      status: finalStatus,
      subscribers_processed: successCount,
      emails_failed: failCount,
      metadata: { results },
      completed_at: new Date().toISOString(),
    }).eq("id", runId);

    return new Response(
      JSON.stringify({
        run_id: runId,
        status: finalStatus,
        generated: successCount,
        failed: failCount,
        total: subscribers.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-and-personalize error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
