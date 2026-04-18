import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Loader2, Tag, TrendingDown, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PricingResult {
  recommended_price: string;
  price_range: { low: string; sweet_spot: string; premium: string };
  psychological_anchor: string;
  tiers: { name: string; price: string; features: string[]; target: string }[];
  competitor_avg: string;
  value_justification: string[];
  discount_strategy: string;
  upsell_ideas: string[];
  warning: string;
}

const PricingOptimizer = () => {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [costBase, setCostBase] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PricingResult | null>(null);

  const handleOptimize = async () => {
    if (!product.trim()) { toast.error("Describe your product first"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("optimize-pricing", {
        body: { product, audience, costBase },
      });
      if (error) throw error;
      setResult(data.data);
      toast.success("Pricing strategy ready 💰");
    } catch (e: any) {
      toast.error(e.message || "Failed to optimize");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-premium rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Tag className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">AI Pricing Optimizer</h3>
          <p className="text-xs text-muted-foreground">Find your sweet-spot price + tiered packages</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <Input placeholder="Your product/service" value={product} onChange={(e) => setProduct(e.target.value)} className="bg-background/50" />
        <Input placeholder="Target audience" value={audience} onChange={(e) => setAudience(e.target.value)} className="bg-background/50" />
        <Input placeholder="Cost / time per unit" value={costBase} onChange={(e) => setCostBase(e.target.value)} className="bg-background/50" />
      </div>

      <Button onClick={handleOptimize} disabled={loading} className="w-full gradient-primary text-primary-foreground">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing market…</> : <><Sparkles className="w-4 h-4 mr-2" /> Optimize Pricing</>}
      </Button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-5">
            {/* Hero price */}
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/30">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Recommended Sweet Spot</p>
              <p className="font-heading text-5xl font-bold text-gradient">{result.recommended_price}</p>
              <p className="text-xs text-muted-foreground mt-2">{result.psychological_anchor}</p>
            </div>

            {/* Range */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Budget", val: result.price_range.low, color: "text-muted-foreground" },
                { label: "Sweet Spot", val: result.price_range.sweet_spot, color: "text-primary" },
                { label: "Premium", val: result.price_range.premium, color: "text-amber-400" },
              ].map((p) => (
                <div key={p.label} className="glass rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase text-muted-foreground">{p.label}</p>
                  <p className={`font-bold text-lg ${p.color}`}>{p.val}</p>
                </div>
              ))}
            </div>

            {/* Tiers */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Suggested Tiers</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {result.tiers?.map((t, i) => (
                  <div key={i} className={`glass rounded-xl p-4 ${i === 1 ? "border-primary/40 glow-green-sm" : ""}`}>
                    <p className="text-xs text-muted-foreground">{t.name}</p>
                    <p className="font-heading text-2xl font-bold text-foreground">{t.price}</p>
                    <p className="text-[10px] text-primary mt-1">{t.target}</p>
                    <ul className="mt-3 space-y-1">
                      {t.features?.slice(0, 4).map((f, j) => (
                        <li key={j} className="text-xs text-muted-foreground flex items-start gap-1">
                          <span className="text-primary">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Justification + warning */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="glass rounded-lg p-4">
                <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Why This Price Works</p>
                <ul className="space-y-1">
                  {result.value_justification?.map((v, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {v}</li>
                  ))}
                </ul>
                <p className="text-[10px] text-muted-foreground mt-3">Competitor avg: <span className="text-foreground">{result.competitor_avg}</span></p>
              </div>
              <div className="glass rounded-lg p-4 border border-destructive/30">
                <p className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Avoid This Mistake</p>
                <p className="text-xs text-muted-foreground">{result.warning}</p>
                <p className="text-xs font-semibold text-foreground mt-3 mb-1 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Discount Strategy</p>
                <p className="text-xs text-muted-foreground">{result.discount_strategy}</p>
              </div>
            </div>

            {/* Upsells */}
            <div className="glass rounded-lg p-4">
              <p className="text-xs font-semibold text-foreground mb-2">Upsell Ideas</p>
              <div className="flex flex-wrap gap-2">
                {result.upsell_ideas?.map((u, i) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{u}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PricingOptimizer;
