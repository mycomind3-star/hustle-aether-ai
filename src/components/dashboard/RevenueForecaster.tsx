import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, DollarSign, Loader2, Zap, AlertTriangle, Rocket, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ForecastMonth {
  revenue_low: number;
  revenue_high: number;
  milestone: string;
  key_actions: string[];
}

interface ForecastResult {
  forecast: {
    idea_name: string;
    month_1: ForecastMonth;
    month_3: ForecastMonth;
    month_6: ForecastMonth;
    month_12: ForecastMonth;
  };
  startup_costs: { item: string; cost: string; essential: boolean }[];
  risk_factors: string[];
  success_probability: number;
  fastest_path_to_first_dollar: string;
  scaling_strategy: string;
}

const RevenueForecaster = () => {
  const [idea, setIdea] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("10");
  const [budget, setBudget] = useState("$0-100");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleForecast = async () => {
    if (!idea.trim()) { toast.error("Enter a hustle idea to forecast"); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("forecast-revenue", {
        body: { idea: idea.trim(), hours_per_week: parseInt(hoursPerWeek) || 10, initial_budget: budget },
      });
      if (error) throw error;
      setResult(data);
      setExpanded(true);
    } catch (err: any) {
      toast.error(err.message || "Forecast failed");
    } finally {
      setLoading(false);
    }
  };

  const months: { key: string; label: string; field: keyof ForecastResult["forecast"] }[] = [
    { key: "m1", label: "Month 1", field: "month_1" },
    { key: "m3", label: "Month 3", field: "month_3" },
    { key: "m6", label: "Month 6", field: "month_6" },
    { key: "m12", label: "Year 1", field: "month_12" },
  ];

  return (
    <div className="glass rounded-xl p-6 hover:glow-green-sm transition-shadow">
      <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => !result && setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-foreground">Revenue Forecaster</h3>
            <p className="text-xs text-muted-foreground">AI-powered 12-month income projection</p>
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
                  placeholder="Your hustle idea (e.g., AI content agency, Etsy print shop)"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  className="bg-muted/50 border-border"
                  onKeyDown={(e) => e.key === "Enter" && handleForecast()}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Hours/week</label>
                    <Input
                      type="number"
                      value={hoursPerWeek}
                      onChange={(e) => setHoursPerWeek(e.target.value)}
                      className="bg-muted/50 border-border"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Starting budget</label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full h-9 rounded-md border border-border bg-muted/50 px-3 text-sm text-foreground"
                    >
                      <option value="$0">$0 (Broke start)</option>
                      <option value="$0-100">$0–100</option>
                      <option value="$100-500">$100–500</option>
                      <option value="$500-2000">$500–2,000</option>
                      <option value="$2000+">$2,000+</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleForecast} disabled={loading} className="w-full gradient-primary text-primary-foreground font-semibold">
                  {loading ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Forecasting...</> : <><DollarSign className="mr-2 w-4 h-4" /> Forecast My Revenue</>}
                </Button>
              </div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                {/* Success probability */}
                <div className="glass rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Success Probability</span>
                    <span className="text-lg font-bold text-primary">{result.success_probability}%</span>
                  </div>
                  <Progress value={result.success_probability} className="h-2" />
                </div>

                {/* Revenue timeline */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {months.map((m, i) => {
                    const data = result.forecast[m.field] as ForecastMonth;
                    if (!data) return null;
                    return (
                      <motion.div
                        key={m.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass rounded-lg p-3 text-center"
                      >
                        <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                        <p className="text-sm font-bold text-primary">${data.revenue_low.toLocaleString()}–${data.revenue_high.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{data.milestone}</p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* First dollar path */}
                <div className="glass rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">Fastest Path to First $</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.fastest_path_to_first_dollar}</p>
                </div>

                {/* Startup costs */}
                {result.startup_costs?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Startup Costs</p>
                    <div className="flex flex-wrap gap-2">
                      {result.startup_costs.map((c, i) => (
                        <span key={i} className={`text-xs px-2 py-1 rounded-full ${c.essential ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {c.item}: {c.cost} {c.essential && "⚡"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risks */}
                {result.risk_factors?.length > 0 && (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">{result.risk_factors.join(" · ")}</p>
                  </div>
                )}

                {/* Scaling */}
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground"><span className="text-foreground font-medium">10x Strategy:</span> {result.scaling_strategy}</p>
                </div>

                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => { setResult(null); setExpanded(false); }}>
                  Forecast Another Idea
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RevenueForecaster;
