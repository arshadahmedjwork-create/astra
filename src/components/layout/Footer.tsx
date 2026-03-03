import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import astraLogo from "@/assets/astra-logo.png";

const productLinks = [
  { name: "Cow Milk", href: "/products/cow-milk" },
  { name: "Paneer", href: "/products/paneer" },
  { name: "Ghee", href: "/products/ghee" },
  { name: "Curd / Dahi", href: "/products/curd" },
  { name: "Natural Kulfi", href: "/products/kulfi" },
  { name: "Flavoured Milk", href: "/products/flavoured-milk" },
];

const otherLinks = [
  { name: "About Us", href: "/about" },
  { name: "Gallery", href: "/gallery" },
  { name: "Media Coverage", href: "/media" },
  { name: "FAQ", href: "/faq" },
  { name: "Support", href: "/support" },
  { name: "Blog", href: "https://blog.astradairy.in/", external: true },
  { name: "Environment", href: "/environment" },
  { name: "Terms & Conditions", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
];

const Footer = () => {
  return (
    <footer className="forest-gradient text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={astraLogo} alt="Astra Dairy" className="h-10 w-10 object-contain brightness-0 invert" />
              <span className="text-xl font-bold">
                Astra<span className="text-accent">Dairy</span>
              </span>
            </Link>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Delivering farm fresh cow's milk in glass bottles to your home. Pure, natural, and organic.
            </p>
            <p className="text-xs text-primary-foreground/40">
              FSSAI License No: 12419012000655
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">Products</h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Others */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">Quick Links</h4>
            <ul className="space-y-2">
              {otherLinks.map((link) => (
                <li key={link.name}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Delivering Cities */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">Delivering In</h4>
            <p className="text-sm text-primary-foreground/60 mb-4">Chennai & surrounding areas</p>
            <div className="space-y-2 text-sm text-primary-foreground/60">
              <p>📍 No. 60, Satyamurthy Nagar,</p>
              <p>Medavakkam, Chennai – 600100</p>
              <p className="pt-2">📞 +91 44 4856 2222</p>
              <p>✉️ hello@astradairy.in</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} Astra Dairy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-xs text-primary-foreground/40 hover:text-primary-foreground/60 transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-xs text-primary-foreground/40 hover:text-primary-foreground/60 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
