import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const rawMilk = "/assets/product-raw-milk.png";
const paneer = "/assets/product-paneer.png";
const ghee = "/assets/product-ghee.png";
const curd = "/assets/product-curd.png";
const kulfi = "/assets/product-kulfi.png";
const chocolateMilk = "/assets/product-chocolate-milk.png";

const categories = [
  { name: "Cow Milk", image: rawMilk, href: "/products/cow-milk", desc: "Farm fresh A2 cow's milk in glass bottles" },
  { name: "Paneer", image: paneer, href: "/products/paneer", desc: "Soft, fresh paneer made from pure cow's milk" },
  { name: "Ghee", image: ghee, href: "/products/ghee", desc: "Pure desi cow ghee, bilona method" },
  { name: "Curd / Dahi", image: curd, href: "/products/curd", desc: "Natural curd set in traditional earthen pots" },
  { name: "Natural Kulfi", image: kulfi, href: "/products/kulfi", desc: "Handcrafted malai kulfi with no added colors" },
  { name: "Flavoured Milk", image: chocolateMilk, href: "/products/flavoured-milk", desc: "Delicious flavoured milk for all ages" },
];

const Products = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">Our Range</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Dairy Products</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={cat.href} className="group block">
                  <div className="bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="aspect-square bg-sage/30 overflow-hidden">
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-1">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">{cat.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
