import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, DollarSign, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { HomepageVariants } from "@/hooks/use-homepage-variants";

interface HeroSectionProps {
  variants: HomepageVariants;
  onTrack: (event: string, data?: any, variantId?: string) => void;
}

const HeroSection = ({ variants, onTrack }: HeroSectionProps) => {
  const navigate = useNavigate();

  const headline = variants.heroHeadline?.metadata || { line1: "AI That", line2: "Prints Money", line3: "Daily" };
  const subtext = variants.heroSubtext?.text || "Get personalized, AI-curated money-making strategies delivered to your inbox every morning. Turn insights into income with AetherHustle AI.";
  const badge = variants.heroBadge?.text || "Trusted by 12,000+ hustlers worldwide";
  const ctaText = variants.ctaText?.text || "Start Making Money";

  const handleCtaClick = () => {
    onTrack("button_click", { button: "hero_cta", cta: ctaText }, variants.ctaText?.id);
    navigate("/auth");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-primary/8 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="container relative z-10 px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{badge}</span>
          </motion.div>

          {/* Headline */}
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="text-foreground">{headline.line1}</span>
            <br />
            <span className="text-gradient">{headline.line2}</span>
            <br />
            <span className="text-foreground">{headline.line3}</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {subtext}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="gradient-primary text-primary-foreground font-semibold text-lg px-8 py-6 glow-green hover:opacity-90 transition-opacity"
              onClick={handleCtaClick}
            >
              {ctaText} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-border text-foreground font-medium text-lg px-8 py-6 hover:bg-card"
              onClick={() => {
                onTrack("button_click", { button: "view_pricing" });
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              View Pricing
            </Button>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-3 gap-6 max-w-xl mx-auto"
          >
            {[
              { icon: DollarSign, value: "$2.4M+", label: "Revenue Generated" },
              { icon: TrendingUp, value: "94%", label: "Success Rate" },
              { icon: Zap, value: "50K+", label: "Hustles Delivered" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="font-heading text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Powered by AI badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 inline-flex items-center gap-1.5 text-xs text-muted-foreground/60"
          >
            <Sparkles className="w-3 h-3" />
            <span>Powered by AI · Self-optimizing for maximum conversions</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
