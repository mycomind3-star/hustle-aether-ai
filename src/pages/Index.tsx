import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import FooterSection from "@/components/landing/FooterSection";
import { useHomepageVariants } from "@/hooks/use-homepage-variants";

const Index = () => {
  const { variants, loading, trackEvent } = useHomepageVariants();

  return (
    <div className="min-h-screen gradient-dark">
      <Navbar />
      <HeroSection variants={variants} onTrack={trackEvent} />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection variants={variants} onTrack={trackEvent} />
      <PricingSection variants={variants} onTrack={trackEvent} />
      <FooterSection />
    </div>
  );
};

export default Index;
