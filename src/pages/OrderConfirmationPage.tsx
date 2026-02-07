import { Link } from "react-router-dom";
import { CheckCircle, Package, Truck, Calendar } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { mockProducts } from "@/data/mockData";

export default function OrderConfirmationPage() {
  const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  const suggestedProducts = mockProducts.slice(4, 8);

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>

          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your purchase. We've received your order and will begin
            processing it right away.
          </p>

          {/* Order Details Card */}
          <div className="bg-card border border-border rounded-lg p-6 text-left mb-8">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-semibold text-lg">{orderNumber}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/orders">View Order</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Order Placed</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-sm font-medium">Shipping</p>
                  <p className="text-xs text-muted-foreground">Standard Delivery</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium">Est. Delivery</p>
                  <p className="text-xs text-muted-foreground">
                    {estimatedDelivery.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Email Notice */}
          <div className="bg-secondary/50 rounded-lg p-4 mb-8">
            <p className="text-sm">
              A confirmation email has been sent to your email address with your
              order details and tracking information.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="btn-cta">
              <Link to="/">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/orders">Track Your Order</Link>
            </Button>
          </div>
        </div>

        {/* Recommended Products */}
        <section className="mt-16">
          <h2 className="section-header text-center">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {suggestedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
