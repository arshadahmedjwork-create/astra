import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

import coconutOil from "@/assets/product-coconut-oil.png";
import sesameOil from "@/assets/product-sesame-oil.png";

const nonDairyProducts = [
  { name: "Country Chicken Eggs", desc: "Free-range country chicken eggs, rich in nutrition." },
  { name: "Kadaknath Eggs", desc: "Premium Kadaknath breed eggs, known for higher protein and lower cholesterol." },
  { name: "Sesame Oil (Gingelly)", image: sesameOil, desc: "Cold pressed, unrefined sesame oil for authentic South Indian cooking." },
  { name: "Coconut Oil", image: coconutOil, desc: "Virgin cold pressed coconut oil, perfect for cooking and skincare." },
  { name: "Honey", desc: "Pure, raw, unprocessed honey sourced from natural apiaries." },
  { name: "Vegetables", desc: "Farm fresh, organic vegetables sourced from local farms." },
  { name: "Natural Rice", desc: "Traditional rice varieties grown without chemical fertilizers." },
];

const NonDairy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">Beyond Dairy</p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Non-Dairy Products</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nonDairyProducts.map((product, i) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                >
                  {product.image && (
                    <div className="aspect-video bg-sage/30 overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NonDairy;
