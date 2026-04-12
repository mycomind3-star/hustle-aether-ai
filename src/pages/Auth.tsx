import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event !== "INITIAL_SESSION") {
        navigate("/dashboard");
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account!");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[150px]"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[130px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground mb-6" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="glass-premium rounded-2xl p-8 glow-green-sm relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8 justify-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg"
              >
                <Zap className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              <span className="font-heading text-xl font-bold text-foreground">AetherHustle AI</span>
            </div>

            <h2 className="font-heading text-2xl font-bold text-foreground text-center mb-1">
              {isLogin ? "Welcome Back" : "Join the Hustle"}
            </h2>
            <p className="text-muted-foreground text-center text-sm mb-8">
              {isLogin ? "Sign in to access your dashboard" : "Create your account and start earning"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-muted border-border text-foreground placeholder:text-muted-foreground" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 bg-muted border-border text-foreground placeholder:text-muted-foreground" required minLength={6} />
              </div>
              <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-semibold py-6 hover:opacity-90 transition-opacity text-base">
                {loading ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Loading...</> : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>

            <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-muted-foreground/50">
              <Sparkles className="w-3 h-3" />
              <span>Secured with enterprise-grade encryption</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
