import { useState, useMemo } from "react";
import { useLocation, useSearchParams, useParams } from "react-router-dom";
import { Grid3X3, List, X, SlidersHorizontal } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchProducts } from "@/hooks/useProducts";
import { useLanguage } from "@/i18n/LanguageContext";

type SortOption = "relevance" | "price-low" | "price-high" | "rating" | "newest";

export default function SearchResultsPage() {
  const { t } = useLanguage();
  const location = useLocation();
  const { brand: brandParam, sellerId: sellerIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [filters, setFilters] = useState({ primeOnly: false, deals: false, handmade: false, artisan: false, minRating: 0, brands: [] as string[] });
  const [showFilters, setShowFilters] = useState(false);

  const { data: fetchedProducts = [], isLoading } = useSearchProducts(query);
  const routeMode =
    location.pathname === "/deals" ? "deals"
    : location.pathname === "/bestsellers" ? "bestsellers"
    : location.pathname === "/trending" ? "trending"
    : "search";

  const baseProducts = useMemo(() => {
    let products = [...fetchedProducts];
    if (brandParam) {
      const normalizedBrand = decodeURIComponent(brandParam).toLowerCase();
      products = products.filter((p) => p.brand.toLowerCase() === normalizedBrand);
    }
    if (sellerIdParam) products = products.filter((p) => p.offer.sellerId === sellerIdParam);
    if (routeMode === "deals") products = products.filter((p) => p.isLimitedDeal || p.offer.originalPrice);
    if (routeMode === "bestsellers") products = products.filter((p) => p.isBestSeller);
    return products;
  }, [brandParam, fetchedProducts, routeMode, sellerIdParam]);

  const pageTitle =
    routeMode === "deals" ? t("home.todaysDeals")
    : routeMode === "bestsellers" ? t("home.bestSellers")
    : routeMode === "trending" ? t("home.trendingNow")
    : brandParam ? `${t("search.brand")}: ${decodeURIComponent(brandParam)}`
    : sellerIdParam ? `${sellerIdParam}`
    : query ? t("search.resultsFor").replace("{query}", query)
    : t("search.allProducts");

  const filteredProducts = useMemo(() => {
    let products = [...baseProducts];
    if (filters.primeOnly) products = products.filter((p) => p.isPrime);
    if (filters.deals) products = products.filter((p) => p.offer.originalPrice);
    if (filters.handmade) products = products.filter((p) => p.isHandmade);
    if (filters.artisan) products = products.filter((p) => p.isArtisanBrand);
    if (filters.minRating > 0) products = products.filter((p) => p.rating >= filters.minRating);
    if (filters.brands.length > 0) products = products.filter((p) => filters.brands.includes(p.brand));
    switch (sortBy) {
      case "price-low": products.sort((a, b) => a.offer.price - b.offer.price); break;
      case "price-high": products.sort((a, b) => b.offer.price - a.offer.price); break;
      case "rating": products.sort((a, b) => b.rating - a.rating); break;
      case "newest": products.sort((a, b) => b.id.localeCompare(a.id)); break;
      case "relevance":
        if (routeMode === "trending") {
          products.sort((a, b) => {
            const scoreA = a.rating * 100 + a.reviewCount + (a.isPrime ? 25 : 0);
            const scoreB = b.rating * 100 + b.reviewCount + (b.isPrime ? 25 : 0);
            return scoreB - scoreA;
          });
        }
        break;
    }
    return products;
  }, [baseProducts, filters, routeMode, sortBy]);

  const availableBrands = [...new Set(baseProducts.map((p) => p.brand))];
  const toggleBrand = (brand: string) => setFilters((prev) => ({ ...prev, brands: prev.brands.includes(brand) ? prev.brands.filter((b) => b !== brand) : [...prev.brands, brand] }));
  const clearFilters = () => setFilters({ primeOnly: false, deals: false, handmade: false, artisan: false, minRating: 0, brands: [] });
  const activeFilterCount = [filters.primeOnly, filters.deals, filters.handmade, filters.artisan, filters.minRating > 0, filters.brands.length > 0].filter(Boolean).length;

  const renderFilters = () => (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{t("search.filters")}</h2>
        {activeFilterCount > 0 && <button onClick={clearFilters} className="text-xs text-info hover:underline">{t("search.clearAll")}</button>}
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">{t("search.delivery")}</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={filters.primeOnly} onCheckedChange={(c) => setFilters((p) => ({ ...p, primeOnly: !!c }))} />
          <span className="text-sm prime-badge py-0">{t("search.freeDelivery")}</span>
        </label>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">{t("search.dealsDiscounts")}</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={filters.deals} onCheckedChange={(c) => setFilters((p) => ({ ...p, deals: !!c }))} />
          <span className="text-sm">{t("search.allDiscounts")}</span>
        </label>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">{t("search.productType")}</h3>
        <label className="flex items-center gap-2 cursor-pointer py-1">
          <Checkbox checked={filters.handmade} onCheckedChange={(c) => setFilters((p) => ({ ...p, handmade: !!c }))} />
          <span className="text-sm">{t("search.handmadeOnly")}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer py-1">
          <Checkbox checked={filters.artisan} onCheckedChange={(c) => setFilters((p) => ({ ...p, artisan: !!c }))} />
          <span className="text-sm">{t("search.artisanOnly")}</span>
        </label>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">{t("search.customerRating")}</h3>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((rating) => (
            <button key={rating} onClick={() => setFilters((p) => ({ ...p, minRating: p.minRating === rating ? 0 : rating }))} className={`flex items-center gap-1 text-sm py-1 px-2 rounded-lg w-full text-left rtl:text-right ${filters.minRating === rating ? "bg-muted" : "hover:bg-muted/50"}`}>
              <span className="text-star">{"★".repeat(rating)}</span><span className="text-star-empty">{"★".repeat(5 - rating)}</span><span className="text-muted-foreground">{t("search.andUp")}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">{t("search.brand")}</h3>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {availableBrands.map((brand) => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer py-1">
              <Checkbox checked={filters.brands.includes(brand)} onCheckedChange={() => toggleBrand(brand)} />
              <span className="text-sm">{brand}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <Layout>
      <div className="container py-10 md:py-14">
        <div className="mb-8">
          <h1 className="page-title">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground mt-2">{filteredProducts.length} {t("common.results")}</p>
        </div>
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              {renderFilters()}
            </div>
          </aside>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden rounded-full">
                  <SlidersHorizontal className="w-4 h-4 mr-1" />{t("search.filters")}
                  {activeFilterCount > 0 && <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>}
                </Button>
                {filters.primeOnly && <span className="filter-chip active text-xs">{t("search.freeDelivery")}<button onClick={() => setFilters((p) => ({ ...p, primeOnly: false }))}><X className="w-3 h-3" /></button></span>}
                {filters.deals && <span className="filter-chip active text-xs">{t("search.deals")}<button onClick={() => setFilters((p) => ({ ...p, deals: false }))}><X className="w-3 h-3" /></button></span>}
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-40 h-9 text-sm rounded-xl"><SelectValue placeholder={t("search.sortBy")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">{t("search.relevance")}</SelectItem>
                    <SelectItem value="price-low">{t("search.priceLowHigh")}</SelectItem>
                    <SelectItem value="price-high">{t("search.priceHighLow")}</SelectItem>
                    <SelectItem value="rating">{t("search.avgCustomerReview")}</SelectItem>
                    <SelectItem value="newest">{t("search.newestArrivals")}</SelectItem>
                  </SelectContent>
                </Select>
                <div className="hidden sm:flex border border-border rounded-lg">
                  <button onClick={() => setViewMode("grid")} className={`p-2 rounded-l-lg ${viewMode === "grid" ? "bg-muted" : ""}`}><Grid3X3 className="w-4 h-4" /></button>
                  <button onClick={() => setViewMode("list")} className={`p-2 rounded-r-lg ${viewMode === "list" ? "bg-muted" : ""}`}><List className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
            {showFilters && (
              <div className="lg:hidden mb-6 bg-card border border-border rounded-xl p-5 space-y-4">
                {renderFilters()}
              </div>
            )}
            {isLoading ? (
              <ProductGridSkeleton count={8} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" />
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg font-medium mb-2">{t("search.noResults")}</p>
                <p className="text-muted-foreground mb-4">{t("search.tryAdjusting")}</p>
                <Button onClick={clearFilters} variant="outline" className="rounded-full">{t("search.clearAllFilters")}</Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredProducts.map((product) => (<ProductCard key={product.id} product={product} />))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (<ProductCard key={product.id} product={product} variant="horizontal" />))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
