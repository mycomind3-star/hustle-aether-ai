import { Zap, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const FooterSection = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer className="relative" ref={ref}>
      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="container px-4 mb-16"
      >
        <div className="glass-premium rounded-3xl p-12 text-center relative overflow-hidden glow-green-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="relative z-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to <span className="text-gradient">Start Earning</span>?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Join 12,000+ hustlers using AI to discover untapped money-making opportunities every day.
            </p>
            <Button
              className="gradient-primary text-primary-foreground font-semibold text-lg px-8 py-6 hover:opacity-90 transition-all hover:scale-[1.02]"
              onClick={() => navigate("/auth")}
            >
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="border-t border-border py-16">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
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
      </div>
    </footer>
  );
};

export default FooterSection;
