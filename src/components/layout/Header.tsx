import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import astraLogo from "@/assets/astra-logo.png";
import { useCartStore } from "@/stores/useCartStore";
import { CartSheet } from "./CartSheet";

const productsMenu = [
  { name: "Cow Milk", href: "/products/cow-milk" },
  { name: "Paneer", href: "/products/paneer" },
  { name: "Ghee", href: "/products/ghee" },
  { name: "Curd / Dahi", href: "/products/curd" },
  { name: "Natural Kulfi", href: "/products/kulfi" },
  { name: "Flavoured Milk", href: "/products/flavoured-milk" },
];

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Products", href: "/products", megaMenu: productsMenu },
  { name: "Gallery", href: "/gallery" },
  { name: "Media Coverage", href: "/media" },
  { name: "FAQ", href: "/faq" },
  { name: "Support", href: "/support" },
  { name: "Contact", href: "/contact" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveMenu(null);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-card/95 backdrop-blur-md shadow-sm py-2"
        : "bg-transparent py-4"
        }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={astraLogo} alt="Astra Dairy" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-primary hidden sm:block">
            Astra<span className="text-accent">Dairy</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => item.megaMenu && setActiveMenu(item.name)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                to={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${location.pathname === item.href
                  ? "text-primary bg-primary/5"
                  : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  }`}
              >
                {item.name}
                {item.megaMenu && <ChevronDown className="w-3 h-3" />}
              </Link>

              {/* Mega Menu */}
              <AnimatePresence>
                {item.megaMenu && activeMenu === item.name && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 bg-card rounded-xl shadow-xl border border-border p-4 min-w-[200px]"
                  >
                    {item.megaMenu.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.href}
                        className="block px-3 py-2 text-sm text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <CartSheet />
          <Link to="/erp/login">
            <Button variant="hero-outline" size="sm">Take a Trial</Button>
          </Link>
          <Link to="/erp/login">
            <Button variant="hero" size="sm">Login</Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between">
                    <Link
                      to={item.href}
                      className="block px-3 py-2.5 text-sm font-medium text-foreground/70 hover:text-primary rounded-lg"
                    >
                      {item.name}
                    </Link>
                    {item.megaMenu && (
                      <button
                        onClick={() => setActiveMenu(activeMenu === item.name ? null : item.name)}
                        className="p-2 text-foreground/50"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${activeMenu === item.name ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>
                  <AnimatePresence>
                    {item.megaMenu && activeMenu === item.name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-6 space-y-1 overflow-hidden"
                      >
                        {item.megaMenu.map((sub) => (
                          <Link
                            key={sub.name}
                            to={sub.href}
                            className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              <div className="pt-4 flex flex-col gap-2">
                <Link to="/erp/login">
                  <Button variant="hero" className="w-full">Login</Button>
                </Link>
                <Link to="/erp/login">
                  <Button variant="hero-outline" className="w-full">Take a Trial</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
