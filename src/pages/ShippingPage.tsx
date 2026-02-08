import { Layout } from "@/components/Layout";
import { Truck, Clock, Package, MapPin } from "lucide-react";

export default function ShippingPage() {
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Shipping Rates & Policies</h1>
          <p className="text-muted-foreground mb-8">
            Learn about our shipping options, delivery times, and policies.
          </p>

          {/* Shipping Options */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6">Shipping Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Standard Shipping</h3>
                <p className="text-2xl font-bold text-primary mb-2">$4.99</p>
                <p className="text-sm text-muted-foreground">
                  5-7 business days
                </p>
                <p className="text-xs text-success mt-2">
                  FREE on orders over $35
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-info" />
                </div>
                <h3 className="font-semibold mb-2">Express Shipping</h3>
                <p className="text-2xl font-bold text-primary mb-2">$9.99</p>
                <p className="text-sm text-muted-foreground">
                  2-3 business days
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 border-prime">
                <div className="w-12 h-12 bg-prime/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-prime" />
                </div>
                <h3 className="font-semibold mb-2">Next Day Delivery</h3>
                <p className="text-2xl font-bold text-primary mb-2">$14.99</p>
                <p className="text-sm text-muted-foreground">
                  Next business day
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Order by 2pm local time
                </p>
              </div>
            </div>
          </section>

          {/* Free Shipping */}
          <section className="bg-success/10 border border-success/30 rounded-lg p-6 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Free Shipping on Orders $35+</h3>
                <p className="text-muted-foreground">
                  Spend $35 or more on eligible items and get free standard shipping. 
                  Free shipping is automatically applied at checkout when you meet the minimum.
                </p>
              </div>
            </div>
          </section>

          {/* Delivery Information */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              <div className="p-4">
                <h3 className="font-medium mb-2">Delivery Dates</h3>
                <p className="text-sm text-muted-foreground">
                  Estimated delivery dates are shown at checkout and in your order confirmation. 
                  Delivery times are calculated from the ship date, not the order date.
                </p>
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">Tracking Your Order</h3>
                <p className="text-sm text-muted-foreground">
                  Once your order ships, you'll receive a confirmation email with tracking information. 
                  You can also track your order anytime from Your Orders.
                </p>
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">Delivery Attempts</h3>
                <p className="text-sm text-muted-foreground">
                  Carriers will typically attempt delivery 2-3 times before returning the package. 
                  You can often request a specific delivery date or leave delivery instructions.
                </p>
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">Missing Packages</h3>
                <p className="text-sm text-muted-foreground">
                  If your package shows as delivered but you haven't received it, wait 48 hours 
                  as it may still be in transit. Then contact us through our Help Center.
                </p>
              </div>
            </div>
          </section>

          {/* Shipping Restrictions */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Shipping Restrictions</h2>
            <div className="bg-secondary/50 rounded-lg p-6">
              <p className="text-muted-foreground mb-4">
                Some items have shipping restrictions:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Hazardous Materials:</strong> Some items like batteries, chemicals, 
                  and aerosols may have shipping restrictions.
                </li>
                <li>
                  <strong>Oversized Items:</strong> Large items like furniture may have additional 
                  shipping fees and longer delivery times.
                </li>
                <li>
                  <strong>Temperature-Sensitive:</strong> Perishable and temperature-sensitive 
                  items may only be available with express shipping.
                </li>
                <li>
                  <strong>International:</strong> Some products cannot be shipped internationally 
                  due to regulations or seller restrictions.
                </li>
              </ul>
            </div>
          </section>

          {/* International Shipping */}
          <section>
            <h2 className="text-xl font-semibold mb-4">International Shipping</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">We Ship to 190+ Countries</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    International shipping rates and delivery times vary by destination. 
                    Import duties and taxes may apply and are the responsibility of the recipient.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Shipping options and prices are displayed at checkout based on your delivery address.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
