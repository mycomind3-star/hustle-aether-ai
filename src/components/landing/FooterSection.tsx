import { Zap, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FooterSection = () => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-border py-16">
      <div className="container px-4">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-heading text-lg font-bold text-foreground">AetherHustle AI</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-4">
              The world's first self-evolving AI newsletter that discovers, personalizes, and delivers money-making opportunities directly to your inbox.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
              <Sparkles className="w-3 h-3" />
              <span>Self-optimizing with AI</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-bold text-foreground mb-4 text-sm">Product</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Features", action: () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }) },
                { label: "Pricing", action: () => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }) },
                { label: "Dashboard", action: () => navigate("/dashboard") },
              ].map((link) => (
                <li key={link.label}>
                  <button onClick={link.action} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-foreground mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5">
              {["About", "Blog", "Careers", "Contact"].map((label) => (
                <li key={label}>
                  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 AetherHustle AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <button key={item} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{item}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
