import { motion } from "framer-motion";
import { Brain, Target, Zap, TrendingUp, Shield, Clock } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Strategies",
    description: "Our AI analyzes thousands of opportunities daily to find the highest-ROI hustles tailored to your skills.",
  },
  {
    icon: Target,
    title: "Personalized to You",
    description: "Every recommendation is calibrated to your niche, risk level, and experience — no generic advice.",
  },
  {
    icon: TrendingUp,
    title: "Proven Results",
    description: "Our strategies have helped users generate over $2.4M collectively. Real data, real outcomes.",
  },
  {
    icon: Clock,
    title: "Daily Delivery",
    description: "Fresh opportunities in your inbox every morning at 7 AM. Start your day with actionable insights.",
  },
  {
    icon: Shield,
    title: "Risk-Calibrated",
    description: "Choose your comfort zone. From conservative side income to aggressive growth plays.",
  },
  {
    icon: Zap,
    title: "Self-Evolving AI",
    description: "Our platform continuously improves using performance data — getting smarter every single day.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-3 block">
            Why AetherHustle AI
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            How We <span className="text-gradient">Print Money</span> for You
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A fully automated money-making engine that works while you sleep. Here's what powers it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-xl p-6 group hover:border-primary/30 transition-all duration-500 hover:glow-green-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
