import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap, Shield, Users, Send, Loader2, ArrowLeft, CheckCircle, XCircle,
  Activity, Clock, RefreshCw, AlertTriangle, Play, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [batchResults, setBatchResults] = useState<any[] | null>(null);
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [automationLogs, setAutomationLogs] = useState<any[]>([]);
  const [pipelineResult, setPipelineResult] = useState<any>(null);

  const loadData = async () => {
    const [subsRes, nlRes, logsRes] = await Promise.all([
      supabase.from("subscribers").select("*").order("joined_at", { ascending: false }),
      supabase.from("newsletters").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("automation_logs").select("*").order("created_at", { ascending: false }).limit(20),
    ]);

    if (subsRes.data) setSubscribers(subsRes.data);
    if (nlRes.data) setNewsletters(nlRes.data);
    if (logsRes.data) setAutomationLogs(logsRes.data);
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast.error("Admin access required");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await loadData();
      setLoading(false);
    };
    checkAdmin();
  }, [navigate]);

  // Realtime subscription for automation logs
  useEffect(() => {
    const channel = supabase
      .channel("admin-automation")
      .on("postgres_changes", { event: "*", schema: "public", table: "automation_logs" }, () => {
        loadData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleBatchGenerate = async () => {
    setGenerating(true);
    setBatchResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-newsletter", {
        body: { mode: "batch" },
      });
      if (error) throw error;
      setBatchResults(data?.results || []);
      toast.success(`Batch complete! Generated for ${data?.count || 0} subscribers.`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Batch generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleForceRunPipeline = async () => {
    setRunningPipeline(true);
    setPipelineResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("run-daily-pipeline", {
        body: { source: "manual" },
      });
      if (error) throw error;
      setPipelineResult(data);
      toast.success(`Pipeline ${data?.status || "complete"}!`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Pipeline failed");
    } finally {
      setRunningPipeline(false);
    }
  };

  // Compute stats
  const last24hLogs = automationLogs.filter(
    (l) => new Date(l.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
  );
  const successRate = last24hLogs.length > 0
    ? Math.round((last24hLogs.filter((l) => l.status === "completed").length / last24hLogs.length) * 100)
    : 0;
  const lastRun = automationLogs[0];
  const failedCount = last24hLogs.filter((l) => l.status === "failed").length;

  if (loading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen gradient-dark">
      <header className="border-b border-border glass-strong sticky top-0 z-50">
        <div className="container px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground">AetherHustle</span>
            <span className="text-primary font-heading font-bold text-sm">ADMIN</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/evolution")}>
              <Sparkles className="w-4 h-4 mr-2" /> Evolution
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-10 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-3xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">Manage subscribers, generate newsletters, and monitor the automation pipeline.</p>
        </motion.div>

        {/* Automation Status Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-xl p-6 mb-8 glow-green-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-xl font-bold text-foreground">Automation Status</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                failedCount > 0 ? "bg-destructive/20 text-destructive" : "bg-primary/10 text-primary"
              }`}>
                {failedCount > 0 ? "⚠ Issues" : "✅ Healthy"}
              </span>
            </div>
            <Button
              onClick={handleForceRunPipeline}
              disabled={runningPipeline}
              size="sm"
              className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              {runningPipeline ? (
                <><Loader2 className="mr-2 w-3 h-3 animate-spin" /> Running...</>
              ) : (
                <><Play className="mr-2 w-3 h-3" /> Force Run Now</>
              )}
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Last Run</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {lastRun ? new Date(lastRun.created_at).toLocaleString() : "Never"}
              </p>
              {lastRun && (
                <span className={`text-xs ${
                  lastRun.status === "completed" ? "text-primary" :
                  lastRun.status === "failed" ? "text-destructive" : "text-yellow-500"
                }`}>
                  {lastRun.status}
                </span>
              )}
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Success Rate (24h)</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{successRate}%</p>
              <span className="text-xs text-muted-foreground">{last24hLogs.length} runs</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Emails Sent (24h)</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {last24hLogs.reduce((sum, l) => sum + (l.emails_sent || 0), 0)}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-xs text-muted-foreground">Failures (24h)</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {last24hLogs.reduce((sum, l) => sum + (l.emails_failed || 0), 0)}
              </p>
            </div>
          </div>

          {/* Pipeline Result */}
          {pipelineResult && (
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">Pipeline Result:</h4>
              <div className="space-y-2">
                {pipelineResult.pipeline?.steps?.map((step: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {step.status === "success" ? (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="text-foreground capitalize">{step.step}</span>
                    <span className="text-muted-foreground ml-auto">{step.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Runs */}
          <h4 className="text-sm font-semibold text-foreground mb-2">Recent Automation Runs:</h4>
          <div className="space-y-2 max-h-48 overflow-auto">
            {automationLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  {log.status === "completed" ? (
                    <CheckCircle className="w-3 h-3 text-primary" />
                  ) : log.status === "failed" ? (
                    <XCircle className="w-3 h-3 text-destructive" />
                  ) : log.status === "running" ? (
                    <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 text-yellow-500" />
                  )}
                  <span className="text-foreground capitalize">{log.run_type.replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-3">
                  {log.subscribers_processed > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {log.subscribers_processed}/{log.subscribers_total} processed
                    </span>
                  )}
                  {log.emails_sent > 0 && (
                    <span className="text-xs text-primary">{log.emails_sent} sent</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {automationLogs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">No automation runs yet.</p>
            )}
          </div>
        </motion.div>

        {/* Batch Generate */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Send className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-foreground">Quick Generate (Manual)</h3>
                <p className="text-sm text-muted-foreground">
                  One-click generate for {subscribers.length} subscribers (uses original function)
                </p>
              </div>
            </div>
            <Button
              onClick={handleBatchGenerate}
              disabled={generating}
              variant="outline"
              className="font-semibold"
            >
              {generating ? (
                <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><RefreshCw className="mr-2 w-4 h-4" /> Generate</>
              )}
            </Button>
          </div>

          {batchResults && (
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-semibold text-foreground mb-2">Results:</h4>
              {batchResults.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50">
                  {r.status === "generated" ? (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className="text-foreground">{r.email}</span>
                  <span className="text-muted-foreground ml-auto">{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Subscribers */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-bold text-foreground">Subscribers ({subscribers.length})</h2>
          </div>
          <div className="space-y-2">
            {subscribers.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-foreground">{sub.email}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{sub.tier}</span>
                  <span className={`text-xs ${sub.is_active ? "text-primary" : "text-destructive"}`}>
                    {sub.is_active ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(sub.joined_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {subscribers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No subscribers yet.</p>
            )}
          </div>
        </motion.div>

        {/* Recent Newsletters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6"
        >
          <h2 className="font-heading text-xl font-bold text-foreground mb-4">Recent Newsletters</h2>
          <div className="space-y-2">
            {newsletters.map((nl) => (
              <div key={nl.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-primary font-medium mr-2">#{nl.issue_number}</span>
                  <span className="text-sm text-foreground truncate">{nl.title}</span>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    nl.send_status === "sent" ? "bg-primary/10 text-primary" :
                    nl.send_status === "failed" ? "bg-destructive/10 text-destructive" :
                    "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    {nl.send_status || "pending"}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(nl.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {newsletters.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No newsletters generated yet.</p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;
