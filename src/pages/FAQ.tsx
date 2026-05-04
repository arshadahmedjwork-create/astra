import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Is your milk organic?", a: "Yes. Our cows are raised on natural fodder without artificial hormones, antibiotics, or growth stimulants. No preservatives are ever added to our milk." },
  { q: "Why do you use glass bottles?", a: "Glass is non-reactive, reusable, and doesn't leach chemicals into the milk. It preserves the natural taste and freshness. Plus, it's better for the environment." },
  { q: "What time do you deliver?", a: "We deliver between 5:00 AM and 7:30 AM every morning to ensure you get the freshest milk for your day." },
  { q: "Why does the cream separate?", a: "Cream separation is a sign of pure, non-homogenised milk. Simply shake the bottle before use." },
  { q: "Do I need to boil the milk?", a: "Yes, we recommend boiling raw milk before consumption. Pasteurised milk can be consumed directly." },
  { q: "How do I return the glass bottles?", a: "Our delivery team collects empty glass bottles during the next delivery. The bottles are cleaned, sterilized, and reused." },
  { q: "Can I order for a trial?", a: "Yes! You can order a trial through our website at erp.astradairy.in." },
  { q: "Which areas do you deliver to?", a: "We currently deliver in Chennai and surrounding areas. Check our website for specific delivery zones." },
  { q: "Do you use any preservatives?", a: "No. Our milk is 100% natural with zero preservatives, additives, or artificial ingredients." },
  { q: "How is your ghee made?", a: "Our ghee is made using the traditional bilona (hand-churning) method from A2 cow's milk curd." },
];

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="text-center mb-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">Help Center</p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Frequently Asked Questions</h1>
              
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Search for answers..." 
                  className="w-full pl-12 pr-4 h-14 rounded-2xl bg-card border-border/50 shadow-sm text-lg focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredFaqs.length > 0 ? (
              <Accordion type="multiple" className="space-y-4">
                {filteredFaqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border border-border/50 rounded-2xl px-6 py-1 bg-card shadow-sm data-[state=open]:border-primary/20 transition-colors">
                    <AccordionTrigger className="text-left font-medium text-foreground text-lg hover:no-underline hover:text-primary transition-colors py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed text-base pb-5">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
                <p className="text-muted-foreground text-lg">No matching questions found for "{searchQuery}".</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-primary font-medium hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
