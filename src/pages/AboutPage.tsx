import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Globe, Shield, Truck } from "lucide-react";

export default function AboutPage() {
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">About Marketplace</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're building the world's most customer-centric marketplace, where millions of buyers and sellers come together to create endless possibilities.
            </p>
          </div>

          {/* Mission */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              At Marketplace, our mission is to enable people and businesses of all sizes to thrive by providing access to the tools, services, and opportunities they need to buy, sell, and grow. We believe that commerce should be accessible to everyone, everywhere.
            </p>
          </section>

          {/* Values */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Customer Obsession</h3>
                <p className="text-sm text-muted-foreground">
                  We start with the customer and work backwards. We work vigorously to earn and keep customer trust.
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Think Big</h3>
                <p className="text-sm text-muted-foreground">
                  Thinking small is a self-fulfilling prophecy. We create and communicate a bold direction that inspires results.
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-info" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Earn Trust</h3>
                <p className="text-sm text-muted-foreground">
                  We listen attentively, speak candidly, and treat others respectfully. We benchmark ourselves against the best.
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-prime/10 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-prime" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Deliver Results</h3>
                <p className="text-sm text-muted-foreground">
                  We focus on the key inputs and deliver them with the right quality and in a timely fashion.
                </p>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-secondary/50 rounded-lg p-8 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">10M+</p>
                <p className="text-sm text-muted-foreground">Active Customers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">500K+</p>
                <p className="text-sm text-muted-foreground">Sellers Worldwide</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">50M+</p>
                <p className="text-sm text-muted-foreground">Products Listed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">190+</p>
                <p className="text-sm text-muted-foreground">Countries Served</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Join millions of customers and sellers on Marketplace today.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild className="btn-cta">
                <Link to="/">Start Shopping</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/seller">Become a Seller</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
