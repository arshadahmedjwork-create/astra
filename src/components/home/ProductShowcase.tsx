import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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

const ProductShowcase = () => {
  return (
    <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent mb-3">
            From Our Farm to Your Table
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
            Products
          </h2>
        </motion.div>

        {/* Product grid — Shatto style: large hoverable cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-8 max-w-5xl mx-auto mt-12">
          {products.map((product, i) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link to={product.href} className="group block text-center">
                <div className="relative bg-card rounded-3xl border border-border p-6 lg:p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 overflow-hidden">
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                  <div className="aspect-square flex items-center justify-center relative mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Shadow under product */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-foreground/5 rounded-full blur-md" />
                  </div>

                  <h3 className="text-lg md:text-xl font-black text-foreground relative z-10 tracking-tight">
                    {product.name}
                  </h3>
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
