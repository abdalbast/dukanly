import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, RotateCcw, Truck, Clock, CheckCircle } from "lucide-react";

export default function ReturnsPage() {
  const steps = [
    {
      icon: Package,
      title: "Start Your Return",
      description: "Go to Your Orders and select the item you want to return. Choose a reason for the return.",
    },
    {
      icon: RotateCcw,
      title: "Print Return Label",
      description: "Print the prepaid return label. Pack the item securely in its original packaging if possible.",
    },
    {
      icon: Truck,
      title: "Ship Your Return",
      description: "Drop off the package at any authorized shipping location. Keep your tracking number.",
    },
    {
      icon: CheckCircle,
      title: "Get Your Refund",
      description: "Once we receive your return, we'll process your refund within 3-5 business days.",
    },
  ];

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Returns & Replacements</h1>
          <p className="text-muted-foreground mb-8">
            We want you to be completely satisfied with your purchase. If you're not happy with your order, we're here to help.
          </p>

          {/* Return Policy Overview */}
          <section className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Our Return Policy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">30-Day Returns</h3>
                <p className="text-sm text-muted-foreground">
                  Most items can be returned within 30 days of delivery
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="w-8 h-8 text-success" />
                </div>
                <h3 className="font-semibold mb-1">Free Returns</h3>
                <p className="text-sm text-muted-foreground">
                  Prepaid return labels for eligible items
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-info/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <RotateCcw className="w-8 h-8 text-info" />
                </div>
                <h3 className="font-semibold mb-1">Easy Process</h3>
                <p className="text-sm text-muted-foreground">
                  Start your return online in just a few clicks
                </p>
              </div>
            </div>
          </section>

          {/* How to Return */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6">How to Return an Item</h2>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <h3 className="font-semibold mb-1">
                      Step {index + 1}: {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Return Categories */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Return Windows by Category</h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Category</th>
                    <th className="text-left p-4 font-semibold">Return Window</th>
                    <th className="text-left p-4 font-semibold">Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-4">Most Items</td>
                    <td className="p-4">30 days</td>
                    <td className="p-4">New, unused condition</td>
                  </tr>
                  <tr>
                    <td className="p-4">Electronics</td>
                    <td className="p-4">15 days</td>
                    <td className="p-4">Unopened or defective</td>
                  </tr>
                  <tr>
                    <td className="p-4">Clothing & Shoes</td>
                    <td className="p-4">30 days</td>
                    <td className="p-4">Unworn with tags attached</td>
                  </tr>
                  <tr>
                    <td className="p-4">Books & Media</td>
                    <td className="p-4">30 days</td>
                    <td className="p-4">Undamaged, no marks</td>
                  </tr>
                  <tr>
                    <td className="p-4">Beauty & Personal Care</td>
                    <td className="p-4">30 days</td>
                    <td className="p-4">Unopened only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Non-Returnable Items */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Non-Returnable Items</h2>
            <div className="bg-secondary/50 rounded-lg p-6">
              <p className="text-muted-foreground mb-4">
                Some items cannot be returned for safety or hygiene reasons:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Gift cards and prepaid cards</li>
                <li>Downloadable software and digital content</li>
                <li>Items marked as non-returnable on the product page</li>
                <li>Personalized or custom-made items</li>
                <li>Hazardous materials</li>
                <li>Intimate apparel (underwear, swimwear)</li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center bg-card border border-border rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-2">Ready to start a return?</h2>
            <p className="text-muted-foreground mb-4">
              Go to Your Orders to initiate a return for any eligible item.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild className="btn-cta">
                <Link to="/orders">Go to Your Orders</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/help">Get Help</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
