import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, PackageOpen } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { LazyImage } from "@/components/LazyImage";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { categories } from "@/data/mockData";
import { useProductsByCategory, useProducts } from "@/hooks/useProducts";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CategoryPage() {
  const { slug, subcategory } = useParams<{ slug: string; subcategory?: string }>();
  const { t } = useLanguage();
  const category = categories.find((c) => c.slug === slug);
  const [handmadeOnly, setHandmadeOnly] = useState(false);
  const [artisanOnly, setArtisanOnly] = useState(false);

  const { data: categoryProducts = [], isLoading: isCatLoading } = useProductsByCategory(slug);
  const { data: allProducts = [], isLoading: isAllLoading } = useProducts();

  const isLoading = isCatLoading || isAllLoading;
  const baseProducts = categoryProducts.length > 0 ? categoryProducts : allProducts;
  const normalizedSubcategory = subcategory?.trim().toLowerCase();

  if (!slug) {
    return (
      <Layout>
        <div className="bg-card border-b border-border">
          <div className="container py-2">
            <nav className="breadcrumb">
              <Link to="/">{t("common.home")}</Link>
              <ChevronRight className="w-3 h-3 rtl:rotate-180" />
              <span className="text-foreground">{t("category.shopByCategory")}</span>
            </nav>
          </div>
        </div>
        <div className="relative h-48 md:h-64 overflow-hidden bg-muted">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40" />
          <div className="container relative h-full flex flex-col justify-end pb-8">
            <h1 className="page-title text-3xl md:text-4xl text-white">{t("category.shopByCategory")}</h1>
            <p className="text-white/80 mt-1.5">{categories.length} {t("category.allProducts")}</p>
          </div>
        </div>
        <div className="container py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group relative rounded-xl overflow-hidden aspect-[4/3]"
              >
                <LazyImage
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                  wrapperClassName="absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="text-white font-semibold text-lg">{cat.name}</h2>
                  <span className="text-white/70 text-sm">{t("common.shopNow")} →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Layout>
    );
  }


    let products = normalizedSubcategory
      ? baseProducts.filter((p) => p.subcategory?.trim().toLowerCase() === normalizedSubcategory)
      : baseProducts;
    if (handmadeOnly) products = products.filter((p) => p.isHandmade);
    if (artisanOnly) products = products.filter((p) => p.isArtisanBrand);
    return products;
  }, [baseProducts, normalizedSubcategory, handmadeOnly, artisanOnly]);

  return (
    <Layout>
      <div className="bg-card border-b border-border">
        <div className="container py-2">
          <nav className="breadcrumb">
            <Link to="/">{t("common.home")}</Link>
            <ChevronRight className="w-3 h-3 rtl:rotate-180" />
            {category ? (
              <>
                <Link to={`/category/${category.slug}`}>{category.name}</Link>
                {subcategory && (
                  <>
                    <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                    <span className="text-foreground capitalize">{subcategory}</span>
                  </>
                )}
              </>
            ) : (
              <span className="text-foreground capitalize">{slug}</span>
            )}
          </nav>
        </div>
      </div>
      <div className="relative h-48 md:h-64 overflow-hidden">
        {category?.image ? (
          <LazyImage
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover absolute inset-0"
            wrapperClassName="absolute inset-0"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30" />
        <div className="container relative h-full flex flex-col justify-end pb-8">
          <h1 className="page-title text-3xl md:text-4xl text-white capitalize">
            {category?.name || slug || t("category.allProducts")}
          </h1>
          <p className="text-white/80 mt-1.5">
            {displayProducts.length} {t("common.products")}
          </p>
        </div>
      </div>
      <div className="container py-10 md:py-14">
        {category?.subcategories && !subcategory && (
          <div className="flex flex-wrap gap-2 mb-8">
            {category.subcategories.map((sub) => (
              <Link key={sub.id} to={`/category/${category.slug}/${sub.slug}`} className="filter-chip">{sub.name}</Link>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={handmadeOnly} onCheckedChange={(c) => setHandmadeOnly(!!c)} />
            <span className="text-sm">{t("search.handmadeOnly")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={artisanOnly} onCheckedChange={(c) => setArtisanOnly(!!c)} />
            <span className="text-sm">{t("search.artisanOnly")}</span>
          </label>
        </div>
        {isLoading ? (
          <ProductGridSkeleton count={10} />
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">{t("search.noResults")}</p>
            <p className="text-muted-foreground">{t("search.tryAdjusting")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {displayProducts.map((product) => (<ProductCard key={product.id} product={product} />))}
          </div>
        )}
      </div>
    </Layout>
  );
}
