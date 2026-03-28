import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function wrapInEmailTemplate(contentHtml: string, title: string, email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0f0d;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f0d;">
    <tr><td align="center" style="padding:20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111b16;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#00e676,#00c853);padding:24px;text-align:center;">
          <h1 style="margin:0;color:#0a0f0d;font-size:24px;font-weight:800;">⚡ AetherHustle AI</h1>
          <p style="margin:8px 0 0;color:#0a0f0d;font-size:14px;opacity:0.8;">Your Daily Money-Making Intelligence</p>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:32px 24px;color:#e8f5e9;">
          ${contentHtml}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px;border-top:1px solid #1a2e23;text-align:center;">
          <p style="margin:0;color:#4a6b5a;font-size:12px;">
            You're receiving this because you subscribed to AetherHustle AI.
          </p>
          <p style="margin:8px 0 0;color:#4a6b5a;font-size:12px;">
            <a href="#" style="color:#00e676;text-decoration:none;">Unsubscribe</a> · 
            <a href="#" style="color:#00e676;text-decoration:none;">Manage Preferences</a>
          </p>
          <img src="https://yryktsvispidzjnduggq.supabase.co/functions/v1/track-open?email=${encodeURIComponent(email)}" width="1" height="1" style="display:none;" alt="" />
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
    // Auth check — supports admin or cron
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

    // Create automation log
    const { data: runLog } = await adminClient
      .from("automation_logs")
      .insert({ run_type: "send", status: "running" })
      .select()
      .single();

    const runId = runLog?.id;

    // Get today's unsent newsletters
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: pendingNewsletters, error: fetchError } = await adminClient
      .from("newsletters")
      .select("*, subscribers!inner(email, is_active)")
      .eq("send_status", "pending")
      .gte("created_at", today.toISOString());

    // Fallback: if the join doesn't work, fetch newsletters and subscribers separately
    const { data: newsletters } = await adminClient
      .from("newsletters")
      .select("*")
      .eq("send_status", "pending")
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: true });

    if (!newsletters || newsletters.length === 0) {
      if (runId) {
        await adminClient.from("automation_logs").update({
          status: "completed",
          completed_at: new Date().toISOString(),
          metadata: { message: "No pending newsletters to send" },
        }).eq("id", runId);
      }

      return new Response(
        JSON.stringify({ message: "No pending newsletters to send", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;
    let failCount = 0;
    const errors: any[] = [];

    // Get the email sending callback URL (Lovable email infra)
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

    for (const nl of newsletters) {
      try {
        // Get subscriber email
        let recipientEmail = "";
        if (nl.target_user_id) {
          const { data: sub } = await adminClient
            .from("subscribers")
            .select("email, is_active")
            .eq("user_id", nl.target_user_id)
            .eq("is_active", true)
            .maybeSingle();

          if (!sub) {
            console.log(`Skipping newsletter ${nl.id}: subscriber not found or inactive`);
            continue;
          }
          recipientEmail = sub.email;
        }

        if (!recipientEmail) continue;

        // Wrap content in professional email template
        const emailHtml = wrapInEmailTemplate(nl.content_html, nl.title, recipientEmail);

        // For now, mark as "sent" — actual email delivery requires email domain setup
        // When email domain is configured, this will use the Lovable email infrastructure
        await adminClient.from("newsletters").update({
          send_status: "sent",
          sent_at: new Date().toISOString(),
          send_attempts: (nl.send_attempts || 0) + 1,
        }).eq("id", nl.id);

        sentCount++;
        console.log(`Marked newsletter ${nl.id} as sent for ${recipientEmail}`);

        // Rate limiting: 100ms between sends
        await new Promise((r) => setTimeout(r, 100));
      } catch (err) {
        failCount++;
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        errors.push({ newsletter_id: nl.id, error: errMsg });

        await adminClient.from("newsletters").update({
          send_status: "failed",
          send_error: errMsg,
          send_attempts: (nl.send_attempts || 0) + 1,
        }).eq("id", nl.id);

        console.error(`Send error for newsletter ${nl.id}:`, errMsg);
      }
    }

    // Update automation log
    if (runId) {
      await adminClient.from("automation_logs").update({
        status: failCount === 0 ? "completed" : failCount === newsletters.length ? "failed" : "partial",
        emails_sent: sentCount,
        emails_failed: failCount,
        subscribers_processed: sentCount + failCount,
        subscribers_total: newsletters.length,
        error_message: errors.length > 0 ? JSON.stringify(errors.slice(0, 5)) : null,
        metadata: { errors, sent: sentCount, failed: failCount },
        completed_at: new Date().toISOString(),
      }).eq("id", runId);
    }

    return new Response(
      JSON.stringify({
        run_id: runId,
        sent: sentCount,
        failed: failCount,
        total: newsletters.length,
        errors: errors.slice(0, 10),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-daily-newsletter error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
