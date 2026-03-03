import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import bottleBanner from "@/assets/bottle-banner.png";

const MilkPourSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const bottleY = useTransform(scrollYProgress, [0, 0.3, 0.7], [0, 0, -120]);
  const bottleScale = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [1.1, 1, 0.5, 0.3]);
  const bottleOpacity = useTransform(scrollYProgress, [0.7, 1], [1, 0]);
  const bottleRotate = useTransform(scrollYProgress, [0.1, 0.4], [0, -15]);
  const milkFill = useTransform(scrollYProgress, [0.1, 0.6], [0, 100]);
  const textOpacity = useTransform(scrollYProgress, [0.4, 0.65], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.4, 0.65], [60, 0]);
  const textScale = useTransform(scrollYProgress, [0.4, 0.7], [0.9, 1]);
  const streamOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.6, 0.7], [0, 1, 1, 0]);

  return (
    <div ref={containerRef} className="relative h-[250vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Bottle */}
        <motion.div
          style={{ y: bottleY, scale: bottleScale, opacity: bottleOpacity, rotate: bottleRotate }}
          className="absolute z-20"
        >
          <img
            src={bottleBanner}
            alt="Milk pouring"
            className="w-36 md:w-56 h-auto drop-shadow-2xl"
            loading="lazy"
          />
        </motion.div>

        {/* Milk Stream SVG - more dynamic */}
        <motion.div
          style={{ opacity: streamOpacity }}
          className="absolute top-1/2 z-10 w-8 flex justify-center"
        >
          <svg width="32" height="300" viewBox="0 0 32 300" className="overflow-visible">
            <motion.path
              d="M16 0 Q10 50 16 100 Q22 150 16 200 Q10 250 16 300"
              fill="none"
              stroke="hsl(var(--milk))"
              strokeWidth="12"
              strokeLinecap="round"
              style={{
                pathLength: useTransform(scrollYProgress, [0.15, 0.5], [0, 1]),
              }}
            />
            {/* Splash drops */}
            <motion.circle
              cx="8" cy="280" r="4"
              fill="hsl(var(--milk))"
              style={{ opacity: useTransform(scrollYProgress, [0.4, 0.5], [0, 1]) }}
            />
            <motion.circle
              cx="24" cy="270" r="3"
              fill="hsl(var(--milk))"
              style={{ opacity: useTransform(scrollYProgress, [0.42, 0.52], [0, 1]) }}
            />
            <motion.circle
              cx="4" cy="260" r="2"
              fill="hsl(var(--milk))"
              style={{ opacity: useTransform(scrollYProgress, [0.44, 0.54], [0, 1]) }}
            />
          </svg>
        </motion.div>

        {/* Milk Pool / Background Fill */}
        <motion.div
          style={{
            height: useTransform(milkFill, (v) => `${v}%`),
          }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-milk via-cream to-transparent z-0"
        />

        {/* Revealed Text */}
        <motion.div
          style={{ opacity: textOpacity, y: textY, scale: textScale }}
          className="relative z-30 text-center px-4 mt-32"
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground max-w-4xl mx-auto leading-[0.95] tracking-tight">
            Delivering{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">Farm Fresh</span>
            </span>{" "}
            Cow's Milk
            <br />
            <span className="text-muted-foreground text-3xl md:text-5xl lg:text-6xl">to Your Home</span>
          </h2>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
            Organic. Glass bottled. Delivered every morning between 5:00 – 7:30 AM.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default MilkPourSection;
