import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";

const rawMilk = "/assets/product-raw-milk.png";
const paneer = "/assets/product-paneer.png";
const ghee = "/assets/product-ghee.png";
const curd = "/assets/product-curd.png";
const kulfi = "/assets/product-kulfi.png";
const chocolateMilk = "/assets/product-chocolate-milk.png";

interface ProductData {
  title: string;
  hook: string;
  image: string;
  description: string;
  notes: string[];
  faqs: { q: string; a: string }[];
}

const productData: Record<string, ProductData> = {
  "cow-milk": {
    title: "Farm Fresh Cow's Milk",
    hook: "Pure A2 cow's milk, delivered in glass bottles within 12 hours of milking.",
    image: rawMilk,
    description:
      "Our cow's milk comes from indigenous breeds raised on natural fodder. Available as raw, pasteurised, and homogenised variants. Every bottle is packed in reusable glass, preserving the natural taste and nutrition.",
    notes: [
      "Please order one day in advance for next-day delivery.",
      "Boil before consuming (raw milk).",
      "Cream separation is natural and indicates purity — simply shake before use.",
      "Store refrigerated and consume within 24 hours.",
    ],
    faqs: [
      { q: "Is your milk organic?", a: "Yes, our cows are raised on natural fodder without artificial hormones or antibiotics." },
      { q: "Why glass bottles?", a: "Glass is non-reactive, reusable, and doesn't leach chemicals. It keeps milk fresher and is better for the environment." },
      { q: "What time is delivery?", a: "We deliver between 5:00 AM and 7:30 AM every morning." },
    ],
  },
  paneer: {
    title: "Fresh Paneer",
    hook: "Soft, fresh paneer made from 100% pure cow's milk. Perfect for curries, tikkas, and more.",
    image: paneer,
    description:
      "Our paneer is made fresh from pure cow's milk — soft, creamy, and rich in protein. It's perfect for a wide range of dishes including palak paneer, paneer tikka, paneer butter masala, kadai paneer, and more.",
    notes: [
      "Order one day in advance.",
      "Best consumed within 2 days of purchase.",
      "Store in refrigerator.",
    ],
    faqs: [
      { q: "Is the paneer made from cow's milk?", a: "Yes, 100% pure cow's milk paneer." },
      { q: "How long does it last?", a: "Best consumed within 2 days. Store refrigerated." },
    ],
  },
  ghee: {
    title: "Desi Cow Ghee",
    hook: "Pure A2 desi cow ghee made using the traditional bilona method.",
    image: ghee,
    description:
      "Our ghee is prepared using the traditional bilona (hand-churning) method from A2 cow's milk. Rich in flavour and aroma, it's perfect for cooking, Ayurvedic uses, and daily consumption. Ghee has been revered in Ayurveda for its digestive, nourishing, and healing properties.",
    notes: [
      "Store in a cool, dry place.",
      "Use a clean, dry spoon to scoop.",
      "Granulation is natural and indicates purity.",
    ],
    faqs: [
      { q: "What is bilona method?", a: "The bilona method involves hand-churning curd made from whole milk to separate butter, which is then slow-cooked to produce ghee." },
      { q: "Why is A2 ghee special?", a: "A2 ghee comes from indigenous cow breeds that produce A2 beta-casein protein, considered easier to digest." },
      { q: "Can I use it for cooking?", a: "Absolutely. It has a high smoke point and is perfect for all types of cooking." },
    ],
  },
  curd: {
    title: "Curd / Dahi",
    hook: "Natural curd set in traditional earthen pots for the authentic taste.",
    image: curd,
    description:
      "Our curd is set using natural culture in earthen pots (mann paanai), which gives it a distinct flavour and texture. Made from pure cow's milk, it's rich in probiotics and perfect for daily consumption.",
    notes: [
      "Order one day in advance.",
      "Earthen pot packaging is biodegradable.",
      "Store refrigerated, consume within 48 hours.",
    ],
    faqs: [
      { q: "Why earthen pots?", a: "Earthen pots absorb excess water, making the curd thicker. They also add a subtle earthy flavour." },
      { q: "Is it set with natural culture?", a: "Yes, we use natural curd culture — no artificial thickeners or preservatives." },
    ],
  },
  kulfi: {
    title: "Natural Malai Kulfi",
    hook: "Handcrafted malai kulfi made with real milk, nuts, and saffron. No added colors.",
    image: kulfi,
    description:
      "Our kulfi is made the traditional way — slow-cooking milk until it reduces and thickens, then infusing it with cardamom, saffron, and pistachios. No added colors, flavours, or preservatives.",
    notes: [
      "Keep frozen until consumption.",
      "Contains dairy and nuts.",
      "No added colors or artificial flavours.",
    ],
    faqs: [
      { q: "Does it contain artificial colors?", a: "No. Our kulfi uses only natural ingredients — milk, sugar, nuts, saffron, and cardamom." },
      { q: "Is it suitable for kids?", a: "Yes! It's a healthier frozen treat made from pure ingredients." },
    ],
  },
  "flavoured-milk": {
    title: "Flavoured Milk",
    hook: "Delicious chocolate and other flavoured milk drinks for all ages.",
    image: chocolateMilk,
    description:
      "Our flavoured milk is made with real cow's milk and natural flavours. Available in chocolate and other seasonal flavours. A delicious and nutritious drink for children and adults alike.",
    notes: [
      "Shake well before consuming — separation is natural.",
      "Store refrigerated.",
      "Consume within 24 hours of delivery.",
    ],
    faqs: [
      { q: "Why does it separate?", a: "Natural separation occurs because we don't use artificial emulsifiers. Simply shake the bottle before consuming." },
      { q: "Is it made with real milk?", a: "Yes, 100% pure cow's milk with natural flavouring." },
    ],
  },
};

