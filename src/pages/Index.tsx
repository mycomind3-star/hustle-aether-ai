import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import FooterSection from "@/components/landing/FooterSection";
import { useHomepageVariants } from "@/hooks/use-homepage-variants";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const { variants, loading, trackEvent } = useHomepageVariants();

  return (
    <div className="min-h-screen gradient-dark">
      <Helmet>
        <title>AetherHustle — AI-Curated Money-Making Strategies</title>
        <meta name="description" content="Personalized AI-curated money-making strategies delivered daily. Validate, build and scale ideas faster with AetherHustle AI." />
        <link rel="canonical" href="https://hustle-aether-ai.lovable.app/" />
      </Helmet>
      <Navbar />
      <main>
        <HeroSection variants={variants} onTrack={trackEvent} />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection variants={variants} onTrack={trackEvent} />
        <PricingSection variants={variants} onTrack={trackEvent} />
      </main>
      <FooterSection />
    </div>
  );
};

export default Index;
