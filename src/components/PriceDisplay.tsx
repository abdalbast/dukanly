import { convertToIQD } from "@/lib/currency";

interface PriceDisplayProps {
  /** Price in USD (will be converted to IQD for display) */
  price: number;
  /** Original price in USD (optional, for showing discount) */
  originalPrice?: number;
  size?: "sm" | "md" | "lg" | "xl";
}

export function PriceDisplay({
  price,
  originalPrice,
  size = "md",
}: PriceDisplayProps) {
  const iqdPrice = convertToIQD(price);
  const iqdOriginal = originalPrice ? convertToIQD(originalPrice) : undefined;

  const sizeClasses = {
    sm: { whole: "text-sm font-semibold", suffix: "text-[10px]" },
    md: { whole: "text-lg font-bold", suffix: "text-xs" },
    lg: { whole: "text-2xl font-bold", suffix: "text-sm" },
    xl: { whole: "text-3xl font-bold", suffix: "text-base" },
  };

  const discount = iqdOriginal
    ? Math.round(((iqdOriginal - iqdPrice) / iqdOriginal) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-0.5">
      {iqdOriginal && discount > 0 && (
        <div className="flex items-center gap-2">
          <span className="deal-badge">{discount}% off</span>
          {size !== "sm" && (
            <span className="text-muted-foreground text-sm">Limited time deal</span>
          )}
        </div>
      )}
      <div className="flex items-baseline gap-1">
        <span className={sizeClasses[size].whole}>
          {iqdPrice.toLocaleString()}
        </span>
        <span className={sizeClasses[size].suffix}>IQD</span>
        {iqdOriginal && (
          <span className="ml-2 text-muted-foreground text-sm line-through">
            {iqdOriginal.toLocaleString()} IQD
          </span>
        )}
      </div>
    </div>
  );
}
