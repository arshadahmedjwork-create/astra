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

import bottlePasteurised from "@/assets/bottle-pasteurised.png";
import bottleHomogenised from "@/assets/bottle-homogenised.png";

const products = [
  { name: "Milk", image: pasteurizedMilk, href: "/products/cow-milk" },
  { name: "Paneer", image: paneer, href: "/products/paneer" },
  { name: "Ghee", image: ghee, href: "/products/ghee" },
  { name: "Curd", image: curd, href: "/products/curd" },
  { name: "Flavoured Milk", image: carrotMilk, href: "/products/flavoured-milk" },
];

const leftBottles = [{ name: "Pasteurised", image: bottlePasteurised }];
const rightBottles = [{ name: "Homogenised", image: bottleHomogenised }];

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // ── Phase A: Hero split-screen (0 → 0.22) ──
  const heroOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);
  const heroTextY = useTransform(scrollYProgress, [0, 0.22], [0, -48]);
  const heroBottleOpacity = useTransform(scrollYProgress, [0, 0.18, 0.28], [1, 1, 0]);

  // ── Background (0 → 0.35) ──
  const bgScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.15]);
  const bgOpacity = useTransform(scrollYProgress, [0.15, 0.35], [1, 0]);

  // ── Phase A→B: Products header (0.3 → 0.45) ──
  const headerOpacity = useTransform(scrollYProgress, [0.3, 0.45], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0.3, 0.45], [40, 0]);

  // ── Center showcase bottle: rises up from below, handoff from hero bottle ──
  const bottleY = useTransform(scrollYProgress, [0.18, 0.45], [160, 0]);
  const bottleScale = useTransform(scrollYProgress, [0.18, 0.45], [1.25, 0.85]);
  const bottleShowOpacity = useTransform(scrollYProgress, [0.18, 0.38], [0, 1]);

  // ── Phase B: Flanking bottles slide in (0.35 → 0.55) ──
  const flankOpacity = useTransform(scrollYProgress, [0.35, 0.5], [0, 1]);
  const leftFlankX = useTransform(scrollYProgress, [0.35, 0.55], [-200, 0]);
  const rightFlankX = useTransform(scrollYProgress, [0.35, 0.55], [200, 0]);

  // ── Phase C: Products reveal (0.55 → 0.7) ──
  const productsOpacity = useTransform(scrollYProgress, [0.55, 0.7], [0, 1]);
  const productsY = useTransform(scrollYProgress, [0.55, 0.7], [50, 0]);

  // ── Phase D: Everything exits (0.85 → 0.95) ──
  const showcaseOpacity = useTransform(scrollYProgress, [0.85, 0.95], [1, 0]);

  return (
    <div ref={containerRef} className="relative h-[400vh]" id="productsShowcase">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* ═══ BACKGROUND ═══ */}
        <motion.div className="absolute inset-0 z-0" style={{ scale: bgScale, opacity: bgOpacity }}>
          <img src={heroBg} alt="Premium misty farm" className="w-full h-full object-cover" loading="eager" />
          {/* Bright, airy overlays to ensure a premium light theme */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-white/30" />
        </motion.div>
        <div className="absolute inset-0 bg-background -z-[1]" />

        {/* ═══ HERO SPLIT-SCREEN ═══ */}
        <motion.div
          className="absolute inset-0 z-30 flex flex-col md:flex-row max-w-[90rem] mx-auto w-full items-center justify-center gap-4 lg:gap-16"
          style={{ opacity: heroOpacity }}
        >
          {/* LEFT: Text panel */}
          <div className="relative w-full md:w-[55%] lg:w-[50%] flex flex-col justify-center px-6 sm:px-10 lg:px-12 pt-28 md:pt-12 pb-4 md:pb-0">
            {/* Added aesthetic backdrop for trust and uniqueness */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md border border-[#1A7A3F]/10 rounded-3xl shadow-2xl shadow-[#1A7A3F]/5 hidden md:block -mx-4 my-20 pointer-events-none" />


            <motion.div className="relative z-10" style={{ y: heroTextY }}>
              {/* Eyebrow — DM Sans 700 uppercase, Amber Gold */}
              <p
                className="mb-3 md:mb-4"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "clamp(0.5625rem, 0.9vw, 0.6875rem)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.4em",
                  color: "#F5A623",
                }}
              >
                Farm‑Fresh · Pure · Natural
              </p>

              {/* Campaign H1 — Playfair Display 900 */}
              <h1
                className="leading-[1.05] tracking-tighter mb-5 md:mb-6"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(2.8rem, 6.5vw, 6rem)",
                  fontWeight: 900,
                  color: "#1A7A3F",
                }}
              >
                Pure, fresh milk.
                <br />
                {/* Amber Gold — standout highlight */}
                <span style={{ color: "#F5A623" }}>No shortcuts.</span>
              </h1>

              {/* Decorative separator line */}
              <div className="w-20 h-1 bg-[#F5A623] rounded-full mb-6" />

              {/* Lead body — DM Sans 400 */}
              <p
                className="max-w-sm md:max-w-md leading-relaxed text-lg"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 500,
                  color: "#1C1C1C",
                }}
              >
                At Astra Dairy, nothing gets in the way of producing the freshest,
                most natural dairy products.
              </p>
              <p
                className="max-w-sm md:max-w-md leading-relaxed mt-2 text-base"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 400,
                  color: "rgba(28,28,28,0.7)",
                }}
              >
                No hormones. No preservatives. No factory farms. Just pure goodness.
              </p>

              {/* Trust badges — updated for light theme */}
              <div className="flex flex-wrap gap-3 mt-6 md:mt-8">
                <span
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-white shadow-sm"
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    border: "1px solid rgba(26,122,63,0.15)",
                    color: "#1A7A3F",
                  }}
                >
                  <span className="text-[#6BBF2A]">✦</span> No Hormones
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-white shadow-sm"
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    border: "1px solid rgba(245,166,35,0.25)",
                    color: "#F5A623",
                  }}
                >
                  <span className="text-[#F5A623]">✦</span> No Preservatives
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1A7A3F] shadow-md"
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    color: "#FFFFFF",
                  }}
                >
                  <span className="text-[#F5A623]">✦</span> Farm Direct
                </span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Rotating bottle panel */}
          <div className="w-full md:w-[45%] lg:w-[50%] flex items-center justify-center relative pt-8 md:pt-20 pb-12 md:pb-0">
            {/* Layered ground glow for depth */}
            <div className="absolute bottom-[18%] md:bottom-[20%] left-1/2 -translate-x-1/2 w-64 md:w-96 h-12 md:h-20 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[18%] md:bottom-[20%] left-1/2 -translate-x-1/2 w-44 md:w-64 h-6 md:h-10 rounded-full bg-white/15 blur-2xl pointer-events-none" />
            <div className="absolute bottom-[18%] md:bottom-[20%] left-1/2 -translate-x-1/2 w-28 md:w-40 h-3 md:h-5 rounded-full bg-foreground/20 blur-md pointer-events-none" />

            <motion.div
              className="relative flex flex-col items-center"
              style={{ opacity: heroBottleOpacity }}
            >
              {/* Turntable wrapper */}
              <div className="hero-turntable-stage">
                <img
                  src={bottleBanner}
                  alt="Astra Dairy farm fresh milk in glass bottle"
                  className="hero-turntable-bottle h-64 sm:h-80 md:h-[26rem] lg:h-[30rem] xl:h-[34rem] w-auto object-contain select-none"
                  draggable={false}
                  loading="eager"
                />
              </div>

              <span
                className="mt-4 uppercase drop-shadow-sm"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "clamp(0.5625rem, 0.85vw, 0.6875rem)",
                  fontWeight: 700,
                  letterSpacing: "0.28em",
                  color: "#F5A623",
                }}
              >
                Farm Fresh
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* ═══ SHOWCASE SECTION — Products reveal ═══ */}
        <motion.div className="absolute inset-0 flex flex-col z-10" style={{ opacity: showcaseOpacity }}>
          {/* Products Header */}
          <motion.div
            className="flex-shrink-0 flex justify-center pt-8 md:pt-16"
            style={{ opacity: headerOpacity, y: headerY }}
          >
            <div className="text-center">
              {/* Eyebrow — DM Sans 700 uppercase, Amber Gold */}
              <p
                className="mb-3"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "clamp(0.5625rem, 0.9vw, 0.6875rem)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.4em",
                  color: "#F5A623",
                }}
              >
                From Our Farm to Your Table
              </p>
              {/* Section H2 — Playfair Display 700, Forest Green */}
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)",
                  fontWeight: 700,
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  color: "#1A7A3F",
                }}
              >
                Our Products
              </h2>
            </div>
          </motion.div>

          {/* Bottle Showcase Row */}
          <div className="flex-1 flex items-center justify-center px-4 md:px-8">
            <div className="flex items-end justify-center gap-3 md:gap-8 lg:gap-12 max-w-4xl w-full">
              {/* Left flanking bottle */}
              <motion.div
                className="flex items-end gap-2 md:gap-6"
                style={{ opacity: flankOpacity, x: leftFlankX }}
              >
                {leftBottles.map((b) => (
                  <div key={b.name} className="flex flex-col items-center">
                    <img
                      src={b.image}
                      alt={b.name}
                      className="h-24 md:h-36 lg:h-48 w-auto object-contain object-bottom drop-shadow-lg"
                      style={{ transform: "scale(0.95)" }}
                    />
                    <span className="text-[9px] md:text-xs font-bold text-muted-foreground mt-2 uppercase tracking-wider">
                      {b.name}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* Center hero bottle – transitions from hero right side into showcase */}
              <motion.div
                className="flex flex-col items-center relative"
                style={{ y: bottleY, scale: bottleScale, opacity: bottleShowOpacity }}
              >
                <img
                  src={bottleBanner}
                  alt="Astra Dairy farm fresh milk in glass bottle"
                  className="h-32 md:h-56 lg:h-64 w-auto drop-shadow-[0_25px_50px_rgba(0,0,0,0.2)]"
                  loading="eager"
                />
                <motion.span
                  className="text-[10px] md:text-xs font-bold text-accent mt-4 uppercase tracking-[0.2em]"
                  style={{ opacity: flankOpacity }}
                >
                  Farm Fresh
                </motion.span>
              </motion.div>

              {/* Right flanking bottle */}
              <motion.div
                className="flex items-end gap-2 md:gap-6"
                style={{ opacity: flankOpacity, x: rightFlankX }}
              >
                {rightBottles.map((b) => (
                  <div key={b.name} className="flex flex-col items-center">
                    <img
                      src={b.image}
                      alt={b.name}
                      className="h-24 md:h-36 lg:h-48 w-auto object-contain object-bottom drop-shadow-lg"
                      style={{ transform: "scale(0.95)" }}
                    />
                    <span className="text-[9px] md:text-xs font-bold text-muted-foreground mt-2 uppercase tracking-wider">
                      {b.name}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Product Category Cards */}
          <motion.div
            className="flex-shrink-0 px-4 pb-4 md:pb-8"
            style={{ opacity: productsOpacity, y: productsY }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-5 max-w-5xl mx-auto">
              {products.map((product) => (
                <Link key={product.name} to={product.href} className="group block text-center">
                  <div className="relative p-3 md:p-4 rounded-2xl group-hover:bg-primary/5 transition-colors duration-500">
                    <div className="aspect-square flex items-end justify-center relative mb-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain object-bottom p-1 transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105 mix-blend-multiply"
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
