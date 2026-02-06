interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showCurrencySymbol?: boolean;
}

export function PriceDisplay({
  price,
  originalPrice,
  currency = "USD",
  size = "md",
  showCurrencySymbol = true,
}: PriceDisplayProps) {
  const whole = Math.floor(price);
  const fraction = Math.round((price - whole) * 100);

  const sizeClasses = {
    sm: { whole: "text-sm font-semibold", fraction: "text-[9px]", symbol: "text-[10px]" },
    md: { whole: "text-lg font-bold", fraction: "text-[10px]", symbol: "text-xs" },
    lg: { whole: "text-2xl font-bold", fraction: "text-xs", symbol: "text-sm" },
    xl: { whole: "text-3xl font-bold", fraction: "text-sm", symbol: "text-base" },
  };

  const currencySymbol = currency === "USD" ? "$" : currency;

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-0.5">
      {originalPrice && discount > 0 && (
        <div className="flex items-center gap-2">
          <span className="deal-badge">{discount}% off</span>
          {size !== "sm" && (
            <span className="text-muted-foreground text-sm">Limited time deal</span>
          )}
        </div>
      )}
      <div className="flex items-baseline gap-1">
        {showCurrencySymbol && (
          <span className={sizeClasses[size].symbol}>{currencySymbol}</span>
        )}
        <span className={sizeClasses[size].whole}>{whole}</span>
        {fraction > 0 && (
          <span className={`${sizeClasses[size].fraction} align-super`}>
            {fraction.toString().padStart(2, "0")}
          </span>
        )}
        {originalPrice && (
          <span className="ml-2 text-muted-foreground text-sm line-through">
            {currencySymbol}{originalPrice.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
