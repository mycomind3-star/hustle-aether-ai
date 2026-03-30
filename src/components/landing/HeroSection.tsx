import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, DollarSign, Sparkles, Users } from "lucide-react";
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
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-primary/8 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[200px]" />

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
            className="inline-flex items-center gap-2 glass rounded-full px-5 py-2.5 mb-8"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-sm text-muted-foreground">{badge}</span>
          </motion.div>

          {/* Headline */}
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-foreground block"
            >
              {headline.line1}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-gradient block"
            >
              {headline.line2}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-foreground block"
            >
              {headline.line3}
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {subtext}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              size="lg"
              className="gradient-primary text-primary-foreground font-semibold text-lg px-8 py-6 glow-green hover:opacity-90 transition-all hover:scale-[1.02]"
              onClick={handleCtaClick}
            >
              {ctaText} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-border text-foreground font-medium text-lg px-8 py-6 hover:bg-card transition-colors"
              onClick={() => {
                onTrack("button_click", { button: "view_pricing" });
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              View Pricing
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
          >
            {[
              { icon: DollarSign, value: "$2.4M+", label: "Revenue Generated" },
              { icon: TrendingUp, value: "94%", label: "Success Rate" },
              { icon: Zap, value: "50K+", label: "Hustles Delivered" },
              { icon: Users, value: "12K+", label: "Active Hustlers" },
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
