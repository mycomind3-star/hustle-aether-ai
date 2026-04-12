import { motion, useInView } from "framer-motion";
import { Brain, Target, Zap, TrendingUp, Shield, Clock } from "lucide-react";
import { useRef } from "react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Strategies",
    description: "Our AI analyzes thousands of opportunities daily to find the highest-ROI hustles tailored to your skills.",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    icon: Target,
    title: "Personalized to You",
    description: "Every recommendation is calibrated to your niche, risk level, and experience — no generic advice.",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: TrendingUp,
    title: "Proven Results",
    description: "Our strategies have helped users generate over $2.4M collectively. Real data, real outcomes.",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: Clock,
    title: "Daily Delivery",
    description: "Fresh opportunities in your inbox every morning at 7 AM. Start your day with actionable insights.",
    gradient: "from-amber-500/20 to-yellow-500/20",
  },
  {
    icon: Shield,
    title: "Risk-Calibrated",
    description: "Choose your comfort zone. From conservative side income to aggressive growth plays.",
    gradient: "from-violet-500/20 to-purple-500/20",
  },
  {
    icon: Zap,
    title: "Self-Evolving AI",
    description: "Our platform continuously improves using performance data — getting smarter every single day.",
    gradient: "from-rose-500/20 to-pink-500/20",
  },
];

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-28 relative">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[200px]" />

      <div className="container px-4 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 glass-premium rounded-full px-4 py-1.5 mb-6"
          >
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Why AetherHustle AI</span>
          </motion.span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold mb-5">
            How We <span className="text-gradient">Print Money</span> for You
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            A fully automated money-making engine that works while you sleep. Here's what powers it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="glass rounded-2xl p-7 group hover:border-primary/30 transition-all duration-500 hover:glow-green-sm relative overflow-hidden"
            >
              {/* Hover gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
