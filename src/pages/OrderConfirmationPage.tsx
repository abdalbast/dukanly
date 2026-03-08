import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { AlertTriangle, Calendar, CheckCircle, Loader2, Package, Truck } from "lucide-react";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { useLanguage } from "@/i18n/LanguageContext";
import { getDateLocale } from "@/lib/locale";
import { getPaymentMethodTranslationKey, getPaymentStateTranslationKey } from "@/lib/paymentLabels";
import { getPaymentStatus, type PaymentStatusResponse } from "@/lib/writeApi";

export default function OrderConfirmationPage() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data: products = [] } = useProducts();
  const { clearCart } = useCart();
  const didReconcile = useRef(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [isVerifyingStripeOrder, setIsVerifyingStripeOrder] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const state = (location.state as { order?: { orderId?: string; orderNumber?: string; paymentMethod?: "fib" | "cod" | "stripe"; paymentState?: string; }; } | null) ?? null;

  const stripeOrderId = searchParams.get("order_id");
  const stripeSessionId = searchParams.get("session_id");
  const hasStripeReturnContext = Boolean(stripeOrderId && stripeSessionId);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const suggestedProducts = products.slice(4, 8);
  const locale = getDateLocale(language);
  const orderId = state?.order?.orderId ?? paymentStatus?.orderId ?? stripeOrderId ?? null;
  const orderNumber = state?.order?.orderNumber ?? orderId;
  const paymentMethod = paymentStatus?.paymentMethod ?? state?.order?.paymentMethod ?? (hasStripeReturnContext ? "stripe" : null);
  const paymentState = paymentStatus?.paymentState ?? state?.order?.paymentState ?? null;
  const hasRenderableOrder = Boolean(state?.order || paymentStatus);
  const isConfirmedOrder = Boolean(state?.order) || paymentState === "paid" || paymentState === "cod_pending";

  useEffect(() => {
    if (stripeOrderId && !didReconcile.current) {
      didReconcile.current = true;
      setIsVerifyingStripeOrder(true);
      setVerificationError(null);
      clearCart();
      getPaymentStatus({ orderId: stripeOrderId })
        .then((result) => {
          if (!result.ok) { setVerificationError(result.failure?.message ?? t("orderConfirmation.verificationFailed")); return; }
          setPaymentStatus(result.data);
        })
        .catch(() => { setVerificationError(t("orderConfirmation.verificationFailed")); })
        .finally(() => { setIsVerifyingStripeOrder(false); });
    }
  }, [stripeOrderId, clearCart, t]);

  if (!state?.order && !hasStripeReturnContext) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="page-title mb-3">{t("orderConfirmation.notFoundTitle")}</h1>
            <p className="text-muted-foreground mb-6">{t("orderConfirmation.notFoundDesc")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="btn-cta"><Link to="/">{t("common.continueShopping")}</Link></Button>
              <Button asChild variant="outline" className="rounded-full"><Link to="/orders">{t("orderConfirmation.goToOrders")}</Link></Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (hasStripeReturnContext && isVerifyingStripeOrder && !paymentStatus) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h1 className="page-title mb-3">{t("orderConfirmation.validatingTitle")}</h1>
            <p className="text-muted-foreground">{t("orderConfirmation.validatingDesc")}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (hasStripeReturnContext && verificationError && !hasRenderableOrder) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="page-title mb-3">{t("orderConfirmation.verificationPendingTitle")}</h1>
            <p className="text-muted-foreground mb-6">{verificationError}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="btn-cta"><Link to="/orders">{t("orderConfirmation.goToOrders")}</Link></Button>
              <Button asChild variant="outline" className="rounded-full"><Link to="/checkout">{t("orderConfirmation.returnToCheckout")}</Link></Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (hasStripeReturnContext && hasRenderableOrder && !isConfirmedOrder) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h1 className="page-title mb-3">{t("orderConfirmation.processingTitle")}</h1>
            <p className="text-muted-foreground mb-6">{t("orderConfirmation.processingDesc")}</p>
            <div className="bg-card border border-border rounded-xl p-6 mb-6 text-left rtl:text-right">
              <p className="text-sm text-muted-foreground">{t("orderConfirmation.orderReference")}</p>
              <p className="font-semibold">{orderNumber ?? t("payment.state.unavailable")}</p>
              <p className="text-sm text-muted-foreground mt-3">{t("orderConfirmation.paymentStateLabel")}</p>
              <p className="font-medium">{t(getPaymentStateTranslationKey(paymentState))}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="btn-cta"><Link to="/orders">{t("orderConfirmation.goToOrders")}</Link></Button>
              <Button asChild variant="outline" className="rounded-full"><Link to="/checkout">{t("orderConfirmation.returnToCheckout")}</Link></Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-14 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          <h1 className="page-title text-3xl mb-3">{t("orderConfirmation.title")}</h1>
          <p className="text-muted-foreground mb-8">{t("orderConfirmation.thankYou")}</p>
          <div className="bg-card border border-border rounded-xl p-6 text-left rtl:text-right mb-8">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{t("orderConfirmation.orderNumber")}</p>
                <p className="font-semibold text-lg">{orderNumber ?? t("payment.state.unavailable")}</p>
              </div>
              <Button variant="outline" size="sm" asChild className="rounded-full">
                <Link to="/orders">{t("orderConfirmation.viewOrder")}</Link>
              </Button>
            </div>
            <div className="mb-4 p-4 rounded-xl bg-secondary/40 text-sm space-y-2">
              <p>
                {t("orderConfirmation.paymentMethodLabel")}:{" "}
                <span className="font-medium">{t(getPaymentMethodTranslationKey(paymentMethod))}</span>
              </p>
              <p>
                {t("orderConfirmation.paymentStateLabel")}:{" "}
                <span className="font-medium">{t(getPaymentStateTranslationKey(paymentState))}</span>
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("orderConfirmation.orderPlaced")}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-info/10 rounded-xl flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("orderConfirmation.shipping")}</p>
                  <p className="text-xs text-muted-foreground">{t("orderConfirmation.standardDelivery")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("orderConfirmation.estDelivery")}</p>
                  <p className="text-xs text-muted-foreground">
                    {estimatedDelivery.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-secondary/50 rounded-xl p-5 mb-8">
            <p className="text-sm">{t("orderConfirmation.emailNotice")}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="btn-cta"><Link to="/">{t("common.continueShopping")}</Link></Button>
            <Button variant="outline" asChild className="rounded-full"><Link to="/orders">{t("orderConfirmation.trackOrder")}</Link></Button>
          </div>
        </div>
        {suggestedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="section-header text-center">{t("orderConfirmation.youMightAlsoLike")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {suggestedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
