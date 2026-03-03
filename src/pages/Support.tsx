import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Clock, Phone, Mail } from "lucide-react";

const Support = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">We're Here to Help</p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Support</h1>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">Support Hours</h3>
                  <p className="text-sm text-muted-foreground">Monday – Saturday: 8:00 AM – 8:00 PM</p>
                  <p className="text-sm text-muted-foreground">Sunday: 8:00 AM – 12:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">Call Us</h3>
                  <p className="text-sm text-muted-foreground">+91 44 4856 2222</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <p className="text-sm text-muted-foreground">hello@astradairy.in</p>
                </div>
              </div>
            </div>

            <div className="bg-secondary rounded-2xl p-8">
              <h2 className="text-xl font-bold text-foreground mb-3">Delivery Window</h2>
              <p className="text-muted-foreground">Our delivery happens every morning between <strong className="text-foreground">5:00 AM – 7:30 AM</strong>. Please place orders one day in advance for next-day delivery.</p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Support;
