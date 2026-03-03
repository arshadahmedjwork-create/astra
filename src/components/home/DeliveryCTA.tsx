import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";

const DeliveryCTA = () => {
  return (
    <section className="py-20 lg:py-28 bg-secondary relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Map placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square max-w-md mx-auto rounded-3xl bg-card border border-border overflow-hidden shadow-xl">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="text-center space-y-4 p-8">
                  <div className="w-20 h-20 rounded-full forest-gradient flex items-center justify-center mx-auto shadow-lg">
                    <MapPin className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground">Chennai & Suburbs</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Delivering fresh to Medavakkam, Velachery, Tambaram, OMR, ECR, Adyar, and 50+ neighbourhoods.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 lg:pl-8"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
              Why buy the cow when you can get the milk{" "}
              <span className="text-primary">at your doorstep?</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We deliver fresh milk and dairy every morning between 5:00–7:30 AM.
              Glass bottles collected. No plastic. No waste.
            </p>
            <a href="https://erp.astradairy.in" target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="lg" className="text-base px-10 py-7 mt-4">
                Start Your Subscription <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DeliveryCTA;
