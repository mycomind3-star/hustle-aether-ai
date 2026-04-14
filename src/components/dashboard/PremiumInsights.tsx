import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, TrendingUp, Target, Lightbulb, Sparkles, Loader2,
  Flame, BarChart3, ArrowRight, Zap, Clock, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface PremiumInsightsProps {
  tier: string;
}

type Insights = {
  market_trends: { title: string; description: string; opportunity_score: number; category: string; timeframe: string }[];
  revenue_predictions: { niche: string; current_avg: string; predicted_30d: string; confidence: number; reasoning: string }[];
  competitor_gaps: { market: string; gap_description: string; estimated_value: string; difficulty: string; tools_needed: string[] }[];
  ai_strategy: { title: string; summary: string; steps: string[]; estimated_roi: string; tools: string[] };
  hot_tip: { title: string; description: string; urgency: string };
};

const urgencyColors: Record<string, string> = {
  act_now: "bg-destructive/20 text-destructive",
  this_week: "bg-yellow-500/20 text-yellow-400",
  this_month: "bg-primary/20 text-primary",
};

const difficultyColors: Record<string, string> = {
  easy: "text-primary",
  medium: "text-yellow-400",
  hard: "text-destructive",
};

export default function PremiumInsights({ tier }: PremiumInsightsProps) {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"trends" | "predictions" | "gaps" | "strategy">("trends");
  const isPaid = true; // All features are free!

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-premium-insights");
      if (error) throw error;
      if (data?.insights) {
        setInsights(data.insights);
        toast.success("Premium insights generated! 🔥");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  // Locked state for free users
  if (!isPaid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative z-10 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Premium AI Insights</h2>
          <p className="text-muted-foreground mb-6">
            Unlock real-time market intelligence, revenue predictions, competitor gap analysis, and personalized AI strategies.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: TrendingUp, label: "Market Trends" },
              { icon: BarChart3, label: "Revenue Predictions" },
              { icon: Target, label: "Competitor Gaps" },
              { icon: Lightbulb, label: "AI Strategy" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                <f.icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">{f.label}</span>
              </div>
            ))}
          </div>
          <Button
            className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity px-8"
            onClick={() => navigate("/")}
          >
            Upgrade to Unlock <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Premium content
  const tabs = [
    { key: "trends" as const, label: "Trends", icon: TrendingUp },
    { key: "predictions" as const, label: "Predictions", icon: BarChart3 },
    { key: "gaps" as const, label: "Gaps", icon: Target },
    { key: "strategy" as const, label: "Strategy", icon: Lightbulb },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header card */}
      <div className="glass rounded-xl p-6 glow-green-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">Premium AI Insights</h2>
              <p className="text-sm text-muted-foreground">AI-powered market intelligence tailored to you</p>
            </div>
          </div>
          <Button
            onClick={generate}
            disabled={loading}
            className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="mr-2 w-4 h-4" /> Generate Insights</>
            )}
          </Button>
        </div>
      </div>

      {/* Hot Tip */}
      {insights?.hot_tip && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-xl p-4 border border-primary/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading font-bold text-foreground text-sm">{insights.hot_tip.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyColors[insights.hot_tip.urgency] || urgencyColors.this_week}`}>
                  {insights.hot_tip.urgency.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{insights.hot_tip.description}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs + Content */}
      {insights && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="flex border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "trends" && (
                <motion.div key="trends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {insights.market_trends?.map((t, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-heading font-bold text-foreground text-sm">{t.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t.category}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {t.timeframe}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{t.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Opportunity:</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full gradient-primary rounded-full" style={{ width: `${t.opportunity_score}%` }} />
                        </div>
                        <span className="text-xs font-bold text-primary">{t.opportunity_score}/100</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === "predictions" && (
                <motion.div key="predictions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {insights.revenue_predictions?.map((p, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-heading font-bold text-foreground text-sm">{p.niche}</h4>
                        <span className="text-xs font-medium text-primary">{p.confidence}% confidence</span>
                      </div>
                      <div className="flex items-center gap-4 mb-2">
                        <div>
                          <span className="text-xs text-muted-foreground block">Current Avg</span>
                          <span className="text-sm font-bold text-foreground">{p.current_avg}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">30-Day Predicted</span>
                          <span className="text-sm font-bold text-primary">{p.predicted_30d}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.reasoning}</p>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === "gaps" && (
                <motion.div key="gaps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {insights.competitor_gaps?.map((g, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-heading font-bold text-foreground text-sm">{g.market}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium capitalize ${difficultyColors[g.difficulty] || "text-muted-foreground"}`}>
                            {g.difficulty}
                          </span>
                          <span className="text-xs font-bold text-primary">{g.estimated_value}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{g.gap_description}</p>
                      <div className="flex flex-wrap gap-1">
                        {g.tools_needed?.map((tool, j) => (
                          <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === "strategy" && (
                <motion.div key="strategy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="bg-muted/50 rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-primary" />
                      <h4 className="font-heading font-bold text-foreground">{insights.ai_strategy?.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{insights.ai_strategy?.summary}</p>
                    <div className="space-y-2 mb-4">
                      {insights.ai_strategy?.steps?.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-sm text-foreground">{step}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Est. ROI: <strong className="text-primary">{insights.ai_strategy?.estimated_roi}</strong></span>
                      </div>
                      <div className="flex gap-1">
                        {insights.ai_strategy?.tools?.map((tool, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tool}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty state for paid but no insights yet */}
      {!insights && !loading && (
        <div className="glass rounded-xl p-8 text-center">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Click "Generate Insights" to get your personalized market intelligence.</p>
        </div>
      )}
    </motion.div>
  );
}
