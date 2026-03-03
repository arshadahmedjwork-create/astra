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

// Milk splash/droplet particles
const MilkParticle = ({ style, delay, size }: { style: React.CSSProperties; delay: number; size: number }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      ...style,
      width: size,
      height: size,
      background: "radial-gradient(circle, hsl(var(--milk)) 0%, hsl(var(--cream)) 60%, transparent 100%)",
      boxShadow: `0 0 ${size}px ${size / 2}px hsl(var(--milk) / 0.3)`,
    }}
    animate={{
      y: [0, -20, 0],
      opacity: [0.3, 0.7, 0.3],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: 4 + delay,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
  />
);

const MilkSplash = ({ className }: { className?: string }) => (
  <div className={`absolute ${className}`}>
    <svg viewBox="0 0 200 100" className="w-full h-full opacity-[0.07]" fill="hsl(var(--foreground))">
      <ellipse cx="100" cy="80" rx="90" ry="15" />
      <path d="M60 80 Q50 40 70 60 Q80 70 60 80Z" />
      <path d="M120 80 Q140 30 130 55 Q125 70 120 80Z" />
      <path d="M90 80 Q85 20 100 50 Q105 65 90 80Z" />
      <circle cx="55" cy="35" r="5" />
      <circle cx="130" cy="25" r="4" />
      <circle cx="95" cy="15" r="3" />
    </svg>
  </div>
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
      className="py-24 lg:py-36 relative overflow-hidden bg-background"
    >
      {/* Milk powder / misty overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 30%, hsl(var(--milk) / 0.25) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 70%, hsl(var(--cream) / 0.3) 0%, transparent 70%), radial-gradient(ellipse 100% 40% at 50% 0%, hsl(var(--milk) / 0.15) 0%, transparent 60%)",
        }}
      />

      {/* Floating milk particles */}
      <MilkParticle style={{ top: "8%", left: "5%" }} delay={0} size={60} />
      <MilkParticle style={{ top: "15%", right: "8%" }} delay={1.5} size={45} />
      <MilkParticle style={{ top: "40%", left: "12%" }} delay={0.8} size={35} />
      <MilkParticle style={{ top: "60%", right: "15%" }} delay={2} size={50} />
      <MilkParticle style={{ top: "75%", left: "3%" }} delay={1.2} size={40} />
      <MilkParticle style={{ top: "25%", right: "3%" }} delay={3} size={30} />
      <MilkParticle style={{ top: "50%", left: "45%" }} delay={2.5} size={25} />
      <MilkParticle style={{ top: "85%", right: "25%" }} delay={0.5} size={55} />

      {/* Milk splash shapes */}
      <MilkSplash className="top-4 left-[5%] w-[200px] h-[100px]" />
      <MilkSplash className="top-[20%] right-[3%] w-[180px] h-[90px] -scale-x-100" />
      <MilkSplash className="bottom-[15%] left-[8%] w-[160px] h-[80px]" />
      <MilkSplash className="bottom-4 right-[10%] w-[150px] h-[75px] -scale-x-100" />

      {/* Top milk drip wave */}
      <div className="absolute top-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full">
          <path
            d="M0 0H1440V40C1440 40 1380 65 1200 55C1020 45 900 70 720 60C540 50 360 70 180 55C60 45 0 60 0 60V0Z"
            fill="hsl(var(--milk) / 0.12)"
          />
        </svg>
      </div>

      {/* Bottom milk drip wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full">
          <path
            d="M0 80H1440V40C1440 40 1350 15 1200 25C1050 35 900 10 720 20C540 30 360 10 180 25C60 35 0 20 0 20V80Z"
            fill="hsl(var(--milk) / 0.12)"
          />
          {/* Drip drops */}
          <ellipse cx="300" cy="18" rx="8" ry="10" fill="hsl(var(--milk) / 0.15)" />
          <ellipse cx="800" cy="12" rx="6" ry="8" fill="hsl(var(--milk) / 0.1)" />
          <ellipse cx="1100" cy="20" rx="7" ry="9" fill="hsl(var(--milk) / 0.12)" />
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

        {/* Zigzag timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Animated vertical line */}
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
                  className={`lg:grid lg:grid-cols-2 lg:gap-16 items-center lg:py-10 ${isEven ? "" : ""}`}
                >
                  <div className={`${isEven ? "lg:text-right lg:pr-16" : "lg:text-left lg:pl-16 lg:col-start-2"}`}>
                    <div className={`inline-flex flex-col ${isEven ? "lg:items-end" : "lg:items-start"} items-start`}>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="relative bg-card/80 backdrop-blur-md rounded-3xl border border-border/50 p-8 shadow-lg hover:shadow-2xl transition-shadow duration-500 max-w-md"
                      >
                        {/* Number badge */}
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
  );
};

export default ProcessSteps;
