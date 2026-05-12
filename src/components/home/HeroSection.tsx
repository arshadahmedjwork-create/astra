import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

// ── Product assets (showcase section — DO NOT REMOVE) ──
import paneer          from "@/assets/product-paneer.png";
import carrotMilk      from "@/assets/product-carrot-milk.png";
import pasteurizedMilk from "@/assets/product-pasteurized-milk.png";
import ghee            from "@/assets/product-ghee.png";
import curd            from "@/assets/product-curd.png";

import bottleBanner      from "@/assets/bottle-banner.png";
import bottlePasteurised from "@/assets/bottle-pasteurised.png";
import bottleHomogenised from "@/assets/bottle-homogenised.png";

// ── Static hero image — poster + reduced-motion fallback ──
import heroBg from "@/assets/hero-misty-farm-bg.jpg";

/* ─────────────────────────────────────────────────────────────
   SCROLL TIMELINE  (container = 550 vh)
   ─────────────────────────────────────────────────────────────
   Phase 1  0.00 – 0.08   Pure video (landing view)
   Phase 2  0.08 – 0.42   Hero content slides up over video
   Phase 3  0.42 – 1.00   Our Products showcase
   ───────────────────────────────────────────────────────────── */

const products = [
  { name: "Milk",          image: pasteurizedMilk, href: "/products/cow-milk"      },
  { name: "Paneer",        image: paneer,          href: "/products/paneer"         },
  { name: "Ghee",          image: ghee,            href: "/products/ghee"           },
  { name: "Curd",          image: curd,            href: "/products/curd"           },
  { name: "Flavoured Milk",image: carrotMilk,      href: "/products/flavoured-milk" },
];

const leftBottles  = [{ name: "Pasteurised", image: bottlePasteurised }];
const rightBottles = [{ name: "Homogenised", image: bottleHomogenised }];

const trustPoints = [
  {
    icon: "🌾",
    label: "Ethically Sourced",
    desc:  "Grass-fed herds. Open pastures. No compromises.",
    accent: "rgba(26,122,63,0.28)",
    border: "rgba(107,191,42,0.50)",
  },
  {
    icon: "🧊",
    label: "Cold-Chain Integrity",
    desc:  "Farm-chilled within hours of every collection.",
    accent: "rgba(245,166,35,0.22)",
    border: "rgba(245,166,35,0.50)",
  },
  {
    icon: "🏡",
    label: "Family Nourishment",
    desc:  "Trusted by thousands of families, every morning.",
    accent: "rgba(255,255,255,0.10)",
    border: "rgba(255,255,255,0.38)",
  },
];

