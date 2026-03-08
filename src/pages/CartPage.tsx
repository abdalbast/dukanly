import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, Heart, Gift, Truck, ShieldCheck, ShoppingCart } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LazyImage } from "@/components/LazyImage";
import { useCart } from "@/contexts/CartContext";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useLanguage } from "@/i18n/LanguageContext";
import { convertToIQD, formatIQD, FREE_SHIPPING_THRESHOLD_IQD } from "@/lib/currency";

export default function CartPage() {
  const { t } = useLanguage();
  const { activeItems, savedItems, removeFromCart, updateQuantity, toggleSaveForLater, toggleGift, subtotal, itemCount } = useCart();
  const { data: products = [] } = useProducts();

  const subtotalIQD = convertToIQD(subtotal);
  const shippingProgress = Math.min((subtotalIQD / FREE_SHIPPING_THRESHOLD_IQD) * 100, 100);
  const freeShipping = subtotalIQD >= FREE_SHIPPING_THRESHOLD_IQD;
  const suggestedProducts = products.slice(0, 4);
  const remainingIQD = FREE_SHIPPING_THRESHOLD_IQD - subtotalIQD;

  if (activeItems.length === 0 && savedItems.length === 0) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-3">{t("cart.yourCartEmpty")}</h1>
            <p className="text-muted-foreground mb-6">{t("cart.emptyMessage")}</p>
            <Button asChild className="btn-cta">
              <Link to="/">{t("common.continueShopping")}</Link>
            </Button>
            <div className="mt-12 text-left rtl:text-right">
              <h2 className="section-header">{t("cart.youMightLike")}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {suggestedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} variant="compact" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">{t("cart.shoppingCart")}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            {!freeShipping && (
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-prime" />
                  <span className="text-sm font-medium">
                    {t("cart.addMore", { amount: formatIQD(remainingIQD) })}{" "}
                    <span className="text-prime font-semibold">{t("cart.freeDelivery")}</span>
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-prime transition-all duration-300" style={{ width: `${shippingProgress}%` }} />
                </div>
              </div>
            )}
            {freeShipping && (
              <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-success">{t("cart.qualifyFreeDelivery")}</span>
              </div>
            )}

            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("cart.price")}</span>
              </div>
              {activeItems.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex gap-4">
                    <Link to={`/product/${item.product.id}`} className="shrink-0">
                      <LazyImage src={item.product.images[0]} alt={item.product.title} className="w-24 h-24 object-contain" wrapperClassName="w-24 h-24 bg-secondary rounded" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product.id}`} className="text-sm font-medium hover:text-primary line-clamp-2">{item.product.title}</Link>
                      {item.product.offer.stock <= 10 && (
                        <p className="text-xs text-deal mt-1">{t("cart.onlyLeftStock", { count: item.product.offer.stock })}</p>
                      )}
                      {item.product.isPrime && (
                        <p className="prime-badge text-xs mt-1">
                          <Truck className="w-3 h-3" />{t("cart.freeDelivery")}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{t("cart.soldBy")} {item.product.offer.sellerName}</p>
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <Checkbox checked={item.isGift} onCheckedChange={() => toggleGift(item.id)} />
                        <span className="text-xs flex items-center gap-1"><Gift className="w-3 h-3" />{t("cart.thisIsGift")}</span>
                      </label>
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <div className="flex items-center border border-border rounded">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2.5 hover:bg-muted" disabled={item.quantity <= 1}><Minus className="w-3 h-3" /></button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2.5 hover:bg-muted"><Plus className="w-3 h-3" /></button>
                        </div>
                        <span className="border-r border-border h-4" />
                        <button onClick={() => removeFromCart(item.id)} className="text-xs text-info hover:underline">{t("common.delete")}</button>
                        <span className="border-r border-border h-4" />
                        <button onClick={() => toggleSaveForLater(item.id)} className="text-xs text-info hover:underline">{t("cart.saveForLater")}</button>
                        <span className="border-r border-border h-4" />
                        <button className="text-xs text-info hover:underline">{t("cart.compareWithSimilar")}</button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold">{formatIQD(convertToIQD(item.product.offer.price * item.quantity))}</p>
                      {item.product.offer.originalPrice && (
                        <p className="text-xs text-muted-foreground line-through">{formatIQD(convertToIQD(item.product.offer.originalPrice * item.quantity))}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="p-4 text-right rtl:text-left">
                <span className="text-lg">
                  {t("cart.subtotal")} ({itemCount} {itemCount === 1 ? t("common.item") : t("common.items")}): <span className="font-bold">{formatIQD(subtotalIQD)}</span>
                </span>
              </div>
            </div>

            {savedItems.length > 0 && (
              <div className="bg-card border border-border rounded-lg">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold">{t("cart.savedForLater")} ({savedItems.length} {savedItems.length === 1 ? t("common.item") : t("common.items")})</h2>
                </div>
                <div className="divide-y divide-border">
                  {savedItems.map((item) => (
                    <div key={item.id} className="p-4 flex gap-4">
                      <Link to={`/product/${item.product.id}`} className="shrink-0">
                        <LazyImage src={item.product.images[0]} alt={item.product.title} className="w-20 h-20 object-contain" wrapperClassName="w-20 h-20 bg-secondary rounded" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.product.id}`} className="text-sm font-medium hover:text-primary line-clamp-2">{item.product.title}</Link>
                        <p className="font-bold mt-1">{formatIQD(convertToIQD(item.product.offer.price))}</p>
                        <div className="flex gap-3 mt-2">
                          <button onClick={() => toggleSaveForLater(item.id)} className="text-xs text-info hover:underline">{t("cart.moveToCart")}</button>
                          <button onClick={() => removeFromCart(item.id)} className="text-xs text-info hover:underline">{t("common.delete")}</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-4 sticky top-24">
              {freeShipping && (
                <div className="flex items-center gap-2 text-success text-sm">
                  <ShieldCheck className="w-4 h-4" />{t("cart.orderQualifiesFree")}
                </div>
              )}
              <div className="text-lg">
                {t("cart.subtotal")} ({itemCount} {itemCount === 1 ? t("common.item") : t("common.items")}): <span className="font-bold">{formatIQD(subtotalIQD)}</span>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox className="mt-0.5" />
                <span className="text-sm">{t("cart.orderContainsGift")}</span>
              </label>
              <Button asChild className="w-full btn-cta">
                <Link to="/checkout">{t("cart.proceedToCheckout")}</Link>
              </Button>
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" />{t("cart.secureCheckout")}</div>
                <div className="flex items-center gap-1"><Truck className="w-3 h-3" />{t("cart.dayReturns")}</div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="section-header">{t("cart.customersAlsoBought")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {suggestedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
