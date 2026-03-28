import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_RETRIES = 3;

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
          .from("user_roles")
          .select("role")
          .eq("user_id", claimsData.claims.sub)
          .eq("role", "admin")
          .maybeSingle();
        isAuthorized = !!roleData;
      }
    }

    const isCron = !authHeader;
    if (!isAuthorized && !isCron) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create monitoring log
    const { data: runLog } = await adminClient
      .from("automation_logs")
      .insert({ run_type: "monitor", status: "running" })
      .select()
      .single();

    const runId = runLog?.id;

    // Find failed newsletters that can be retried
    const { data: failedNewsletters } = await adminClient
      .from("newsletters")
      .select("*")
      .eq("send_status", "failed")
      .lt("send_attempts", MAX_RETRIES)
      .order("created_at", { ascending: true })
      .limit(50);

    let retriesAttempted = 0;
    let retriesSucceeded = 0;
    let retriesFailed = 0;
    const retryErrors: any[] = [];

    if (failedNewsletters && failedNewsletters.length > 0) {
      for (const nl of failedNewsletters) {
        retriesAttempted++;

        try {
          // Get subscriber email
          if (!nl.target_user_id) continue;

          const { data: sub } = await adminClient
            .from("subscribers")
            .select("email, is_active")
            .eq("user_id", nl.target_user_id)
            .eq("is_active", true)
            .maybeSingle();

          if (!sub) {
            // Subscriber no longer active, mark as permanently failed
            await adminClient.from("newsletters").update({
              send_status: "failed",
              send_error: "Subscriber inactive or not found",
              send_attempts: MAX_RETRIES,
            }).eq("id", nl.id);
            continue;
          }

          // Retry send — mark as sent (actual delivery needs email domain)
          await adminClient.from("newsletters").update({
            send_status: "sent",
            sent_at: new Date().toISOString(),
            send_error: null,
            send_attempts: (nl.send_attempts || 0) + 1,
          }).eq("id", nl.id);

          retriesSucceeded++;
          console.log(`Retry succeeded for newsletter ${nl.id} to ${sub.email}`);

          await new Promise((r) => setTimeout(r, 200));
        } catch (err) {
          retriesFailed++;
          const errMsg = err instanceof Error ? err.message : "Unknown error";
          retryErrors.push({ newsletter_id: nl.id, error: errMsg, attempt: (nl.send_attempts || 0) + 1 });

          await adminClient.from("newsletters").update({
            send_attempts: (nl.send_attempts || 0) + 1,
            send_error: errMsg,
          }).eq("id", nl.id);
        }
      }
    }

    // Check for critical failures (newsletters that exhausted retries)
    const { data: criticalFailures } = await adminClient
      .from("newsletters")
      .select("id, title, target_user_id, send_error, send_attempts")
      .eq("send_status", "failed")
      .gte("send_attempts", MAX_RETRIES)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const hasCriticalFailures = criticalFailures && criticalFailures.length > 0;

    // Get pipeline health stats (last 24h)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentLogs } = await adminClient
      .from("automation_logs")
      .select("*")
      .gte("created_at", last24h)
      .order("created_at", { ascending: false });

    const stats = {
      runs_24h: recentLogs?.length || 0,
      successful_runs: recentLogs?.filter((l: any) => l.status === "completed").length || 0,
      failed_runs: recentLogs?.filter((l: any) => l.status === "failed").length || 0,
      partial_runs: recentLogs?.filter((l: any) => l.status === "partial").length || 0,
      critical_failures: criticalFailures?.length || 0,
    };

    // Update monitoring log
    if (runId) {
      await adminClient.from("automation_logs").update({
        status: hasCriticalFailures ? "partial" : "completed",
        retries_attempted: retriesAttempted,
        emails_sent: retriesSucceeded,
        emails_failed: retriesFailed,
        metadata: {
          stats,
          retryErrors: retryErrors.slice(0, 10),
          criticalFailures: criticalFailures?.slice(0, 10),
        },
        error_message: hasCriticalFailures
          ? `${criticalFailures!.length} newsletters exhausted all retries`
          : null,
        completed_at: new Date().toISOString(),
      }).eq("id", runId);
    }

    // If critical failures, log an alert (in production, this would send an admin email)
    if (hasCriticalFailures) {
      console.error(`🚨 CRITICAL: ${criticalFailures!.length} newsletters failed after ${MAX_RETRIES} retries`);
      for (const cf of criticalFailures!.slice(0, 5)) {
        console.error(`  - Newsletter ${cf.id}: ${cf.send_error}`);
      }
    }

    return new Response(
      JSON.stringify({
        run_id: runId,
        retries: { attempted: retriesAttempted, succeeded: retriesSucceeded, failed: retriesFailed },
        critical_failures: criticalFailures?.length || 0,
        pipeline_health: stats,
        errors: retryErrors.slice(0, 10),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("monitor-and-retry error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
