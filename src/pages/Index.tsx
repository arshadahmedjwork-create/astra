import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingBuyNow from "@/components/layout/FloatingBuyNow";
import HeroSection from "@/components/home/HeroSection";
import MilkPourSection from "@/components/home/MilkPourSection";
import ProductShowcase from "@/components/home/ProductShowcase";
import GrassToGlass from "@/components/home/GrassToGlass";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <MilkPourSection />
      <ProductShowcase />
      <GrassToGlass />
      <Footer />
      <FloatingBuyNow />
    </div>
  );
};

export default Index;
