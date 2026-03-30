import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Tell Us Your Goals",
    description: "Set your niche interests, risk tolerance, and experience level. Takes 2 minutes.",
  },
  {
    number: "02",
    title: "AI Curates Your Hustle",
    description: "Our engine scans market opportunities and crafts a personalized strategy just for you.",
  },
  {
    number: "03",
    title: "Get Your Daily Playbook",
    description: "Every morning, receive actionable money-making ideas with step-by-step instructions.",
  },
  {
    number: "04",
    title: "Watch the Money Flow",
    description: "Execute the strategies, track your results, and watch your income grow week over week.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-3 block">
            Simple Process
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            Start Earning in <span className="text-gradient">4 Steps</span>
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          {/* Vertical line connector */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-border hidden sm:block" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`flex items-start gap-6 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className={`flex-1 glass rounded-xl p-6 ${i % 2 === 0 ? "md:text-right" : ""}`}>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shrink-0 z-10 font-heading font-bold text-primary-foreground text-sm">
                  {step.number}
                </div>
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
