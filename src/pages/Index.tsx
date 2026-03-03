import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingBuyNow from "@/components/layout/FloatingBuyNow";
import HeroSection from "@/components/home/HeroSection";
import MilkPourSection from "@/components/home/MilkPourSection";
import ProcessSteps from "@/components/home/ProcessSteps";
import WhyAstraDairy from "@/components/home/WhyAstraDairy";
import ProductShowcase from "@/components/home/ProductShowcase";
import CTABanner from "@/components/home/CTABanner";
import GrassToGlass from "@/components/home/GrassToGlass";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <ProcessSteps />
      <MilkPourSection />
      <WhyAstraDairy />
      <ProductShowcase />
      <CTABanner />
      <GrassToGlass />
      <Footer />
      <FloatingBuyNow />
    </div>
  );
};

export default Index;
