import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronRight, Heart, Share2, Truck, Shield, RotateCcw, Store, Minus, Plus } from "lucide-react";
import { ChatButton } from "@/components/chat/ChatButton";
import { Layout } from "@/components/Layout";
import { StarRating } from "@/components/StarRating";
import { PriceDisplay } from "@/components/PriceDisplay";
import { ProductCard } from "@/components/ProductCard";
import { LazyImage } from "@/components/LazyImage";
import { ProductDetailSkeleton } from "@/components/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useProductById, useProductsByCategory } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: product, isLoading, isError } = useProductById(id);
  const { data: relatedProducts = [] } = useProductsByCategory(product?.category);

  if (isLoading) {
    return (
      <Layout>
        <ProductDetailSkeleton />
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="page-title mb-4">{t("common.loading")}</h1>
          <p className="text-muted-foreground mb-4">Something went wrong loading this product.</p>
          <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="page-title mb-4">{t("product.notFound")}</h1>
          <Link to="/" className="text-info hover:underline">{t("product.returnToHome")}</Link>
        </div>
      </Layout>
    );
  }

  const { offer } = product;
  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id).slice(0, 5);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({ title: t("product.addToCart"), description: `${product.title.slice(0, 50)}...` });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate("/checkout");
  };

  const deliveryText = offer.deliveryDays <= 1 ? t("product.tomorrow") : offer.deliveryDays <= 2 ? t("product.tomorrow") : t("product.inDays", { days: offer.deliveryDays });

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container py-2">
          <nav className="breadcrumb">
            <Link to="/">{t("common.home")}</Link>
            <ChevronRight className="w-3 h-3 rtl:rotate-180" />
            <Link to={`/category/${product.category}`} className="capitalize">{product.category}</Link>
            {product.subcategory && (
              <>
                <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                <Link to={`/category/${product.category}/${product.subcategory}`} className="capitalize">{product.subcategory}</Link>
              </>
            )}
            <ChevronRight className="w-3 h-3 rtl:rotate-180" />
            <span className="text-foreground truncate max-w-xs">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Product Images */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <div className="bg-card rounded-xl border border-border p-4">
                <LazyImage src={product.images[selectedImage]} alt={product.title} className="max-w-full max-h-full object-contain group-hover:scale-150 transition-transform duration-500 ease-out cursor-zoom-in" wrapperClassName="group aspect-square bg-secondary rounded-lg flex items-center justify-center mb-4" />
                {product.images.length > 1 && (
                  <div className="flex gap-2">
                    {product.images.map((img, idx) => (
                      <button key={idx} onClick={() => setSelectedImage(idx)} className={`w-16 h-16 rounded-lg border-2 overflow-hidden transition-colors ${selectedImage === idx ? "border-primary" : "border-border hover:border-primary/50"}`}>
                        <LazyImage src={img} alt="" className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-4">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {product.isBestSeller && <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">{t("product.bestSeller")}</span>}
                {product.isLimitedDeal && <span className="deal-badge rounded-full">{t("product.limitedTimeDeal")}</span>}
              </div>
              <h1 className="text-xl font-semibold leading-snug page-title !text-xl">{product.title}</h1>
              <p className="text-sm">{t("product.visitStore")} <Link to={`/brand/${product.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} className="text-info hover:underline">{product.brand} {t("product.store")}</Link></p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-info">{product.rating.toFixed(1)}</span>
                <StarRating rating={product.rating} size="sm" />
                <Link to="#reviews" className="text-sm text-info hover:underline">{product.reviewCount.toLocaleString()} {t("product.ratings")}</Link>
              </div>
              <hr className="border-border" />
              <div>
                <PriceDisplay price={offer.price} originalPrice={offer.originalPrice} size="xl" />
                {product.isPrime && (
                  <div className="prime-badge mt-2">
                    <Truck className="w-4 h-4" />
                    <span>{t("product.freeDelivery")}</span>
                    <span className="font-normal text-muted-foreground">{deliveryText}</span>
                  </div>
                )}
              </div>
              <hr className="border-border" />
              <div>
                <h3 className="font-semibold mb-2">{t("product.aboutThisItem")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            </div>
          </div>

          {/* Buy Box */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl border border-border p-5 space-y-4 sticky top-24">
              <PriceDisplay price={offer.price} originalPrice={offer.originalPrice} size="lg" />
              {product.isPrime && (
                <div className="prime-badge text-sm">
                  <Truck className="w-4 h-4" />
                  <span>{t("product.freeDelivery")} {deliveryText}</span>
                </div>
              )}
              <p className={`text-sm font-semibold ${offer.stock > 10 ? "text-success" : "text-deal"}`}>
                {offer.stock > 10 ? t("product.inStock") : t("product.onlyLeft", { count: offer.stock })}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm">{t("product.qty")}</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 hover:bg-muted rounded-l-lg" disabled={quantity <= 1}><Minus className="w-4 h-4" /></button>
                  <span className="px-4 py-1 text-sm font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(offer.stock, quantity + 1))} className="p-2.5 hover:bg-muted rounded-r-lg" disabled={quantity >= offer.stock}><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-2">
                <Button onClick={handleAddToCart} className="w-full btn-cta">{t("product.addToCart")}</Button>
                <Button onClick={handleBuyNow} variant="outline" className="w-full rounded-full">{t("product.buyNow")}</Button>
              </div>
              <div className="text-sm text-muted-foreground space-y-1.5 pt-3 border-t border-border">
                <div className="flex justify-between"><span>{t("product.shipsFrom")}</span><span className="text-foreground">{offer.sellerName}</span></div>
                <div className="flex justify-between"><span>{t("product.soldBy")}</span><Link to={`/seller/${offer.sellerId}`} className="text-info hover:underline">{offer.sellerName}</Link></div>
                <div className="flex justify-between"><span>{t("product.condition")}</span><span className="text-foreground capitalize">{offer.condition}</span></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" className="flex-1 text-xs"><Heart className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />{t("product.addToList")}</Button>
                <Button variant="ghost" size="sm" className="flex-1 text-xs"><Share2 className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />{t("product.share")}</Button>
              </div>
              <div className="space-y-2.5 pt-3 border-t border-border text-sm text-muted-foreground">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center"><RotateCcw className="w-4 h-4 text-success" /></div><span>{t("product.dayReturns")}</span></div>
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center"><Shield className="w-4 h-4 text-info" /></div><span>{t("product.secureTransaction")}</span></div>
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><Store className="w-4 h-4" /></div><span>{t("product.buyerProtection")}</span></div>
              </div>
            </div>
          </div>
        </div>

        {filteredRelated.length > 0 && (
          <section className="mt-16">
            <h2 className="section-header">{t("product.customersAlsoViewed")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {filteredRelated.map((p) => (<ProductCard key={p.id} product={p} />))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-card border-t border-border p-3 flex items-center gap-3 lg:hidden z-40">
        <div className="flex-1 min-w-0">
          <PriceDisplay price={offer.price} originalPrice={offer.originalPrice} size="md" />
        </div>
        <Button onClick={handleAddToCart} className="btn-cta shrink-0">{t("product.addToCart")}</Button>
      </div>
    </Layout>
  );
}
