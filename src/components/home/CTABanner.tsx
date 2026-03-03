import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTABanner = () => {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Bold gradient background */}
      <div className="absolute inset-0 forest-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--accent)/0.15),transparent_60%)]" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary-foreground tracking-tight leading-tight mb-6">
            CLAIM YOUR FREE
            <br />
            PURE SAMPLE TODAY!
          </h2>
          <p className="text-lg text-primary-foreground/70 mb-10 max-w-md mx-auto">
            Experience the taste of real farm-fresh milk. No commitment, no cost.
            Just pure goodness delivered to your door.
          </p>
          <a href="https://erp.astradairy.in" target="_blank" rel="noopener noreferrer">
            <Button variant="gold" size="lg" className="text-lg px-12 py-8 shadow-2xl">
              Claim Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
