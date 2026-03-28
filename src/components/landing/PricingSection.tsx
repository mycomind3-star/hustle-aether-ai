import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { HomepageVariants } from "@/hooks/use-homepage-variants";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/forever",
    description: "Get started with basic hustles",
    features: ["Weekly newsletter digest", "Basic AI insights", "Community access", "1 hustle idea/week"],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Basic",
    price: "$9",
    period: "/month",
    description: "For serious side-hustlers",
    features: ["Daily newsletter", "Personalized AI hustles", "Trending opportunities", "Priority support", "5 hustle ideas/day"],
    cta: "Start Basic Plan",
    popular: true,
  },
  {
    name: "Premium",
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
  const headline = variants.pricingHeadline?.text || "Choose Your Hustle Level";

  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 gradient-dark" />
      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">{headline}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Every plan comes with a 7-day money-back guarantee. No risk, only rewards.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl p-8 relative ${
                tier.popular ? "glass-strong glow-green border-primary/30" : "glass"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-heading text-xl font-bold text-foreground mb-1">{tier.name}</h3>
                <p className="text-muted-foreground text-sm">{tier.description}</p>
              </div>

              <div className="mb-6">
                <span className="font-heading text-4xl font-bold text-foreground">{tier.price}</span>
                <span className="text-muted-foreground text-sm">{tier.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-secondary-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full font-semibold py-5 ${
                  tier.popular
                    ? "gradient-primary text-primary-foreground hover:opacity-90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                } transition-opacity`}
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