/* ─────────────────────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────────────────────── */
const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  /* ── Video layer ── */
  const bgScale   = useTransform(scrollYProgress, [0, 0.50],   [1, 1.18]);
  const bgOpacity = useTransform(scrollYProgress, [0.34, 0.50], [1, 0]);

  /* ── Phase 2: Hero content panel ── */
  // Slides up from 80 px below, holds, then fades out
  const heroContentOpacity = useTransform(
    scrollYProgress,
    [0.06, 0.17, 0.34, 0.44],
    [0,    1,    1,    0]
  );
  const heroContentY = useTransform(scrollYProgress, [0.06, 0.17], [80, 0]);

  // Staggered children — eyebrow, headline, body, badges, CTAs
  const eyebrowOpacity = useTransform(scrollYProgress, [0.07, 0.16], [0, 1]);
  const eyebrowY       = useTransform(scrollYProgress, [0.07, 0.16], [30, 0]);

  const headlineOpacity = useTransform(scrollYProgress, [0.09, 0.19], [0, 1]);
  const headlineY       = useTransform(scrollYProgress, [0.09, 0.19], [50, 0]);

  const bodyOpacity = useTransform(scrollYProgress, [0.12, 0.22], [0, 1]);
  const bodyY       = useTransform(scrollYProgress, [0.12, 0.22], [40, 0]);

  const cardsOpacity = useTransform(scrollYProgress, [0.16, 0.27], [0, 1]);
  const cardsY       = useTransform(scrollYProgress, [0.16, 0.27], [40, 0]);

  const ctaOpacity = useTransform(scrollYProgress, [0.20, 0.30], [0, 1]);
  const ctaY       = useTransform(scrollYProgress, [0.20, 0.30], [30, 0]);

  /* ── Phase 3: Products showcase ── */
  const showcaseOpacity = useTransform(scrollYProgress, [0.88, 0.97], [1, 0]);

  const headerOpacity = useTransform(scrollYProgress, [0.45, 0.57], [0, 1]);
  const headerY       = useTransform(scrollYProgress, [0.45, 0.57], [40, 0]);

  const bottleY           = useTransform(scrollYProgress, [0.40, 0.60], [160, 0]);
  const bottleScale       = useTransform(scrollYProgress, [0.40, 0.60], [1.25, 0.85]);
  const bottleShowOpacity = useTransform(scrollYProgress, [0.40, 0.56], [0, 1]);

  const flankOpacity = useTransform(scrollYProgress, [0.54, 0.66], [0, 1]);
  const leftFlankX   = useTransform(scrollYProgress, [0.54, 0.68], [-200, 0]);
  const rightFlankX  = useTransform(scrollYProgress, [0.54, 0.68], [200, 0]);

  const productsOpacity = useTransform(scrollYProgress, [0.68, 0.80], [0, 1]);
  const productsY       = useTransform(scrollYProgress, [0.68, 0.80], [50, 0]);

  return (
    <div ref={containerRef} className="relative h-[550vh]" id="productsShowcase">
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* ═══════════════════════════════════════════════════════
            LAYER 0 — Full-screen video background
            Slowly scales + fades out as the user scrolls,
            staying visible through both Phase 1 and Phase 2.
        ═══════════════════════════════════════════════════════ */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ scale: bgScale, opacity: bgOpacity }}
        >
          <video
            className="hero-bg-video pointer-events-none absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={heroBg}
            aria-hidden="true"
          >
            <source src="/assets/video/astra-hero-bg-master.mp4" type="video/mp4" />
          </video>

          {/* Brand-safe directional overlay — uniform dark centre for Phase 1 readability */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(12,18,12,0.62) 0%, rgba(12,18,12,0.38) 50%, rgba(12,18,12,0.65) 100%)",
            }}
          />
          {/* Top + bottom vignette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
        </motion.div>

        {/* Solid brand background visible once video fades */}
        <div className="absolute inset-0 bg-background -z-[1]" />

        {/* ═══════════════════════════════════════════════════════
            PHASE 2 DARK SCRIM — sits between the video (z-0)
            and the content panel (z-20). Appears ONLY during
            Phase 2 so the video is visibly dimmed for readability
            without affecting Phase 1 (pure video) or Phase 3.
        ═══════════════════════════════════════════════════════ */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-[5]"
          style={{
            opacity: heroContentOpacity,
            background: "rgba(8, 14, 8, 0.70)",
          }}
        />

        {/* ═══════════════════════════════════════════════════════
            LAYER 1 — PHASE 2: Hero Content Panel
            Slides up over the still-playing video, holds for a
            full viewport scroll, then fades out smoothly.
        ═══════════════════════════════════════════════════════ */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center px-6 sm:px-10 md:px-16"
          style={{ opacity: heroContentOpacity, y: heroContentY }}
        >
          <div className="w-full max-w-4xl mx-auto text-center">

            {/* Eyebrow tag */}
            <motion.p
              className="mb-6"
              style={{
                opacity:       eyebrowOpacity,
                y:             eyebrowY,
                fontFamily:    "'DM Sans', system-ui, sans-serif",
                fontSize:      "clamp(0.5rem, 0.82vw, 0.63rem)",
                fontWeight:    700,
                textTransform: "uppercase",
                letterSpacing: "0.38em",
                color:         "#F5A623",
              }}
            >
              PASTURE · PURITY · PURPOSE
            </motion.p>

            {/* Primary headline */}
            <motion.div style={{ opacity: headlineOpacity, y: headlineY }}>
              <h1
                className="leading-[1.02] tracking-tight mb-1"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize:   "clamp(3rem, 8vw, 6.8rem)",
                  fontWeight: 900,
                  color:      "#FFFFFF",
                  textShadow: "0 2px 32px rgba(0,0,0,0.7), 0 0 80px rgba(0,0,0,0.4)",
                }}
              >
                The finest milk,
              </h1>
              <p
                className="leading-[1.02] tracking-tight mb-8"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize:   "clamp(3rem, 8vw, 6.8rem)",
                  fontWeight: 900,
                  color:      "#6BBF2A",
                  textShadow: "0 2px 40px rgba(107,191,42,0.50), 0 0 80px rgba(107,191,42,0.20)",
                }}
              >
                naturally yours.
              </p>
            </motion.div>

            {/* Body copy */}
            <motion.p
              className="mx-auto mb-10 leading-relaxed"
              style={{
                opacity:    bodyOpacity,
                y:          bodyY,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize:   "clamp(0.95rem, 1.55vw, 1.12rem)",
                fontWeight: 400,
                color:      "rgba(255,255,255,0.92)",
                maxWidth:   "600px",
                textShadow: "0 1px 12px rgba(0,0,0,0.6)",
              }}
            >
              At Astra Dairy, excellence is not a promise — it is a practice.
              From our ethically raised herd to your morning table, every bottle
              carries the integrity of nature, the warmth of tradition, and the
              uncompromising quality only a{" "}
              <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
                truly dedicated farm can deliver.
              </span>
            </motion.p>

            {/* Trust / stat cards */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
              style={{ opacity: cardsOpacity, y: cardsY }}
            >
              {trustPoints.map((tp) => (
                <div
                  key={tp.label}
                  className="flex flex-col items-center gap-2 px-6 py-5 rounded-2xl backdrop-blur-md"
                  style={{
                    background:  tp.accent,
                    border:      `1px solid ${tp.border}`,
                    minWidth:    "168px",
                    boxShadow:   "0 4px 24px rgba(0,0,0,0.35)",
                  }}
                >
                  <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>{tp.icon}</span>
                  <span
                    style={{
                      fontFamily:    "'DM Sans', system-ui, sans-serif",
                      fontSize:      "0.68rem",
                      fontWeight:    800,
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      color:         "#FFFFFF",
                    }}
                  >
                    {tp.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      fontSize:   "0.72rem",
                      fontWeight: 400,
                      color:      "rgba(255,255,255,0.82)",
                      textAlign:  "center",
                      lineHeight: 1.5,
                    }}
                  >
                    {tp.desc}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-4"
              style={{ opacity: ctaOpacity, y: ctaY }}
            >
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:scale-105 hover:brightness-110"
                style={{
                  fontFamily:    "'DM Sans', system-ui, sans-serif",
                  background:    "#1A7A3F",
                  color:         "#FFFFFF",
                  letterSpacing: "0.12em",
                  boxShadow:     "0 4px 24px rgba(26,122,63,0.55), 0 0 0 1px rgba(107,191,42,0.3)",
                }}
              >
                Explore Our Collection
                <span style={{ fontSize: "1.1rem" }}>→</span>
              </Link>
              <Link
                to="/products/cow-milk"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:scale-105 hover:bg-white/20"
                style={{
                  fontFamily:    "'DM Sans', system-ui, sans-serif",
                  background:    "rgba(255,255,255,0.15)",
                  border:        "1.5px solid rgba(255,255,255,0.70)",
                  color:         "#FFFFFF",
                  letterSpacing: "0.12em",
                  boxShadow:     "0 4px 20px rgba(0,0,0,0.30)",
                }}
              >
                Begin Your Journey
              </Link>
            </motion.div>

          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            LAYER 2 — PHASE 3: Our Products scroll showcase
            Fades in after hero content exits; all product images
            and bottle animations are preserved exactly as before.
        ═══════════════════════════════════════════════════════ */}
        <motion.div
          className="absolute inset-0 flex flex-col z-10"
          style={{ opacity: showcaseOpacity }}
        >
          {/* Products Header */}
          <motion.div
            className="flex-shrink-0 flex justify-center pt-8 md:pt-16"
            style={{ opacity: headerOpacity, y: headerY }}
          >
            <div className="text-center">
              <p
                className="mb-3"
                style={{
                  fontFamily:    "'DM Sans', system-ui, sans-serif",
                  fontSize:      "clamp(0.5625rem, 0.9vw, 0.6875rem)",
                  fontWeight:    700,
                  textTransform: "uppercase",
                  letterSpacing: "0.4em",
                  color:         "#F5A623",
                }}
              >
                From Our Farm to Your Table
              </p>
              <h2
                style={{
                  fontFamily:    "'Playfair Display', serif",
                  fontSize:      "clamp(2.4rem, 5.5vw, 4.5rem)",
                  fontWeight:    700,
                  lineHeight:    1.05,
                  letterSpacing: "-0.02em",
                  color:         "#1A7A3F",
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

              {/* Center hero bottle */}
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
