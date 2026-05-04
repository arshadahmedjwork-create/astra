import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingBuyNow from "@/components/layout/FloatingBuyNow";
import HeroSection from "@/components/home/HeroSection";
import StorySection from "@/components/home/StorySection";
import ProcessSteps from "@/components/home/ProcessSteps";
import GrassToGlass from "@/components/home/GrassToGlass";
import ProductShowcase from "@/components/home/ProductShowcase";
import WhyAstraDairy from "@/components/home/WhyAstraDairy";
import DeliveryCTA from "@/components/home/DeliveryCTA";
import FarmTourCTA from "@/components/home/FarmTourCTA";
import SectionDivider from "@/components/ui/SectionDivider";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <SectionDivider color="fill-secondary" />
      <StorySection />
      <SectionDivider color="fill-background" backgroundColor="bg-secondary" position="top" />
      <ProcessSteps />
      <SectionDivider color="fill-milk" />
      <GrassToGlass />
      <SectionDivider color="fill-background" backgroundColor="bg-milk" position="top" />
      <ProductShowcase />
      <WhyAstraDairy />
      <SectionDivider color="fill-primary" position="top" />
      <DeliveryCTA />
      <FarmTourCTA />
      <Footer />
      <FloatingBuyNow />
    </div>
  );
};

export default Index;
