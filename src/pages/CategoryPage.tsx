import { useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { categories } from "@/data/mockData";
import { useProductsByCategory, useProducts } from "@/hooks/useProducts";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CategoryPage() {
  const { slug, subcategory } = useParams<{ slug: string; subcategory?: string }>();
  const { t } = useLanguage();
  const category = categories.find((c) => c.slug === slug);

  const { data: categoryProducts = [] } = useProductsByCategory(slug);
  const { data: allProducts = [] } = useProducts();

  const displayProducts = categoryProducts.length > 0 ? categoryProducts : allProducts;

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
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold capitalize">{category?.name || slug || t("category.allProducts")}</h1>
          <p className="text-muted-foreground mt-1">{displayProducts.length} {t("common.products")}</p>
        </div>
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
