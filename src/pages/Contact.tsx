import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">Get In Touch</p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Contact Us</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: MapPin, title: "Address", text: "No. 60, Satyamurthy Nagar, Medavakkam, Chennai – 600100" },
                { icon: Phone, title: "Phone", text: "+91 44 4856 2222" },
                { icon: Mail, title: "Email", text: "hello@astradairy.in" },
                { icon: Clock, title: "Support Hours", text: "Mon–Sat: 8:00 AM – 8:00 PM\nSunday: 8:00 AM – 12:00 PM" },
              ].map((item) => (
                <div key={item.title} className="bg-card border border-border rounded-2xl p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl forest-gradient flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
