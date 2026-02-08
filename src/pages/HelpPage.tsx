import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Search,
  Package,
  Truck,
  RotateCcw,
  CreditCard,
  User,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const helpCategories = [
  { icon: Package, label: "Orders & Purchases", href: "/help/orders" },
  { icon: Truck, label: "Shipping & Delivery", href: "/help/shipping" },
  { icon: RotateCcw, label: "Returns & Refunds", href: "/returns" },
  { icon: CreditCard, label: "Payment & Gift Cards", href: "/help/payments" },
  { icon: User, label: "Account Settings", href: "/account" },
  { icon: MessageCircle, label: "Contact Us", href: "/help/contact" },
];

const faqs = [
  {
    question: "How do I track my order?",
    answer:
      "You can track your order by going to Your Orders in your account. Click on the order you want to track and you'll see the current status and tracking information if available.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Most items can be returned within 30 days of delivery for a full refund. Some categories like electronics have a 15-day return window. Items must be in original condition with all packaging.",
  },
  {
    question: "How do I cancel an order?",
    answer:
      "If your order hasn't shipped yet, you can cancel it from Your Orders page. If it has already shipped, you'll need to wait for delivery and then initiate a return.",
  },
  {
    question: "When will I receive my refund?",
    answer:
      "Refunds are typically processed within 3-5 business days after we receive your return. The refund will be credited to your original payment method.",
  },
  {
    question: "How do I change my shipping address?",
    answer:
      "You can update your shipping address in Account Settings > Addresses. For existing orders, you may be able to change the address if the order hasn't shipped yet.",
  },
  {
    question: "Do you offer free shipping?",
    answer:
      "Yes! Orders over $35 qualify for free standard shipping. Members also get free shipping on all orders.",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">How can we help you?</h1>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
          </div>

          {/* Quick Links */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Browse Help Topics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {helpCategories.map((category) => (
                <Link
                  key={category.label}
                  to={category.href}
                  className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors group"
                >
                  <category.icon className="w-8 h-8 text-primary mb-3" />
                  <p className="font-medium group-hover:text-primary transition-colors">
                    {category.label}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="bg-secondary/50 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" asChild className="justify-start">
                <Link to="/orders">
                  <Package className="w-4 h-4 mr-2" />
                  Track Package
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link to="/returns">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Start a Return
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link to="/account">
                  <User className="w-4 h-4 mr-2" />
                  Manage Account
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link to="/help/contact">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
            </div>
          </section>

          {/* FAQs */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Contact CTA */}
          <section className="mt-12 text-center bg-card border border-border rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-2">Still need help?</h2>
            <p className="text-muted-foreground mb-4">
              Our customer service team is available 24/7 to assist you.
            </p>
            <Button className="btn-cta">Contact Customer Service</Button>
          </section>
        </div>
      </div>
    </Layout>
  );
}
