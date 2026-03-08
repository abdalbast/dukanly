import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, Truck, Shield, Clock, Percent, ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { LazyImage } from "@/components/LazyImage";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import { categories } from "@/data/mockData";
import { useProducts } from "@/hooks/useProducts";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/en";

import heroSlide1 from "@/assets/hero/slide-1.jpg";
import heroSlide2 from "@/assets/hero/slide-2.jpg";
import heroSlide3 from "@/assets/hero/slide-3.jpg";
import heroSlide4 from "@/assets/hero/slide-4.jpg";

import pelinBrandImage from "@/assets/pelin/0T7A0070.webp";
import azhinBrandImage from "@/assets/brands/azhin-art-hero.jpg";

const HERO_SLIDES: {
  image: string;
  tagline: TranslationKey;
  title: TranslationKey;
  subtitle: TranslationKey;
  cta: TranslationKey;
  link: string;
}[] = [
  {
    image: heroSlide1,
    tagline: "home.slide1.tagline",
    title: "home.slide1.title",
    subtitle: "home.slide1.subtitle",
    cta: "home.slide1.cta",
    link: "/deals",
  },
  {
    image: heroSlide2,
    tagline: "home.slide2.tagline",
    title: "home.slide2.title",
    subtitle: "home.slide2.subtitle",
    cta: "home.slide2.cta",
    link: "/category/fashion",
  },
  {
    image: heroSlide3,
    tagline: "home.slide3.tagline",
    title: "home.slide3.title",
    subtitle: "home.slide3.subtitle",
    cta: "home.slide3.cta",
    link: "/brand/Pelin%20Products",
  },
  {
    image: heroSlide4,
    tagline: "home.slide4.tagline",
    title: "home.slide4.title",
    subtitle: "home.slide4.subtitle",
    cta: "home.slide4.cta",
    link: "/sell",
  },
];

const AUTOPLAY_MS = 5500;

