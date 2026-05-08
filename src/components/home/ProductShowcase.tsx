import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import paneer from "@/assets/product-paneer.png";
import carrotMilk from "@/assets/product-carrot-milk.png";
import pasteurizedMilk from "@/assets/product-pasteurized-milk.png";
import ghee from "@/assets/product-ghee.png";
import curd from "@/assets/product-curd.png";

const products = [
  { name: "Milk", image: pasteurizedMilk, href: "/products/cow-milk" },
  { name: "Paneer", image: paneer, href: "/products/paneer" },
  { name: "Ghee", image: ghee, href: "/products/ghee" },
  { name: "Curd", image: curd, href: "/products/curd" },
  { name: "Flavoured Milk", image: carrotMilk, href: "/products/flavoured-milk" },
];

const ProductShowcase = () => {
  return (
    <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Subtle sage background texture for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {/* Eyebrow — DM Sans 700 uppercase, Amber Gold */}
          <p
            className="mb-4"
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
              fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#1A7A3F",
            }}
          >
            Our Products
          </h2>
        </motion.div>

        {/* Product grid */}
        <div className="flex flex-wrap justify-center gap-4 lg:gap-8 max-w-5xl mx-auto mt-4">
          {products.map((product, i) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              viewport={{ once: true }}
              className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1.5rem)] lg:w-[calc(33.333%-2rem)]"
            >
              <Link to={product.href} className="group block text-center">
                <div
                  className={`relative bg-card ${i % 2 === 0 ? "organic-radius" : "organic-radius-reverse"} border border-border p-6 lg:p-10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 overflow-hidden shadow-sm`}
                  style={{
                    borderColor: "hsl(0 0% 90%)",
                  }}
                >
                  {/* Hover overlay — Forest Green tint */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${i % 2 === 0 ? "organic-radius" : "organic-radius-reverse"}`}
                    style={{ background: "linear-gradient(to top, rgba(26,122,63,0.05), transparent)" }}
                  />

                  <div className="aspect-square flex items-end justify-center relative mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain object-bottom p-2 transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
                      loading="lazy"
                    />
                    {/* Ground shadow */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-foreground/5 rounded-full blur-md" />
                  </div>

                  {/* Product name — DM Sans semibold, Charcoal Ink */}
                  <h3
                    className="relative z-10"
                    style={{
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      fontSize: "clamp(1rem, 1.4vw, 1.2rem)",
                      fontWeight: 600,
                      color: "#1C1C1C",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {product.name}
                  </h3>

                  {/* Amber Gold hover accent line */}
                  <div
                    className="mx-auto mt-2 h-0.5 w-0 group-hover:w-10 transition-all duration-500 rounded-full"
                    style={{ background: "#F5A623" }}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
