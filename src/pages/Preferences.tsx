import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const NICHE_OPTIONS = [
  "AI Tools", "Crypto", "Dropshipping", "Freelancing", "Content Creation",
  "SaaS", "Affiliate Marketing", "Real Estate", "Stock Trading", "E-commerce",
  "YouTube", "Social Media", "Consulting", "Digital Products", "Print on Demand",
];

const Preferences = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [riskLevel, setRiskLevel] = useState("medium");
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setSelectedNiches(data.niche_interests || []);
        setRiskLevel(data.risk_level || "medium");
        setExperienceLevel(data.experience_level || "beginner");
        setFullName(data.full_name || "");
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const toggleNiche = (niche: string) => {
    setSelectedNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          niche_interests: selectedNiches,
          risk_level: riskLevel,
          experience_level: experienceLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;
      toast.success("Preferences saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark">
      <header className="border-b border-border glass-strong sticky top-0 z-50">
        <div className="container px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground">Preferences</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
          </Button>
        </div>
      </header>

      <main className="container px-4 py-10 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Your Preferences</h1>
          <p className="text-muted-foreground mb-8">Customize your AI-generated content to match your goals.</p>

          {/* Name */}
          <div className="glass rounded-xl p-6 mb-6">
            <h3 className="font-heading font-bold text-foreground mb-3">Display Name</h3>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="bg-muted border-border text-foreground"
            />
          </div>

          {/* Niche Interests */}
          <div className="glass rounded-xl p-6 mb-6">
            <h3 className="font-heading font-bold text-foreground mb-3">Niche Interests</h3>
            <p className="text-sm text-muted-foreground mb-4">Select topics you want personalized strategies for.</p>
            <div className="flex flex-wrap gap-2">
              {NICHE_OPTIONS.map((niche) => (
                <button
                  key={niche}
                  onClick={() => toggleNiche(niche)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedNiches.includes(niche)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {niche}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Level */}
          <div className="glass rounded-xl p-6 mb-6">
            <h3 className="font-heading font-bold text-foreground mb-3">Risk Tolerance</h3>
            <div className="flex gap-2">
              {["low", "medium", "high", "aggressive"].map((level) => (
                <button
                  key={level}
                  onClick={() => setRiskLevel(level)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    riskLevel === level
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div className="glass rounded-xl p-6 mb-8">
            <h3 className="font-heading font-bold text-foreground mb-3">Experience Level</h3>
            <div className="flex gap-2">
              {["beginner", "intermediate", "advanced", "expert"].map((level) => (
                <button
                  key={level}
                  onClick={() => setExperienceLevel(level)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    experienceLevel === level
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full gradient-primary text-primary-foreground font-semibold py-5 hover:opacity-90 transition-opacity"
          >
            {saving ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default Preferences;
