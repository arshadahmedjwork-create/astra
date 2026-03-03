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

// Flanking bottles: 2 left, 2 right — the hero bottle lands in the center
const leftBottles = [
  { name: "Paneer", image: paneer },
  { name: "Ghee", image: ghee },
];
const rightBottles = [
  { name: "Curd", image: curd },
  { name: "Coconut Oil", image: coconutOil },
];

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Hero content fades out
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroTextY = useTransform(scrollYProgress, [0, 0.25], [0, -80]);

  // Background zooms in slightly and fades
  const bgScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.15]);
  const bgOpacity = useTransform(scrollYProgress, [0.2, 0.5], [1, 0]);

  // Bottle moves down from hero center to products section center
  const bottleY = useTransform(scrollYProgress, [0, 0.3, 0.55, 0.75], [0, 200, 400, 500]);
  const bottleScale = useTransform(scrollYProgress, [0, 0.3, 0.55, 0.75], [1, 0.9, 0.7, 0.5]);
  const bottleOpacity = useTransform(scrollYProgress, [0.7, 0.85], [1, 0]);

  // "From Our Farm to Your Table" section appears
  const productsHeaderOpacity = useTransform(scrollYProgress, [0.4, 0.55], [0, 1]);
  const productsHeaderY = useTransform(scrollYProgress, [0.4, 0.55], [60, 0]);

  // Product cards staggered reveal
  const productsOpacity = useTransform(scrollYProgress, [0.5, 0.65], [0, 1]);
  const productsY = useTransform(scrollYProgress, [0.5, 0.65], [80, 0]);

  // Milk reflection surface
  const reflectionOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 0.6]);

  return (
    <div ref={containerRef} className="relative h-[350vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background image layer */}
        <motion.div className="absolute inset-0" style={{ scale: bgScale, opacity: bgOpacity }}>
          <img
            src={heroBg}
            alt="Premium kitchen setting"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-foreground/10" />
        </motion.div>

        {/* Solid background that appears as bg fades */}
        <div className="absolute inset-0 bg-background -z-0" />

        {/* Hero text — fades up and out on scroll */}
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
          <p
            className="text-base md:text-lg text-foreground/80 max-w-xl leading-relaxed"
            style={{ textShadow: "0 1px 20px rgba(255,255,255,0.6)" }}
          >
            At Astra Dairy, nothing gets in the way of producing the freshest, most natural dairy products.
            <br className="hidden md:block" />
            No hormones. No preservatives. No factory farms. Just pure goodness.
          </p>
        </motion.div>

        {/* The bottle — starts centered in hero, moves down through scroll */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 z-20"
          style={{
            top: "35%",
            y: bottleY,
            scale: bottleScale,
            opacity: bottleOpacity,
          }}
        >
          <img
            src={bottleBanner}
            alt="Astra Dairy farm fresh milk in glass bottle"
            className="w-40 md:w-56 lg:w-64 h-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            loading="eager"
          />
          {/* Reflection under bottle */}
          <motion.div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 md:w-44 h-6 bg-foreground/8 rounded-full blur-xl"
            style={{ opacity: reflectionOpacity }}
          />
        </motion.div>

        {/* "From Our Farm to Your Table" header — appears after scroll */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center z-10 px-4"
          style={{ opacity: productsHeaderOpacity, y: productsHeaderY }}
        >
          <div className="pt-20 md:pt-24 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent mb-3">
              From Our Farm to Your Table
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
              Products
            </h2>
          </div>
        </motion.div>

        {/* Product grid — appears below the header */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-10 px-4 pb-12 md:pb-16"
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
