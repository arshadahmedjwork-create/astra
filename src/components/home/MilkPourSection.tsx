import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import bottleBanner from "@/assets/bottle-banner.png";

const MilkPourSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const bottleY = useTransform(scrollYProgress, [0, 0.3, 0.7], [0, 0, -100]);
  const bottleScale = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [1, 1, 0.6, 0.4]);
  const bottleOpacity = useTransform(scrollYProgress, [0.7, 1], [1, 0]);
  const milkFill = useTransform(scrollYProgress, [0.1, 0.6], [0, 100]);
  const textOpacity = useTransform(scrollYProgress, [0.4, 0.65], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.4, 0.65], [40, 0]);
  const streamOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.6, 0.7], [0, 1, 1, 0]);

  return (
    <div ref={containerRef} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Bottle */}
        <motion.div
          style={{ y: bottleY, scale: bottleScale, opacity: bottleOpacity }}
          className="absolute z-20"
        >
          <img
            src={bottleBanner}
            alt="Milk pouring"
            className="w-32 md:w-48 h-auto drop-shadow-xl"
            loading="lazy"
          />
        </motion.div>

        {/* Milk Stream SVG */}
        <motion.div
          style={{ opacity: streamOpacity }}
          className="absolute top-1/2 z-10 w-4 flex justify-center"
        >
          <svg width="16" height="200" viewBox="0 0 16 200" className="overflow-visible">
            <motion.path
              d="M8 0 Q8 50 8 100 Q8 150 8 200"
              fill="none"
              stroke="hsl(40 20% 94%)"
              strokeWidth="8"
              strokeLinecap="round"
              style={{
                pathLength: useTransform(scrollYProgress, [0.15, 0.5], [0, 1]),
              }}
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
          style={{ opacity: textOpacity, y: textY }}
          className="relative z-30 text-center px-4 mt-32"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground max-w-3xl mx-auto leading-tight">
            Delivering{" "}
            <span className="text-primary">Farm Fresh</span> Cow's Milk
            <br />
            to Your Home
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto">
            Organic farm fresh milk, bottled in glass and delivered every morning.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default MilkPourSection;
