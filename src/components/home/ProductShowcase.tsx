import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import paneer from "@/assets/product-paneer.png";
import carrotMilk from "@/assets/product-carrot-milk.png";
import pasteurizedMilk from "@/assets/product-pasteurized-milk.png";
import homogenizedMilk from "@/assets/product-homogenized-milk.png";
import ghee from "@/assets/product-ghee.png";
import chocolateMilk from "@/assets/product-chocolate-milk.png";
import curd from "@/assets/product-curd.png";
import kulfi from "@/assets/product-kulfi.png";
import coconutOil from "@/assets/product-coconut-oil.png";
import sesameOil from "@/assets/product-sesame-oil.png";
import buttermilk from "@/assets/product-buttermilk.png";

const products = [
  { name: "Fresh Paneer", image: paneer, tags: ["Farm fresh", "In whey water"], href: "/products/paneer" },
  { name: "Carrot Milk", image: carrotMilk, tags: ["Flavoured", "Nutritious"], href: "/products/flavoured-milk" },
  { name: "Desi Cow Ghee", image: ghee, tags: ["A2 Ghee", "Bilona method"], href: "/products/ghee" },
  { name: "Pasteurised Milk", image: pasteurizedMilk, tags: ["Glass bottled", "No preservatives"], href: "/products/cow-milk" },
  { name: "Homogenised Milk", image: homogenizedMilk, tags: ["Glass bottled", "Uniform texture"], href: "/products/cow-milk" },
  { name: "Chocolate Milk", image: chocolateMilk, tags: ["Flavoured", "Kids favourite"], href: "/products/flavoured-milk" },
  { name: "Curd / Dahi", image: curd, tags: ["Earthen pot", "Natural culture"], href: "/products/curd" },
  
  { name: "Coconut Oil", image: coconutOil, tags: ["Cold pressed", "Virgin"], href: "/non-dairy" },
  { name: "Sesame Oil", image: sesameOil, tags: ["Cold pressed", "Natural"], href: "/non-dairy" },
  { name: "Butter Milk", image: buttermilk, tags: ["Traditional", "Refreshing"], href: "/products/cow-milk" },
];

const ProductShowcase = () => {
  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-primary/3 blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent mb-3">
            Our Products
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
            Pure & Natural{" "}
            <span className="text-primary">Goodness</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-lg">
            From fresh milk to artisanal ghee — every product crafted with love.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <Link to={product.href} className="group block">
                <div className="relative bg-card rounded-2xl border border-border p-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                  <div className="aspect-square rounded-xl overflow-hidden bg-sage/20 mb-4 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-2 leading-snug relative z-10">
                    {product.name}
                  </h3>
                  <div className="flex flex-wrap gap-1 relative z-10">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold bg-primary/8 text-primary px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link to="/products">
            <Button variant="hero-outline" size="lg" className="text-base px-10 py-7">
              View All Products <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductShowcase;
