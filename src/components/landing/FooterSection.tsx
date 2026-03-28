import { Zap, Sparkles } from "lucide-react";

const FooterSection = () => (
  <footer className="border-t border-border py-12">
    <div className="container px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded gradient-primary flex items-center justify-center">
            <Zap className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-foreground">AetherHustle AI</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
            <Sparkles className="w-3 h-3" />
            <span>Self-optimizing with AI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 AetherHustle AI. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
);

export default FooterSection;
