import { useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { LazyImage } from "@/components/LazyImage";
import { categories } from "@/data/mockData";
import { useProductsByCategory, useProducts } from "@/hooks/useProducts";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CategoryPage() {
  const { slug, subcategory } = useParams<{ slug: string; subcategory?: string }>();
  const { t } = useLanguage();
  const category = categories.find((c) => c.slug === slug);

  const { data: categoryProducts = [] } = useProductsByCategory(slug);
  const { data: allProducts = [] } = useProducts();

  const baseProducts = categoryProducts.length > 0 ? categoryProducts : allProducts;
  const normalizedSubcategory = subcategory?.trim().toLowerCase();
  const displayProducts = normalizedSubcategory
    ? baseProducts.filter((product) => {
        const productSubcategory = product.subcategory?.trim().toLowerCase();
        return productSubcategory === normalizedSubcategory;
      })
    : baseProducts;

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
        <div className="container relative h-full flex flex-col justify-end pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white capitalize">
            {category?.name || slug || t("category.allProducts")}
          </h1>
          <p className="text-white/80 mt-1">
            {displayProducts.length} {t("common.products")}
          </p>
        </div>
      </div>
      <div className="container py-6">
        {category?.subcategories && !subcategory && (
          <div className="flex flex-wrap gap-2 mb-6">
            {category.subcategories.map((sub) => (
              <Link key={sub.id} to={`/category/${category.slug}/${sub.slug}`} className="filter-chip">{sub.name}</Link>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayProducts.map((product) => (<ProductCard key={product.id} product={product} />))}
        </div>
      </div>
    </Layout>
  );
}
