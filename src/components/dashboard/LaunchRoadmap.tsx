import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Loader2, Sparkles, Target, CheckCircle2, Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RoadmapDay {
  day: number;
  task: string;
  deliverable: string;
  time_estimate: string;
}
interface RoadmapWeek {
  week: number;
  theme: string;
  goal: string;
  days: RoadmapDay[];
}
interface RoadmapResult {
  headline: string;
  first_revenue_target_day: number;
  weeks: RoadmapWeek[];
  key_milestones: { day: number; milestone: string }[];
  success_metrics: string[];
}

const LaunchRoadmap = () => {
  const [idea, setIdea] = useState("");
  const [hours, setHours] = useState("2");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoadmapResult | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [activeWeek, setActiveWeek] = useState(1);

  const handleGenerate = async () => {
    if (!idea.trim()) { toast.error("Enter your business idea"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-launch-roadmap", {
        body: { idea, hoursPerDay: hours },
      });
      if (error) throw error;
      setResult(data.data);
      setActiveWeek(1);
      setCompleted(new Set());
      toast.success("Your 30-day roadmap is live 🚀");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: number) => {
    const next = new Set(completed);
    next.has(day) ? next.delete(day) : next.add(day);
    setCompleted(next);
  };

  const totalDays = result?.weeks.reduce((sum, w) => sum + w.days.length, 0) || 30;
  const progress = (completed.size / totalDays) * 100;

  return (
    <div className="glass-premium rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Rocket className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">30-Day Launch Roadmap</h3>
          <p className="text-xs text-muted-foreground">Daily tasks → first revenue, with progress tracking</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-[1fr_120px] gap-3 mb-4">
        <Input placeholder="Your business idea" value={idea} onChange={(e) => setIdea(e.target.value)} className="bg-background/50" />
        <Input placeholder="Hours/day" value={hours} onChange={(e) => setHours(e.target.value)} className="bg-background/50" />
      </div>

      <Button onClick={handleGenerate} disabled={loading} className="w-full gradient-primary text-primary-foreground">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Building plan…</> : <><Sparkles className="w-4 h-4 mr-2" /> Build My 30-Day Plan</>}
      </Button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-5">
            {/* Hero */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 border border-violet-500/30">
              <p className="text-sm font-heading font-bold text-foreground mb-1">{result.headline}</p>
              <p className="text-xs text-muted-foreground mb-3">First revenue target: <span className="text-primary font-semibold">Day {result.first_revenue_target_day}</span></p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-background/40 rounded-full overflow-hidden">
                  <motion.div className="h-full gradient-primary" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                </div>
                <span className="text-xs font-semibold text-foreground">{completed.size}/{totalDays} days</span>
              </div>
            </div>

            {/* Week tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {result.weeks?.map((w) => (
                <button
                  key={w.week}
                  onClick={() => setActiveWeek(w.week)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeWeek === w.week
                      ? "gradient-primary text-primary-foreground"
                      : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Week {w.week} · {w.theme}
                </button>
              ))}
            </div>

            {/* Active week */}
            {result.weeks?.filter((w) => w.week === activeWeek).map((w) => (
              <div key={w.week} className="space-y-2">
                <p className="text-xs text-primary font-semibold flex items-center gap-1"><Target className="w-3 h-3" /> Goal: {w.goal}</p>
                {w.days.map((d) => {
                  const done = completed.has(d.day);
                  return (
                    <motion.div
                      key={d.day}
                      onClick={() => toggleDay(d.day)}
                      whileHover={{ x: 2 }}
                      className={`glass rounded-lg p-3 flex items-start gap-3 cursor-pointer transition-all ${done ? "opacity-60" : ""}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        {done ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{d.day}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-foreground ${done ? "line-through" : ""}`}>{d.task}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">📦 {d.deliverable}</p>
                      </div>
                      <span className="text-[10px] text-primary whitespace-nowrap">{d.time_estimate}</span>
                    </motion.div>
                  );
                })}
              </div>
            ))}

            {/* Milestones + metrics */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="glass rounded-lg p-4">
                <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><Trophy className="w-3 h-3 text-amber-400" /> Key Milestones</p>
                <ul className="space-y-1">
                  {result.key_milestones?.map((m, i) => (
                    <li key={i} className="text-xs text-muted-foreground"><span className="text-primary font-semibold">Day {m.day}:</span> {m.milestone}</li>
                  ))}
                </ul>
              </div>
              <div className="glass rounded-lg p-4">
                <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><Calendar className="w-3 h-3 text-primary" /> Day-30 Success Metrics</p>
                <ul className="space-y-1">
                  {result.success_metrics?.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground">→ {s}</li>
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

export default LaunchRoadmap;
