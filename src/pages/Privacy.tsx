import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const Privacy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
            </div>
            <div className="prose max-w-none text-muted-foreground text-sm leading-relaxed space-y-4">
              <p>Astra Dairy respects your privacy and is committed to protecting your personal data.</p>
              <p>We collect only the information necessary to process orders and deliver products — including name, address, phone number, and email.</p>
              <p>Your data is never shared with third parties for marketing purposes. We use industry-standard security measures to protect your information.</p>
              <p>You may request access to, correction of, or deletion of your personal data by contacting our support team at hello@astradairy.in.</p>
              <p>This website may use cookies for analytics purposes. By continuing to use the site, you consent to cookie usage.</p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
