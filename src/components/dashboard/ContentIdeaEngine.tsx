import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Loader2, Sparkles, Copy, Calendar, Mail, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentResult {
  hooks: string[];
  post_ideas: { platform: string; title: string; format: string; concept: string; cta: string; hashtags: string[] }[];
  email_subjects: string[];
  viral_angles: string[];
  content_calendar_week: { day: string; post: string }[];
}

const platformColor: Record<string, string> = {
  Instagram: "from-pink-500/20 to-purple-500/20 border-pink-500/30",
  TikTok: "from-cyan-400/20 to-pink-500/20 border-cyan-400/30",
  "Twitter/X": "from-sky-500/20 to-slate-500/20 border-sky-500/30",
  LinkedIn: "from-blue-600/20 to-blue-400/20 border-blue-500/30",
  "YouTube Shorts": "from-red-500/20 to-orange-500/20 border-red-500/30",
};

const ContentIdeaEngine = () => {
  const [niche, setNiche] = useState("");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);

  const handleGenerate = async () => {
    if (!niche.trim()) { toast.error("Enter a niche or product"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content-ideas", {
        body: { niche, tone },
      });
      if (error) throw error;
      setResult(data.data);
      toast.success("Content ideas locked in 🔥");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  return (
    <div className="glass-premium rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-background" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">Content Idea Engine</h3>
          <p className="text-xs text-muted-foreground">Hooks, posts, calendar — across every platform</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <Input placeholder="Niche / product" value={niche} onChange={(e) => setNiche(e.target.value)} className="bg-background/50" />
        <Input placeholder="Tone (optional)" value={tone} onChange={(e) => setTone(e.target.value)} className="bg-background/50" />
      </div>

      <Button onClick={handleGenerate} disabled={loading} className="w-full gradient-primary text-primary-foreground">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Brainstorming…</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Content Pack</>}
      </Button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-5">
            {/* Hooks */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><Flame className="w-4 h-4 text-amber-400" /> Scroll-Stopping Hooks</p>
              <div className="space-y-1.5">
                {result.hooks?.slice(0, 10).map((h, i) => (
                  <div key={i} className="glass rounded-lg p-3 flex items-start justify-between gap-2 group hover:border-primary/40 transition-colors">
                    <p className="text-sm text-foreground">{h}</p>
                    <button onClick={() => copyText(h)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy className="w-3 h-3 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Post ideas */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Platform-Specific Posts</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {result.post_ideas?.map((p, i) => (
                  <div key={i} className={`rounded-xl p-4 bg-gradient-to-br border ${platformColor[p.platform] || "from-muted/20 to-muted/10 border-border"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground">{p.platform}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-background/40 text-muted-foreground">{p.format}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">{p.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">{p.concept}</p>
                    <p className="text-xs text-primary mb-2">CTA: {p.cta}</p>
                    {p.hashtags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.hashtags.slice(0, 5).map((h, j) => (
                          <span key={j} className="text-[10px] text-primary/80">{h}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="glass rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> 7-Day Content Calendar</p>
              <div className="grid grid-cols-7 gap-2">
                {result.content_calendar_week?.map((d, i) => (
                  <div key={i} className="bg-background/40 rounded-lg p-2 text-center">
                    <p className="text-[10px] font-bold text-primary uppercase">{d.day}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{d.post}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Email subjects + viral angles */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="glass rounded-lg p-4">
                <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><Mail className="w-3 h-3 text-primary" /> Email Subject Lines</p>
                <ul className="space-y-1">
                  {result.email_subjects?.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground">→ {s}</li>
                  ))}
                </ul>
              </div>
              <div className="glass rounded-lg p-4">
                <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><Flame className="w-3 h-3 text-amber-400" /> Viral Contrarian Takes</p>
                <ul className="space-y-1">
                  {result.viral_angles?.map((v, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {v}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentIdeaEngine;
