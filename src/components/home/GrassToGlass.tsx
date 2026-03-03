import { motion } from "framer-motion";
import { Leaf, Droplets, Truck } from "lucide-react";

const steps = [
  {
    icon: Leaf,
    title: "Natural Fodder & Happy Cows",
    description: "Our cows graze on natural fodder in open farms, ensuring the richest, purest milk.",
  },
  {
    icon: Droplets,
    title: "Milk Bottled in Glass",
    description: "Fresh milk is bottled in reusable glass within hours, preserving taste and nutrients.",
  },
  {
    icon: Truck,
    title: "Delivered Early Morning",
    description: "At your doorstep between 5:00 – 7:30 AM, within 12 hours of milking.",
  },
];

const GrassToGlass = () => {
  return (
    <section className="py-20 lg:py-28 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">Our Process</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            From <span className="text-primary">Grass</span> to Glass
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              viewport={{ once: true }}
              className="relative text-center"
            >
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-border" />
              )}

              <div className="w-20 h-20 mx-auto rounded-2xl forest-gradient flex items-center justify-center mb-6 shadow-lg">
                <step.icon className="w-8 h-8 text-primary-foreground" />
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border">
                <span className="text-xs font-bold text-accent mb-2 block">Step {i + 1}</span>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GrassToGlass;
