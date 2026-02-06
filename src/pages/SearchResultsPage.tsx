import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Grid3X3, List, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { searchProducts, mockProducts } from "@/data/mockData";

type SortOption = "relevance" | "price-low" | "price-high" | "rating" | "newest";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [filters, setFilters] = useState({
    primeOnly: false,
    deals: false,
    minRating: 0,
    brands: [] as string[],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get products based on search query
  const baseProducts = query ? searchProducts(query) : mockProducts;

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    let products = [...baseProducts];

    // Apply filters
    if (filters.primeOnly) {
      products = products.filter((p) => p.isPrime);
    }
    if (filters.deals) {
      products = products.filter((p) => p.offer.originalPrice);
    }
    if (filters.minRating > 0) {
      products = products.filter((p) => p.rating >= filters.minRating);
    }
    if (filters.brands.length > 0) {
      products = products.filter((p) => filters.brands.includes(p.brand));
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        products.sort((a, b) => a.offer.price - b.offer.price);
        break;
      case "price-high":
        products.sort((a, b) => b.offer.price - a.offer.price);
        break;
      case "rating":
        products.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        // Mock: just shuffle for demo
        break;
    }

    return products;
  }, [baseProducts, filters, sortBy]);

  // Get unique brands for filter
  const availableBrands = [...new Set(baseProducts.map((p) => p.brand))];

  const toggleBrand = (brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const clearFilters = () => {
    setFilters({
      primeOnly: false,
      deals: false,
      minRating: 0,
      brands: [],
    });
  };

  const activeFilterCount = [
    filters.primeOnly,
    filters.deals,
    filters.minRating > 0,
    filters.brands.length > 0,
  ].filter(Boolean).length;

  return (
    <Layout>
      <div className="container py-6">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-lg font-medium">
            {query ? (
              <>
                Results for "<span className="text-primary font-semibold">{query}</span>"
              </>
            ) : (
              "All Products"
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredProducts.length} results
          </p>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-info hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Delivery */}
              <div>
                <h3 className="text-sm font-medium mb-2">Delivery</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.primeOnly}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({ ...prev, primeOnly: !!checked }))
                    }
                  />
                  <span className="text-sm prime-badge py-0">FREE Delivery</span>
                </label>
              </div>

              {/* Deals */}
              <div>
                <h3 className="text-sm font-medium mb-2">Deals & Discounts</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.deals}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({ ...prev, deals: !!checked }))
                    }
                  />
                  <span className="text-sm">All Discounts</span>
                </label>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-sm font-medium mb-2">Customer Rating</h3>
                <div className="space-y-1">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          minRating: prev.minRating === rating ? 0 : rating,
                        }))
                      }
                      className={`flex items-center gap-1 text-sm py-1 px-2 rounded w-full text-left ${
                        filters.minRating === rating
                          ? "bg-muted"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-star">{"★".repeat(rating)}</span>
                      <span className="text-star-empty">{"★".repeat(5 - rating)}</span>
                      <span className="text-muted-foreground">& Up</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="text-sm font-medium mb-2">Brand</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {availableBrands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center gap-2 cursor-pointer py-1"
                    >
                      <Checkbox
                        checked={filters.brands.includes(brand)}
                        onCheckedChange={() => toggleBrand(brand)}
                      />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                {/* Mobile Filters Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-1" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>

                {/* Active Filter Chips */}
                {filters.primeOnly && (
                  <span className="filter-chip active text-xs">
                    FREE Delivery
                    <button onClick={() => setFilters((p) => ({ ...p, primeOnly: false }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.deals && (
                  <span className="filter-chip active text-xs">
                    Deals
                    <button onClick={() => setFilters((p) => ({ ...p, deals: false }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-40 h-9 text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Avg. Customer Review</SelectItem>
                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="hidden sm:flex border border-border rounded">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-muted" : ""}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-muted" : ""}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg font-medium mb-2">No results found</p>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear all filters
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} variant="horizontal" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
