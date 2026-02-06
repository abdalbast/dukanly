import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Heart, Share2, Truck, Shield, RotateCcw, Store, Check, Minus, Plus } from "lucide-react";
import { Layout } from "@/components/Layout";
import { StarRating } from "@/components/StarRating";
import { PriceDisplay } from "@/components/PriceDisplay";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { getProductById, mockProducts } from "@/data/mockData";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();

  const product = id ? getProductById(id) : undefined;

  if (!product) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link to="/" className="text-info hover:underline">
            Return to Home
          </Link>
        </div>
      </Layout>
    );
  }

  const { offer } = product;
  const relatedProducts = mockProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 5);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    // Navigate to checkout
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container py-2">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/category/${product.category}`} className="capitalize">
              {product.category}
            </Link>
            {product.subcategory && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link
                  to={`/category/${product.category}/${product.subcategory}`}
                  className="capitalize"
                >
                  {product.subcategory}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground truncate max-w-xs">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Product Images */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="aspect-square bg-secondary rounded flex items-center justify-center mb-4">
                  <img
                    src={product.images[selectedImage]}
                    alt={product.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-16 h-16 rounded border-2 overflow-hidden ${
                          selectedImage === idx
                            ? "border-primary"
                            : "border-border"
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-4">
            <div className="space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.isBestSeller && (
                  <span className="bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded">
                    Best Seller
                  </span>
                )}
                {product.isLimitedDeal && (
                  <span className="deal-badge">Limited Time Deal</span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl font-medium leading-snug">{product.title}</h1>

              {/* Brand */}
              <p className="text-sm">
                Visit the{" "}
                <Link to={`/brand/${product.brand}`} className="text-info hover:underline">
                  {product.brand} Store
                </Link>
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-info">{product.rating.toFixed(1)}</span>
                <StarRating rating={product.rating} size="sm" />
                <Link to="#reviews" className="text-sm text-info hover:underline">
                  {product.reviewCount.toLocaleString()} ratings
                </Link>
              </div>

              <hr className="border-border" />

              {/* Price */}
              <div>
                <PriceDisplay
                  price={offer.price}
                  originalPrice={offer.originalPrice}
                  size="xl"
                />
                {product.isPrime && (
                  <div className="prime-badge mt-2">
                    <Truck className="w-4 h-4" />
                    <span>FREE delivery</span>
                    <span className="font-normal text-muted-foreground">
                      {offer.deliveryDays <= 1
                        ? "Tomorrow"
                        : offer.deliveryDays <= 2
                        ? "in 2 days"
                        : `in ${offer.deliveryDays} days`}
                    </span>
                  </div>
                )}
              </div>

              <hr className="border-border" />

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">About this item</h3>
                <p className="text-dense text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>

          {/* Buy Box */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg border border-border p-4 space-y-4 sticky top-24">
              <PriceDisplay price={offer.price} originalPrice={offer.originalPrice} size="lg" />

              {product.isPrime && (
                <div className="prime-badge text-sm">
                  <Truck className="w-4 h-4" />
                  <span>FREE delivery {offer.deliveryDays <= 2 ? "Tomorrow" : `in ${offer.deliveryDays} days`}</span>
                </div>
              )}

              {/* Stock */}
              <p className={`text-sm font-semibold ${offer.stock > 10 ? "text-success" : "text-deal"}`}>
                {offer.stock > 10 ? "In Stock" : `Only ${offer.stock} left in stock`}
              </p>

              {/* Quantity */}
              <div className="flex items-center gap-3">
                <span className="text-sm">Qty:</span>
                <div className="flex items-center border border-border rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-muted"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-1 text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(offer.stock, quantity + 1))}
                    className="p-2 hover:bg-muted"
                    disabled={quantity >= offer.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button onClick={handleAddToCart} className="w-full btn-cta">
                  Add to Cart
                </Button>
                <Button onClick={handleBuyNow} variant="outline" className="w-full">
                  Buy Now
                </Button>
              </div>

              {/* Seller Info */}
              <div className="text-dense text-muted-foreground space-y-1 pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span>Ships from</span>
                  <span className="text-foreground">{offer.sellerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sold by</span>
                  <Link to={`/seller/${offer.sellerId}`} className="text-info hover:underline">
                    {offer.sellerName}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span>Condition</span>
                  <span className="text-foreground capitalize">{offer.condition}</span>
                </div>
              </div>

              {/* Additional Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" className="flex-1 text-xs">
                  <Heart className="w-4 h-4 mr-1" />
                  Add to List
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-xs">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="space-y-2 pt-2 border-t border-border text-dense text-muted-foreground">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-success" />
                  <span>30-Day Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-info" />
                  <span>Secure transaction</span>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  <span>Eligible for Buyer Protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="section-header">Customers also viewed</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
