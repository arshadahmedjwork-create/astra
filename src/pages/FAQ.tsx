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
import { faqData } from "@/constants/astraData";

const faqs = faqData.map((item) => ({ q: item.question, a: item.answer }));

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
              <p className="text-eyebrow text-accent mb-3">Help Center</p>
              <h1 className="text-section-title text-forest mb-6">Frequently Asked Questions</h1>
              
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
