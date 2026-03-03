import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import bottleBanner from "@/assets/bottle-banner.png";

const points = [
  "No artificial hormones or preservatives",
  "Glass bottle packaging — better for taste & planet",
  "Delivered within 12 hours of milking",
  "QR code on every pack for full transparency",
  "A2 milk from indigenous cow breeds",
  "Cold chain maintained from farm to doorstep",
];

const WhyAstraDairy = () => {
  return (
    <section className="py-20 lg:py-28 bg-secondary relative overflow-hidden">
      {/* Background milk splash pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]">
        <svg viewBox="0 0 800 600" className="w-full h-full">
          <circle cx="200" cy="150" r="100" fill="hsl(var(--primary))" />
          <circle cx="600" cy="400" r="120" fill="hsl(var(--accent))" />
          <circle cx="700" cy="100" r="60" fill="hsl(var(--primary))" />
        </svg>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Bottle visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex justify-center relative"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full bg-primary/5 border border-primary/10" />
              </div>
              <img
                src={bottleBanner}
                alt="Astra Dairy glass bottle"
                className="w-48 md:w-64 h-auto drop-shadow-2xl relative z-10"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent mb-3">
                Why Choose Us
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                Why{" "}
                <span className="text-primary">Astra Dairy</span>?
              </h2>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              In this day and age when purity is hard to find, we've made it our mission to get back to the basics.
              Our purpose is simple: to get the best and freshest possible milk to your home without any additives,
              hormones, or treatment.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {points.map((point, i) => (
                <motion.div
                  key={point}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-foreground/80">{point}</span>
                </motion.div>
              ))}
            </div>

            <a href="https://erp.astradairy.in" target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="lg" className="text-base px-10 py-7 mt-4">
                Claim Free Sample →
              </Button>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyAstraDairy;
