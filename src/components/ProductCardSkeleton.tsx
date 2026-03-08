import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border p-3 space-y-3">
      <Skeleton className="aspect-square w-full rounded" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-5 w-1/3" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, columns = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" }: { count?: number; columns?: string }) {
  return (
    <div className={`grid ${columns} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <Skeleton className="aspect-square w-full rounded-lg" />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-2/5" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="lg:col-span-3">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="bg-muted/50 p-4 flex items-center justify-between gap-4">
        <div className="flex gap-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="p-4 flex gap-4">
        <Skeleton className="w-20 h-20 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
}
