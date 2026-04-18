import { motion } from "framer-motion";
import { Zap, Newspaper, Sparkles, LogOut, ArrowRight, Settings, Loader2, Flame, CalendarDays, BookOpen, Crown, TrendingUp, Shield, LayoutDashboard, Compass, Wrench, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PremiumInsights from "@/components/dashboard/PremiumInsights";
import HustleDnaScanner from "@/components/dashboard/HustleDnaScanner";
import OpportunityRadar from "@/components/dashboard/OpportunityRadar";
import RevenueForecaster from "@/components/dashboard/RevenueForecaster";
import CompetitorIntel from "@/components/dashboard/CompetitorIntel";
import BusinessPlanBuilder from "@/components/dashboard/BusinessPlanBuilder";
import PricingOptimizer from "@/components/dashboard/PricingOptimizer";
import ContentIdeaEngine from "@/components/dashboard/ContentIdeaEngine";
import LaunchRoadmap from "@/components/dashboard/LaunchRoadmap";
import SalesPageGenerator from "@/components/dashboard/SalesPageGenerator";
import PersonaBuilder from "@/components/dashboard/PersonaBuilder";
import { Progress } from "@/components/ui/progress";

const tierConfig: Record<string, { label: string; color: string; next?: string; progress: number }> = {
  free: { label: "Free", color: "bg-secondary text-secondary-foreground", next: "Basic", progress: 33 },
  basic: { label: "✦ Basic", color: "bg-primary/20 text-primary", next: "Premium", progress: 66 },
  premium: { label: "⭐ Premium", color: "gradient-primary text-primary-foreground", progress: 100 },
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

      <main className="container px-4 py-8 max-w-6xl">
        {/* Hero welcome */}
        <motion.div {...fadeUp(0)} className="mb-8 relative overflow-hidden rounded-2xl glass-hero p-6 md:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase tracking-wider text-primary font-semibold">Command Center</span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-2">
              Welcome back, <span className="text-gradient">{profile?.full_name || "Hustler"}</span>
            </h1>
            <p className="text-muted-foreground mb-5 max-w-xl">Your AI-powered command center for building, validating, and scaling money-making ideas.</p>

            {/* Quick stats inline */}
            <div className="grid grid-cols-3 gap-3 max-w-lg">
              {[
                { icon: BookOpen, value: totalIssues, label: "Issues" },
                { icon: Flame, value: (profile?.niche_interests || []).length, label: "Niches" },
                { icon: CalendarDays, value: memberSince, label: "Joined", small: true },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-xl p-3 text-center hover:glow-green-sm transition-shadow">
                  <stat.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className={`font-bold text-foreground ${stat.small ? "text-xs" : "text-xl"}`}>{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>

            {tier.next && (
              <div className="mt-5 max-w-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Plan: <span className="text-foreground font-medium capitalize">{userTier}</span></span>
                  <span className="text-xs text-primary font-medium">All features free →</span>
                </div>
                <Progress value={tier.progress} className="h-1.5" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Generate hero CTA */}
        <motion.div {...fadeUp(0.05)} className="glass rounded-2xl p-5 mb-6 glow-green-sm relative overflow-hidden group">
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
                <h3 className="font-heading font-bold text-foreground">Generate My Daily Hustle</h3>
                <p className="text-sm text-muted-foreground">A personalized strategy crafted in seconds</p>
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="gradient-primary text-primary-foreground font-semibold hover:opacity-90">
              {generating ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Generating…</> : <>Generate <Sparkles className="ml-2 w-4 h-4" /></>}
            </Button>
          </div>
        </motion.div>

        {/* Generated newsletter preview */}
        {generatedHtml && (
          <motion.div {...fadeUp(0)} className="glass rounded-xl p-6 mb-6 glow-green-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="font-heading text-xl font-bold text-foreground">Your Personalized Hustle</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setGeneratedHtml(null)} className="text-muted-foreground text-xs">Close</Button>
            </div>
            <div className="newsletter-content rounded-lg overflow-auto max-h-[600px] p-4" dangerouslySetInnerHTML={{ __html: generatedHtml }} />
          </motion.div>
        )}

        {/* TABBED WORKSPACE */}
        <motion.div {...fadeUp(0.1)}>
          <Tabs defaultValue="discover" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6 glass-strong h-auto p-1.5">
              <TabsTrigger value="discover" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground py-2.5 gap-2">
                <Compass className="w-4 h-4" /> <span className="hidden sm:inline">Discover</span>
              </TabsTrigger>
              <TabsTrigger value="build" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground py-2.5 gap-2">
                <Wrench className="w-4 h-4" /> <span className="hidden sm:inline">Build</span>
              </TabsTrigger>
              <TabsTrigger value="grow" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground py-2.5 gap-2">
                <TrendingUp className="w-4 h-4" /> <span className="hidden sm:inline">Grow</span>
              </TabsTrigger>
              <TabsTrigger value="library" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground py-2.5 gap-2">
                <Newspaper className="w-4 h-4" /> <span className="hidden sm:inline">Library</span>
              </TabsTrigger>
            </TabsList>

            {/* DISCOVER */}
            <TabsContent value="discover" className="space-y-6 mt-0">
              <SectionHeader icon={Compass} title="Discover Opportunities" subtitle="Find your next money-making idea" />
              <OpportunityRadar />
              <HustleDnaScanner />
              <PremiumInsights tier={userTier} />
            </TabsContent>

            {/* BUILD */}
            <TabsContent value="build" className="space-y-6 mt-0">
              <SectionHeader icon={Wrench} title="Build Your Business" subtitle="Validate, plan, and price your idea" />
              <RevenueForecaster />
              <PricingOptimizer />
              <PersonaBuilder />
              <BusinessPlanBuilder />
              <LaunchRoadmap />
            </TabsContent>

            {/* GROW */}
            <TabsContent value="grow" className="space-y-6 mt-0">
              <SectionHeader icon={TrendingUp} title="Grow & Scale" subtitle="Outsmart competitors, fuel content" />
              <CompetitorIntel />
              <ContentIdeaEngine />
              <SalesPageGenerator />
            </TabsContent>

            {/* LIBRARY */}
            <TabsContent value="library" className="space-y-6 mt-0">
              <SectionHeader icon={BookOpen} title="Your Library" subtitle="Newsletters, archives & past wins" />

              {latestNewsletter && !generatedHtml && (
                <div className="glass rounded-xl p-6 hover:glow-green-sm transition-shadow">
                  <div className="flex items-center gap-2 mb-4">
                    <Newspaper className="w-5 h-5 text-primary" />
                    <h2 className="font-heading text-xl font-bold text-foreground">Latest Issue</h2>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto">Issue #{latestNewsletter.issue_number}</span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{latestNewsletter.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{latestNewsletter.summary}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{new Date(latestNewsletter.created_at).toLocaleDateString()}</span>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" onClick={() => setGeneratedHtml(latestNewsletter.content_html)}>
                      Read Full Issue <ArrowRight className="ml-1 w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              {newsletters.length > 0 && (
                <div className="glass rounded-xl p-6">
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
                </div>
              )}

              {!latestNewsletter && newsletters.length === 0 && (
                <div className="glass rounded-xl p-10 text-center">
                  <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No newsletters yet. Generate your first one above!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) => (
  <div className="flex items-center gap-3 mb-2">
    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div>
      <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

export default Dashboard;
