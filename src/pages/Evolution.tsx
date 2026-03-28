import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap, ArrowLeft, Loader2, Activity, Eye, MousePointer,
  UserPlus, TrendingUp, Sparkles, Play, Archive, CheckCircle, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";

const Evolution = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [evolving, setEvolving] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [evolutionLogs, setEvolutionLogs] = useState<any[]>([]);
  const [evolveResult, setEvolveResult] = useState<any>(null);

  const loadData = async () => {
    const [metricsRes, variantsRes, logsRes] = await Promise.all([
      supabase.from("daily_metrics").select("*").order("date", { ascending: true }).limit(30),
      supabase.from("homepage_variants").select("*").order("performance_score", { ascending: false }),
      supabase.from("automation_logs").select("*")
        .order("created_at", { ascending: false }).limit(10),
    ]);

    if (metricsRes.data) setMetrics(metricsRes.data);
    if (variantsRes.data) setVariants(variantsRes.data);
    if (logsRes.data) {
      setEvolutionLogs(logsRes.data.filter((l: any) => l.metadata?.type === "homepage_evolution"));
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const { data: roleData } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", user.id).eq("role", "admin").maybeSingle();

      if (!roleData) {
        toast.error("Admin access required");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await loadData();
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleEvolve = async () => {
    setEvolving(true);
    setEvolveResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("evolve-homepage", {
        body: {},
      });
      if (error) throw error;
      setEvolveResult(data);
      toast.success(`Evolution complete! ${data?.new_variants || 0} new variants created.`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Evolution failed");
    } finally {
      setEvolving(false);
    }
  };

  // Group variants by section type
  const variantsBySection: Record<string, any[]> = {};
  for (const v of variants.filter((v) => !v.is_archived)) {
    if (!variantsBySection[v.section_type]) variantsBySection[v.section_type] = [];
    variantsBySection[v.section_type].push(v);
  }

  const sectionLabels: Record<string, string> = {
    hero_headline: "Hero Headlines",
    hero_subtext: "Hero Subtexts",
    hero_badge: "Badge Texts",
    cta_text: "CTA Buttons",
    testimonial: "Testimonials",
    pricing_headline: "Pricing Headlines",
  };

  const chartData = metrics.map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    views: m.page_views || 0,
    signups: m.new_signups || 0,
    clicks: m.button_clicks || 0,
    convRate: m.conversion_rate || 0,
  }));

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
            <span className="font-heading text-lg font-bold text-foreground">Homepage Evolution</span>
            <span className="text-primary font-heading font-bold text-sm">AI</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Admin
          </Button>
        </div>
      </header>

      <main className="container px-4 py-10 max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-primary" />
                <h1 className="font-heading text-3xl font-bold text-foreground">Homepage Evolution Dashboard</h1>
              </div>
              <p className="text-muted-foreground">AI-powered self-optimizing landing page. Continuously improving conversions.</p>
            </div>
            <Button
              onClick={handleEvolve}
              disabled={evolving}
              className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              {evolving ? (
                <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Evolving...</>
              ) : (
                <><Play className="mr-2 w-4 h-4" /> Apply Evolution Now</>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              icon: Eye, label: "Total Page Views",
              value: metrics.reduce((s, m) => s + (m.page_views || 0), 0).toLocaleString(),
            },
            {
              icon: MousePointer, label: "Button Clicks",
              value: metrics.reduce((s, m) => s + (m.button_clicks || 0), 0).toLocaleString(),
            },
            {
              icon: UserPlus, label: "Total Signups",
              value: metrics.reduce((s, m) => s + (m.new_signups || 0), 0).toLocaleString(),
            },
            {
              icon: TrendingUp, label: "Avg Conversion",
              value: metrics.length > 0
                ? (metrics.reduce((s, m) => s + (m.conversion_rate || 0), 0) / metrics.length).toFixed(2) + "%"
                : "0%",
            },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Metrics Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <h2 className="font-heading text-xl font-bold text-foreground mb-4">Performance Over Time</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 16%)" />
                <XAxis dataKey="date" stroke="hsl(220 10% 55%)" fontSize={12} />
                <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220 18% 8%)",
                    border: "1px solid hsl(220 14% 16%)",
                    borderRadius: "8px",
                    color: "hsl(0 0% 95%)",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="hsl(145 72% 50%)" name="Page Views" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="signups" stroke="hsl(200 80% 60%)" name="Signups" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="clicks" stroke="hsl(40 90% 55%)" name="Clicks" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              <p>No metrics data yet. Visit the homepage to start generating data.</p>
            </div>
          )}
        </motion.div>

        {/* Conversion Rate Chart */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-xl p-6 mb-8"
          >
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Conversion Rate Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 16%)" />
                <XAxis dataKey="date" stroke="hsl(220 10% 55%)" fontSize={12} />
                <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220 18% 8%)",
                    border: "1px solid hsl(220 14% 16%)",
                    borderRadius: "8px",
                    color: "hsl(0 0% 95%)",
                  }}
                />
                <Bar dataKey="convRate" fill="hsl(145 72% 50%)" name="Conversion %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Evolution Result */}
        {evolveResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 mb-8 glow-green-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-xl font-bold text-foreground">Latest Evolution Results</h2>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto">
                {evolveResult.new_variants} new variants
              </span>
            </div>
            <div className="space-y-3">
              {evolveResult.details?.map((d: any, i: number) => (
                <div key={i} className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                      {d.section?.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-1">"{d.text}"</p>
                  {d.reasoning && (
                    <p className="text-xs text-muted-foreground italic">{d.reasoning}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Past Evolution Logs */}
        {evolutionLogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-6 mb-8"
          >
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Evolution History</h2>
            <div className="space-y-3">
              {evolutionLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    {log.status === "completed" ? (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="text-sm text-foreground">
                      {log.metadata?.new_variants || 0} new variants · {log.metadata?.archived || 0} archived
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Current Winning Variants */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-xl p-6"
        >
          <h2 className="font-heading text-xl font-bold text-foreground mb-6">Current Active Variants</h2>
          <div className="space-y-8">
            {Object.entries(variantsBySection).map(([section, sectionVariants]) => (
              <div key={section}>
                <h3 className="font-heading font-bold text-foreground mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  {sectionLabels[section] || section}
                  <span className="text-xs text-muted-foreground font-normal">({sectionVariants.length} active)</span>
                </h3>
                <div className="space-y-2">
                  {sectionVariants.slice(0, 5).map((v: any) => (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm text-foreground truncate">{v.variant_text}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {v.impressions || 0} impressions
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {v.conversions || 0} conversions
                          </span>
                          <span className="text-xs text-muted-foreground/50">
                            by {v.created_by}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className={`text-sm font-bold ${
                            v.performance_score >= 60 ? "text-primary" :
                            v.performance_score >= 40 ? "text-yellow-500" : "text-destructive"
                          }`}>
                            {Number(v.performance_score).toFixed(0)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">pts</span>
                        </div>
                        {v.impressions > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {((v.conversions / v.impressions) * 100).toFixed(1)}% CTR
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(variantsBySection).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No variants yet. Click "Apply Evolution Now" to generate AI-optimized copy.
              </p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Evolution;
