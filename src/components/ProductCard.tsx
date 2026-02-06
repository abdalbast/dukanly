import { Link } from "react-router-dom";
import { ProductWithOffer } from "@/types/product";
import { StarRating } from "./StarRating";
import { PriceDisplay } from "./PriceDisplay";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Check, Truck } from "lucide-react";

interface ProductCardProps {
  product: ProductWithOffer;
  variant?: "default" | "compact" | "horizontal";
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { addToCart } = useCart();
  const { offer } = product;

  if (variant === "horizontal") {
    return (
      <div className="product-card flex gap-4">
        <Link to={`/product/${product.id}`} className="shrink-0">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-32 h-32 object-contain bg-secondary rounded"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-dense font-medium text-foreground line-clamp-2 hover:text-primary">
              {product.title}
            </h3>
          </Link>
          <div className="mt-1">
            <StarRating
              rating={product.rating}
              size="sm"
              showCount
              count={product.reviewCount}
            />
          </div>
          <div className="mt-2">
            <PriceDisplay
              price={offer.price}
              originalPrice={offer.originalPrice}
              size="md"
            />
          </div>
          {product.isPrime && (
            <div className="mt-1 prime-badge text-xs">
              <Truck className="w-3 h-3" />
              <span>FREE Delivery</span>
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
          <span className="absolute top-0 left-0 bg-accent text-accent-foreground text-[10px] font-semibold px-2 py-0.5 rounded-br">
            Best Seller
          </span>
        )}
        {product.isLimitedDeal && (
          <span className="absolute top-0 left-0 deal-badge rounded-tl-none rounded-br text-[10px]">
            Limited Deal
          </span>
        )}
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full aspect-square object-contain bg-secondary rounded-t transition-transform group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-col flex-1 pt-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-dense font-medium text-foreground line-clamp-2 hover:text-primary leading-snug">
            {product.title}
          </h3>
        </Link>

        <div className="mt-1.5">
          <StarRating
            rating={product.rating}
            size="sm"
            showCount
            count={product.reviewCount}
          />
        </div>

        <div className="mt-2">
          <PriceDisplay
            price={offer.price}
            originalPrice={offer.originalPrice}
            size={variant === "compact" ? "sm" : "md"}
          />
        </div>

        {product.isPrime && (
          <div className="mt-1.5 prime-badge text-xs">
            <Truck className="w-3 h-3" />
            <span>FREE Delivery {offer.deliveryDays <= 2 ? "Tomorrow" : `in ${offer.deliveryDays} days`}</span>
          </div>
        )}

        <div className="mt-auto pt-3">
          <Button
            onClick={() => addToCart(product)}
            className="w-full btn-cta text-sm h-9"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
