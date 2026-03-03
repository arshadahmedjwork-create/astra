import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import bottleBanner from "@/assets/bottle-banner.png";
import heroBg from "@/assets/hero-kitchen-bg.jpg";

import paneer from "@/assets/product-paneer.png";
import carrotMilk from "@/assets/product-carrot-milk.png";
import pasteurizedMilk from "@/assets/product-pasteurized-milk.png";
import ghee from "@/assets/product-ghee.png";
import curd from "@/assets/product-curd.png";
import coconutOil from "@/assets/product-coconut-oil.png";

// Flanking bottle images
import bottlePasteurised from "@/assets/bottle-pasteurised.png";
import bottleHomogenised from "@/assets/bottle-homogenised.png";
import bottleSesameOil from "@/assets/bottle-sesame-oil.png";
import bottleCoconutOil from "@/assets/bottle-coconut-oil.png";

const products = [
  { name: "Milk", image: pasteurizedMilk, href: "/products/cow-milk" },
  { name: "Paneer", image: paneer, href: "/products/paneer" },
  { name: "Ghee", image: ghee, href: "/products/ghee" },
  { name: "Curd", image: curd, href: "/products/curd" },
  { name: "Flavoured Milk", image: carrotMilk, href: "/products/flavoured-milk" },
  { name: "Non-Dairy", image: coconutOil, href: "/non-dairy" },
];

