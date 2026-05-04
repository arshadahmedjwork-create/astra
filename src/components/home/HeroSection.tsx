import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import bottleBanner from "@/assets/bottle-banner.png";
import heroBg from "@/assets/hero-misty-farm-bg.jpg";

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
];

const leftBottles = [
  { name: "Pasteurised", image: bottlePasteurised },
];
const rightBottles = [
  { name: "Homogenised", image: bottleHomogenised },
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

  // ── Single bottle: starts on counter (positive Y), rises to showcase row (0) ──
  const bottleY = useTransform(scrollYProgress, [0, 0.15, 0.45], [180, 80, 0]);
  const bottleScale = useTransform(scrollYProgress, [0, 0.45], [1.3, 0.85]);

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

        {/* ═══ HERO TEXT — fades out in Phase A, layered OVER bottle ═══ */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center pt-[12vh] sm:pt-[15vh] md:pt-[18vh] z-30 px-4 text-center pointer-events-none"
          style={{ opacity: heroTextOpacity, y: heroTextY }}
        >
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-foreground leading-[0.95] tracking-tighter mb-6"
            style={{ textShadow: "0 4px 40px rgba(255,255,255,0.7)" }}
          >
            Pure, fresh milk.
            <br />
            <span className="text-primary">No shortcuts.</span>
          </h1>
          <p className="text-base md:text-xl text-foreground/90 max-w-2xl leading-relaxed font-medium bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20 shadow-xl"
            style={{ textShadow: "0 2px 10px rgba(255,255,255,0.8)" }}>
            At Astra Dairy, nothing gets in the way of producing the freshest, most natural dairy products.
            <br className="hidden md:block" />
            No hormones. No preservatives. No factory farms. Just pure goodness.
          </p>
        </motion.div>

        {/* ═══ SHOWCASE SECTION (header + bottles + products) ═══ */}
        <motion.div className="absolute inset-0 flex flex-col z-10" style={{ opacity: showcaseOpacity }}>
          {/* Products Header */}
          <motion.div
            className="flex-shrink-0 flex justify-center pt-8 md:pt-16"
            style={{ opacity: headerOpacity, y: headerY }}
          >
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-accent mb-3">
                From Our Farm to Your Table
              </p>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-black text-foreground tracking-tight">
                Our Products
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
                      className="h-24 md:h-36 lg:h-48 w-auto object-contain drop-shadow-lg"
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
                <motion.img
                  src={bottleBanner}
                  alt="Astra Dairy farm fresh milk in glass bottle"
                  className="h-32 md:h-56 lg:h-64 w-auto drop-shadow-[0_25px_50px_rgba(0,0,0,0.2)]"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  loading="eager"
                />
                <motion.span
                  className="text-[10px] md:text-xs font-bold text-accent mt-4 uppercase tracking-[0.2em]"
                  style={{ opacity: flankOpacity }}
                >
                  Farm Fresh
                </motion.span>
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
                      className="h-24 md:h-36 lg:h-48 w-auto object-contain drop-shadow-lg"
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
            className="flex-shrink-0 px-4 pb-4 md:pb-8"
            style={{ opacity: productsOpacity, y: productsY }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-5 max-w-5xl mx-auto">
              {products.map((product) => (
                <Link key={product.name} to={product.href} className="group block text-center">
                  <div className="relative p-3 md:p-4 transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                    <div className="aspect-square flex items-center justify-center relative mb-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-1 transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
                        loading="lazy"
                      />
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-foreground/5 rounded-full blur-md" />
                    </div>
                    <h3 className="text-[9px] md:text-xs font-bold text-muted-foreground relative z-10 tracking-wider uppercase mt-2">
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
