import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import bottleBanner from "@/assets/bottle-banner.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-cream blur-3xl" />
        {/* Milk splash decorative circles */}
        <motion.div
          animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[25%] w-16 h-16 rounded-full bg-milk border border-border/30 opacity-40"
        />
        <motion.div
          animate={{ y: [0, 10, 0], scale: [1, 0.95, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-[30%] right-[15%] w-10 h-10 rounded-full bg-sage opacity-50"
        />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[25%] left-[10%] w-20 h-20 rounded-full bg-cream border border-border/20 opacity-30"
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                100% Farm Fresh &bull; Organic
              </span>
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-foreground leading-[0.9] tracking-tighter">
                NUTRITION
                <br />
                FOR EVERY
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary-foreground px-4 py-1">
                    GENERATION
                  </span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 bg-primary rounded-lg origin-left"
                  />
                </span>
              </h1>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed">
              Farm fresh cow's milk in glass bottles. Delivered to your doorstep within{" "}
              <span className="font-semibold text-foreground">12 hours of milking</span>.
              No hormones. No preservatives. Just pure goodness.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="https://erp.astradairy.in" target="_blank" rel="noopener noreferrer">
                <Button variant="hero" size="lg" className="text-base px-10 py-7 text-lg shadow-2xl shadow-primary/20">
                  Buy Now
                </Button>
              </a>
              <a href="https://erp.astradairy.in" target="_blank" rel="noopener noreferrer">
                <Button variant="hero-outline" size="lg" className="text-base px-10 py-7 text-lg">
                  Get Free Sample
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Right: Bottle with milk splash effect */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="flex justify-center lg:justify-end relative"
          >
            <div className="relative">
              {/* Glow ring behind bottle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-full border-2 border-dashed border-primary/10"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full border border-accent/10"
                />
              </div>

              <motion.img
                src={bottleBanner}
                alt="Astra Dairy farm fresh milk in glass bottle"
                className="w-56 md:w-72 lg:w-80 h-auto drop-shadow-2xl relative z-10"
                loading="eager"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Milk droplets */}
              <motion.div
                animate={{ y: [0, 20, 0], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3 h-6 bg-milk rounded-full shadow-sm"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Curved bottom separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
