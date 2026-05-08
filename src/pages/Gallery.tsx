import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { galleryCategories, GalleryImage } from "@/constants/astraData";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface LightboxState {
  categoryIndex: number;
  imageIndex: number;
}

const Gallery = () => {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const openLightbox = (categoryIndex: number, imageIndex: number) => {
    setImageLoaded(false);
    setLightbox({ categoryIndex, imageIndex });
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    document.body.style.overflow = "";
  }, []);

  const navigate = useCallback((dir: 1 | -1) => {
    if (!lightbox) return;
    setImageLoaded(false);
    const cat = galleryCategories[lightbox.categoryIndex];
    const newIdx = lightbox.imageIndex + dir;
    if (newIdx >= 0 && newIdx < cat.images.length) {
      setLightbox({ ...lightbox, imageIndex: newIdx });
    } else if (newIdx < 0 && lightbox.categoryIndex > 0) {
      const prevCat = galleryCategories[lightbox.categoryIndex - 1];
      setLightbox({ categoryIndex: lightbox.categoryIndex - 1, imageIndex: prevCat.images.length - 1 });
    } else if (newIdx >= cat.images.length && lightbox.categoryIndex < galleryCategories.length - 1) {
      setLightbox({ categoryIndex: lightbox.categoryIndex + 1, imageIndex: 0 });
    }
  }, [lightbox]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, closeLightbox, navigate]);

  const currentImage: GalleryImage | null = lightbox
    ? galleryCategories[lightbox.categoryIndex].images[lightbox.imageIndex]
    : null;

  const currentCategoryTitle = lightbox
    ? galleryCategories[lightbox.categoryIndex].title
    : "";

  const totalInCategory = lightbox
    ? galleryCategories[lightbox.categoryIndex].images.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-10 max-w-7xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent mb-3">Visual Stories</p>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">Our Gallery</h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-base">
              A window into life at Astra Dairy — our farm, our cows, our celebrations.
            </p>
          </motion.div>

          {/* Category Sections */}
          <div className="space-y-20">
            {galleryCategories.map((category, catIdx) => (
              <motion.section
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
              >
                {/* Section Header */}
                <div className="flex items-end gap-4 mb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">
                      {String(catIdx + 1).padStart(2, "0")}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">{category.title}</h2>
                    <p className="text-muted-foreground text-sm mt-1 max-w-xl">{category.description}</p>
                  </div>
                  <div className="flex-1 h-px bg-border mb-2 hidden md:block" />
                  <span className="text-xs text-muted-foreground mb-2 hidden md:block whitespace-nowrap">
                    {category.images.length} photos
                  </span>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {category.images.map((image, imgIdx) => (
                    <motion.div
                      key={imgIdx}
                      initial={{ opacity: 0, scale: 0.92 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: imgIdx * 0.04, duration: 0.4 }}
                      onClick={() => openLightbox(catIdx, imgIdx)}
                      className="relative group aspect-[4/3] overflow-hidden rounded-xl cursor-pointer bg-muted shadow-sm hover:shadow-xl transition-shadow duration-300"
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                        <p className="text-white text-xs font-medium leading-tight line-clamp-2">{image.alt}</p>
                      </div>
                      {/* Zoom icon */}
                      <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                        <ZoomIn className="w-4 h-4 text-white" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      </main>
      <Footer />

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && currentImage && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Blurred backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

            {/* Panel */}
            <motion.div
              key={`${lightbox.categoryIndex}-${lightbox.imageIndex}`}
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative z-10 w-full max-w-5xl mx-4 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top bar */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-widest">{currentCategoryTitle}</p>
                  <p className="text-white font-medium text-sm">
                    {lightbox.imageIndex + 1} / {totalInCategory}
                  </p>
                </div>
                <button
                  onClick={closeLightbox}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Image frame */}
              <div className="relative rounded-2xl overflow-hidden bg-black/40 shadow-2xl border border-white/10">
                {/* Loading shimmer */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
                )}
                <motion.img
                  key={currentImage.url}
                  src={currentImage.url}
                  alt={currentImage.alt}
                  onLoad={() => setImageLoaded(true)}
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: imageLoaded ? 1 : 0, filter: imageLoaded ? "blur(0px)" : "blur(8px)" }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-h-[75vh] object-contain mx-auto block"
                />

                {/* Prev / Next arrows */}
                <button
                  onClick={() => navigate(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-30"
                  disabled={lightbox.categoryIndex === 0 && lightbox.imageIndex === 0}
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => navigate(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-30"
                  disabled={
                    lightbox.categoryIndex === galleryCategories.length - 1 &&
                    lightbox.imageIndex === galleryCategories[lightbox.categoryIndex].images.length - 1
                  }
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Caption */}
              <motion.p
                key={currentImage.alt}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white/60 text-sm text-center mt-3 px-4"
              >
                {currentImage.alt}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
