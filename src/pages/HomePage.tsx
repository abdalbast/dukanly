import { Link } from "react-router-dom";
import { ChevronRight, Truck, Shield, Clock, Percent } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { categories } from "@/data/mockData";
import { useProducts } from "@/hooks/useProducts";
import heroBanner from "@/assets/hero-banner.jpg";
import { useLanguage } from "@/i18n/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();
  const { data: products = [], isLoading } = useProducts();

  const dealsProducts = products.filter((p) => p.isLimitedDeal || p.offer.originalPrice);
  const bestSellers = products.filter((p) => p.isBestSeller);
  const pelinProducts = products.filter((p) => p.brand.toLowerCase() === "pelin products");
  const trendingProducts = products.slice(0, 8);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative">
        <div 
          className="h-[300px] md:h-[400px] bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBanner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent rtl:bg-gradient-to-l" />
          <div className="container relative h-full flex items-center">
            <div className="max-w-lg text-primary-foreground">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{t("home.heroTitle")}</h1>
              <p className="text-lg text-primary-foreground/80 mb-6">{t("home.heroSubtitle")}</p>
              <div className="flex gap-3">
                <Link to="/deals" className="btn-cta px-8 py-3 inline-block">{t("home.shopDeals")}</Link>
                <Link to="/sell" className="hero-secondary-link">
                  {t("home.sellOnDukanly")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="bg-card border-b border-border py-4">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 justify-center">
              <Truck className="w-6 h-6 text-prime" />
              <div>
                <p className="text-sm font-semibold">{t("home.freeShipping")}</p>
                <p className="text-xs text-muted-foreground">{t("home.onOrders35")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Shield className="w-6 h-6 text-success" />
              <div>
                <p className="text-sm font-semibold">{t("home.buyerProtection")}</p>
                <p className="text-xs text-muted-foreground">{t("home.secure100")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Clock className="w-6 h-6 text-info" />
              <div>
                <p className="text-sm font-semibold">{t("home.easyReturns")}</p>
                <p className="text-xs text-muted-foreground">{t("home.dayPolicy")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Percent className="w-6 h-6 text-deal" />
              <div>
                <p className="text-sm font-semibold">{t("home.dailyDeals")}</p>
                <p className="text-xs text-muted-foreground">{t("home.upTo70Off")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((cat) => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className="bg-card rounded-lg p-4 border border-border hover:shadow-card transition-shadow group">
              <h3 className="font-semibold mb-3">{cat.name}</h3>
              <div className="aspect-square bg-secondary rounded flex items-center justify-center text-muted-foreground mb-3">
                <span className="text-4xl opacity-30">📦</span>
              </div>
              <span className="text-sm text-info group-hover:underline flex items-center gap-1">
                {t("common.shopNow")} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Today's Deals */}
      {!isLoading && dealsProducts.length > 0 && (
        <section className="container py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-header mb-0">{t("home.todaysDeals")}</h2>
            <Link to="/deals" className="text-sm text-info hover:underline flex items-center gap-1">
              {t("common.seeAllDeals")} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {dealsProducts.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {!isLoading && bestSellers.length > 0 && (
        <section className="bg-secondary/50 py-8">
          <div className="container">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-header mb-0">{t("home.bestSellers")}</h2>
              <Link to="/bestsellers" className="text-sm text-info hover:underline flex items-center gap-1">
                {t("common.seeMore")} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {bestSellers.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Brand */}
      {!isLoading && pelinProducts.length > 0 && (
        <section className="container py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-header mb-0">Featured Brand: Pelin Products</h2>
            <Link to="/brand/Pelin%20Products" className="text-sm text-info hover:underline flex items-center gap-1">
              Shop Pelin Products <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pelinProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* More Categories */}
      <section className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(4, 8).map((cat) => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className="bg-card rounded-lg p-4 border border-border hover:shadow-card transition-shadow group">
              <h3 className="font-semibold mb-3">{cat.name}</h3>
              <div className="aspect-square bg-secondary rounded flex items-center justify-center text-muted-foreground mb-3">
                <span className="text-4xl opacity-30">📦</span>
              </div>
              <span className="text-sm text-info group-hover:underline flex items-center gap-1">
                {t("common.shopNow")} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      {!isLoading && trendingProducts.length > 0 && (
        <section className="container py-6 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-header mb-0">{t("home.trendingNow")}</h2>
            <Link to="/trending" className="text-sm text-info hover:underline flex items-center gap-1">
              {t("common.seeMore")} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trendingProducts.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
