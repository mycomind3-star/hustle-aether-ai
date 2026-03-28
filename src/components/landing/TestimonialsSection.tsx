import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { HomepageVariants } from "@/hooks/use-homepage-variants";

const defaultTestimonials = [
  { text: "AetherHustle AI helped me find a niche that now generates $8K/month in passive income.", metadata: { name: "Sarah Chen", role: "E-commerce Entrepreneur", avatar: "SC", revenue: "$8K/mo" } },
  { text: "I was skeptical at first, but the personalized hustle recommendations were spot on.", metadata: { name: "Marcus Williams", role: "Freelance Developer", avatar: "MW", revenue: "$12K/mo" } },
  { text: "The premium tier is worth every penny. My income doubled in two months.", metadata: { name: "Elena Rodriguez", role: "Content Creator", avatar: "ER", revenue: "$15K/mo" } },
];

interface TestimonialsSectionProps {
  variants: HomepageVariants;
  onTrack: (event: string, data?: any, variantId?: string) => void;
}

const TestimonialsSection = ({ variants, onTrack }: TestimonialsSectionProps) => {
  const testimonials = variants.testimonials.length > 0
    ? variants.testimonials.map((t) => ({
        text: t.text,
        name: t.metadata?.name || "Happy Customer",
        role: t.metadata?.role || "Entrepreneur",
        avatar: t.metadata?.avatar || "HC",
        revenue: t.metadata?.revenue || "$5K/mo",
        id: t.id,
      }))
    : defaultTestimonials.map((t) => ({
        text: t.text,
        name: t.metadata.name,
        role: t.metadata.role,
        avatar: t.metadata.avatar,
        revenue: t.metadata.revenue,
        id: undefined,
      }));

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
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass rounded-xl p-6 hover:glow-green-sm transition-shadow duration-500"
              onMouseEnter={() => onTrack("button_click", { element: "testimonial", index: i }, t.id)}
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
