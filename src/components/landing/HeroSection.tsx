import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, DollarSign, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { HomepageVariants } from "@/hooks/use-homepage-variants";
import heroDashboard from "@/assets/hero-dashboard.jpg";

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
      {/* Animated mesh background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        {/* Floating orbs */}
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[150px]"
        />
        <motion.div
          animate={{ x: [0, -40, 30, 0], y: [0, 30, -50, 0], scale: [1, 0.8, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] rounded-full bg-primary/6 blur-[130px]"
        />
        <motion.div
          animate={{ x: [0, 50, -30, 0], y: [0, -20, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-[120px]"
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 grid-pattern opacity-20" />
      </div>

      <div className="container relative z-10 px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass-premium rounded-full px-5 py-2.5 mb-8"
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
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              {subtext}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-12"
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
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {[
                { icon: DollarSign, value: "$2.4M+", label: "Revenue Generated" },
                { icon: TrendingUp, value: "94%", label: "Success Rate" },
                { icon: Zap, value: "50K+", label: "Hustles Delivered" },
                { icon: Users, value: "12K+", label: "Active Hustlers" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <stat.icon className="w-4 h-4 text-primary mx-auto lg:mx-0 mb-1" />
                  <div className="font-heading text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Hero image with glassmorphism frame */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: -5 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            {/* Glow behind image */}
            <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-3xl animate-pulse-glow" />

            {/* Glass card frame */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative glass-hero rounded-2xl p-2 shadow-2xl"
            >
              <img
                src={heroDashboard}
                alt="AetherHustle AI Dashboard showing financial analytics and AI-powered insights"
                width={1280}
                height={800}
                className="rounded-xl w-full h-auto"
              />

              {/* Floating glass overlay cards */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute -right-6 top-[20%] glass-premium rounded-xl p-3 shadow-xl float-card"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue Today</p>
                    <p className="text-sm font-bold text-primary">+$1,247</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 }}
                className="absolute -left-6 bottom-[25%] glass-premium rounded-xl p-3 shadow-xl float-card-reverse"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">AI Confidence</p>
                    <p className="text-sm font-bold text-foreground">96.4%</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
                className="absolute -bottom-4 left-[15%] right-[15%] glass-premium rounded-xl p-3 shadow-xl float-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-muted-foreground">Live Pipeline</span>
                  </div>
                  <span className="text-xs font-bold text-primary">12 hustles generated</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Powered by AI badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-16 inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 w-full justify-center"
        >
          <Sparkles className="w-3 h-3" />
          <span>Powered by AI · Self-optimizing for maximum conversions</span>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
