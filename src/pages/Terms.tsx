import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const Terms = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground">Terms & Conditions</h1>
            </div>
            <div className="prose max-w-none text-muted-foreground text-sm leading-relaxed space-y-4">
              <p>By using the Astra Dairy website and services, you agree to the following terms and conditions.</p>
              <p>All products are subject to availability. Prices may change without prior notice. Orders must be placed one day in advance for next-day delivery.</p>
              <p>Glass bottles remain the property of Astra Dairy and must be returned during the next delivery. Damaged or unreturned bottles may be charged.</p>
              <p>Astra Dairy reserves the right to modify delivery schedules during holidays or extreme weather conditions.</p>
              <p>For cancellations or refunds, please contact our support team within 24 hours of delivery.</p>
              <p>All content on this website is the intellectual property of Astra Dairy and may not be reproduced without permission.</p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
