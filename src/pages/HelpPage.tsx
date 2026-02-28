import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Package, Truck, RotateCcw, CreditCard, User, MessageCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/i18n/LanguageContext";

export default function HelpPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const helpCategories = [
    { icon: Package, label: t("help.ordersAndPurchases"), href: "/help/orders" },
    { icon: Truck, label: t("help.shippingAndDelivery"), href: "/help/shipping" },
    { icon: RotateCcw, label: t("help.returnsAndRefunds"), href: "/returns" },
    { icon: CreditCard, label: t("help.paymentAndGiftCards"), href: "/help/payments" },
    { icon: User, label: t("help.accountSettings"), href: "/account" },
    { icon: MessageCircle, label: t("help.contactUs"), href: "/help/contact" },
  ];

  const faqs = [
    { q: t("help.faq1q"), a: t("help.faq1a") },
    { q: t("help.faq2q"), a: t("help.faq2a") },
    { q: t("help.faq3q"), a: t("help.faq3a") },
    { q: t("help.faq4q"), a: t("help.faq4a") },
    { q: t("help.faq5q"), a: t("help.faq5a") },
    { q: t("help.faq6q"), a: t("help.faq6a") },
  ];

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">{t("help.title")}</h1>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input type="search" placeholder={t("help.searchPlaceholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 rtl:pl-4 rtl:pr-12 h-12 text-lg" />
            </div>
          </div>
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">{t("help.browseTopics")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {helpCategories.map((category) => (
                <Link key={category.label} to={category.href} className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors group">
                  <category.icon className="w-8 h-8 text-primary mb-3" />
                  <p className="font-medium group-hover:text-primary transition-colors">{category.label}</p>
                </Link>
              ))}
            </div>
          </section>
          <section className="bg-secondary/50 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-semibold mb-4">{t("help.quickActions")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" asChild className="justify-start"><Link to="/orders"><Package className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />{t("help.trackPackage")}</Link></Button>
              <Button variant="outline" asChild className="justify-start"><Link to="/returns"><RotateCcw className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />{t("help.startReturn")}</Link></Button>
              <Button variant="outline" asChild className="justify-start"><Link to="/account"><User className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />{t("help.manageAccount")}</Link></Button>
              <Button variant="outline" asChild className="justify-start"><Link to="/help/contact"><MessageCircle className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />{t("help.contactSupport")}</Link></Button>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-4">{t("help.faq")}</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left rtl:text-right">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
          <section className="mt-12 text-center bg-card border border-border rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-2">{t("help.stillNeedHelp")}</h2>
            <p className="text-muted-foreground mb-4">{t("help.customerService247")}</p>
            <Button className="btn-cta">{t("help.contactCustomerService")}</Button>
          </section>
        </div>
      </div>
    </Layout>
  );
}
