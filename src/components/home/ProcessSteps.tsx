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
    color: "from-primary/20 to-primary/5",
  },
  {
    num: "02",
    icon: Heart,
    title: "CARE",
    description:
      "Raised with great care and grown in the most natural environment possible without artificial chemicals.",
    color: "from-accent/20 to-accent/5",
  },
  {
    num: "03",
    icon: Droplets,
    title: "MILK EXTRACTION",
    description:
      "Milk is extracted 24 hours prior to delivery under the most hygienic conditions.",
    color: "from-sage/30 to-sage/10",
  },
  {
    num: "04",
    icon: Eye,
    title: "TRANSPARENCY",
    description:
      "Our milk packaging has a QR code to display the full test results of the milk delivered to you.",
    color: "from-gold-light/30 to-gold-light/10",
  },
  {
    num: "05",
    icon: Truck,
    title: "TRANSPORTATION",
    description:
      "We own the quality at every step. Our milk is packaged and delivered by our own fleet and employees.",
    color: "from-primary/15 to-forest/5",
  },
];

const Cloud = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    initial={{ x: "-100%" }}
    animate={{ x: "120vw" }}
    transition={{ duration: 40 + delay * 5, repeat: Infinity, ease: "linear", delay }}
    className={`absolute ${className}`}
  >
    <svg viewBox="0 0 200 80" fill="white" className="w-full h-full opacity-60 drop-shadow-lg">
      <ellipse cx="60" cy="50" rx="50" ry="25" />
      <ellipse cx="100" cy="40" rx="45" ry="30" />
      <ellipse cx="140" cy="50" rx="50" ry="25" />
      <ellipse cx="100" cy="55" rx="60" ry="20" />
    </svg>
  </motion.div>
);

const SmallCloud = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    initial={{ x: "-50%" }}
    animate={{ x: "110vw" }}
    transition={{ duration: 55 + delay * 8, repeat: Infinity, ease: "linear", delay }}
    className={`absolute ${className}`}
  >
    <svg viewBox="0 0 120 50" fill="white" className="w-full h-full opacity-40">
      <ellipse cx="35" cy="30" rx="30" ry="15" />
      <ellipse cx="65" cy="25" rx="28" ry="18" />
      <ellipse cx="90" cy="30" rx="25" ry="14" />
    </svg>
  </motion.div>
);

const ProcessSteps = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const pathLength = useTransform(scrollYProgress, [0.1, 0.8], [0, 1]);

  return (
    <section
      ref={containerRef}
      className="py-24 lg:py-36 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(var(--cream)) 0%, hsl(var(--background)) 30%, hsl(var(--ivory)) 70%, hsl(var(--cream)) 100%)",
      }}
    >
      {/* Sky gradient at top */}
      <div
        className="absolute top-0 left-0 right-0 h-40"
        style={{
          background: "linear-gradient(180deg, hsl(200 60% 92% / 0.6) 0%, transparent 100%)",
        }}
      />

      {/* Animated clouds */}
      <Cloud className="top-4 w-[200px] h-[80px]" delay={0} />
      <Cloud className="top-16 w-[160px] h-[60px]" delay={8} />
      <SmallCloud className="top-8 w-[100px] h-[40px]" delay={3} />
      <SmallCloud className="top-28 w-[120px] h-[50px]" delay={12} />
      <Cloud className="top-2 w-[180px] h-[70px]" delay={18} />
      <SmallCloud className="top-20 w-[90px] h-[35px]" delay={25} />

      {/* Subtle grass/ground at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 60C200 30 400 50 600 40C800 30 1000 50 1200 35C1300 28 1400 40 1440 45V100H0Z"
            fill="hsl(var(--primary) / 0.08)"
          />
          <path
            d="M0 75C180 55 360 70 540 60C720 50 900 65 1080 55C1260 45 1380 60 1440 65V100H0Z"
            fill="hsl(var(--primary) / 0.05)"
          />
        </svg>
      </div>

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

        {/* Winding path with steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Animated connecting line (desktop) */}
          <svg
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full hidden lg:block"
            viewBox="0 0 2 1000"
            preserveAspectRatio="none"
          >
            <motion.line
              x1="1"
              y1="0"
              x2="1"
              y2="1000"
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
                  className={`lg:grid lg:grid-cols-2 lg:gap-16 items-center lg:py-10 ${
                    isEven ? "" : "lg:direction-rtl"
                  }`}
                >
                  {/* Content side */}
                  <div
                    className={`${isEven ? "lg:text-right lg:pr-16" : "lg:text-left lg:pl-16 lg:col-start-2"}`}
                  >
                    <div
                      className={`inline-flex flex-col ${isEven ? "lg:items-end" : "lg:items-start"} items-start`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: -2 }}
                        className={`relative bg-gradient-to-br ${step.color} backdrop-blur-sm rounded-3xl border border-border/50 p-8 shadow-lg hover:shadow-2xl transition-shadow duration-500 max-w-md`}
                      >
                        {/* Floating number */}
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                          className="absolute -top-5 -left-5 w-14 h-14 rounded-2xl forest-gradient flex items-center justify-center shadow-xl rotate-6"
                        >
                          <span className="text-sm font-black text-primary-foreground">
                            {step.num}
                          </span>
                        </motion.div>

                        <div className="ml-6 mb-4">
                          <div className="w-16 h-16 rounded-2xl bg-background/80 backdrop-blur flex items-center justify-center shadow-inner">
                            <step.icon className="w-8 h-8 text-primary" />
                          </div>
                        </div>

                        <h3 className="text-xl font-black text-foreground mb-3 tracking-wide ml-6">
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed ml-6">
                          {step.description}
                        </p>

                        {/* Decorative corner dots */}
                        <div className="absolute bottom-3 right-3 flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Center dot connector (desktop) */}
                  <div
                    className={`hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center`}
                    style={{ top: `${10 + i * 20}%` }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      className="w-5 h-5 rounded-full bg-primary shadow-lg shadow-primary/30 border-4 border-background"
                    />
                  </div>

                  {/* Spacer for alternating layout */}
                  {isEven && <div className="hidden lg:block" />}
                  {!isEven && <div className="hidden lg:block lg:col-start-1 lg:row-start-1" />}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
