import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-bold text-foreground">AetherHustle</span>
          <span className="text-primary font-heading font-bold text-sm">AI</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["features", "testimonials", "pricing"].map((id) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors capitalize relative group"
            >
              {id}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </button>
          ))}
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

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-border px-4 py-4 space-y-3 overflow-hidden"
          >
            {["features", "testimonials", "pricing"].map((id) => (
              <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left text-sm text-muted-foreground hover:text-foreground py-2 capitalize">
                {id}
              </button>
            ))}
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
