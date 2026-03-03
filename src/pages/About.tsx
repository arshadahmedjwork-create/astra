import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">Our Story</p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">About Astra Dairy</h1>
            </div>

            <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
              <p>
                Astra Dairy was born from a simple belief — that every family deserves access to pure, unadulterated cow's milk, just the way nature intended. In a world of packaged and processed dairy, we chose a different path.
              </p>
              <p>
                We source our milk from indigenous cows raised on natural fodder in open, humane farms. No artificial hormones, no antibiotics, and no preservatives ever touch our milk. From farm to your doorstep, every glass bottle of Astra milk is a promise of purity.
              </p>
              <p>
                Our milk is bottled in reusable glass — not plastic — because we care about what goes into your body and what goes back into the earth. We deliver within 12 hours of milking, ensuring the freshest milk reaches you every morning between 5:00 AM and 7:30 AM.
              </p>
              <p>
                What started as a small dairy in Chennai has grown into a trusted name for families who value health, transparency, and sustainability. We're not just delivering milk — we're reviving the way milk was always meant to be.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Delivery Window", value: "5:00 – 7:30 AM" },
                { label: "From Farm to Door", value: "Within 12 Hours" },
                { label: "Packaging", value: "Reusable Glass" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-2xl p-6 text-center">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
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

export default About;
