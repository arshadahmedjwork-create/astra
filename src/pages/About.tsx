import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { companyInfo } from "@/constants/astraData";
import { Leaf, Milk, Truck, Award, ShieldCheck, Heart } from "lucide-react";

const timeline = [
  { year: "1950s", title: "The Beginning", desc: "Ravindran built a giant in handloom manufacturing and exports, supplying to all major countries globally." },
  { year: "2011", title: "Farm Established", desc: "The Astra Dairy farm was built on the belief that the essence of life is nutritious, natural food — not processed alternatives." },
  { year: "2012", title: "Home Delivery Launched", desc: "Astra Dairy introduced farm fresh cow's milk delivered directly to homes in custom patented glass bottles." },
  { year: "2013", title: "Kankrej Cows Adopted", desc: "Focus shifted from Holstein & Jersey to Kankrej cows — an indigenous Indian breed better adapted to local climate." },
  { year: "2015", title: "Sustainable Ecosystem", desc: "The self-sustaining farm now yields organic vegetables, paddy, sesame oil, eggs, and honey alongside fresh milk." },
  { year: "Today", title: "12-Hour Farm-to-Door", desc: "Milk delivered to your doorstep within 12 hours of milking, across multiple Chennai locations, every single day." },
];

const values = [
  { icon: Leaf, title: "100% Organic Fodder", desc: "No GMOs or animal by-products. Cows graze freely on corn, grains, and alfalfa grown in our own farms." },
  { icon: Milk, title: "Never Homogenized", desc: "Our milk is untouched and pure. Cream rising to the top is nature's sign of quality." },
  { icon: Truck, title: "Within 12 Hours", desc: "From milking to your doorstep in under 12 hours — the freshest milk possible, every morning." },
  { icon: ShieldCheck, title: "No Hormones or Antibiotics", desc: "We rely on ayurvedic and homeopathic treatments. Milk from any treated cow is never sold." },
  { icon: Heart, title: "Kankrej Cows", desc: "Indigenous Indian breed — adapted to local climate, happier and healthier than exotic breeds." },
  { icon: Award, title: "FSSAI Certified", desc: `Licensed and regulated. FSSAI Lic No: ${companyInfo.fssai}.` },
];

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-20">

            {/* Hero */}
            <div className="text-center space-y-4">
              <p className="text-eyebrow text-accent mb-3">Our Story</p>
              <h1 className="text-section-title text-forest">About Astra Dairy</h1>
              <p className="text-lead text-charcoal/80 max-w-3xl mx-auto leading-relaxed">
                "Do what is right, not what is easy." — A philosophy that shaped everything we do.
              </p>
            </div>

            {/* Founder Section */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left side: Founder portrait image */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="aspect-[4/5] rounded-[24px] overflow-hidden shadow-sm bg-white relative">
                  <img
                    src="/assets/about/founder-astra-dairy.png"
                    alt="Founder of Astra Dairy standing in a professional portrait"
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle Forest Green border frame for polish */}
                  <div className="absolute inset-0 border-[1.5px] border-[#1A7A3F]/10 rounded-[24px] pointer-events-none" />
                </div>
              </motion.div>

              {/* Right side: About content and founder story */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-8"
              >
                <div>
                  <p className="text-eyebrow text-accent mb-3">From Our Founder</p>
                  <h2 className="text-section-title text-forest mb-6">Built on trust. Delivered fresh every day.</h2>
                  
                  <div className="space-y-4 text-lead text-charcoal/80 leading-relaxed">
                    <p>
                      Astra Dairy began with a simple belief: families deserve dairy that is pure, fresh, and handled with responsibility from farm to doorstep. Our founder’s vision continues to guide every part of the brand, from product quality and sourcing discipline to daily delivery consistency.
                    </p>
                    <p className="font-semibold text-charcoal">
                      No shortcuts. No compromise. Just honest dairy, delivered with care.
                    </p>
                  </div>
                </div>

                {/* Founder quote card */}
                <div className="bg-white border border-[#1A7A3F]/10 rounded-[20px] p-8 shadow-sm relative mt-4">
                  <div className="absolute -top-3 left-8 bg-white px-2">
                    <span className="text-accent font-serif text-4xl leading-none">"</span>
                  </div>
                  <p className="text-xl font-serif italic text-charcoal mb-4 mt-2">
                    Freshness is not a claim. It is a responsibility we deliver every morning.
                  </p>
                  <div>
                    <p className="font-bold text-forest text-lg">Ravindran</p>
                    <p className="text-sm font-medium text-charcoal/60 uppercase tracking-widest mt-1">Founder, Astra Dairy</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Delivery Window", value: "5:00 – 7:30 AM" },
                { label: "From Farm to Door", value: "Within 12 Hours" },
                { label: "Packaging", value: "Reusable Glass" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -4 }}
                  className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all"
                >
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Timeline */}
            <div>
              <div className="text-center mb-10">
                <p className="text-eyebrow text-accent mb-2">Our Journey</p>
                <h2 className="text-section-title text-forest">Milestones</h2>
              </div>
              <div className="relative">
                <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-border hidden md:block" />
                <div className="space-y-10">
                  {timeline.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className={`md:flex md:gap-10 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center`}
                    >
                      <div className="md:w-1/2 flex md:justify-end">
                        <div className={`bg-card border border-border rounded-2xl p-6 shadow-sm max-w-sm w-full ${i % 2 !== 0 ? "md:ml-auto" : ""}`}>
                          <span className="text-accent font-bold text-sm">{item.year}</span>
                          <h3 className="font-semibold text-foreground mt-1 mb-2">{item.title}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                      <div className="hidden md:flex md:w-0 relative justify-center">
                        <div className="w-4 h-4 rounded-full bg-accent border-2 border-background shadow-md absolute top-1/2 -translate-y-1/2 -translate-x-1/2" />
                      </div>
                      <div className="md:w-1/2" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Values */}
            <div>
              <div className="text-center mb-10">
                <p className="text-eyebrow text-accent mb-2">What We Stand For</p>
                <h2 className="text-section-title text-forest">Our Values</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {values.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all hover:-translate-y-1"
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                      <v.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;

