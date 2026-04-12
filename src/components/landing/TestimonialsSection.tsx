import { motion, useInView } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useRef } from "react";
import type { HomepageVariants } from "@/hooks/use-homepage-variants";

const defaultTestimonials = [
  { text: "AetherHustle AI helped me find a niche that now generates $8K/month in passive income. The AI recommendations are scarily accurate.", metadata: { name: "Sarah Chen", role: "E-commerce Entrepreneur", avatar: "SC", revenue: "$8K/mo" } },
  { text: "I was skeptical at first, but the personalized hustle recommendations were spot on. Went from zero to $12K in 3 months.", metadata: { name: "Marcus Williams", role: "Freelance Developer", avatar: "MW", revenue: "$12K/mo" } },
  { text: "The premium tier is worth every penny. My income doubled in two months and the AI keeps finding new opportunities.", metadata: { name: "Elena Rodriguez", role: "Content Creator", avatar: "ER", revenue: "$15K/mo" } },
];

interface TestimonialsSectionProps {
  variants: HomepageVariants;
  onTrack: (event: string, data?: any, variantId?: string) => void;
}

const TestimonialsSection = ({ variants, onTrack }: TestimonialsSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

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
    <section id="testimonials" className="py-28 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />

      <div className="container px-4 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 glass-premium rounded-full px-4 py-1.5 mb-6">
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Success Stories</span>
          </span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold mb-5">
            Real People, <span className="text-gradient">Real Money</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Join thousands who've transformed their income with AI-powered strategies.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: 0.15 + i * 0.15, duration: 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="glass-premium rounded-2xl p-7 flex flex-col relative overflow-hidden group"
              onMouseEnter={() => onTrack("button_click", { element: "testimonial", index: i }, t.id)}
            >
              {/* Quote icon */}
              <Quote className="w-10 h-10 text-primary/10 absolute top-4 right-4" />

              {/* Revenue badge */}
              <div className="inline-flex self-start items-center gap-1 bg-primary/10 rounded-full px-3 py-1 mb-5">
                <span className="text-xs font-bold text-primary">{t.revenue}</span>
                <span className="text-xs text-primary/60">earned</span>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-secondary-foreground mb-8 leading-relaxed text-sm flex-1">"{t.text}"</p>

              <div className="flex items-center gap-3 pt-5 border-t border-border/50">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-heading font-bold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
