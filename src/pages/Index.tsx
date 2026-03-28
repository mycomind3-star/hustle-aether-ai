import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import FooterSection from "@/components/landing/FooterSection";

const Index = () => (
  <div className="min-h-screen gradient-dark">
    <Navbar />
    <HeroSection />
    <TestimonialsSection />
    <PricingSection />
    <FooterSection />
  </div>
);

export default Index;
