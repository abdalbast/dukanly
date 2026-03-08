import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
}

export function LazyImage({ className, wrapperClassName, onLoad, ...props }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", !loaded && "bg-muted animate-pulse", wrapperClassName)}>
      <img
        loading="lazy"
        decoding="async"
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        {...props}
      />
    </div>
  );
}
