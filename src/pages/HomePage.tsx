import { Link } from "react-router-dom";
import { ChevronRight, Truck, Shield, Clock, Percent, ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { LazyImage } from "@/components/LazyImage";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
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
      {/* Hero Section — cinematic, Apple-style */}
      <section className="relative overflow-hidden">
        <div className="h-[420px] md:h-[540px] lg:h-[600px] relative">
          <img
            src={heroBanner}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent rtl:bg-gradient-to-l" />
          <div className="container relative h-full flex items-center">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/60 mb-4">
                {t("home.heroTagline")}
              </p>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary-foreground leading-[1.08] mb-5 page-title"
              >
                {t("home.heroTitle")}
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-md leading-relaxed">
                {t("home.heroSubtitle")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/deals"
                  className="btn-cta px-8 py-3.5 text-base inline-flex items-center gap-2 group"
                >
                  {t("home.shopDeals")}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </Link>
                <Link to="/sell" className="hero-secondary-link px-8 py-3.5">
                  {t("home.sellOnDukanly")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions — spacious, icon-forward */}
      <section className="border-b border-border bg-card">
        <div className="container py-8 md:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Truck, color: "text-prime bg-prime/10", title: t("home.freeShipping"), desc: t("home.onOrders35") },
              { icon: Shield, color: "text-success bg-success/10", title: t("home.buyerProtection"), desc: t("home.secure100") },
              { icon: Clock, color: "text-info bg-info/10", title: t("home.easyReturns"), desc: t("home.dayPolicy") },
              { icon: Percent, color: "text-deal bg-deal/10", title: t("home.dailyDeals"), desc: t("home.upTo70Off") },
            ].map((v) => (
              <div key={v.title} className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${v.color}`}>
                  <v.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">{v.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Cards — clean, editorial grid */}
      <section className="container py-14 md:py-20">
        <div className="text-center mb-10">
          <h2 className="section-header">
            Shop by Category
          </h2>
          <p className="section-subheader">Discover products across every department</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {cat.image ? (
                <LazyImage
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  wrapperClassName="aspect-[4/5]"
                />
              ) : (
                <div className="aspect-[4/5] bg-secondary flex items-center justify-center text-muted-foreground">
                  <span className="text-5xl opacity-20">📦</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-5 pt-12">
                <h3 className="font-bold text-primary-foreground text-lg">{cat.name}</h3>
                <span className="text-sm text-primary-foreground/70 flex items-center gap-1 mt-1">
                  {t("common.shopNow")} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Today's Deals */}
      <section className="bg-secondary/40">
        <div className="container py-14 md:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-header">
                {t("home.todaysDeals")}
              </h2>
              <p className="section-subheader mb-0">Limited-time offers you don't want to miss</p>
            </div>
            <Link to="/deals" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              {t("common.seeAllDeals")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
          {isLoading ? (
            <ProductGridSkeleton count={5} />
          ) : dealsProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {dealsProducts.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
          <Link to="/deals" className="md:hidden mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            {t("common.seeAllDeals")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container py-14 md:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
              <h2 className="section-header">
              {t("home.bestSellers")}
            </h2>
            <p className="section-subheader mb-0">The products our customers love most</p>
          </div>
          <Link to="/bestsellers" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            {t("common.seeMore")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
        {isLoading ? (
          <ProductGridSkeleton count={5} />
        ) : bestSellers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {bestSellers.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>

      {/* Featured Brand */}
      {!isLoading && pelinProducts.length > 0 && (
        <section className="bg-secondary/40">
          <div className="container py-14 md:py-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">Featured Brand</p>
                <h2 className="section-header">
                  Pelin Products
                </h2>
              </div>
              <Link to="/brand/Pelin%20Products" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Shop Pelin Products <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {pelinProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* More Categories */}
      <section className="container py-14 md:py-20">
        <div className="text-center mb-10">
          <h2 className="section-header">
            More to Explore
          </h2>
          <p className="section-subheader">Browse our full range of departments</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {categories.slice(4, 8).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {cat.image ? (
                <LazyImage
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  wrapperClassName="aspect-[4/5]"
                />
              ) : (
                <div className="aspect-[4/5] bg-secondary flex items-center justify-center text-muted-foreground">
                  <span className="text-5xl opacity-20">📦</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-5 pt-12">
                <h3 className="font-bold text-primary-foreground text-lg">{cat.name}</h3>
                <span className="text-sm text-primary-foreground/70 flex items-center gap-1 mt-1">
                  {t("common.shopNow")} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="bg-secondary/40">
        <div className="container py-14 md:py-20 pb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-header">
                {t("home.trendingNow")}
              </h2>
              <p className="section-subheader mb-0">See what's popular right now</p>
            </div>
            <Link to="/trending" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              {t("common.seeMore")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
          {isLoading ? (
            <ProductGridSkeleton count={6} columns="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" />
          ) : trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {trendingProducts.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} variant="compact" />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Bottom CTA Band */}
      <section className="bg-primary">
        <div className="container py-16 md:py-20 text-center">
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary-foreground mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
          >
            Start Selling on Dukanly
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-8 max-w-lg mx-auto">
            Reach thousands of customers across Kurdistan and Iraq. Set up your store in minutes.
          </p>
          <Link to="/sell" className="btn-cta px-10 py-4 text-base inline-flex items-center gap-2 group">
            Get Started Free
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </Link>
        </div>
      </section>
    </Layout>
  );
}
