import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import farmBg from "@/assets/farm-tour-bg.jpg";

const FarmTourCTA = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={farmBg}
          alt="Astra Dairy farm with happy cows"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-xl space-y-6"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-primary-foreground leading-tight tracking-tight">
            See the love we put
            <br />
            into our milk.
          </h2>
          <p className="text-xl text-primary-foreground/70 font-medium">
            Visit the Farm
          </p>
          <p className="text-primary-foreground/60 text-lg leading-relaxed max-w-md">
            Come visit our farm to discover how our milk is produced and bottled. Meet the cows, see the process, taste the freshness.
          </p>
          <a href="https://erp.astradairy.in" target="_blank" rel="noopener noreferrer">
            <Button variant="gold" size="lg" className="text-lg px-10 py-7 mt-2">
              Plan a Visit <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FarmTourCTA;
