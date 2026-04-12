import { motion, useInView } from "framer-motion";
import { UserPlus, Brain, Mail, DollarSign, ArrowDown } from "lucide-react";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Tell Us Your Goals",
    description: "Set your niche interests, risk tolerance, and experience level. Takes just 2 minutes to get started.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    number: "02",
    icon: Brain,
    title: "AI Curates Your Hustle",
    description: "Our engine scans thousands of market opportunities and crafts a personalized strategy just for you.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "03",
    icon: Mail,
    title: "Get Your Daily Playbook",
    description: "Every morning, receive actionable money-making ideas with step-by-step instructions in your inbox.",
    color: "from-violet-500 to-purple-500",
  },
  {
    number: "04",
    icon: DollarSign,
    title: "Watch the Money Flow",
    description: "Execute the strategies, track your results, and watch your income grow week over week.",
    color: "from-amber-500 to-yellow-500",
  },
];

const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-28 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/4 blur-[180px]" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-accent/4 blur-[150px]" />

      <div className="container px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 glass-premium rounded-full px-4 py-1.5 mb-6">
            <ArrowDown className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Simple Process</span>
          </span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold mb-5">
            Start Earning in <span className="text-gradient">4 Steps</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From signup to your first dollar — here's how it works.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
                className="text-center relative"
              >
                {/* Step circle */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-[72px] h-[72px] rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10`}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Number badge */}
                <div className="absolute top-[-8px] right-[calc(50%-48px)] w-7 h-7 rounded-full bg-background border-2 border-primary flex items-center justify-center z-20">
                  <span className="text-xs font-bold text-primary">{step.number}</span>
                </div>

                <h3 className="font-heading text-lg font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