const leftBottles = [
  { name: "Pasteurised", image: bottlePasteurised },
  { name: "Homogenised", image: bottleHomogenised },
];
const rightBottles = [
  { name: "Sesame Oil", image: bottleSesameOil },
  { name: "Coconut Oil", image: bottleCoconutOil },
];

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // ── Phase A: Hero text + bg (0 → 0.25) ──
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroTextY = useTransform(scrollYProgress, [0, 0.2], [0, -60]);
  const bgScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.15]);
  const bgOpacity = useTransform(scrollYProgress, [0.15, 0.35], [1, 0]);

  // ── Phase A→B: Header appears (0.3 → 0.45) ──
  const headerOpacity = useTransform(scrollYProgress, [0.3, 0.45], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0.3, 0.45], [40, 0]);

  // ── Phase B: Hero bottle descends to align with flanking bottles (0.15 → 0.5) ──
  // Bottle starts above (negative Y), settles to 0 (aligned with flanking row)
  const bottleY = useTransform(scrollYProgress, [0, 0.15, 0.45], [-300, -150, 0]);
  const bottleScale = useTransform(scrollYProgress, [0, 0.45], [1.1, 0.85]);

  // ── Phase B: Flanking bottles slide in (0.35 → 0.55) ──
  const flankOpacity = useTransform(scrollYProgress, [0.35, 0.5], [0, 1]);
  const leftFlankX = useTransform(scrollYProgress, [0.35, 0.55], [-200, 0]);
  const rightFlankX = useTransform(scrollYProgress, [0.35, 0.55], [200, 0]);

  // ── Phase C: Products reveal (0.55 → 0.7) ──
  const productsOpacity = useTransform(scrollYProgress, [0.55, 0.7], [0, 1]);
  const productsY = useTransform(scrollYProgress, [0.55, 0.7], [50, 0]);

  // ── Phase D: Everything exits (0.8 → 0.95) ──
  const showcaseOpacity = useTransform(scrollYProgress, [0.85, 0.95], [1, 0]);

  return (
    <div ref={containerRef} className="relative h-[400vh]" id="productsShowcase">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        {/* ═══ BACKGROUND LAYERS ═══ */}
        <motion.div className="absolute inset-0 z-0" style={{ scale: bgScale, opacity: bgOpacity }}>
          <img src={heroBg} alt="Premium kitchen setting" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-foreground/10" />
        </motion.div>
        <div className="absolute inset-0 bg-background -z-[1]" />

        {/* ═══ HERO TEXT — fades out in Phase A ═══ */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-start pt-28 md:pt-32 z-10 px-4 text-center"
          style={{ opacity: heroTextOpacity, y: heroTextY }}
        >
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-foreground leading-[0.95] tracking-tighter mb-6"
            style={{ textShadow: "0 2px 40px rgba(255,255,255,0.5)" }}
          >
            Pure, fresh milk.
            <br />
            <span className="text-primary">No shortcuts.</span>
          </h1>
          <p className="text-base md:text-lg text-foreground/80 max-w-xl leading-relaxed"
            style={{ textShadow: "0 1px 20px rgba(255,255,255,0.6)" }}>
            At Astra Dairy, nothing gets in the way of producing the freshest, most natural dairy products.
            <br className="hidden md:block" />
            No hormones. No preservatives. No factory farms. Just pure goodness.
          </p>
        </motion.div>

        {/* ═══ SHOWCASE SECTION (header + bottles + products) ═══ */}
        <motion.div className="absolute inset-0 flex flex-col z-10" style={{ opacity: showcaseOpacity }}>
          {/* Products Header */}
          <motion.div
            className="flex-shrink-0 flex justify-center pt-16 md:pt-20"
            style={{ opacity: headerOpacity, y: headerY }}
          >
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent mb-2">
                From Our Farm to Your Table
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
                Products
              </h2>
            </div>
          </motion.div>

          {/* ═══ BOTTLE SHOWCASE ROW — center stage ═══ */}
          <div className="flex-1 flex items-center justify-center px-4 md:px-8">
            <div className="flex items-end justify-center gap-3 md:gap-8 lg:gap-12 max-w-4xl w-full">
              {/* Left 2 bottles — slide in from left */}
              <motion.div
                className="flex items-end gap-2 md:gap-6"
                style={{ opacity: flankOpacity, x: leftFlankX }}
              >
                {leftBottles.map((b, i) => (
                  <div key={b.name} className="flex flex-col items-center">
                    <img
                      src={b.image}
                      alt={b.name}
                      className="h-28 md:h-44 lg:h-56 w-auto object-contain drop-shadow-lg"
                      style={{ transform: i === 0 ? "scale(0.85)" : "scale(0.95)" }}
                    />
                    <span className="text-[9px] md:text-xs font-bold text-muted-foreground mt-2 uppercase tracking-wider">
                      {b.name}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* Center hero bottle — descends from hero into this spot */}
              <motion.div
                className="flex flex-col items-center relative"
                style={{ y: bottleY, scale: bottleScale }}
              >
                <img
                  src={bottleBanner}
                  alt="Astra Dairy farm fresh milk in glass bottle"
                  className="h-36 md:h-56 lg:h-72 w-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
                  loading="eager"
                />
                <span className="text-[9px] md:text-xs font-bold text-accent mt-2 uppercase tracking-wider">
                  Farm Fresh
                </span>
              </motion.div>

              {/* Right 2 bottles — slide in from right */}
              <motion.div
                className="flex items-end gap-2 md:gap-6"
                style={{ opacity: flankOpacity, x: rightFlankX }}
              >
                {rightBottles.map((b, i) => (
                  <div key={b.name} className="flex flex-col items-center">
                    <img
                      src={b.image}
                      alt={b.name}
                      className="h-28 md:h-44 lg:h-56 w-auto object-contain drop-shadow-lg"
                      style={{ transform: i === 1 ? "scale(0.85)" : "scale(0.95)" }}
                    />
                    <span className="text-[9px] md:text-xs font-bold text-muted-foreground mt-2 uppercase tracking-wider">
                      {b.name}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* ═══ BOTTOM STRIP: Product Category Cards ═══ */}
          <motion.div
            className="flex-shrink-0 px-4 pb-6 md:pb-10"
            style={{ opacity: productsOpacity, y: productsY }}
          >
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-5 max-w-5xl mx-auto">
              {products.map((product) => (
                <Link key={product.name} to={product.href} className="group block text-center">
                  <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-3 md:p-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                    <div className="aspect-square flex items-center justify-center relative mb-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-1 transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-foreground/5 rounded-full blur-md" />
                    </div>
                    <h3 className="text-xs md:text-sm font-black text-foreground relative z-10 tracking-tight">
                      {product.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
