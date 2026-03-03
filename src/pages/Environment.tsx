import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const Environment = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">Our Commitment</p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Environment</h1>
            </div>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                At Astra Dairy, sustainability isn't a buzzword — it's built into everything we do. From reusable glass bottles to natural farming practices, we're committed to reducing our environmental footprint.
              </p>
              <p>
                Our glass bottles are collected, cleaned, and reused — reducing single-use plastic waste. Our cows are raised on natural fodder, and we avoid chemical fertilizers and pesticides in our sourcing.
              </p>
              <p>
                We believe that healthy food starts with a healthy planet. Every bottle of Astra milk is a step towards a more sustainable future for our families and our earth.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Environment;
