import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dna, ArrowRight, ArrowLeft, Loader2, Sparkles,
  Clock, DollarSign, Briefcase, Rocket, CheckCircle2,
  Zap, Target, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  icon: any;
  options: { label: string; value: string; emoji: string }[];
}

const questions: Question[] = [
  {
    id: "time",
    question: "How much time can you invest weekly?",
    icon: Clock,
    options: [
      { label: "2-5 hours", value: "minimal", emoji: "⏰" },
      { label: "5-15 hours", value: "moderate", emoji: "📅" },
      { label: "15-30 hours", value: "significant", emoji: "💪" },
      { label: "30+ hours (full send)", value: "fulltime", emoji: "🔥" },
    ],
  },
  {
    id: "budget",
    question: "What's your starting budget?",
    icon: DollarSign,
    options: [
      { label: "$0 — Hustle only", value: "zero", emoji: "🆓" },
      { label: "$50-200", value: "low", emoji: "💵" },
      { label: "$200-1000", value: "medium", emoji: "💰" },
      { label: "$1000+", value: "high", emoji: "🏦" },
    ],
  },
  {
    id: "skills",
    question: "What's your strongest skill set?",
    icon: Briefcase,
    options: [
      { label: "Writing & Content", value: "writing", emoji: "✍️" },
      { label: "Tech & Coding", value: "tech", emoji: "💻" },
      { label: "Design & Creative", value: "design", emoji: "🎨" },
      { label: "Sales & Marketing", value: "sales", emoji: "📈" },
    ],
  },
  {
    id: "goal",
    question: "What's your monthly income goal?",
    icon: Target,
    options: [
      { label: "$500/mo", value: "starter", emoji: "🌱" },
      { label: "$2,000/mo", value: "growth", emoji: "🌿" },
      { label: "$5,000/mo", value: "serious", emoji: "🌳" },
      { label: "$10,000+/mo", value: "moon", emoji: "🚀" },
    ],
  },
];

type Blueprint = {
  hustle_name: string;
  tagline: string;
  match_score: number;
  income_potential: string;
  time_to_first_dollar: string;
  week_1_plan: string[];
  tools: { name: string; cost: string }[];
  revenue_streams: { stream: string; percentage: number }[];
  pro_tip: string;
};

export default function HustleDnaScanner() {
  const [step, setStep] = useState<"intro" | "quiz" | "loading" | "result">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);

  const selectAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ((c) => c + 1), 300);
    }
  };

  const generateBlueprint = async () => {
    setStep("loading");
    try {
      const { data, error } = await supabase.functions.invoke("generate-hustle-dna", {
        body: { answers },
      });
      if (error) throw error;
      if (data?.blueprint) {
        setBlueprint(data.blueprint);
        setStep("result");
        toast.success("Your Hustle DNA Blueprint is ready! 🧬");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate blueprint");
      setStep("quiz");
    }
  };

  const reset = () => {
    setStep("intro");
    setCurrentQ(0);
    setAnswers({});
    setBlueprint(null);
  };

  // Intro
  if (step === "intro") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-8 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative z-10 text-center max-w-lg mx-auto">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5"
          >
            <Dna className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
            Hustle DNA Scanner
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Answer 4 quick questions and our AI will generate a <strong className="text-foreground">personalized money-making blueprint</strong> — 
            complete with your ideal hustle, week-1 action plan, tools, and revenue projections.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {[
              { icon: Zap, label: "30-Second Quiz" },
              { icon: Target, label: "Personalized Match" },
              { icon: Rocket, label: "Week-1 Plan" },
              { icon: TrendingUp, label: "Revenue Map" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground">
                <f.icon className="w-3.5 h-3.5 text-primary" />
                {f.label}
              </div>
            ))}
          </div>
          <Button
            onClick={() => setStep("quiz")}
            className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity px-8"
          >
            Scan My Hustle DNA <Dna className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Quiz
  if (step === "quiz") {
    const q = questions[currentQ];
    const allAnswered = questions.every((q) => answers[q.id]);

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-foreground text-sm">Hustle DNA Scanner</span>
          </div>
          <span className="text-xs text-muted-foreground">{currentQ + 1} / {questions.length}</span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mb-6">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < currentQ ? "bg-primary" : i === currentQ ? "bg-primary/60" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <q.icon className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-bold text-foreground">{q.question}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectAnswer(q.id, opt.value)}
                  className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                    answers[q.id] === opt.value
                      ? "bg-primary/15 border-2 border-primary text-foreground"
                      : "bg-muted/50 border-2 border-transparent hover:border-primary/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="text-sm font-medium">{opt.label}</span>
                  {answers[q.id] === opt.value && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => currentQ > 0 ? setCurrentQ((c) => c - 1) : reset()}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> {currentQ > 0 ? "Back" : "Cancel"}
          </Button>

          {allAnswered && (
            <Button
              onClick={generateBlueprint}
              className="gradient-primary text-primary-foreground font-semibold hover:opacity-90"
            >
              Generate Blueprint <Sparkles className="ml-2 w-4 h-4" />
            </Button>
          )}

          {!allAnswered && currentQ < questions.length - 1 && answers[q.id] && (
            <Button variant="ghost" size="sm" onClick={() => setCurrentQ((c) => c + 1)} className="text-primary">
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  // Loading
  if (step === "loading") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-12 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4"
        >
          <Dna className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <h3 className="font-heading text-xl font-bold text-foreground mb-2">Analyzing Your Hustle DNA...</h3>
        <p className="text-sm text-muted-foreground mb-4">Our AI is matching you with the perfect income strategy</p>
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full bg-primary"
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // Result
  if (step === "result" && blueprint) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Header */}
        <div className="glass rounded-xl p-6 glow-green-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Dna className="w-5 h-5 text-primary" />
                <span className="text-xs text-primary font-medium uppercase tracking-wider">Your Hustle Blueprint</span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">{blueprint.hustle_name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{blueprint.tagline}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">{blueprint.match_score}%</span>
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">Match</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{blueprint.income_potential}</p>
              <p className="text-xs text-muted-foreground">Income Potential</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{blueprint.time_to_first_dollar}</p>
              <p className="text-xs text-muted-foreground">First Dollar</p>
            </div>
          </div>
        </div>

        {/* Week 1 Plan */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold text-foreground">Week 1 Action Plan</h3>
          </div>
          <div className="space-y-3">
            {blueprint.week_1_plan?.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Streams */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold text-foreground">Revenue Streams</h3>
          </div>
          <div className="space-y-3">
            {blueprint.revenue_streams?.map((rs, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">{rs.stream}</span>
                  <span className="text-xs font-bold text-primary">{rs.percentage}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rs.percentage}%` }}
                    transition={{ duration: 0.8, delay: i * 0.15 }}
                    className="h-full gradient-primary rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools + Pro Tip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-primary" />
              <h4 className="font-heading font-bold text-foreground text-sm">Recommended Tools</h4>
            </div>
            <div className="space-y-2">
              {blueprint.tools?.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{t.name}</span>
                  <span className="text-xs text-primary font-medium">{t.cost}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h4 className="font-heading font-bold text-foreground text-sm">Pro Tip</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{blueprint.pro_tip}</p>
          </div>
        </div>

        <div className="text-center pt-2">
          <Button variant="ghost" onClick={reset} className="text-muted-foreground hover:text-foreground">
            <Dna className="w-4 h-4 mr-2" /> Scan Again
          </Button>
        </div>
      </motion.div>
    );
  }

  return null;
}
