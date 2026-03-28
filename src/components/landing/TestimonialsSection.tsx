import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "E-commerce Entrepreneur",
    text: "AetherHustle AI helped me find a niche that now generates $8K/month in passive income. The AI insights are genuinely game-changing.",
    avatar: "SC",
    revenue: "$8K/mo",
  },
  {
    name: "Marcus Williams",
    role: "Freelance Developer",
    text: "I was skeptical at first, but the personalized hustle recommendations were spot on. Landed 3 new clients in my first week.",
    avatar: "MW",
    revenue: "$12K/mo",
  },
  {
    name: "Elena Rodriguez",
    role: "Content Creator",
    text: "The premium tier is worth every penny. The AI-generated strategies are incredibly specific and actionable. My income doubled.",
    avatar: "ER",
    revenue: "$15K/mo",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            Real People, <span className="text-gradient">Real Money</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Join thousands who've transformed their income with AI-powered strategies.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass rounded-xl p-6 hover:glow-green-sm transition-shadow duration-500"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-secondary-foreground mb-6 leading-relaxed text-sm">{t.text}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
                <span className="text-primary font-heading font-bold text-sm">{t.revenue}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
