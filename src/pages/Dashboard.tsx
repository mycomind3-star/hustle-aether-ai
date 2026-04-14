import { motion } from "framer-motion";
import { Zap, Newspaper, Sparkles, LogOut, ArrowRight, Settings, Loader2, Flame, CalendarDays, BookOpen, Crown, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import PremiumInsights from "@/components/dashboard/PremiumInsights";
import HustleDnaScanner from "@/components/dashboard/HustleDnaScanner";
import { Progress } from "@/components/ui/progress";

const tierConfig: Record<string, { label: string; icon: any; color: string; next?: string; progress: number }> = {
  free: { label: "Free", icon: Zap, color: "bg-secondary text-secondary-foreground", next: "Basic", progress: 33 },
  basic: { label: "✦ Basic", icon: TrendingUp, color: "bg-primary/20 text-primary", next: "Premium", progress: 66 },
  premium: { label: "⭐ Premium", icon: Crown, color: "gradient-primary text-primary-foreground", progress: 100 },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [latestNewsletter, setLatestNewsletter] = useState<any>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalIssues, setTotalIssues] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const [profileRes, newslettersRes, roleRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("newsletters").select("*")
          .or(`target_user_id.eq.${user.id},is_global.eq.true`)
          .order("created_at", { ascending: false }).limit(20),
        supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (roleRes.data) setIsAdmin(true);
      if (newslettersRes.data) {
        setTotalIssues(newslettersRes.data.length);
        if (newslettersRes.data.length > 0) {
          setLatestNewsletter(newslettersRes.data[0]);
          setNewsletters(newslettersRes.data.slice(1));
        }
      }
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGeneratedHtml(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in first"); navigate("/auth"); return; }

      const { data, error } = await supabase.functions.invoke("generate-newsletter", {
        body: { mode: "single" },
      });
      if (error) throw error;

      if (data?.newsletter) {
        setGeneratedHtml(data.newsletter.content_html);
        setLatestNewsletter(data.newsletter);
        toast.success("Your personalized hustle is ready! 🚀");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Generation failed. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const userTier = profile?.subscription_tier || "free";
  const tier = tierConfig[userTier] || tierConfig.free;
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";

  if (loading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.4 },
  });

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
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${tier.color}`}>
              {tier.label}
            </span>
            {isAdmin && (
              <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/admin")}>
                <Shield className="w-3 h-3 mr-1" /> Admin
              </Button>
            )}
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/preferences")}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-10 max-w-4xl">
        {/* Welcome + Tier Progress */}
        <motion.div {...fadeUp(0)} className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back, <span className="text-gradient">{profile?.full_name || "Hustler"}</span> 👋
          </h1>
          <p className="text-muted-foreground mb-4">Your daily dose of AI-powered money-making strategies.</p>

          {/* Tier progress */}
          {tier.next && (
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Your plan: <span className="text-foreground font-medium capitalize">{userTier}</span></span>
                <span className="text-xs text-primary font-medium">Upgrade to {tier.next} →</span>
              </div>
              <Progress value={tier.progress} className="h-1.5" />
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div {...fadeUp(0.05)} className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: BookOpen, value: totalIssues, label: "Issues Received" },
            { icon: Flame, value: (profile?.niche_interests || []).length, label: "Active Niches" },
            { icon: CalendarDays, value: memberSince, label: "Member Since", small: true },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4 text-center group hover:glow-green-sm transition-shadow">
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <p className={`font-bold text-foreground ${stat.small ? "text-sm" : "text-2xl"}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Generate button */}
        <motion.div {...fadeUp(0.1)} className="glass rounded-xl p-6 mb-8 glow-green-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center"
              >
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              <div>
                <h3 className="font-heading font-bold text-foreground">Generate My Daily Hustle Now</h3>
                <p className="text-sm text-muted-foreground">AI crafts a strategy tailored to your skills & interests</p>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              {generating ? (
                <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <>Generate <Sparkles className="ml-2 w-4 h-4" /></>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Generated newsletter preview */}
        {generatedHtml && (
          <motion.div {...fadeUp(0)} className="glass rounded-xl p-6 mb-8 glow-green-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="font-heading text-xl font-bold text-foreground">Your Personalized Hustle</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setGeneratedHtml(null)} className="text-muted-foreground text-xs">
                Close
              </Button>
            </div>
            <div className="newsletter-content rounded-lg overflow-auto max-h-[600px] p-4" dangerouslySetInnerHTML={{ __html: generatedHtml }} />
          </motion.div>
        )}

        {/* Latest issue */}
        {latestNewsletter && !generatedHtml && (
          <motion.div {...fadeUp(0.15)} className="glass rounded-xl p-6 mb-8 hover:glow-green-sm transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-xl font-bold text-foreground">Latest Issue</h2>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto">
                Issue #{latestNewsletter.issue_number}
              </span>
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{latestNewsletter.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{latestNewsletter.summary}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{new Date(latestNewsletter.created_at).toLocaleDateString()}</span>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" onClick={() => setGeneratedHtml(latestNewsletter.content_html)}>
                Read Full Issue <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Hustle DNA Scanner — NEW */}
        <motion.div {...fadeUp(0.18)} className="mb-8">
          <HustleDnaScanner />
        </motion.div>

        {/* Premium AI Insights — now free for everyone */}
        <motion.div {...fadeUp(0.22)} className="mb-8">
          <PremiumInsights tier={userTier} />
        </motion.div>

        {/* Archive */}
        {newsletters.length > 0 && (
          <motion.div {...fadeUp(0.25)} className="glass rounded-xl p-6">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Newsletter Archive</h2>
            <div className="space-y-1">
              {newsletters.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => setGeneratedHtml(issue.content_html)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary font-medium">#{issue.issue_number}</span>
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">{issue.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{new Date(issue.created_at).toLocaleDateString()}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
