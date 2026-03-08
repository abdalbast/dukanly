import { useParams, Link } from "react-router-dom";

import { ArrowRight, Leaf, Heart, MapPin, Recycle, Paintbrush, Gem, Award, Sparkles } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import { useSearchProducts } from "@/hooks/useProducts";

import pelinHeroImage from "@/assets/pelin/0T7A0070.webp";
import azhinHeroImage from "@/assets/brands/azhin-art-hero.jpg";

interface BrandInfo {
  name: string;
  tagline: string;
  description: string;
  story: string;
  heroImage: string;
  features: { icon: React.ElementType; title: string; description: string }[];
}

const BRAND_DATA: Record<string, BrandInfo> = {
  "pelin products": {
    name: "Pelin Products",
    tagline: "Pure Botanicals, Handcrafted in Kurdistan",
    description:
      "Born in the heart of Kurdistan, Pelin Products creates luxurious handcrafted skincare using locally sourced botanicals and time-honoured recipes passed down through generations.",
    story:
      "Every bar of soap, every cleanser, and every gift set is carefully crafted by hand using 100% natural ingredients — from cold-pressed olive oil to wildcrafted herbs. We believe in beauty that's gentle on your skin and kind to the earth.",
    heroImage: pelinHeroImage,
    features: [
      { icon: Leaf, title: "100% Natural", description: "Pure botanical ingredients with zero synthetic additives" },
      { icon: Heart, title: "Handcrafted with Care", description: "Small-batch production ensures artisan quality in every piece" },
      { icon: MapPin, title: "Locally Sourced", description: "Ingredients harvested from Kurdistan's rich natural landscape" },
      { icon: Recycle, title: "Eco-Friendly Packaging", description: "Minimal, recyclable packaging that respects our planet" },
    ],
  },
  "azhin art": {
    name: "Azhin Art",
    tagline: "The Art of Self-Improvement",
    description:
      "For Azhin Ehwen Horami, creativity is more than a hobby—it is a way of life. As a music undergraduate and a visual artist, Azhin lives at the intersection where the soul and profession meet. Her journey is defined by the belief that while your profession may take one form of art, your soul often speaks through another.",
    story:
      "The Azhinart brand was born from a personal creative journey that embraces every color of life. After rediscovering her own light within art, Azhin began sharing her world with a global community, spanning from Slemany and Kurdistan to the USA and Germany. Her story is rooted in the philosophy that art is a powerful tool for self-improvement and therapy, helping to turn bad habits into good ones and finding beauty in the pleasure of being an artist.\n\nCentral to the Azhinart mission is the concept of \"You vs. You\". The brand represents the discipline required to protect your plans and the patience to wait for your future to unfold. It is a celebration of the colorful journey of your 20s, grounded in the belief that God's plans are more beautiful than yours.\n\nEvery piece shared by Azhinart is a testament to the idea that we are what we put into our bodies and souls. This shop is an extension of that artistry—a place where the discipline of a student and the passion of a creator combine to help you win with your art and live in your own unique way.\n\n\"Try everything; at least the journey is colorful!\"",
    heroImage: azhinHeroImage,
    features: [
      { icon: Paintbrush, title: "Handmade Originals", description: "Every piece is one-of-a-kind, crafted entirely by hand" },
      { icon: Award, title: "Cultural Heritage", description: "Designs inspired by centuries of Kurdish artistic tradition" },
      { icon: Gem, title: "Premium Materials", description: "Finest quality materials sourced for lasting beauty" },
      { icon: Sparkles, title: "Limited Editions", description: "Small runs ensure exclusivity and collectible value" },
    ],
  },
};

