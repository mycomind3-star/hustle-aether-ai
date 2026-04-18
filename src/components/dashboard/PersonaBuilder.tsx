import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Loader2, Sparkles, MapPin, Heart, AlertCircle, Megaphone, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Persona {
  name: string;
  archetype: string;
  avatar_emoji: string;
  demographics: { age: string; occupation: string; income: string; location: string; family: string };
  psychographics: { values: string[]; fears: string[]; desires: string[]; identity: string };
  day_in_life: string;
  pain_points: string[];
  buying_triggers: string[];
  objections: { objection: string; underlying_fear: string; how_to_overcome: string }[];
  where_they_hang_out: string[];
  trusted_voices: string[];
  language_they_use: string[];
  willingness_to_pay: string;
  preferred_format: string;
  marketing_message: string;
}

interface PersonaResult {
  personas: Persona[];
  shared_insights: { biggest_market_gap: string; underserved_segment: string; fastest_path_to_trust: string };
}

const PersonaBuilder = () => {
  const [product, setProduct] = useState("");
  const [market, setMarket] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PersonaResult | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleGenerate = async () => {
    if (!product.trim()) { toast.error("Enter your product or service"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("build-personas", {
        body: { product, market },
      });
      if (error) throw error;
      setResult(data.data);
      setActiveIdx(0);
      toast.success("Personas built 🎯");
    } catch (e: any) {
      toast.error(e.message || "Failed to build personas");
    } finally {
      setLoading(false);
    }
  };

  const persona = result?.personas?.[activeIdx];

  return (
    <div className="glass-premium rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">Customer Persona Builder</h3>
          <p className="text-xs text-muted-foreground">Deep psychographic profiles + buying triggers + ad language</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <Input placeholder="Product / service" value={product} onChange={(e) => setProduct(e.target.value)} className="bg-background/50" />
        <Input placeholder="Market context (optional)" value={market} onChange={(e) => setMarket(e.target.value)} className="bg-background/50" />
      </div>

      <Button onClick={handleGenerate} disabled={loading} className="w-full gradient-primary text-primary-foreground">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Profiling buyers…</> : <><Sparkles className="w-4 h-4 mr-2" /> Build 3 Personas</>}
      </Button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-5">
            {/* Persona switcher */}
            <div className="grid grid-cols-3 gap-2">
              {result.personas?.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`rounded-xl p-3 text-left transition-all ${
                    activeIdx === i
                      ? "bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/40"
                      : "glass hover:border-primary/30"
                  }`}
                >
                  <div className="text-2xl mb-1">{p.avatar_emoji}</div>
                  <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-[10px] text-primary truncate">{p.archetype}</p>
                </button>
              ))}
            </div>

            {persona && (
              <motion.div key={activeIdx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {/* Hero card */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/5 border border-rose-500/30">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{persona.avatar_emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-xl font-bold text-foreground">{persona.name}</p>
                      <p className="text-xs text-primary font-semibold uppercase tracking-wide">{persona.archetype}</p>
                      <p className="text-xs text-muted-foreground mt-2">{persona.day_in_life}</p>
                    </div>
                  </div>
                </div>

                {/* Demographics */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { label: "Age", val: persona.demographics?.age },
                    { label: "Job", val: persona.demographics?.occupation },
                    { label: "Income", val: persona.demographics?.income },
                    { label: "Location", val: persona.demographics?.location },
                    { label: "Family", val: persona.demographics?.family },
                  ].map((d) => (
                    <div key={d.label} className="glass rounded-lg p-2 text-center">
                      <p className="text-[10px] uppercase text-muted-foreground">{d.label}</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{d.val}</p>
                    </div>
                  ))}
                </div>

                {/* Psych grid */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="glass rounded-lg p-4">
                    <p className="text-xs font-semibold text-primary mb-2">💎 Values</p>
                    <ul className="space-y-1">
                      {persona.psychographics?.values?.map((v, i) => <li key={i} className="text-xs text-foreground">• {v}</li>)}
                    </ul>
                  </div>
                  <div className="glass rounded-lg p-4 border border-destructive/20">
                    <p className="text-xs font-semibold text-destructive mb-2">😰 Fears</p>
                    <ul className="space-y-1">
                      {persona.psychographics?.fears?.map((v, i) => <li key={i} className="text-xs text-foreground">• {v}</li>)}
                    </ul>
                  </div>
                  <div className="glass rounded-lg p-4 border border-amber-500/20">
                    <p className="text-xs font-semibold text-amber-400 mb-2">⭐ Desires</p>
                    <ul className="space-y-1">
                      {persona.psychographics?.desires?.map((v, i) => <li key={i} className="text-xs text-foreground">• {v}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Identity */}
                <div className="glass rounded-lg p-4 border-l-2 border-primary">
                  <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1"><Heart className="w-3 h-3" /> Identity Aspiration</p>
                  <p className="text-sm text-foreground italic">"{persona.psychographics?.identity}"</p>
                </div>

                {/* Pain & triggers */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="glass rounded-lg p-4">
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3 text-destructive" /> Pain Points</p>
                    <ul className="space-y-1">
                      {persona.pain_points?.map((p, i) => <li key={i} className="text-xs text-muted-foreground">• {p}</li>)}
                    </ul>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3 text-primary" /> Buying Triggers</p>
                    <ul className="space-y-1">
                      {persona.buying_triggers?.map((p, i) => <li key={i} className="text-xs text-muted-foreground">→ {p}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Objections */}
                <div className="glass rounded-lg p-4">
                  <p className="text-xs font-semibold text-foreground mb-3">Objections & How to Overcome</p>
                  <div className="space-y-3">
                    {persona.objections?.map((o, i) => (
                      <div key={i} className="border-l-2 border-rose-500/40 pl-3">
                        <p className="text-xs font-semibold text-foreground">"{o.objection}"</p>
                        <p className="text-[10px] text-muted-foreground italic mt-0.5">Underlying: {o.underlying_fear}</p>
                        <p className="text-xs text-primary mt-1">→ {o.how_to_overcome}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Where they hang out + voices */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="glass rounded-lg p-4">
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" /> Where to Find Them</p>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.where_they_hang_out?.map((w, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{w}</span>
                      ))}
                    </div>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-xs font-semibold text-foreground mb-2">Trusted Voices</p>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.trusted_voices?.map((w, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-secondary text-foreground">{w}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ad language */}
                <div className="glass rounded-lg p-4 border border-primary/30">
                  <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1"><Megaphone className="w-3 h-3" /> Use These Exact Phrases in Ads</p>
                  <div className="space-y-1">
                    {persona.language_they_use?.map((l, i) => (
                      <p key={i} className="text-xs text-foreground italic">"{l}"</p>
                    ))}
                  </div>
                </div>

                {/* Money + format + message */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="glass rounded-lg p-4">
                    <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3 text-primary" /> Willingness to Pay</p>
                    <p className="text-sm text-foreground">{persona.willingness_to_pay}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">Preferred format: <span className="text-foreground">{persona.preferred_format}</span></p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/30">
                    <p className="text-xs font-semibold text-primary mb-1">🎯 Click-Worthy Hook</p>
                    <p className="text-sm font-semibold text-foreground italic">"{persona.marketing_message}"</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Shared insights */}
            <div className="glass-hero rounded-xl p-5">
              <p className="text-sm font-heading font-bold text-foreground mb-3">📊 Strategic Insights</p>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs font-semibold text-primary mb-1">Biggest Gap</p>
                  <p className="text-xs text-muted-foreground">{result.shared_insights?.biggest_market_gap}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary mb-1">Underserved</p>
                  <p className="text-xs text-muted-foreground">{result.shared_insights?.underserved_segment}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary mb-1">Fastest Trust</p>
                  <p className="text-xs text-muted-foreground">{result.shared_insights?.fastest_path_to_trust}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonaBuilder;
