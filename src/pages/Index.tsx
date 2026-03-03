import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingBuyNow from "@/components/layout/FloatingBuyNow";
import HeroSection from "@/components/home/HeroSection";
import StorySection from "@/components/home/StorySection";
import DeliveryCTA from "@/components/home/DeliveryCTA";
import NewsletterSection from "@/components/home/NewsletterSection";
import FarmTourCTA from "@/components/home/FarmTourCTA";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <StorySection />
      <DeliveryCTA />
      <NewsletterSection />
      <FarmTourCTA />
      <Footer />
      <FloatingBuyNow />
    </div>
  );
};

export default Index;