export default function BrandPage() {
  const { brand } = useParams<{ brand: string }>();
  const brandSlug = (brand ?? "").toLowerCase();
  const brandInfo = BRAND_DATA[brandSlug];

  const { data: products = [], isLoading } = useSearchProducts(brand ?? "");
  const brandProducts = products.filter(
    (p) => p.brand.toLowerCase() === brandSlug,
  );

  if (!brandInfo) {
    return (
      <Layout>
        <div className="container py-28 text-center">
          <h1 className="text-3xl font-bold mb-4">Brand not found</h1>
          <Link to="/" className="text-primary hover:underline">
            Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ─── Hero Banner ─── */}
      <section className="relative h-[420px] sm:h-[500px] md:h-[560px] overflow-hidden">
        <img
          src={brandInfo.heroImage}
          alt={brandInfo.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/65 to-foreground/30" />
        <div className="container relative h-full flex items-center">
          <div className="max-w-2xl">
            <span className="tagline-pill mb-5">Featured Brand</span>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-primary-foreground leading-[1.04] mb-4 sm:mb-6"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
            >
              {brandInfo.name}
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/70 max-w-lg leading-relaxed">
              {brandInfo.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Brand Story ─── */}
      <section className="bg-card border-b border-border">
        <div className="container py-20 md:py-28">
          {(() => {
            const storyParagraphs = brandInfo.story.split("\n\n");
            const lastPara = storyParagraphs[storyParagraphs.length - 1];
            const isQuote = lastPara.startsWith('"') || lastPara.startsWith('\u201C');
            const bodyParagraphs = isQuote ? storyParagraphs.slice(0, -1) : storyParagraphs;
            const pullQuote = isQuote ? lastPara : null;
            const isLong = brandInfo.story.length > 200;

            return (
              <div className={isLong ? "grid md:grid-cols-5 gap-12 md:gap-16 items-start" : "max-w-3xl mx-auto text-center"}>
                {/* Left / Intro column */}
                <div className={isLong ? "md:col-span-2 md:sticky md:top-28" : ""}>
                  <span className="tagline-pill mb-4">Our Story</span>
                  <h2 className="section-header">{brandInfo.name}</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed mt-6">
                    {brandInfo.description}
                  </p>
                  {pullQuote && isLong && (
                    <blockquote className="mt-10 border-l-4 border-primary pl-6 py-2">
                      <p className="text-xl md:text-2xl font-semibold italic text-foreground/80 leading-snug">
                        {pullQuote}
                      </p>
                    </blockquote>
                  )}
                </div>

                {/* Right / Story column */}
                <div className={isLong ? "md:col-span-3 space-y-5" : "mt-8 space-y-5"}>
                  {bodyParagraphs.map((para, i) => {
                    // Detect section headings (short lines without periods)
                    const isHeading = para.length < 60 && !para.includes(".");
                    return isHeading ? (
                      <h3 key={i} className="text-lg font-bold text-foreground mt-8 first:mt-0">
                        {para}
                      </h3>
                    ) : (
                      <p key={i} className="text-muted-foreground leading-relaxed">
                        {para}
                      </p>
                    );
                  })}
                  {pullQuote && !isLong && (
                    <blockquote className="mt-8 border-l-4 border-primary pl-6 py-2">
                      <p className="text-xl font-semibold italic text-foreground/80 leading-snug">
                        {pullQuote}
                      </p>
                    </blockquote>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ─── Separator ─── */}
          <div className="flex items-center gap-4 my-16 md:my-20">
            <div className="flex-1 h-px bg-border" />
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* ─── Standout Features ─── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {brandInfo.features.map((f) => (
              <div
                key={f.title}
                className="relative flex flex-col items-center text-center gap-4 p-6 pt-8 rounded-2xl bg-secondary/50 border border-border/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-primary/60 rounded-t-2xl" />
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <f.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">{f.title}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Products ─── */}
      <section className="container py-20 md:py-28">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="tagline-pill mb-4">Collection</span>
            <h2 className="section-header">
              Shop {brandInfo.name}
            </h2>
            <p className="section-subheader mb-0">
              Explore the full range of products
            </p>
          </div>
        </div>
        {isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : brandProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {brandProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No products available yet. Check back soon!</p>
          </div>
        )}
      </section>
    </Layout>
  );
}
