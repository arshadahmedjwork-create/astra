import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { mediaCoverage } from "@/constants/astraData";
import { X, Calendar, ChevronLeft, ChevronRight, Newspaper } from "lucide-react";

const Media = () => {
  const [selected, setSelected] = useState<number | null>(null);

  const open = (i: number) => {
    setSelected(i);
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    setSelected(null);
    document.body.style.overflow = "";
  };
  const navigate = (dir: 1 | -1) => {
    if (selected === null) return;
    const next = selected + dir;
    if (next >= 0 && next < mediaCoverage.length) setSelected(next);
  };

  const item = selected !== null ? mediaCoverage[selected] : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-10 max-w-6xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent mb-3">In The News</p>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">Media Coverage</h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Astra Dairy has been recognised by leading publications for pioneering farm-fresh dairy in India.
            </p>
          </motion.div>

          {/* Media Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mediaCoverage.map((article, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55 }}
                onClick={() => open(i)}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-2xl transition-all duration-400 hover:-translate-y-2"
              >
                {/* Thumbnail */}
                <div className="relative overflow-hidden aspect-video bg-muted">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Click hint */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Newspaper className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors duration-200 leading-snug">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-3 text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4 text-accent" />
                    {article.date}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {item && selected !== null && (
          <motion.div
            key="media-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            onClick={close}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

            {/* Panel */}
            <motion.div
              key={selected}
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="relative z-10 w-full max-w-4xl mx-4 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top bar */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-0.5">Media Article</p>
                  <p className="text-white font-semibold">{item.title}</p>
                </div>
                <button
                  onClick={close}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Image */}
              <div className="rounded-2xl overflow-hidden bg-black/30 border border-white/10 shadow-2xl">
                <motion.img
                  src={item.imageUrl}
                  alt={item.title}
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-h-[75vh] object-contain block mx-auto"
                />
              </div>

              {/* Footer bar */}
              <div className="flex items-center justify-between mt-4 px-1">
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Calendar className="w-4 h-4" />
                  {item.date}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(-1)}
                    disabled={selected === 0}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all disabled:opacity-30 hover:scale-110"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <span className="text-white/50 text-xs">{selected + 1} / {mediaCoverage.length}</span>
                  <button
                    onClick={() => navigate(1)}
                    disabled={selected === mediaCoverage.length - 1}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all disabled:opacity-30 hover:scale-110"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Media;
