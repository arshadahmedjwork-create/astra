import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const Media = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-12">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">In The News</p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Media Coverage</h1>
              <p className="text-muted-foreground mt-4">See what the media has been saying about Astra Dairy.</p>
            </div>
            <div className="bg-secondary rounded-2xl p-12 text-center">
              <p className="text-muted-foreground">Media coverage highlights coming soon.</p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Media;
