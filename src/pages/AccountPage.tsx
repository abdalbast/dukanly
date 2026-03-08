import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Package, MapPin, CreditCard, Shield, Bell, Heart, Gift, Store, ChevronRight, LogOut } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { AddressBookManager } from "@/components/address/AddressBookManager";
import { formatIQD } from "@/lib/currency";

export default function AccountPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { data: orders = [] } = useOrders();
  const location = useLocation();
  const locale = language === "ckb" ? "ckb" : "en-US";
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Account";
  const email = user?.email || "Signed-in account";
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : t("account.memberSince");

  const recentOrders = orders.slice(0, 3);

  const accountSections = [
    { title: t("account.yourOrders"), description: t("account.yourOrdersDesc"), icon: Package, href: "/orders", color: "bg-primary/10 text-primary" },
    { title: t("account.loginSecurity"), description: t("account.loginSecurityDesc"), icon: Shield, href: "/account/security", color: "bg-info/10 text-info" },
    { title: t("account.yourAddresses"), description: t("account.yourAddressesDesc"), icon: MapPin, href: "/account/addresses", color: "bg-success/10 text-success" },
    { title: t("account.paymentMethods"), description: t("account.paymentMethodsDesc"), icon: CreditCard, href: "/account/payment", color: "bg-warning/10 text-warning" },
    { title: t("account.yourLists"), description: t("account.yourListsDesc"), icon: Heart, href: "/lists", color: "bg-deal/10 text-deal" },
    { title: t("account.giftCards"), description: t("account.giftCardsDesc"), icon: Gift, href: "/gift-cards", color: "bg-accent/30 text-accent-foreground" },
    { title: t("account.notifications"), description: t("account.notificationsDesc"), icon: Bell, href: "/account/notifications", color: "bg-prime/10 text-prime" },
    { title: t("account.sellerAccount"), description: t("account.sellerAccountDesc"), icon: Store, href: "/seller", color: "bg-muted text-foreground" },
  ];

  if (location.pathname === "/account/addresses") {
    return (
      <Layout>
        <div className="container py-10 md:py-14">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">{t("account.title")}</p>
              <h1 className="page-title">{t("account.yourAddresses")}</h1>
            </div>
            <Button asChild variant="outline" size="sm"><Link to="/account">{t("common.back")}</Link></Button>
          </div>
          <AddressBookManager mode="page" />
        </div>
      </Layout>
    );
  }

  const formatOrderTotal = (order: { total: number; currencyCode: string }) =>
    order.currencyCode === "IQD"
      ? formatIQD(order.total)
      : new Intl.NumberFormat(locale, { style: "currency", currency: order.currencyCode || "USD", maximumFractionDigits: 2 }).format(order.total);

  return (
    <Layout>
      <div className="container py-10 md:py-14">
        <h1 className="page-title mb-8">{t("account.title")}</h1>
        <div className="bg-card border border-border rounded-2xl p-8 mb-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center"><User className="w-8 h-8 text-primary" /></div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{email}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("account.memberSince")} {memberSince}</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">{t("account.editProfile")}</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {accountSections.map((section) => (
            <Link key={section.title} to={section.href} className="premium-card p-5 group">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${section.color} rounded-xl flex items-center justify-center shrink-0`}><section.icon className="w-6 h-6" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 rtl:rotate-180" />
              </div>
            </Link>
          ))}
        </div>
        <section className="mt-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-header mb-0">{t("account.recentOrders")}</h2>
            <Link to="/orders" className="text-sm text-info hover:underline">{t("account.viewAllOrders")}</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">{t("account.noOrdersYet")}</p>
              <Button asChild className="btn-cta"><Link to="/">{t("common.startShopping")}</Link></Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-primary" /></div>
                    <div className="min-w-0">
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}
                        {" · "}{order.items.length} {order.items.length !== 1 ? t("common.items") : t("common.item")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={order.status === "delivered" ? "default" : "secondary"}>{order.status}</Badge>
                    <span className="font-semibold text-sm">{formatOrderTotal(order)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
