import { Link } from "react-router-dom";
import { CheckCircle, Package, Truck, Calendar } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { mockProducts } from "@/data/mockData";
import { useLanguage } from "@/i18n/LanguageContext";

export default function OrderConfirmationPage() {
  const { t, language } = useLanguage();
  const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const suggestedProducts = mockProducts.slice(4, 8);
  const locale = language === "ckb" ? "ckb" : "en-US";

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t("orderConfirmation.title")}</h1>
          <p className="text-muted-foreground mb-6">{t("orderConfirmation.thankYou")}</p>
          <div className="bg-card border border-border rounded-lg p-6 text-left rtl:text-right mb-8">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <div>
                <p className="text-sm text-muted-foreground">{t("orderConfirmation.orderNumber")}</p>
                <p className="font-semibold text-lg">{orderNumber}</p>
              </div>
              <Button variant="outline" size="sm" asChild><Link to="/orders">{t("orderConfirmation.viewOrder")}</Link></Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="text-sm font-medium">{t("orderConfirmation.orderPlaced")}</p>
                  <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center shrink-0"><Truck className="w-5 h-5 text-info" /></div>
                <div>
                  <p className="text-sm font-medium">{t("orderConfirmation.shipping")}</p>
                  <p className="text-xs text-muted-foreground">{t("orderConfirmation.standardDelivery")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center shrink-0"><Calendar className="w-5 h-5 text-success" /></div>
                <div>
                  <p className="text-sm font-medium">{t("orderConfirmation.estDelivery")}</p>
                  <p className="text-xs text-muted-foreground">{estimatedDelivery.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 mb-8">
            <p className="text-sm">{t("orderConfirmation.emailNotice")}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="btn-cta"><Link to="/">{t("common.continueShopping")}</Link></Button>
            <Button variant="outline" asChild><Link to="/orders">{t("orderConfirmation.trackOrder")}</Link></Button>
          </div>
        </div>
        <section className="mt-16">
          <h2 className="section-header text-center">{t("orderConfirmation.youMightAlsoLike")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {suggestedProducts.map((product) => (<ProductCard key={product.id} product={product} />))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
