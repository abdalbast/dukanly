import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, Heart, Gift, Truck, ShieldCheck, ChevronRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/CartContext";
import { ProductCard } from "@/components/ProductCard";
import { mockProducts } from "@/data/mockData";

export default function CartPage() {
  const {
    activeItems,
    savedItems,
    removeFromCart,
    updateQuantity,
    toggleSaveForLater,
    toggleGift,
    subtotal,
    itemCount,
  } = useCart();

  const shippingThreshold = 35;
  const shippingProgress = Math.min((subtotal / shippingThreshold) * 100, 100);
  const freeShipping = subtotal >= shippingThreshold;

  // Suggested products
  const suggestedProducts = mockProducts.slice(0, 4);

  if (activeItems.length === 0 && savedItems.length === 0) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-2xl font-bold mb-3">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button asChild className="btn-cta">
              <Link to="/">Continue Shopping</Link>
            </Button>

            {/* Suggested Products */}
            <div className="mt-12 text-left">
              <h2 className="section-header">You might like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {suggestedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} variant="compact" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Shipping Progress */}
            {!freeShipping && (
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-prime" />
                  <span className="text-sm font-medium">
                    Add ${(shippingThreshold - subtotal).toFixed(2)} more for{" "}
                    <span className="text-prime font-semibold">FREE Delivery</span>
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-prime transition-all duration-300"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {freeShipping && (
              <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-success">
                  You qualify for FREE Delivery!
                </span>
              </div>
            )}

            {/* Active Cart Items */}
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Price
                </span>
              </div>

              {activeItems.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link to={`/product/${item.product.id}`} className="shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-24 h-24 object-contain bg-secondary rounded"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product.id}`}
                        className="text-sm font-medium hover:text-primary line-clamp-2"
                      >
                        {item.product.title}
                      </Link>

                      {item.product.offer.stock <= 10 && (
                        <p className="text-xs text-deal mt-1">
                          Only {item.product.offer.stock} left in stock
                        </p>
                      )}

                      {item.product.isPrime && (
                        <p className="prime-badge text-xs mt-1">
                          <Truck className="w-3 h-3" />
                          FREE Delivery
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground mt-1">
                        Sold by {item.product.offer.sellerName}
                      </p>

                      {/* Gift Option */}
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <Checkbox
                          checked={item.isGift}
                          onCheckedChange={() => toggleGift(item.id)}
                        />
                        <span className="text-xs flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          This is a gift
                        </span>
                      </label>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {/* Quantity */}
                        <div className="flex items-center border border-border rounded">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1.5 hover:bg-muted"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1.5 hover:bg-muted"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-border">|</span>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-info hover:underline"
                        >
                          Delete
                        </button>

                        <span className="text-border">|</span>

                        <button
                          onClick={() => toggleSaveForLater(item.id)}
                          className="text-xs text-info hover:underline"
                        >
                          Save for later
                        </button>

                        <span className="text-border">|</span>

                        <button className="text-xs text-info hover:underline">
                          Compare with similar
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="font-bold">
                        ${(item.product.offer.price * item.quantity).toFixed(2)}
                      </p>
                      {item.product.offer.originalPrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          ${(item.product.offer.originalPrice * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-4 text-right">
                <span className="text-lg">
                  Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):{" "}
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </span>
              </div>
            </div>

            {/* Saved for Later */}
            {savedItems.length > 0 && (
              <div className="bg-card border border-border rounded-lg">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold">
                    Saved for Later ({savedItems.length} {savedItems.length === 1 ? "item" : "items"})
                  </h2>
                </div>
                <div className="divide-y divide-border">
                  {savedItems.map((item) => (
                    <div key={item.id} className="p-4 flex gap-4">
                      <Link to={`/product/${item.product.id}`} className="shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-20 h-20 object-contain bg-secondary rounded"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product.id}`}
                          className="text-sm font-medium hover:text-primary line-clamp-2"
                        >
                          {item.product.title}
                        </Link>
                        <p className="font-bold mt-1">
                          ${item.product.offer.price.toFixed(2)}
                        </p>
                        <div className="flex gap-3 mt-2">
                          <button
                            onClick={() => toggleSaveForLater(item.id)}
                            className="text-xs text-info hover:underline"
                          >
                            Move to cart
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs text-info hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-4 sticky top-24">
              {freeShipping && (
                <div className="flex items-center gap-2 text-success text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  Your order qualifies for FREE Delivery
                </div>
              )}

              <div className="text-lg">
                Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):{" "}
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox className="mt-0.5" />
                <span className="text-sm">This order contains a gift</span>
              </label>

              <Button asChild className="w-full btn-cta">
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>

              {/* Trust Signals */}
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Secure checkout
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  30-day returns on most items
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together / You Might Also Like */}
        <section className="mt-12">
          <h2 className="section-header">Customers who bought these also bought</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {suggestedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
