import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import bottleBanner from "@/assets/bottle-banner.png";
import heroBg from "@/assets/hero-kitchen-bg.jpg";

import paneer from "@/assets/product-paneer.png";
import carrotMilk from "@/assets/product-carrot-milk.png";
import ghee from "@/assets/product-ghee.png";
import curd from "@/assets/product-curd.png";
import coconutOil from "@/assets/product-coconut-oil.png";
import buttermilk from "@/assets/product-buttermilk.png";

// Left 2, Right 2 — the center is reserved for the hero bottle landing
const leftProducts = [
  { name: "Paneer", image: paneer, href: "/products/paneer", height: "h-28 md:h-44" },
  { name: "Ghee", image: ghee, href: "/products/ghee", height: "h-24 md:h-36" },
];
const rightProducts = [
  { name: "Curd", image: curd, href: "/products/curd", height: "h-24 md:h-36" },
  { name: "Flavoured Milk", image: carrotMilk, href: "/products/flavoured-milk", height: "h-28 md:h-44" },
];
const outerProducts = [
  { name: "Non-Dairy", image: coconutOil, href: "/non-dairy", side: "left" as const },
  { name: "Buttermilk", image: buttermilk, href: "/products/cow-milk", side: "right" as const },
];

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Hero text fades out
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroTextY = useTransform(scrollYProgress, [0, 0.2], [0, -80]);

  // Background zooms and fades
  const bgScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.15]);
  const bgOpacity = useTransform(scrollYProgress, [0.15, 0.4], [1, 0]);

  // Bottle moves down from hero to land between the flanking products
  const bottleY = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.65], [0, 150, 350, 420]);
  const bottleScale = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.65], [1, 0.85, 0.6, 0.55]);
  const bottleOpacity = useTransform(scrollYProgress, [0, 0.65, 0.85], [1, 1, 0]);

  // Header appears
  const headerOpacity = useTransform(scrollYProgress, [0.3, 0.45], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0.3, 0.45], [50, 0]);

  // Flanking products slide in from sides
  const leftX = useTransform(scrollYProgress, [0.4, 0.6], [-120, 0]);
  const rightX = useTransform(scrollYProgress, [0.4, 0.6], [120, 0]);
  const productsOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);

  // Outer products appear last
  const outerOpacity = useTransform(scrollYProgress, [0.55, 0.7], [0, 1]);
  const outerLeftX = useTransform(scrollYProgress, [0.55, 0.7], [-80, 0]);
  const outerRightX = useTransform(scrollYProgress, [0.55, 0.7], [80, 0]);

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Solid bg behind everything */}
        <div className="absolute inset-0 bg-background" />

        {/* Background image */}
        <motion.div className="absolute inset-0 z-[1]" style={{ scale: bgScale, opacity: bgOpacity }}>
          <img src={heroBg} alt="Premium kitchen" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-foreground/10" />
        </motion.div>

        {/* Hero text */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-start pt-28 md:pt-32 z-[5] px-4 text-center"
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

        {/* The hero bottle — descends into center */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 z-[15]"
          style={{ top: "30%", y: bottleY, scale: bottleScale, opacity: bottleOpacity }}
        >
          <img
            src={bottleBanner}
            alt="Astra Dairy farm fresh milk in glass bottle"
            className="w-40 md:w-56 lg:w-64 h-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            loading="eager"
          />
        </motion.div>

        {/* "From Our Farm to Your Table" header */}
        <motion.div
          className="absolute inset-x-0 top-0 flex flex-col items-center z-[10] px-4 pt-20 md:pt-24"
          style={{ opacity: headerOpacity, y: headerY }}
        >
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent mb-3">
            From Our Farm to Your Table
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
            Products
          </h2>
        </motion.div>

        {/* Product lineup — Shatto style: products flanking center, bottle lands in middle */}
        <div className="absolute inset-x-0 bottom-0 z-[10] px-4 pb-8 md:pb-16">
          <div className="max-w-4xl mx-auto flex items-end justify-center gap-2 md:gap-4 relative">
            {/* Far left outer product */}
            <motion.div
              style={{ opacity: outerOpacity, x: outerLeftX }}
              className="flex-shrink-0"
            >
              <Link to={outerProducts[0].href} className="group block text-center">
                <div className="w-20 md:w-28 transition-transform duration-500 group-hover:-translate-y-2">
                  <img
                    src={outerProducts[0].image}
                    alt={outerProducts[0].name}
                    className="w-full h-20 md:h-32 object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <p className="text-[10px] md:text-xs font-bold text-foreground mt-2 uppercase tracking-wider">
                    {outerProducts[0].name}
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Left 2 products */}
            {leftProducts.map((product, i) => (
              <motion.div
                key={product.name}
                style={{ opacity: productsOpacity, x: leftX }}
                className="flex-shrink-0"
              >
                <Link to={product.href} className="group block text-center">
                  <div className="w-24 md:w-36 transition-transform duration-500 group-hover:-translate-y-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full ${product.height} object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105`}
                      loading="lazy"
                    />
                    <p className="text-[10px] md:text-xs font-bold text-foreground mt-2 uppercase tracking-wider">
                      {product.name}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Center gap — the bottle lands here */}
            <div className="w-28 md:w-40 flex-shrink-0" />

            {/* Right 2 products */}
            {rightProducts.map((product) => (
              <motion.div
                key={product.name}
                style={{ opacity: productsOpacity, x: rightX }}
                className="flex-shrink-0"
              >
                <Link to={product.href} className="group block text-center">
                  <div className="w-24 md:w-36 transition-transform duration-500 group-hover:-translate-y-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full ${product.height} object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105`}
                      loading="lazy"
                    />
                    <p className="text-[10px] md:text-xs font-bold text-foreground mt-2 uppercase tracking-wider">
                      {product.name}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Far right outer product */}
            <motion.div
              style={{ opacity: outerOpacity, x: outerRightX }}
              className="flex-shrink-0"
            >
              <Link to={outerProducts[1].href} className="group block text-center">
                <div className="w-20 md:w-28 transition-transform duration-500 group-hover:-translate-y-2">
                  <img
                    src={outerProducts[1].image}
                    alt={outerProducts[1].name}
                    className="w-full h-20 md:h-32 object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <p className="text-[10px] md:text-xs font-bold text-foreground mt-2 uppercase tracking-wider">
                    {outerProducts[1].name}
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
