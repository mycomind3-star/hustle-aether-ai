import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

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
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/auth")}>
            Log In
          </Button>
          <Button className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity" onClick={() => navigate("/auth")}>
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
