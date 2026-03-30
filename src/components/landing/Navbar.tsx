import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-bold text-foreground">AetherHustle</span>
          <span className="text-primary font-heading font-bold text-sm">AI</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => scrollTo("features")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</button>
          <button onClick={() => scrollTo("testimonials")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</button>
          <button onClick={() => scrollTo("pricing")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Button className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/auth")}>
                Log In
              </Button>
              <Button className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-strong border-t border-border px-4 py-4 space-y-3">
          <button onClick={() => scrollTo("features")} className="block w-full text-left text-sm text-muted-foreground hover:text-foreground py-2">Features</button>
          <button onClick={() => scrollTo("testimonials")} className="block w-full text-left text-sm text-muted-foreground hover:text-foreground py-2">Testimonials</button>
          <button onClick={() => scrollTo("pricing")} className="block w-full text-left text-sm text-muted-foreground hover:text-foreground py-2">Pricing</button>
          <div className="pt-2 border-t border-border space-y-2">
            {isLoggedIn ? (
              <Button className="w-full gradient-primary text-primary-foreground font-semibold" onClick={() => { setMobileOpen(false); navigate("/dashboard"); }}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" className="w-full" onClick={() => { setMobileOpen(false); navigate("/auth"); }}>Log In</Button>
                <Button className="w-full gradient-primary text-primary-foreground font-semibold" onClick={() => { setMobileOpen(false); navigate("/auth"); }}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
