import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Target, Shield, Loader2, ChevronDown, ChevronUp, Users, Lightbulb, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CompetitorResult {
  niche: string;
  market_size: string;
  growth_rate: string;
  top_players: { name: string; strength: string; weakness: string; estimated_revenue: string; audience_size: string }[];
  market_gaps: { gap: string; opportunity_size: string; difficulty_to_fill: string; suggested_approach: string }[];
  positioning_strategies: { strategy: string; description: string; differentiation: string; example: string }[];
  entry_barriers: string[];
  unfair_advantages: string[];
  verdict: { attractiveness_score: number; best_angle: string; avoid: string };
}

const sizeColor = (s: string) => s === "large" ? "text-primary" : s === "medium" ? "text-yellow-500" : "text-muted-foreground";
const diffColor = (d: string) => d === "easy" ? "text-primary" : d === "hard" ? "text-red-400" : "text-yellow-500";

const CompetitorIntel = () => {
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompetitorResult | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleAnalyze = async () => {
    if (!niche.trim()) { toast.error("Enter a niche to analyze"); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-competitors", {
        body: { niche: niche.trim() },
      });
      if (error) throw error;
      setResult(data);
      setExpanded(true);
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-xl p-6 hover:glow-green-sm transition-shadow">
      <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => !result && setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-foreground">Competitor Intelligence</h3>
            <p className="text-xs text-muted-foreground">AI niche analysis — gaps, players & positioning</p>
          </div>
        </div>
        {result && (
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {(!result || expanded) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            {!result && (
              <div className="space-y-3 mb-4">
                <Input
                  placeholder="Enter a niche (e.g., AI tutoring, pet subscription boxes)"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="bg-muted/50 border-border"
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                />
                <Button onClick={handleAnalyze} disabled={loading} className="w-full gradient-primary text-primary-foreground font-semibold">
                  {loading ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Analyzing Market...</> : <><Search className="mr-2 w-4 h-4" /> Analyze Competition</>}
                </Button>
              </div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                {/* Verdict header */}
                <div className="glass rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">{result.niche}</p>
                      <p className="text-xs text-muted-foreground">{result.market_size} market · {result.growth_rate} growth</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Attractiveness</p>
                      <p className="text-lg font-bold text-primary">{result.verdict?.attractiveness_score || 70}/100</p>
                    </div>
                  </div>
                  <Progress value={result.verdict?.attractiveness_score || 70} className="h-2" />
                </div>

                {/* Best angle */}
                <div className="glass rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">Best Entry Angle</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.verdict?.best_angle}</p>
                </div>

                {/* Top players */}
                {result.top_players?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Players</p>
                    </div>
                    <div className="space-y-2">
                      {result.top_players.map((p, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="glass rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{p.name}</span>
                            <span className="text-[10px] text-muted-foreground">{p.estimated_revenue}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <span className="text-primary">✓ {p.strength}</span>
                            <span className="text-red-400">✗ {p.weakness}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Market gaps */}
                {result.market_gaps?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Market Gaps</p>
                    </div>
                    <div className="space-y-2">
                      {result.market_gaps.map((g, i) => (
                        <div key={i} className="glass rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{g.gap}</span>
                            <div className="flex gap-2 text-[10px]">
                              <span className={sizeColor(g.opportunity_size)}>{g.opportunity_size}</span>
                              <span className={diffColor(g.difficulty_to_fill)}>{g.difficulty_to_fill}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{g.suggested_approach}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Positioning */}
                {result.positioning_strategies?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Positioning Strategies</p>
                    </div>
                    {result.positioning_strategies.map((s, i) => (
                      <div key={i} className="glass rounded-lg p-3 mb-2">
                        <p className="text-sm font-medium text-foreground mb-1">{s.strategy}</p>
                        <p className="text-xs text-muted-foreground mb-1">{s.description}</p>
                        <p className="text-[10px] text-primary italic">Example: {s.example}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Avoid */}
                {result.verdict?.avoid && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground"><span className="text-red-400 font-medium">Avoid:</span> {result.verdict.avoid}</p>
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => { setResult(null); setExpanded(false); }}>
                  Analyze Another Niche
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompetitorIntel;
