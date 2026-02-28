import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { User, Package, MapPin, CreditCard, Shield, Bell, Heart, Gift, Store, ChevronRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AccountPage() {
  const { t } = useLanguage();

  const accountSections = [
    { title: t("account.yourOrders"), description: t("account.yourOrdersDesc"), icon: Package, href: "/orders" },
    { title: t("account.loginSecurity"), description: t("account.loginSecurityDesc"), icon: Shield, href: "/account/security" },
    { title: t("account.yourAddresses"), description: t("account.yourAddressesDesc"), icon: MapPin, href: "/account/addresses" },
    { title: t("account.paymentMethods"), description: t("account.paymentMethodsDesc"), icon: CreditCard, href: "/account/payment" },
    { title: t("account.yourLists"), description: t("account.yourListsDesc"), icon: Heart, href: "/lists" },
    { title: t("account.giftCards"), description: t("account.giftCardsDesc"), icon: Gift, href: "/gift-cards" },
    { title: t("account.notifications"), description: t("account.notificationsDesc"), icon: Bell, href: "/account/notifications" },
    { title: t("account.sellerAccount"), description: t("account.sellerAccountDesc"), icon: Store, href: "/seller" },
  ];

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">{t("account.title")}</h1>
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"><User className="w-8 h-8 text-primary" /></div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">John Doe</h2>
              <p className="text-sm text-muted-foreground">john.doe@example.com</p>
              <p className="text-xs text-muted-foreground mt-1">{t("account.memberSince")}</p>
            </div>
            <Button variant="outline" size="sm">{t("account.editProfile")}</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accountSections.map((section) => (
            <Link key={section.title} to={section.href} className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0"><section.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 rtl:rotate-180" />
              </div>
            </Link>
          ))}
        </div>
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t("account.recentOrders")}</h2>
            <Link to="/orders" className="text-sm text-info hover:underline">{t("account.viewAllOrders")}</Link>
          </div>
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">{t("account.noOrdersYet")}</p>
            <Button asChild className="btn-cta"><Link to="/">{t("common.startShopping")}</Link></Button>
          </div>
        </section>
      </div>
    </Layout>
  );
}
