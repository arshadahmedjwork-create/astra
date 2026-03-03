import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";
import bottleBanner from "@/assets/bottle-banner.png";

const StorySection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const bottleRotate = useTransform(mouseX, [-400, 400], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    mouseX.set(e.clientX - centerX);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="py-24 lg:py-36 bg-foreground text-primary-foreground relative overflow-hidden"
    >
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Story text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              The milk speaks
              <br />
              for itself.
            </h2>

            <div className="space-y-6 text-primary-foreground/70 text-lg leading-relaxed">
              <p>
                Fresh, natural, wholesome milk. It speaks for itself. Still, there's a story to be told about how that milk came to be. And a pretty interesting one at that.
              </p>
              <p>
                That's why we equip every Astra bottle with a QR code — it's our way of giving you full insight into our process. From the cow's diet to the lab test results, nothing is hidden.
              </p>
              <p>
                In the end, you'll find that we're pretty transparent here at our family farm. Maybe that's why we started putting milk in{" "}
                <span className="text-accent font-semibold">glass bottles</span>.
              </p>
            </div>

            <p className="text-sm text-primary-foreground/40 italic">
              Move your mouse left and right to see the bottle respond ↔
            </p>
          </motion.div>

          {/* Right: Interactive bottle */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Glow behind bottle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full bg-primary/10 blur-3xl" />
              </div>
              <motion.img
                src={bottleBanner}
                alt="Astra Dairy glass bottle - interactive"
                className="w-48 md:w-64 lg:w-72 h-auto drop-shadow-[0_0_80px_rgba(255,255,255,0.1)] relative z-10"
                loading="lazy"
                style={{ rotateY: bottleRotate }}
              />
              {/* Reflection surface */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-6 bg-primary-foreground/5 rounded-full blur-lg" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
