import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { 
  Store, 
  CreditCard, 
  Truck, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  ChevronRight, 
  Banknote,
  Package,
  Star,
  ArrowRight
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function SellOnDukanlyPage() {
  const { t } = useLanguage();

  const valueProps = [
    {
      icon: Users,
      title: t("sell.reachBuyers"),
      description: t("sell.reachBuyersDesc"),
    },
    {
      icon: CreditCard,
      title: t("sell.multiplePayments"),
      description: t("sell.multiplePaymentsDesc"),
    },
    {
      icon: Truck,
      title: t("sell.localDelivery"),
      description: t("sell.localDeliveryDesc"),
    },
  ];

  const steps = [
    { number: "1", title: t("sell.step1Title"), description: t("sell.step1Desc") },
    { number: "2", title: t("sell.step2Title"), description: t("sell.step2Desc") },
    { number: "3", title: t("sell.step3Title"), description: t("sell.step3Desc") },
  ];

  const feeItems = [
    { label: t("sell.feeMonthly"), value: t("sell.feeMonthlyValue") },
    { label: t("sell.feePerItem"), value: t("sell.feePerItemValue") },
    { label: t("sell.feeCommission"), value: t("sell.feeCommissionValue") },
  ];

  const testimonials = [
    { name: t("sell.testimonial1Name"), business: t("sell.testimonial1Biz"), quote: t("sell.testimonial1Quote") },
    { name: t("sell.testimonial2Name"), business: t("sell.testimonial2Biz"), quote: t("sell.testimonial2Quote") },
    { name: t("sell.testimonial3Name"), business: t("sell.testimonial3Biz"), quote: t("sell.testimonial3Quote") },
  ];

  const faqs = [
    { q: t("sell.faq1Q"), a: t("sell.faq1A") },
    { q: t("sell.faq2Q"), a: t("sell.faq2A") },
    { q: t("sell.faq3Q"), a: t("sell.faq3A") },
    { q: t("sell.faq4Q"), a: t("sell.faq4A") },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16 md:py-24">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{t("sell.heroTitle")}</h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">{t("sell.heroSubtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base font-semibold px-8">
                <Link to="/seller">{t("sell.startSelling")}<ArrowRight className="w-5 h-5 ml-2" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="#how-it-works">{t("sell.learnMore")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-card border-b border-border py-6">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">10,000+</p>
              <p className="text-sm text-muted-foreground">{t("sell.statProducts")}</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">50,000+</p>
              <p className="text-sm text-muted-foreground">{t("sell.statBuyers")}</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">3</p>
              <p className="text-sm text-muted-foreground">{t("sell.statCities")}</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">24/7</p>
              <p className="text-sm text-muted-foreground">{t("sell.statSupport")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Sell on Dukanly */}
      <section className="container py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{t("sell.whySellTitle")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {valueProps.map((prop, i) => (
            <div key={i} className="text-center p-6 bg-card border border-border rounded-xl hover:shadow-card transition-shadow">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                <prop.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{prop.title}</h3>
              <p className="text-muted-foreground text-sm">{prop.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-secondary/50 py-16">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{t("sell.howItWorksTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-6 -right-4 w-8 h-8 text-muted-foreground/30 rtl:rotate-180" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">{t("sell.pricingTitle")}</h2>
        <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">{t("sell.pricingSubtitle")}</p>
        <div className="max-w-md mx-auto bg-card border border-border rounded-xl overflow-hidden">
          {feeItems.map((item, i) => (
            <div key={i} className={`flex justify-between items-center p-4 ${i < feeItems.length - 1 ? "border-b border-border" : ""}`}>
              <span className="text-sm font-medium">{item.label}</span>
              <span className="font-semibold text-primary">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary/50 py-16">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{t("sell.successStoriesTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-accent text-accent" />)}
                </div>
                <p className="text-sm text-muted-foreground italic mb-4">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.business}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{t("sell.faqTitle")}</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="bg-card border border-border rounded-lg group">
              <summary className="p-4 font-medium cursor-pointer hover:text-primary transition-colors list-none flex items-center justify-between">
                {faq.q}
                <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-90 rtl:rotate-180 rtl:group-open:rotate-90" />
              </summary>
              <div className="px-4 pb-4 text-sm text-muted-foreground">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("sell.ctaTitle")}</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">{t("sell.ctaSubtitle")}</p>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base font-semibold px-10">
            <Link to="/seller">{t("sell.startSelling")}<ArrowRight className="w-5 h-5 ml-2" /></Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