const relatedProducts = [
  { name: "Cow Milk", href: "/products/cow-milk", image: rawMilk },
  { name: "Paneer", href: "/products/paneer", image: paneer },
  { name: "Ghee", href: "/products/ghee", image: ghee },
  { name: "Curd", href: "/products/curd", image: curd },
  { name: "Kulfi", href: "/products/kulfi", image: kulfi },
  { name: "Flavoured Milk", href: "/products/flavoured-milk", image: chocolateMilk },
];

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? productData[slug] : null;

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold text-foreground">Product not found</h1>
          <Link to="/products" className="text-primary mt-4 inline-block">Back to Products</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const related = relatedProducts.filter((p) => p.href !== `/products/${slug}`).slice(0, 4);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
            {/* Hero */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="aspect-square rounded-3xl overflow-hidden bg-sage/30">
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{product.title}</h1>
                  <p className="text-lg text-muted-foreground">{product.hook}</p>
                </div>
                {/* Sticky Purchase Bar */}
                <div className="flex flex-wrap gap-3 sticky top-20 bg-card/95 backdrop-blur-sm p-4 rounded-2xl border border-border">
                  <Button
                    variant={useCartStore((state) => state.isInCart(slug || "")) ? "outline" : "hero"}
                    className="flex-1 gap-2"
                    onClick={() => product && useCartStore.getState().addItem({
                      id: slug,
                      name: product.title,
                      price: 0, // Should be fetched from product data if available
                      image: product.image
                    })}
                  >
                    {useCartStore((state) => state.isInCart(slug || "")) ? (
                      <>
                        <Check className="w-4 h-4" /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </>
                    )}
                  </Button>
                  <Link to="/erp/login" className="flex-1 text-center">
                    <Button variant="hero-outline" className="w-full">Take a Trial</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* What it is */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">What it is</h2>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Notes */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Notes</h2>
              <ul className="space-y-2">
                {product.notes.map((note) => (
                  <li key={note} className="flex items-start gap-3 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              <Accordion type="multiple" className="space-y-2">
                {product.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-4">
                    <AccordionTrigger className="text-sm font-medium text-foreground">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Related */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Related Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.map((p) => (
                  <Link key={p.name} to={p.href} className="group">
                    <div className="bg-card rounded-2xl border border-border p-3 transition-all hover:shadow-lg hover:-translate-y-1">
                      <div className="aspect-square rounded-xl overflow-hidden bg-sage/30 mb-3">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    </div>
                  </Link>
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

export default ProductDetail;
