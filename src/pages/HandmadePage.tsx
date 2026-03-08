import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Hand, Palette, Filter, ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/hooks/useProducts";
import { useLanguage } from "@/i18n/LanguageContext";

export default function HandmadePage() {
  const { t } = useLanguage();
  const { data: products, isLoading } = useProducts();
  const [artisanOnly, setArtisanOnly] = useState(false);

  const handmadeProducts = useMemo(() => {
    if (!products) return [];
    let filtered = products.filter((p) => p.isHandmade);
    if (artisanOnly) filtered = filtered.filter((p) => p.isArtisanBrand);
    return filtered;
  }, [products, artisanOnly]);

  return (
    <Layout>
      <Helmet>
        <title>{t("handmade.title")} | Dukanly</title>
        <meta name="description" content={t("handmade.description")} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-800 via-amber-700 to-yellow-600">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }} />
        </div>
        <div className="container relative py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-sm font-medium">
              <Hand className="h-4 w-4" />
              {t("handmade.tagline")}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              {t("handmade.title")}
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-xl mx-auto">
              {t("handmade.description")}
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-2">
              <Link to="/handmade/apply">
                {t("artisanApply.title")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            </p>
          </div>
        </div>
        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 60L1440 60L1440 30C1200 0 960 60 720 30C480 0 240 60 0 30L0 60Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="container py-10">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">
              {handmadeProducts.length} {t("common.products")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="artisan-toggle" className="text-sm cursor-pointer">
              {t("handmade.artisanOnly")}
            </Label>
            <Switch
              id="artisan-toggle"
              checked={artisanOnly}
              onCheckedChange={setArtisanOnly}
            />
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <ProductGridSkeleton count={8} columns="grid-cols-2 sm:grid-cols-3 md:grid-cols-4" />
        ) : handmadeProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Hand className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">{t("handmade.empty")}</h2>
            <p className="text-muted-foreground text-sm max-w-md">
              {t("handmade.emptyDescription")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {handmadeProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
