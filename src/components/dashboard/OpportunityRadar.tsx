import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar, Zap, Clock, TrendingUp, TrendingDown, Sparkles,
  Loader2, ChevronDown, ChevronUp, Flame, Target, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Opportunity = {
  title: string;
  category: string;
  urgency: string;
  potential_income: string;
  difficulty: string;
  time_investment: string;
  description: string;
  action_steps: string[];
  tools_needed: string[];
  why_now: string;
  competition_level: string;
  match_score: number;
};

type MarketPulse = {
  trending_up: string[];
  declining: string[];
  wildcard: string;
};

type ScanResult = {
  opportunities: Opportunity[];
  market_pulse: MarketPulse;
};

const urgencyConfig: Record<string, { label: string; color: string; icon: any }> = {
  hot: { label: "🔥 HOT", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: Flame },
  warm: { label: "⚡ Warm", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Zap },
  emerging: { label: "🌱 Emerging", color: "bg-primary/20 text-primary border-primary/30", icon: TrendingUp },
};

const difficultyColors: Record<string, string> = {
  easy: "text-primary",
  medium: "text-yellow-400",
  hard: "text-red-400",
};

const competitionColors: Record<string, string> = {
  low: "text-primary",
  medium: "text-yellow-400",
  high: "text-red-400",
};

const OpportunityRadar = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const handleScan = async () => {
    setScanning(true);
    setResult(null);
    setExpandedIdx(null);
    setScanProgress(0);

    // Simulate scan progress
    const interval = setInterval(() => {
      setScanProgress((p) => Math.min(p + Math.random() * 15, 90));
    }, 400);

    try {
      const { data, error } = await supabase.functions.invoke("scan-opportunities");
      if (error) throw error;
      setScanProgress(100);
      setTimeout(() => {
        setResult(data as ScanResult);
        toast.success("Radar scan complete! 5 opportunities found 🎯");
      }, 300);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Scan failed. Try again.");
    } finally {
      clearInterval(interval);
      setScanning(false);
    }
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Radar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">Opportunity Radar</h2>
              <p className="text-sm text-muted-foreground">AI-powered market scanning for real-time money plays</p>
            </div>
          </div>
          <Button
            onClick={handleScan}
            disabled={scanning}
            className="gradient-primary text-primary-foreground font-semibold hover:opacity-90"
          >
            {scanning ? (
              <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Scanning...</>
            ) : (
              <><Radar className="mr-2 w-4 h-4" /> Scan Now</>
            )}
          </Button>
        </div>

        {/* Scan progress */}
        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Analyzing markets & trends...</span>
                <span className="text-xs text-primary font-medium">{Math.round(scanProgress)}%</span>
              </div>
              <Progress value={scanProgress} className="h-1.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Market Pulse */}
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Market Pulse</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-primary">Trending Up</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.market_pulse.trending_up.map((t) => (
                        <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingDown className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-red-400">Declining</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.market_pulse.declining.map((t) => (
                        <span key={t} className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-yellow-400">Wildcard</span>
                    <p className="text-xs text-muted-foreground mt-1">{result.market_pulse.wildcard}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Opportunities */}
            <div className="divide-y divide-border">
              {result.opportunities.map((opp, idx) => {
                const urgency = urgencyConfig[opp.urgency] || urgencyConfig.emerging;
                const expanded = expandedIdx === idx;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setExpandedIdx(expanded ? null : idx)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${urgency.color}`}>
                            {urgency.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {opp.category}
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-foreground">{opp.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{opp.description}</p>

                        {/* Quick stats row */}
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <span className="text-xs text-foreground font-medium">{opp.potential_income}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {opp.time_investment}
                          </span>
                          <span className={`text-xs capitalize ${difficultyColors[opp.difficulty] || "text-muted-foreground"}`}>
                            {opp.difficulty} difficulty
                          </span>
                          <span className={`text-xs capitalize ${competitionColors[opp.competition_level] || "text-muted-foreground"}`}>
                            {opp.competition_level} competition
                          </span>
                        </div>
                      </div>

                      {/* Match score + expand */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="relative w-12 h-12">
                          <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                            <circle
                              cx="18" cy="18" r="15" fill="none"
                              stroke="hsl(var(--primary))"
                              strokeWidth="3"
                              strokeDasharray={`${opp.match_score * 0.942} 100`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                            {opp.match_score}
                          </span>
                        </div>
                        {expanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-border space-y-4">
                            {/* Why Now */}
                            <div className="glass rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-primary" />
                                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Why Now</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{opp.why_now}</p>
                            </div>

                            {/* Action Steps */}
                            <div>
                              <span className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 block">Action Plan</span>
                              <div className="space-y-1.5">
                                {opp.action_steps.map((step, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                      {i + 1}
                                    </span>
                                    <span className="text-sm text-muted-foreground">{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Tools */}
                            <div>
                              <span className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 block">Tools Needed</span>
                              <div className="flex flex-wrap gap-1.5">
                                {opp.tools_needed.map((tool) => (
                                  <span key={tool} className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!result && !scanning && (
        <div className="p-8 text-center">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center mx-auto mb-4"
          >
            <Radar className="w-7 h-7 text-primary/50" />
          </motion.div>
          <p className="text-muted-foreground text-sm">Hit <span className="text-primary font-medium">Scan Now</span> to discover personalized opportunities</p>
          <p className="text-muted-foreground/60 text-xs mt-1">AI analyzes trends, competition & your profile</p>
        </div>
      )}
    </div>
  );
};

export default OpportunityRadar;
