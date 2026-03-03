import { motion } from "framer-motion";
import { Leaf, Heart, Droplets, Eye, Truck } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Leaf,
    title: "FEED",
    description:
      "Our cows are fed fresh, organic fodder without any additives, resulting in the purest, nutrient-rich milk.",
  },
  {
    num: "02",
    icon: Heart,
    title: "CARE",
    description:
      "Raised with great care and grown in the most natural environment possible without artificial chemicals.",
  },
  {
    num: "03",
    icon: Droplets,
    title: "MILK EXTRACTION",
    description:
      "Milk is extracted 24 hours prior to delivery under the most hygienic conditions.",
  },
  {
    num: "04",
    icon: Eye,
    title: "TRANSPARENCY",
    description:
      "Our milk packaging has a QR code to display the full test results of the milk delivered to you.",
  },
  {
    num: "05",
    icon: Truck,
    title: "TRANSPORTATION",
    description:
      "We own the quality at every step. Our milk is packaged and delivered by our own fleet and employees.",
  },
];

const ProcessSteps = () => {
  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-primary/3 blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent mb-3">
            Our Process
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
            From <span className="text-primary">Farm</span> to Your{" "}
            <span className="text-primary">Glass</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="relative bg-card rounded-2xl border border-border p-6 h-full transition-all duration-500 hover:shadow-xl hover:-translate-y-2 hover:border-primary/30">
                {/* Number badge */}
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full forest-gradient flex items-center justify-center shadow-lg">
                  <span className="text-xs font-black text-primary-foreground">
                    {step.num}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                </div>

                <h3 className="text-lg font-black text-foreground mb-2 tracking-wide">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
