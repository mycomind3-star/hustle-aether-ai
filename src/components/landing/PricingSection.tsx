import { motion, useInView } from "framer-motion";
import { Check, Sparkles, Crown, Rocket, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import type { HomepageVariants } from "@/hooks/use-homepage-variants";

const tiers = [
  {
    name: "Free",
    icon: Gift,
    price: "$0",
    period: "/forever",
    description: "Get started with basic hustles",
    features: ["Weekly newsletter digest", "Basic AI insights", "Community access", "1 hustle idea/week"],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Basic",
    icon: Rocket,
    price: "$9",
    period: "/month",
    description: "For serious side-hustlers",
    features: ["Daily newsletter", "Personalized AI hustles", "Trending opportunities", "Priority support", "5 hustle ideas/day"],
    cta: "Start Basic Plan",
    popular: true,
  },
  {
    name: "Premium",
    icon: Crown,
    price: "$29",
    period: "/month",
    description: "Unlimited AI money machine",
    features: [
      "Everything in Basic",
      "Premium AI Insights",
      "1-on-1 strategy calls",
      "Revenue tracking tools",
      "Unlimited hustle ideas",
      "Early access to trends",
    ],
    cta: "Go Premium",
    popular: false,
  },
];

interface PricingSectionProps {
  variants: HomepageVariants;
  onTrack: (event: string, data?: any, variantId?: string) => void;
}

const PricingSection = ({ variants, onTrack }: PricingSectionProps) => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const headline = variants.pricingHeadline?.text || "Choose Your Hustle Level";

  return (
    <section id="pricing" className="py-28 relative">
      <div className="absolute inset-0 gradient-dark" />
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[200px]" />

      <div className="container px-4 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 glass-premium rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Pricing</span>
          </span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold mb-5">
            <span className="text-gradient">{headline}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Every plan comes with a 7-day money-back guarantee. No risk, only rewards.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`rounded-2xl p-8 relative ${
                tier.popular
                  ? "glass-premium glow-green border border-primary/30 scale-[1.02]"
                  : "glass hover:border-primary/20 transition-colors"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-bold px-5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tier.popular ? "gradient-primary" : "bg-primary/10"
                }`}>
                  <tier.icon className={`w-5 h-5 ${tier.popular ? "text-primary-foreground" : "text-primary"}`} />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground">{tier.name}</h3>
                  <p className="text-muted-foreground text-xs">{tier.description}</p>
                </div>
              </div>

              <div className="mb-8">
                <span className="font-heading text-5xl font-bold text-foreground">{tier.price}</span>
                <span className="text-muted-foreground text-sm">{tier.period}</span>
              </div>

              <ul className="space-y-3.5 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-secondary-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full font-semibold py-6 text-base ${
                  tier.popular
                    ? "gradient-primary text-primary-foreground hover:opacity-90 glow-green-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                } transition-all`}
                onClick={() => {
                  onTrack("button_click", { button: "pricing_cta", tier: tier.name }, variants.pricingHeadline?.id);
                  navigate("/auth");
                }}
              >
                {tier.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
