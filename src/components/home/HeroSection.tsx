import { motion } from "framer-motion";
import bottleBanner from "@/assets/bottle-banner.png";
import heroBg from "@/assets/hero-kitchen-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Premium kitchen setting"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-foreground/10" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-24 pb-16">
        {/* Bold headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-foreground leading-[0.95] tracking-tighter mb-6"
          style={{ textShadow: "0 2px 40px rgba(255,255,255,0.5)" }}
        >
          Pure, fresh milk.
          <br />
          <span className="text-primary">No shortcuts.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-base md:text-lg text-foreground/80 max-w-xl leading-relaxed mb-8"
          style={{ textShadow: "0 1px 20px rgba(255,255,255,0.6)" }}
        >
          At Astra Dairy, nothing gets in the way of producing the freshest, most natural dairy products.
          <br className="hidden md:block" />
          No hormones. No preservatives. No factory farms. Just pure goodness.
        </motion.p>

        {/* Centered bottle */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <motion.img
            src={bottleBanner}
            alt="Astra Dairy farm fresh milk in glass bottle"
            className="w-40 md:w-56 lg:w-64 h-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
            loading="eager"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Reflection */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 md:w-44 h-8 bg-foreground/5 rounded-full blur-xl" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
