import { motion, useScroll, useTransform } from "framer-motion";
import { Leaf, Heart, Droplets, Eye, Truck } from "lucide-react";
import { useRef } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const pathLength = useTransform(scrollYProgress, [0.1, 0.8], [0, 1]);

  return (
    <>
      {/* Foggy transition INTO this section — tall gradient fog */}
      <div
        className="relative h-32 md:h-48 -mb-1 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--milk) / 0.3) 30%, hsl(var(--milk) / 0.6) 60%, hsl(var(--milk) / 0.85) 85%, hsl(var(--milk)) 100%)",
        }}
      />

      <section
        ref={containerRef}
        className="py-24 lg:py-36 relative overflow-hidden"
        style={{ backgroundColor: "hsl(var(--milk))" }}
      >
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent mb-3">
              Our Process
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
              From <span className="text-primary">Farm</span> to Your{" "}
              <span className="text-primary">Glass</span>
            </h2>
          </motion.div>

          {/* Zigzag timeline */}
          <div className="relative max-w-5xl mx-auto">
            <svg
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full hidden lg:block"
              viewBox="0 0 2 1000"
              preserveAspectRatio="none"
            >
              <motion.line
                x1="1" y1="0" x2="1" y2="1000"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="8 8"
                style={{ pathLength }}
                className="opacity-30"
              />
            </svg>

            <div className="space-y-8 lg:space-y-0">
              {steps.map((step, i) => {
                const isEven = i % 2 === 0;
                return (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, x: isEven ? -60 : 60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="lg:grid lg:grid-cols-2 lg:gap-16 items-center lg:py-10"
                  >
                    <div className={`${isEven ? "lg:text-right lg:pr-16" : "lg:text-left lg:pl-16 lg:col-start-2"}`}>
                      <div className={`inline-flex flex-col ${isEven ? "lg:items-end" : "lg:items-start"} items-start`}>
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          className="relative bg-background/70 backdrop-blur-md rounded-3xl border border-border/50 p-8 shadow-lg hover:shadow-2xl transition-shadow duration-500 max-w-md"
                        >
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                            className="absolute -top-5 -left-5 w-14 h-14 rounded-2xl forest-gradient flex items-center justify-center shadow-xl rotate-6"
                          >
                            <span className="text-sm font-black text-primary-foreground">{step.num}</span>
                          </motion.div>

                          <div className="ml-6 mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                              <step.icon className="w-8 h-8 text-primary" />
                            </div>
                          </div>

                          <h3 className="text-xl font-black text-foreground mb-3 tracking-wide ml-6">{step.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed ml-6">{step.description}</p>

                          <div className="absolute bottom-3 right-3 flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {isEven && <div className="hidden lg:block" />}
                    {!isEven && <div className="hidden lg:block lg:col-start-1 lg:row-start-1" />}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Foggy transition OUT of this section */}
      <div
        className="relative h-32 md:h-48 -mt-1 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--milk)) 0%, hsl(var(--milk) / 0.85) 15%, hsl(var(--milk) / 0.6) 40%, hsl(var(--milk) / 0.3) 70%, hsl(var(--background)) 100%)",
        }}
      />
    </>
  );
};

export default ProcessSteps;
