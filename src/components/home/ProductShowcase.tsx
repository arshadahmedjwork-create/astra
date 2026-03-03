import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import rawMilk from "@/assets/product-raw-milk.png";
import pasteurizedMilk from "@/assets/product-pasteurized-milk.png";
import homogenizedMilk from "@/assets/product-homogenized-milk.png";
import paneer from "@/assets/product-paneer.png";
import ghee from "@/assets/product-ghee.png";
import curd from "@/assets/product-curd.png";
import kulfi from "@/assets/product-kulfi.png";
import chocolateMilk from "@/assets/product-chocolate-milk.png";
import coconutOil from "@/assets/product-coconut-oil.png";
import sesameOil from "@/assets/product-sesame-oil.png";

const products = [
  { name: "Farm Fresh Raw Milk", image: rawMilk, tags: ["Glass bottled", "Farm fresh"], href: "/products/cow-milk" },
  { name: "Pasteurised Milk", image: pasteurizedMilk, tags: ["Glass bottled", "No preservatives"], href: "/products/cow-milk" },
  { name: "Homogenised Milk", image: homogenizedMilk, tags: ["Glass bottled", "Uniform texture"], href: "/products/cow-milk" },
  { name: "Fresh Paneer", image: paneer, tags: ["Farm fresh", "Soft & creamy"], href: "/products/paneer" },
  { name: "Desi Cow Ghee", image: ghee, tags: ["A2 Ghee", "Bilona method"], href: "/products/ghee" },
  { name: "Curd / Dahi", image: curd, tags: ["Earthen pot", "Natural culture"], href: "/products/curd" },
  { name: "Malai Kulfi", image: kulfi, tags: ["No added colors", "Natural"], href: "/products/kulfi" },
  { name: "Chocolate Milk", image: chocolateMilk, tags: ["Flavoured", "Kids favourite"], href: "/products/flavoured-milk" },
  { name: "Coconut Oil", image: coconutOil, tags: ["Cold pressed", "Virgin"], href: "/non-dairy" },
  { name: "Sesame Oil", image: sesameOil, tags: ["Cold pressed", "Natural"], href: "/non-dairy" },
];

const ProductShowcase = () => {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">Our Products</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Pure & Natural <span className="text-primary">Goodness</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <Link to={product.href} className="group block">
                <div className="bg-card rounded-2xl border border-border p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="aspect-square rounded-xl overflow-hidden bg-sage/30 mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-2 leading-snug">{product.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {product.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-medium bg-primary/5 text-primary px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/products">
            <Button variant="hero-outline" size="lg">View All Products</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
