import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Shield, Users, Send, Loader2, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [batchResults, setBatchResults] = useState<any[] | null>(null);
  const [newsletters, setNewsletters] = useState<any[]>([]);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast.error("Admin access required");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);

      // Load subscribers and recent newsletters
      const adminClient = supabase;
      const [subsRes, nlRes] = await Promise.all([
        adminClient.from("subscribers").select("*").order("joined_at", { ascending: false }),
        adminClient.from("newsletters").select("*").order("created_at", { ascending: false }).limit(20),
      ]);

      if (subsRes.data) setSubscribers(subsRes.data);
      if (nlRes.data) setNewsletters(nlRes.data);
      setLoading(false);
    };
    checkAdmin();
  }, [navigate]);

  const handleBatchGenerate = async () => {
    setGenerating(true);
    setBatchResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-newsletter", {
        body: { mode: "batch" },
      });

      if (error) throw error;

      setBatchResults(data?.results || []);
      toast.success(`Batch complete! Generated for ${data?.count || 0} subscribers.`);

      // Refresh newsletters
      const { data: nlData } = await supabase
        .from("newsletters")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (nlData) setNewsletters(nlData);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Batch generation failed");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen gradient-dark">
      <header className="border-b border-border glass-strong sticky top-0 z-50">
        <div className="container px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground">AetherHustle</span>
            <span className="text-primary font-heading font-bold text-sm">ADMIN</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
          </Button>
        </div>
      </header>

      <main className="container px-4 py-10 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-3xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">Manage subscribers and generate batch newsletters.</p>
        </motion.div>

        {/* Batch Generate */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 mb-8 glow-green-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Send className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-foreground">Generate & Send to All Subscribers</h3>
                <p className="text-sm text-muted-foreground">
                  AI-personalized newsletter for each of {subscribers.length} active subscribers
                </p>
              </div>
            </div>
            <Button
              onClick={handleBatchGenerate}
              disabled={generating}
              className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  Generate All <Send className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Batch results */}
          {batchResults && (
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-semibold text-foreground mb-2">Results:</h4>
              {batchResults.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50">
                  {r.status === "generated" ? (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className="text-foreground">{r.email}</span>
                  <span className="text-muted-foreground ml-auto">{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Subscribers */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-bold text-foreground">Subscribers ({subscribers.length})</h2>
          </div>
          <div className="space-y-2">
            {subscribers.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <span className="text-sm text-foreground">{sub.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{sub.tier}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(sub.joined_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {subscribers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No subscribers yet.</p>
            )}
          </div>
        </motion.div>

        {/* Recent Newsletters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6"
        >
          <h2 className="font-heading text-xl font-bold text-foreground mb-4">Recent Newsletters</h2>
          <div className="space-y-2">
            {newsletters.map((nl) => (
              <div key={nl.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-primary font-medium mr-2">#{nl.issue_number}</span>
                  <span className="text-sm text-foreground truncate">{nl.title}</span>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {nl.is_global ? "Global" : "Personal"}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(nl.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {newsletters.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No newsletters generated yet.</p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;
