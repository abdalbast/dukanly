import { Link } from "react-router-dom";
import { ProductWithOffer } from "@/types/product";
import { StarRating } from "./StarRating";
import { PriceDisplay } from "./PriceDisplay";
import { LazyImage } from "./LazyImage";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Check, Truck, Hand, Palette } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { optimizeImageUrl } from "@/lib/imageOptimize";

interface ProductCardProps {
  product: ProductWithOffer;
  variant?: "default" | "compact" | "horizontal";
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { offer } = product;

  const deliveryText = offer.deliveryDays <= 2
    ? t("productCard.freeDeliveryTomorrow")
    : t("productCard.freeDeliveryInDays", { days: offer.deliveryDays });

  if (variant === "horizontal") {
    return (
      <div className="product-card flex gap-4">
        <Link to={`/product/${product.id}`} className="shrink-0">
          <LazyImage src={optimizeImageUrl(product.images[0], 128)} alt={product.title} className="w-32 h-32 object-contain" wrapperClassName="w-32 h-32 bg-secondary rounded" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-dense font-medium text-foreground line-clamp-2 hover:text-primary">{product.title}</h3>
          </Link>
          <div className="mt-1">
            <StarRating rating={product.rating} size="sm" showCount count={product.reviewCount} />
          </div>
          <div className="mt-2">
            <PriceDisplay price={offer.price} originalPrice={offer.originalPrice} size="md" />
          </div>
          {product.isPrime && (
            <div className="mt-1 prime-badge text-xs">
              <Truck className="w-3 h-3" />
              <span>{t("productCard.freeDelivery")}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="product-card flex flex-col h-full group">
      <Link to={`/product/${product.id}`} className="relative">
        {product.isBestSeller && (
          <span className="absolute top-0 left-0 rtl:left-auto rtl:right-0 bg-accent text-accent-foreground text-[10px] font-semibold px-2 py-0.5 rounded-br rtl:rounded-br-none rtl:rounded-bl z-10">
            {t("product.bestSeller")}
          </span>
        )}
        {product.isLimitedDeal && (
          <span className="absolute top-0 left-0 rtl:left-auto rtl:right-0 deal-badge rounded-tl-none rounded-br text-[10px] z-10">
            {t("product.limitedDeal")}
          </span>
        )}
        {product.isHandmade && (
          <span className="absolute top-7 left-0 rtl:left-auto rtl:right-0 bg-amber-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-br rtl:rounded-br-none rtl:rounded-bl z-10 flex items-center gap-1">
            <Hand className="w-3 h-3" />
            {t("product.handmade")}
          </span>
        )}
        {product.isArtisanBrand && (
          <span className="absolute top-7 left-0 rtl:left-auto rtl:right-0 bg-indigo-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-br rtl:rounded-br-none rtl:rounded-bl z-10 flex items-center gap-1" style={{ top: product.isHandmade ? '3.5rem' : '1.75rem' }}>
            <Palette className="w-3 h-3" />
            {t("product.artisan")}
          </span>
        )}
        <LazyImage src={optimizeImageUrl(product.images[0], 250)} alt={product.title} className="w-full aspect-square object-contain transition-transform group-hover:scale-105" wrapperClassName="w-full bg-secondary rounded-t" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
      </Link>

      <div className="flex flex-col flex-1 pt-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-dense font-medium text-foreground line-clamp-2 hover:text-primary leading-snug">{product.title}</h3>
        </Link>

        <div className="mt-1.5">
          <StarRating rating={product.rating} size="sm" showCount count={product.reviewCount} />
        </div>

        <div className="mt-2">
          <PriceDisplay price={offer.price} originalPrice={offer.originalPrice} size={variant === "compact" ? "sm" : "md"} />
        </div>

        {product.isPrime && (
          <div className="mt-1.5 prime-badge text-xs">
            <Truck className="w-3 h-3" />
            <span>{deliveryText}</span>
          </div>
        )}

        <div className="mt-auto pt-3">
          <Button onClick={() => addToCart(product)} className="w-full btn-cta text-sm h-9">
            {t("product.addToCart")}
          </Button>
        </div>
      </div>
    </div>
  );
}
