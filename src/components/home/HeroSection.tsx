import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Droplets, Clock, ShieldCheck } from "lucide-react";
import bottleBanner from "@/assets/bottle-banner.png";

const trustChips = [
  { icon: Droplets, text: "Glass Bottle Packaging" },
  { icon: Clock, text: "Delivered within 12 hours of milking" },
  { icon: ShieldCheck, text: "No artificial hormones. No preservatives." },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 milk-gradient" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-semibold uppercase tracking-[0.2em] text-accent"
              >
                Farm Fresh &bull; Organic &bull; Natural
              </motion.p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1]">
                Cow's Milk
                <br />
                <span className="text-primary">in its Purest</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Farm fresh. Glass bottled. Delivered fast.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <a href="https://erp.astradairy.in" target="_blank" rel="noopener noreferrer">
                <Button variant="hero" size="lg" className="text-base px-8 py-6">
                  Buy Now
                </Button>
              </a>
              <a href="https://erp.astradairy.in" target="_blank" rel="noopener noreferrer">
                <Button variant="hero-outline" size="lg" className="text-base px-8 py-6">
                  Take a Trial
                </Button>
              </a>
            </div>

            {/* Trust Chips */}
            <div className="flex flex-col sm:flex-row gap-3">
              {trustChips.map((chip, i) => (
                <motion.div
                  key={chip.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2"
                >
                  <chip.icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-medium text-foreground/70">{chip.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Bottle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <img
                src={bottleBanner}
                alt="Astra Dairy fresh milk in glass bottle"
                className="w-64 md:w-80 lg:w-96 h-auto drop-shadow-2xl animate-float"
                loading="eager"
              />
              {/* Glow */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-12 bg-primary/5 rounded-full blur-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
