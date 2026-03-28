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

  try {
    const { event_type, event_data, variant_id, session_id } = await req.json();

    if (!event_type || !session_id) {
      return new Response(JSON.stringify({ error: "Missing event_type or session_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insert event
    await adminClient.from("interaction_events").insert({
      event_type,
      event_data: event_data || {},
      variant_id: variant_id || null,
      session_id,
    });

    // Update daily metrics
    const today = new Date().toISOString().split("T")[0];

    // Try upsert: get current row or create
    const { data: existing } = await adminClient
      .from("daily_metrics").select("*").eq("date", today).maybeSingle();

    if (existing) {
      const updates: any = {};
      if (event_type === "page_view") updates.page_views = (existing.page_views || 0) + 1;
      if (event_type === "button_click") updates.button_clicks = (existing.button_clicks || 0) + 1;
      if (event_type === "signup") {
        updates.new_signups = (existing.new_signups || 0) + 1;
        // Recalc conversion rate
        const views = event_type === "page_view" ? (existing.page_views || 0) + 1 : (existing.page_views || 0);
        const signups = (existing.new_signups || 0) + 1;
        updates.conversion_rate = views > 0 ? Number(((signups / views) * 100).toFixed(2)) : 0;
      }
      await adminClient.from("daily_metrics").update(updates).eq("id", existing.id);
    } else {
      await adminClient.from("daily_metrics").insert({
        date: today,
        page_views: event_type === "page_view" ? 1 : 0,
        button_clicks: event_type === "button_click" ? 1 : 0,
        new_signups: event_type === "signup" ? 1 : 0,
        conversion_rate: 0,
      });
    }

    // Update variant impression/conversion counts
    if (variant_id) {
      const { data: variant } = await adminClient
        .from("homepage_variants").select("impressions, conversions").eq("id", variant_id).maybeSingle();
      if (variant) {
        if (event_type === "page_view") {
          await adminClient.from("homepage_variants").update({
            impressions: (variant.impressions || 0) + 1,
          }).eq("id", variant_id);
        }
        if (event_type === "button_click" || event_type === "signup") {
          await adminClient.from("homepage_variants").update({
            conversions: (variant.conversions || 0) + 1,
          }).eq("id", variant_id);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("track-interaction error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
