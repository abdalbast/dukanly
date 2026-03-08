import { formatIQDParts } from "@/lib/currency";
import { useLanguage } from "@/i18n/LanguageContext";

interface PriceDisplayProps {
  /** Price in IQD (native currency) */
  price: number;
  /** Original price in IQD (optional, for showing discount) */
  originalPrice?: number;
  size?: "sm" | "md" | "lg" | "xl";
}

export function PriceDisplay({
  price,
  originalPrice,
  size = "md",
}: PriceDisplayProps) {
  const { t } = useLanguage();
  const iqdPrice = Math.round(price);
  const iqdOriginal = originalPrice ? Math.round(originalPrice) : undefined;
  const priceParts = formatIQDParts(iqdPrice);
  const originalPriceParts = iqdOriginal ? formatIQDParts(iqdOriginal) : null;

  const sizeClasses = {
    sm: { whole: "text-sm font-semibold", suffix: "text-[10px]" },
    md: { whole: "text-base sm:text-lg font-bold", suffix: "text-[10px] sm:text-xs" },
    lg: { whole: "text-2xl font-bold", suffix: "text-sm" },
    xl: { whole: "text-3xl font-bold", suffix: "text-base" },
  };

  const discount = iqdOriginal
    ? Math.round(((iqdOriginal - iqdPrice) / iqdOriginal) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-0.5">
      {iqdOriginal && discount > 0 && (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="deal-badge">{discount}% {t("product.off")}</span>
          {size !== "sm" && (
            <span className="hidden sm:inline text-muted-foreground text-sm">{t("product.limitedTimeDealLabel")}</span>
          )}
        </div>
      )}
      <div className="flex items-baseline gap-1 flex-wrap">
        <span className={sizeClasses[size].whole}>
          {priceParts.amount}
        </span>
        <span className={sizeClasses[size].suffix}>{priceParts.currency}</span>
        {originalPriceParts && (
          <span className="ml-1 sm:ml-2 text-muted-foreground text-xs sm:text-sm line-through whitespace-nowrap">
            {originalPriceParts.amount} {originalPriceParts.currency}
          </span>
        )}
      </div>
    </div>
  );
}
