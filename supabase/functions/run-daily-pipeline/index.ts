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

    // Create pipeline log
    const { data: runLog } = await adminClient
      .from("automation_logs")
      .insert({ run_type: "full_pipeline", status: "running" })
      .select()
      .single();

    const runId = runLog?.id;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const pipelineResults: any = { steps: [] };

    // Step 1: Generate newsletters
    console.log("🚀 Pipeline Step 1: Generate & Personalize Newsletters");
    try {
      const genResponse = await fetch(`${SUPABASE_URL}/functions/v1/generate-and-personalize-newsletter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({}),
      });
      const genData = await genResponse.json();
      pipelineResults.steps.push({ step: "generate", status: genResponse.ok ? "success" : "failed", data: genData });
      console.log(`   ✅ Generate complete: ${genData.generated || 0} generated, ${genData.failed || 0} failed`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown";
      pipelineResults.steps.push({ step: "generate", status: "error", error: errMsg });
      console.error(`   ❌ Generate failed: ${errMsg}`);
    }

    // Small delay between steps
    await new Promise((r) => setTimeout(r, 2000));

    // Step 2: Send newsletters
    console.log("📧 Pipeline Step 2: Send Daily Newsletter");
    try {
      const sendResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-daily-newsletter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({}),
      });
      const sendData = await sendResponse.json();
      pipelineResults.steps.push({ step: "send", status: sendResponse.ok ? "success" : "failed", data: sendData });
      console.log(`   ✅ Send complete: ${sendData.sent || 0} sent, ${sendData.failed || 0} failed`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown";
      pipelineResults.steps.push({ step: "send", status: "error", error: errMsg });
      console.error(`   ❌ Send failed: ${errMsg}`);
    }

    await new Promise((r) => setTimeout(r, 2000));

    // Step 3: Monitor and retry
    console.log("🔍 Pipeline Step 3: Monitor & Retry");
    try {
      const monResponse = await fetch(`${SUPABASE_URL}/functions/v1/monitor-and-retry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({}),
      });
      const monData = await monResponse.json();
      pipelineResults.steps.push({ step: "monitor", status: monResponse.ok ? "success" : "failed", data: monData });
      console.log(`   ✅ Monitor complete: ${monData.retries?.attempted || 0} retries, ${monData.critical_failures || 0} critical`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown";
      pipelineResults.steps.push({ step: "monitor", status: "error", error: errMsg });
      console.error(`   ❌ Monitor failed: ${errMsg}`);
    }

    // Determine overall status
    const allSuccess = pipelineResults.steps.every((s: any) => s.status === "success");
    const allFailed = pipelineResults.steps.every((s: any) => s.status !== "success");
    const finalStatus = allSuccess ? "completed" : allFailed ? "failed" : "partial";

    // Update pipeline log
    if (runId) {
      await adminClient.from("automation_logs").update({
        status: finalStatus,
        metadata: pipelineResults,
        completed_at: new Date().toISOString(),
      }).eq("id", runId);
    }

    console.log(`🏁 Pipeline ${finalStatus}`);

    return new Response(
      JSON.stringify({ run_id: runId, status: finalStatus, pipeline: pipelineResults }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("run-daily-pipeline error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
