import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  const footerLinks = {
    [t("footer.getToKnowUs")]: [
      { label: t("footer.aboutUs"), href: "/about" },
      { label: t("footer.careers"), href: "/careers" },
      { label: t("footer.pressCenter"), href: "/press" },
      { label: t("footer.investorRelations"), href: "/investors" },
    ],
    [t("footer.makeMoneyWithUs")]: [
      { label: t("footer.sellProducts"), href: "/sell" },
      { label: t("footer.becomeAffiliate"), href: "/affiliate" },
      { label: t("footer.advertise"), href: "/advertise" },
      { label: t("footer.selfPublish"), href: "/publish" },
    ],
    [t("footer.paymentProducts")]: [
      { label: t("footer.marketplaceCard"), href: "/card" },
      { label: t("footer.shopWithPoints"), href: "/points" },
      { label: t("footer.reloadBalance"), href: "/reload" },
      { label: t("footer.giftCards"), href: "/gift-cards" },
    ],
    [t("footer.letUsHelpYou")]: [
      { label: t("footer.yourAccount"), href: "/account" },
      { label: t("footer.yourOrders"), href: "/orders" },
      { label: t("footer.shippingRates"), href: "/shipping" },
      { label: t("footer.returnsReplacements"), href: "/returns" },
      { label: t("footer.help"), href: "/help" },
    ],
  };

  return (
    <footer className="bg-primary text-primary-foreground" role="contentinfo">
      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-full py-3 text-sm hover:bg-primary-foreground/10 transition-colors"
      >
        {t("footer.backToTop")}
      </button>

      {/* Main Footer Links */}
      <nav aria-label="Footer navigation" className="border-t border-primary-foreground/10">
        <div className="container py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="font-semibold text-sm mb-4 tracking-wide">{title}</h3>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-sm text-primary-foreground/70 hover:text-primary-foreground hover:underline transition-colors"
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
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link to="/" className="text-xl font-bold tracking-tight">
              <span className="text-accent">Dukan</span>
              <span>ly</span>
            </Link>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-primary-foreground/70">
              <Link to="/conditions" className="hover:text-primary-foreground hover:underline">
                {t("footer.conditionsOfUse")}
              </Link>
              <Link to="/privacy" className="hover:text-primary-foreground hover:underline">
                {t("footer.privacyNotice")}
              </Link>
              <Link to="/interest-ads" className="hover:text-primary-foreground hover:underline">
                {t("footer.interestBasedAds")}
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("dukanly_cookie_consent");
                  window.location.reload();
                }}
                className="hover:text-primary-foreground hover:underline"
              >
                {t("cookie.settings")}
              </button>
              <Link to="/privacy" className="inline-flex items-center gap-1 hover:text-primary-foreground hover:underline">
                <ShieldCheck className="h-3.5 w-3.5" />
                {t("footer.gdprCompliant")}
              </Link>
            </div>

            <p className="text-xs text-primary-foreground/50">
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
