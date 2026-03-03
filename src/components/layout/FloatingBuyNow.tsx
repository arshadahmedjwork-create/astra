import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";

const FloatingBuyNow = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = document.documentElement.scrollHeight * 0.3;
      setVisible(window.scrollY > threshold);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <a href="https://erp.astradairy.in" target="_blank" rel="noopener noreferrer">
            <Button variant="pill" size="lg" className="shadow-2xl gap-2">
              <ShoppingCart className="w-4 h-4" />
              Buy Now
            </Button>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingBuyNow;
