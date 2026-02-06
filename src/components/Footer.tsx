import { Link } from "react-router-dom";

const footerLinks = {
  "Get to Know Us": [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press Center", href: "/press" },
    { label: "Investor Relations", href: "/investors" },
  ],
  "Make Money with Us": [
    { label: "Sell products on Marketplace", href: "/sell" },
    { label: "Become an Affiliate", href: "/affiliate" },
    { label: "Advertise Your Products", href: "/advertise" },
    { label: "Self-Publish with Us", href: "/publish" },
  ],
  "Payment Products": [
    { label: "Marketplace Card", href: "/card" },
    { label: "Shop with Points", href: "/points" },
    { label: "Reload Your Balance", href: "/reload" },
    { label: "Gift Cards", href: "/gift-cards" },
  ],
  "Let Us Help You": [
    { label: "Your Account", href: "/account" },
    { label: "Your Orders", href: "/orders" },
    { label: "Shipping Rates & Policies", href: "/shipping" },
    { label: "Returns & Replacements", href: "/returns" },
    { label: "Help", href: "/help" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-full py-3 text-sm hover:bg-primary-foreground/10 transition-colors"
      >
        Back to top
      </button>

      {/* Main Footer Links */}
      <div className="border-t border-primary-foreground/10">
        <div className="container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="font-semibold text-sm mb-3">{title}</h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-xs text-primary-foreground/70 hover:text-primary-foreground hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-primary-foreground/10 bg-primary/80">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link to="/" className="text-xl font-bold tracking-tight">
              <span className="text-accent">market</span>
              <span>place</span>
            </Link>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-primary-foreground/70">
              <Link to="/conditions" className="hover:text-primary-foreground hover:underline">
                Conditions of Use
              </Link>
              <Link to="/privacy" className="hover:text-primary-foreground hover:underline">
                Privacy Notice
              </Link>
              <Link to="/interest-ads" className="hover:text-primary-foreground hover:underline">
                Interest-Based Ads
              </Link>
            </div>

            <p className="text-xs text-primary-foreground/50">
              © 2024 Marketplace, Inc.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