export default function HomePage() {
  const { t } = useLanguage();
  const { data: products = [], isLoading } = useProducts();

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 28, active: typeof window !== "undefined" });
  const [activeIndex, setActiveIndex] = useState(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      if (!isPausedRef.current && emblaApi) emblaApi.scrollNext();
    }, AUTOPLAY_MS);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActiveIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    startAutoplay();
    return () => {
      emblaApi.off("select", onSelect);
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [emblaApi, startAutoplay]);

  const scrollTo = useCallback(
    (idx: number) => {
      emblaApi?.scrollTo(idx);
      startAutoplay();
    },
    [emblaApi, startAutoplay],
  );

  const dealsProducts = products.filter((p) => p.isLimitedDeal || p.offer.originalPrice);
  const bestSellers = products.filter((p) => p.isBestSeller);
  
  const trendingProducts = products.slice(0, 8);

  return (
    <Layout>
      {/* ─── Hero Carousel ─── */}
      <section
        className="relative overflow-hidden group/hero"
        onMouseEnter={() => (isPausedRef.current = true)}
        onMouseLeave={() => (isPausedRef.current = false)}
      >
        <div ref={emblaRef} className="overflow-hidden" style={{ contain: "layout style paint" }}>
          <div className="flex">
            {HERO_SLIDES.map((slide, i) => (
              <div
                key={i}
                className="flex-[0_0_100%] min-w-0 relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]"
              >
                <img
                  src={slide.image}
                  alt=""
                  fetchPriority={i === 0 ? "high" : "low"}
                  decoding="async"
                  sizes="100vw"
                  className="absolute inset-0 w-full h-full object-cover will-change-transform"
                />
                {/* Deeper cinematic overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/55 to-transparent rtl:bg-gradient-to-l" />

                <div className="container relative h-full flex items-center">
                  <div className="max-w-2xl">
                    {/* Frosted tagline pill */}
                    <span className="tagline-pill mb-5 sm:mb-6">
                      {t(slide.tagline)}
                    </span>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-primary-foreground leading-[1.04] mb-4 sm:mb-6"
                      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
                    >
                      {t(slide.title)}
                    </h2>

                    <p className="text-base sm:text-lg md:text-xl text-primary-foreground/65 mb-8 sm:mb-10 max-w-lg leading-relaxed">
                      {t(slide.subtitle)}
                    </p>

                    {/* CTA pair */}
                    <div className="flex flex-wrap items-center gap-4">
                      <Link
                        to={slide.link}
                        className="btn-cta px-10 py-4 text-base inline-flex items-center gap-2.5 group"
                      >
                        {t(slide.cta)}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                      </Link>
                      <Link
                        to="/category/electronics"
                        className="hero-secondary-link"
                      >
                        {t("common.seeMore")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tall edge arrows */}
        <button
          onClick={() => { emblaApi?.scrollPrev(); startAutoplay(); }}
          className="absolute left-0 top-0 bottom-0 w-12 md:w-16 flex items-center justify-center bg-foreground/0 hover:bg-foreground/10 transition-colors z-10 opacity-0 group-hover/hero:opacity-100 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-8 h-8 text-primary-foreground drop-shadow-lg" />
        </button>
        <button
          onClick={() => { emblaApi?.scrollNext(); startAutoplay(); }}
          className="absolute right-0 top-0 bottom-0 w-12 md:w-16 flex items-center justify-center bg-foreground/0 hover:bg-foreground/10 transition-colors z-10 opacity-0 group-hover/hero:opacity-100 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-8 h-8 text-primary-foreground drop-shadow-lg" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                i === activeIndex
                  ? "w-10 bg-primary-foreground"
                  : "w-2 bg-primary-foreground/35 hover:bg-primary-foreground/55"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ─── Value Propositions — centered cards ─── */}
      <section className="border-b border-border bg-card">
        <div className="container py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { icon: Truck, color: "text-prime bg-prime/10", title: t("home.freeShipping"), desc: t("home.onOrders35") },
              { icon: Shield, color: "text-success bg-success/10", title: t("home.buyerProtection"), desc: t("home.secure100") },
              { icon: Clock, color: "text-info bg-info/10", title: t("home.easyReturns"), desc: t("home.dayPolicy") },
              { icon: Percent, color: "text-deal bg-deal/10", title: t("home.dailyDeals"), desc: t("home.upTo70Off") },
            ].map((v) => (
              <div key={v.title} className="flex flex-col items-center text-center gap-3 py-2">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${v.color}`}>
                  <v.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">{v.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Category Cards ─── */}
      <section className="container py-20 md:py-28">
        <div className="text-center mb-14">
          <span className="tagline-pill mb-4">Curated for You</span>
          <h2 className="section-header">
            Shop by Category
          </h2>
          <p className="section-subheader">Discover products across every department</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
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
                  wrapperClassName="aspect-[3/4]"
                />
              ) : (
                <div className="aspect-[3/4] bg-secondary flex items-center justify-center text-muted-foreground">
                  <span className="text-5xl opacity-20">📦</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/75 to-transparent p-6 pt-16">
                <h3 className="font-bold text-primary-foreground text-xl">{cat.name}</h3>
                <span className="text-sm text-primary-foreground/70 flex items-center gap-1 mt-1.5 group-hover:gap-2 transition-all">
                  {t("common.shopNow")} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Today's Deals ─── */}
      <section className="bg-secondary/40">
        <div className="container py-20 md:py-28">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="tagline-pill mb-4">Limited Time</span>
              <h2 className="section-header">
                {t("home.todaysDeals")}
              </h2>
              <p className="section-subheader mb-0">Limited-time offers you don't want to miss</p>
            </div>
            <Link to="/deals" className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
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
          <Link to="/deals" className="md:hidden mt-8 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            {t("common.seeAllDeals")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>

      {/* ─── Best Sellers ─── */}
      <section className="container py-20 md:py-28">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="tagline-pill mb-4">Most Popular</span>
            <h2 className="section-header">
              {t("home.bestSellers")}
            </h2>
            <p className="section-subheader mb-0">The products our customers love most</p>
          </div>
          <Link to="/bestsellers" className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
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

      {/* ─── Featured Brands ─── */}
      <section className="bg-secondary/40">
        <div className="container py-20 md:py-28">
          <div className="text-center mb-14">
            <span className="tagline-pill mb-4">Spotlight</span>
            <h2 className="section-header">Featured Brands</h2>
            <p className="section-subheader">Discover the makers behind the products</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: "Pelin Products",
                tagline: "Pure Botanicals, Handcrafted in Kurdistan",
                image: pelinBrandImage,
                link: "/brand/Pelin%20Products",
              },
              {
                name: "Azhin Art",
                tagline: "Kurdish Heritage Meets Modern Design",
                image: azhinBrandImage,
                link: "/brand/Azhin%20Art",
              },
            ].map((b) => (
              <Link
                key={b.name}
                to={b.link}
                className="group relative rounded-2xl overflow-hidden h-[320px] md:h-[380px] border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <img
                  src={b.image}
                  alt={b.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <h3
                    className="text-2xl md:text-3xl font-extrabold text-primary-foreground tracking-tight mb-2"
                    style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
                  >
                    {b.name}
                  </h3>
                  <p className="text-primary-foreground/65 text-sm md:text-base mb-4 max-w-sm">
                    {b.tagline}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-foreground group-hover:gap-2.5 transition-all">
                    Explore Brand <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── More Categories ─── */}
      <section className="container py-20 md:py-28">
        <div className="text-center mb-14">
          <span className="tagline-pill mb-4">Explore More</span>
          <h2 className="section-header">
            More to Explore
          </h2>
          <p className="section-subheader">Browse our full range of departments</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
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
                  wrapperClassName="aspect-[3/4]"
                />
              ) : (
                <div className="aspect-[3/4] bg-secondary flex items-center justify-center text-muted-foreground">
                  <span className="text-5xl opacity-20">📦</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/75 to-transparent p-6 pt-16">
                <h3 className="font-bold text-primary-foreground text-xl">{cat.name}</h3>
                <span className="text-sm text-primary-foreground/70 flex items-center gap-1 mt-1.5 group-hover:gap-2 transition-all">
                  {t("common.shopNow")} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Trending Products ─── */}
      <section className="bg-secondary/40">
        <div className="container py-20 md:py-28">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="tagline-pill mb-4">What's Hot</span>
              <h2 className="section-header">
                {t("home.trendingNow")}
              </h2>
              <p className="section-subheader mb-0">See what's popular right now</p>
            </div>
            <Link to="/trending" className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
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

      {/* ─── Bottom CTA Band ─── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(215 35% 25%) 100%)' }}>
        <div className="container py-24 md:py-32 text-center relative z-10">
          <span className="tagline-pill mb-6 border-primary-foreground/20 text-primary-foreground/70 backdrop-blur-md bg-primary-foreground/10">
            Join 5,000+ Sellers
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary-foreground mb-5 leading-[1.08]"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
          >
            Start Selling on Dukanly
          </h2>
          <p className="text-primary-foreground/60 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Reach thousands of customers across Kurdistan and Iraq. Set up your store in minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/sell" className="btn-cta px-12 py-4 text-base inline-flex items-center gap-2.5 group">
              Get Started Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </Link>
            <Link to="/help" className="hero-secondary-link">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
