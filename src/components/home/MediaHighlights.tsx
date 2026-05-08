import { motion } from "framer-motion";
import { mediaCoverage } from "@/constants/astraData";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const MediaHighlights = () => {
  return (
    <section className="py-20 lg:py-24 bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-eyebrow text-accent mb-2">Recognized By</p>
          <h2 className="text-section-title text-forest">Media & Press</h2>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60">
          {mediaCoverage.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, filter: "grayscale(1)" }}
              whileInView={{ opacity: 1, filter: "grayscale(1)" }}
              whileHover={{ opacity: 1, filter: "grayscale(0)", scale: 1.05 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="h-12 w-auto overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="h-full w-auto object-contain transition-transform duration-300"
                />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-accent transition-colors">
                {item.title}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link 
            to="/media" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition-colors group"
          >
            Read All Media Coverage <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MediaHighlights;
