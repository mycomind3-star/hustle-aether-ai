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

1. A catchy, click-worthy title/headline
2. A brief market pulse section (2-3 trending opportunities)
3. 5-7 personalized money-making ideas based on the user's interests and risk level, each with:
   - Clear title
   - Estimated earning potential
   - Step-by-step action plan (3-5 steps)
   - Recommended AI tools to use
4. An "AI Prompt of the Day" section with a ready-to-use prompt for ChatGPT/Claude
5. A "Market Insights" section with fake but realistic market data
6. A strong CTA at the bottom encouraging upgrade/referral

Return ONLY the HTML content, no markdown, no code fences. Start directly with <div> or <section>.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { mode, target_user_id } = await req.json();

    // For batch mode, check admin role
    if (mode === "batch") {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        return new Response(JSON.stringify({ error: "Admin access required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Single user generation
    if (mode !== "batch") {
      const targetId = target_user_id || userId;
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetId)
        .single();

      const userContext = profile
        ? `User preferences:
- Niche interests: ${(profile.niche_interests || []).join(", ") || "general money-making, AI tools, side hustles"}
- Risk level: ${profile.risk_level || "medium"}
- Experience level: ${profile.experience_level || "beginner"}
- Subscription tier: ${profile.subscription_tier || "free"}`
        : "User preferences: general money-making, AI tools, side hustles. Risk: medium. Experience: beginner.";

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
              content: `Generate today's newsletter for this subscriber.\n\n${userContext}\n\nToday's date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        const status = aiResponse.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "AI rate limit exceeded. Please try again in a moment." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errText = await aiResponse.text();
        console.error("AI error:", status, errText);
        throw new Error("AI generation failed");
      }

      const aiData = await aiResponse.json();
      const contentHtml = aiData.choices?.[0]?.message?.content || "";

      // Extract title from content
      const titleMatch = contentHtml.match(/<h1[^>]*>(.*?)<\/h1>/i) ||
        contentHtml.match(/<h2[^>]*>(.*?)<\/h2>/i);
      const title = titleMatch
        ? titleMatch[1].replace(/<[^>]*>/g, "")
        : `AI Hustle Report — ${new Date().toLocaleDateString()}`;

      // Save to newsletters table using service role client
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: newsletter, error: insertError } = await adminClient
        .from("newsletters")
        .insert({
          title,
          content_html: contentHtml,
          summary: contentHtml.substring(0, 200).replace(/<[^>]*>/g, ""),
          target_user_id: targetId,
          is_global: false,
          created_by: userId,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("Failed to save newsletter");
      }

      return new Response(JSON.stringify({ newsletter }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch mode — generate for all active subscribers
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: subscribers } = await adminClient
      .from("subscribers")
      .select("user_id, email, tier")
      .eq("is_active", true);

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ message: "No active subscribers", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];
    for (const sub of subscribers) {
      try {
        const { data: profile } = await adminClient
          .from("profiles")
          .select("*")
          .eq("id", sub.user_id)
          .maybeSingle();

        const userContext = profile
          ? `User: ${sub.email}\nNiche interests: ${(profile.niche_interests || []).join(", ") || "general"}\nRisk level: ${profile.risk_level || "medium"}\nExperience: ${profile.experience_level || "beginner"}\nTier: ${sub.tier}`
          : `User: ${sub.email}\nTier: ${sub.tier}\nGeneral interests.`;

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
              { role: "user", content: `Generate personalized newsletter.\n\n${userContext}\n\nDate: ${new Date().toLocaleDateString()}` },
            ],
          }),
        });

        if (!aiResponse.ok) {
          console.error(`Failed for ${sub.email}: ${aiResponse.status}`);
          results.push({ email: sub.email, status: "failed" });
          continue;
        }

        const aiData = await aiResponse.json();
        const contentHtml = aiData.choices?.[0]?.message?.content || "";
        const titleMatch = contentHtml.match(/<h1[^>]*>(.*?)<\/h1>/i) || contentHtml.match(/<h2[^>]*>(.*?)<\/h2>/i);
        const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "") : `Daily Hustle — ${new Date().toLocaleDateString()}`;

        await adminClient.from("newsletters").insert({
          title,
          content_html: contentHtml,
          summary: contentHtml.substring(0, 200).replace(/<[^>]*>/g, ""),
          target_user_id: sub.user_id,
          is_global: false,
          created_by: userId,
        });

        results.push({ email: sub.email, status: "generated", title });

        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        console.error(`Error for ${sub.email}:`, err);
        results.push({ email: sub.email, status: "error" });
      }
    }

    return new Response(
      JSON.stringify({ message: `Batch complete`, count: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-newsletter error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
