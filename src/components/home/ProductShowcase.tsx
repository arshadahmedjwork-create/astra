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
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-accent mb-4">
            From Our Farm to Your Table
          </p>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-black text-foreground tracking-tight">
            Our Products
          </h2>
        </motion.div>

        {/* Product grid — Shatto style: large hoverable cards */}
        <div className="flex flex-wrap justify-center gap-4 lg:gap-8 max-w-5xl mx-auto mt-12">
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
                <div className={`relative bg-card ${i % 2 === 0 ? 'organic-radius' : 'organic-radius-reverse'} border border-border p-6 lg:p-10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 overflow-hidden shadow-sm`}>
                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${i % 2 === 0 ? 'organic-radius' : 'organic-radius-reverse'}`} />

                  <div className="aspect-square flex items-center justify-center relative mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
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
