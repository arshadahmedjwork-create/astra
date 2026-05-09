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
          {/* HTML5 Video Background (Fallback to static image if video is missing/loading) */}
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={heroBg}
            className="w-full h-full object-cover"
          >
            <source src="/assets/hero-bg-video.mp4" type="video/mp4" />
            <img src={heroBg} alt="Premium misty farm" className="w-full h-full object-cover" />
          </video>
          {/* Cinematic dark vignette — top-down + radial, gives depth without washing out colour */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.45)_100%)]" />
        </motion.div>
        <div className="absolute inset-0 bg-background -z-[1]" />

        {/* ═══ HERO SPLIT-SCREEN ═══ */}
        <motion.div
          className="absolute inset-0 z-30 flex justify-center"
          style={{ opacity: heroOpacity }}
        >
          {/* Full-bleed left gradient to prevent sharp edges on wide screens */}
          <div className="absolute inset-y-0 left-0 w-full md:w-[60%] bg-gradient-to-r from-black/70 via-black/30 to-transparent pointer-events-none -z-10" />

          {/* Constrain width to prevent excessive gap on wide screens */}
          <div className="w-full max-w-[1360px] h-full mx-auto flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 md:px-12 lg:px-16 pt-20 md:pt-0">
            
            {/* LEFT: Text panel */}
            <div className="relative w-full md:w-[50%] flex flex-col justify-center z-10 md:pr-4">
              <motion.div className="relative z-10" style={{ y: heroTextY }}>
                {/* Eyebrow — DM Sans 700 uppercase, Amber Gold */}
                <p
                  className="mb-3 md:mb-4"
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "clamp(0.5625rem, 0.9vw, 0.6875rem)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.25em",
                    color: "#F5A623",
                  }}
                >
                  FARM-FRESH · FAMILY-TRUSTED · DELIVERED DAILY
                </p>

                {/* Campaign H1 — Playfair Display 900 */}
                <h1
                  className="text-white leading-[1.05] tracking-tight mb-4 md:mb-6 max-w-2xl"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(2.5rem, 5.5vw, 4.8rem)",
                    fontWeight: 900,
                    textShadow: "0 2px 32px rgba(0,0,0,0.4)",
                  }}
                >
                  Fresh milk your family can trust every morning.
                </h1>

                {/* Lead body — DM Sans 400 */}
                <p
                  className="max-w-lg leading-relaxed"
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "clamp(0.9rem, 1.3vw, 1.05rem)",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  From your first cup of coffee to your child’s breakfast, Astra Dairy brings clean, farm-fresh goodness home with care, consistency, and comfort.
                </p>
                <p
                  className="max-w-lg leading-relaxed mt-2"
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "clamp(0.85rem, 1.2vw, 1rem)",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  Freshly sourced. Thoughtfully delivered. Loved daily.
                </p>

                {/* Trust badges — brand palette with backdrop blur */}
                <div className="flex flex-wrap gap-2 md:gap-3 mt-6 md:mt-8">
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm"
                    style={{
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      background: "rgba(26,122,63,0.3)",
                      border: "1px solid rgba(26,122,63,0.4)",
                      color: "#FFFFFF",
                    }}
                  >
                    <span className="text-[#6BBF2A] text-sm">✦</span> Morning Fresh
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm"
                    style={{
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      background: "rgba(245,166,35,0.2)",
                      border: "1px solid rgba(245,166,35,0.3)",
                      color: "#FFFFFF",
                    }}
                  >
                    <span className="text-[#F5A623] text-sm">✦</span> Family Trusted
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm"
                    style={{
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      color: "#FFFFFF",
                    }}
                  >
                    <span className="text-[#6BBF2A] text-sm">✦</span> Farm to Doorstep
                  </span>
                </div>
              </motion.div>
            </div>

            {/* RIGHT: Rotating bottle panel */}
            <div className="w-full md:w-[45%] flex items-center justify-center md:justify-end relative mt-8 md:mt-0 lg:-ml-12">
              {/* Layered ground glow for depth */}
              <div className="absolute bottom-[18%] md:bottom-[20%] left-1/2 md:left-[55%] -translate-x-1/2 w-64 md:w-96 h-12 md:h-20 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
              <div className="absolute bottom-[18%] md:bottom-[20%] left-1/2 md:left-[55%] -translate-x-1/2 w-44 md:w-64 h-6 md:h-10 rounded-full bg-white/15 blur-2xl pointer-events-none" />
              <div className="absolute bottom-[18%] md:bottom-[20%] left-1/2 md:left-[55%] -translate-x-1/2 w-28 md:w-40 h-3 md:h-5 rounded-full bg-foreground/20 blur-md pointer-events-none" />

              <motion.div
                className="relative flex flex-col items-center md:items-end"
                style={{ opacity: heroBottleOpacity }}
              >
                {/* Turntable wrapper */}
                <div className="hero-turntable-stage relative z-20">
                  <img
                    src={bottleBanner}
                    alt="Astra Dairy farm fresh milk in glass bottle"
                    className="hero-turntable-bottle h-[18rem] sm:h-80 md:h-[28rem] lg:h-[34rem] xl:h-[38rem] w-auto object-contain select-none filter drop-shadow-2xl"
                    draggable={false}
                    loading="eager"
                  />
                </div>
              </motion.div>
            </div>
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
