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

const products = [
  { name: "Milk", image: pasteurizedMilk, href: "/products/cow-milk" },
  { name: "Paneer", image: paneer, href: "/products/paneer" },
  { name: "Ghee", image: ghee, href: "/products/ghee" },
  { name: "Curd", image: curd, href: "/products/curd" },
  { name: "Flavoured Milk", image: carrotMilk, href: "/products/flavoured-milk" },
  { name: "Non-Dairy", image: coconutOil, href: "/non-dairy" },
];

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // ── Phase A: Hero (0 → 0.3) ──
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroTextY = useTransform(scrollYProgress, [0, 0.2], [0, -60]);
  const bgScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.15]);
  const bgOpacity = useTransform(scrollYProgress, [0.15, 0.35], [1, 0]);

  // ── Phase A→B: Bottle descends into pour corridor (0.15 → 0.55) ──
  // Bottle starts at top-center hero, moves down into the "stage" area
  const bottleY = useTransform(scrollYProgress, [0.1, 0.35, 0.55], [0, 180, 320]);
  const bottleScale = useTransform(scrollYProgress, [0.1, 0.35, 0.55, 0.7], [1, 0.85, 0.7, 0.65]);

  // ── Phase A: Milk stream grows downward (0.25 → 0.6) ──
  const streamHeight = useTransform(scrollYProgress, [0.25, 0.6], [0, 100]); // percentage
  const streamOpacity = useTransform(scrollYProgress, [0.25, 0.3], [0, 1]);

  // ── Phase A: Milk pool expands at bottom of stage (0.45 → 0.65) ──
  const poolScale = useTransform(scrollYProgress, [0.45, 0.65], [0, 1]);
  const poolOpacity = useTransform(scrollYProgress, [0.45, 0.55], [0, 0.7]);

  // ── Phase B: Header + products reveal (0.55 → 0.75) ──
  const headerOpacity = useTransform(scrollYProgress, [0.35, 0.5], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0.35, 0.5], [40, 0]);
  const productsOpacity = useTransform(scrollYProgress, [0.6, 0.75], [0, 1]);
  const productsY = useTransform(scrollYProgress, [0.6, 0.75], [40, 0]);

  // ── Phase C: Bottle exits (0.75 → 0.9) ──
  const bottleExitOpacity = useTransform(scrollYProgress, [0.75, 0.9], [1, 0]);
  const bottleExitY = useTransform(scrollYProgress, [0.75, 0.9], [0, -80]);

  // ── Phase C: Pool becomes section bg (0.85 → 1) ──
  const poolBgOpacity = useTransform(scrollYProgress, [0.8, 0.95], [0.7, 0]);

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

        {/* ═══ PRODUCTS HEADER — appears in Phase B ═══ */}
        <motion.div
          className="absolute inset-x-0 top-0 z-10 flex justify-center pt-16 md:pt-20"
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

        {/* ═══ TOP STAGE: Pour Corridor (55vh desktop / 45vh mobile) ═══ */}
        <div className="relative flex-1 min-h-[45vh] md:min-h-[55vh]">
          {/* Centered milk lane — the invisible corridor */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-3 z-10 flex flex-col items-center"
            style={{ width: "clamp(110px, 12vw, 180px)" }}
          >
            {/* Bottle — starts centered, descends */}
            <motion.div
              className="relative z-20 flex-shrink-0"
              style={{
                y: bottleY,
                scale: bottleScale,
                opacity: bottleExitOpacity,
              }}
            >
              <motion.div style={{ y: bottleExitY }}>
                <img
                  src={bottleBanner}
                  alt="Astra Dairy farm fresh milk in glass bottle"
                  className="w-28 md:w-44 lg:w-52 h-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
                  loading="eager"
                />
              </motion.div>
            </motion.div>

            {/* Milk stream SVG — clipped to lane, grows downward */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-full overflow-hidden z-[9]"
              style={{
                top: "30%",
                height: streamHeight.get ? undefined : "0%",
                opacity: streamOpacity,
              }}
            >
              <motion.div style={{ height: useTransform(streamHeight, (v) => `${v}%`) }}>
                <svg
                  viewBox="0 0 100 400"
                  preserveAspectRatio="none"
                  className="w-full h-full"
                  style={{ filter: "blur(1px)" }}
                >
                  <defs>
                    <linearGradient id="milkStreamGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0.95" />
                      <stop offset="60%" stopColor="hsl(40 20% 97%)" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="hsl(40 20% 97%)" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 35 0 C 35 80, 30 160, 38 240 C 42 300, 35 340, 50 400 L 65 400 C 65 340, 58 300, 62 240 C 70 160, 65 80, 65 0 Z"
                    fill="url(#milkStreamGrad)"
                  />
                </svg>
              </motion.div>
            </motion.div>
          </div>

          {/* Milk pool — expands at bottom of stage, stops above product strip */}
          <motion.div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[8]"
            style={{
              scale: poolScale,
              opacity: poolOpacity,
              width: "clamp(200px, 40vw, 500px)",
              height: "clamp(30px, 4vh, 50px)",
              background: "radial-gradient(ellipse at center, hsl(40 20% 97% / 0.9) 0%, hsl(40 20% 97% / 0) 70%)",
              borderRadius: "50%",
              filter: "blur(12px)",
            }}
          />
        </div>

        {/* ═══ BOTTOM STRIP: Product Categories (never overlaps pour zone) ═══ */}
        <motion.div
          className="relative z-10 flex-shrink-0 pt-6 pb-6 md:pb-10 px-4"
          style={{ opacity: productsOpacity, y: productsY }}
        >
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-6 max-w-5xl mx-auto">
            {products.map((product) => (
              <Link key={product.name} to={product.href} className="group block text-center">
                <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-3 md:p-5 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
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
      </div>
    </div>
  );
};

export default HeroSection;
