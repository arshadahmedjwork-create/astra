import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ImageIcon } from "lucide-react";
import { galleryCategories } from "@/constants/astraData";
import { Button } from "@/components/ui/button";

const GalleryHighlights = () => {
  // Get a selection of images from various categories for variety
  const previewImages = [
    galleryCategories[0].images[0], // Cows Grazing
    galleryCategories[1].images[1], // Farm Cleaning
    galleryCategories[4].images[0], // Natural Fodder
    galleryCategories[7].images[0], // Farm Visits
    galleryCategories[9].images[0], // Pongal
  ];

  return (
    <section className="py-24 lg:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-accent mb-3">Authentic Farming</p>
            <h2 className="text-section-title text-forest">Life at the Farm</h2>
            <p className="text-lead text-charcoal/80 mt-4">
              Explore the daily rhythm of Astra Dairy — from our sustainable fodder cultivation to our healthy, grazing cows.
            </p>
          </div>
          <Link to="/gallery">
            <Button variant="outline" className="rounded-full px-8 h-12 group">
              Explore Gallery <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {previewImages.map((image, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className={`relative overflow-hidden rounded-2xl aspect-[4/5] ${
                i === 2 ? "md:scale-110 z-10 shadow-2xl" : "shadow-lg"
              }`}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-4 text-muted-foreground">
          <div className="h-px w-12 bg-border" />
          <ImageIcon className="w-5 h-5 text-accent" />
          <p className="text-sm font-medium italic">Our gallery contains 80+ authentic farm photos</p>
          <div className="h-px w-12 bg-border" />
        </div>
      </div>
    </section>
  );
};

export default GalleryHighlights;
