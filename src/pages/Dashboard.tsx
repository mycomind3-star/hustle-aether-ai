import { motion } from "framer-motion";
import { Zap, Crown, TrendingUp, Newspaper, Sparkles, LogOut, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

const sampleNewsletter = {
  issue: 42,
  title: "5 AI Side Hustles That Made $10K This Week",
  date: "Mar 28, 2026",
  preview: "This week we're covering the explosion of AI-powered micro-SaaS tools, automated content farms that actually work, and a little-known arbitrage opportunity...",
};

const archiveIssues = [
  { issue: 41, title: "The $500/Day Prompt Engineering Blueprint", date: "Mar 21, 2026" },
  { issue: 40, title: "How to Build a Faceless YouTube Empire with AI", date: "Mar 14, 2026" },
  { issue: 39, title: "Crypto + AI: The New Money Frontier", date: "Mar 7, 2026" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [userTier] = useState<"free" | "basic" | "premium">("free");

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      toast.success("Your personalized hustle is ready! 🚀");
    }, 2000);
  };

  return (
    <div className="min-h-screen gradient-dark">
      {/* Top bar */}
      <header className="border-b border-border glass-strong sticky top-0 z-50">
        <div className="container px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground">AetherHustle</span>
            <span className="text-primary font-heading font-bold text-sm">AI</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground capitalize">
              {userTier} tier
            </span>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/")}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-10 max-w-4xl">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back, <span className="text-gradient">Hustler</span> 👋
          </h1>
          <p className="text-muted-foreground">Your daily dose of AI-powered money-making strategies.</p>
        </motion.div>

        {/* Generate button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 mb-8 glow-green-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-foreground">Generate My Personalized Hustle</h3>
                <p className="text-sm text-muted-foreground">AI crafts a strategy tailored to your skills</p>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              {generating ? "Generating..." : "Generate"} <Sparkles className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Latest issue */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-bold text-foreground">Latest Issue</h2>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto">Issue #{sampleNewsletter.issue}</span>
          </div>
          <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{sampleNewsletter.title}</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{sampleNewsletter.preview}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{sampleNewsletter.date}</span>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              Read Full Issue <ArrowRight className="ml-1 w-3 h-3" />
            </Button>
          </div>
        </motion.div>

        {/* Premium section (locked for free) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6 mb-8 relative overflow-hidden"
        >
          {userTier === "free" && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="text-center">
                <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-heading font-bold text-foreground mb-1">Premium AI Insights</p>
                <p className="text-sm text-muted-foreground mb-3">Upgrade to unlock advanced strategies</p>
                <Button className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity" onClick={() => navigate("/")}>
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-bold text-foreground">Premium AI Insights</h2>
          </div>
          <div className="space-y-3">
            {["Market Trend Analysis", "Revenue Prediction Model", "Competitor Gap Finder"].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Archive */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6"
        >
          <h2 className="font-heading text-xl font-bold text-foreground mb-4">Newsletter Archive</h2>
          <div className="space-y-3">
            {archiveIssues.map((issue) => (
              <div key={issue.issue} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div>
                  <span className="text-xs text-primary font-medium mr-2">#{issue.issue}</span>
                  <span className="text-sm text-foreground">{issue.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">{issue.date}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
