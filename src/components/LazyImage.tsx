import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  sizes?: string;
}

export function LazyImage({ className, wrapperClassName, onLoad, onError, ...props }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", !loaded && !errored && "bg-muted animate-pulse", wrapperClassName)}>
      <img
        loading="lazy"
        decoding="async"
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          errored && "opacity-100",
          className
        )}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setErrored(true);
          setLoaded(true);
          (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
          onError?.(e);
        }}
        {...props}
      />
    </div>
  );
}
