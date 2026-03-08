import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { 
  Store, CreditCard, Truck, Users, ChevronRight, Banknote, Package, Star, ArrowRight,
  Hand, Palette, Globe, Shield, Fingerprint, BadgeCheck, HeartHandshake
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export default function SellOnDukanlyPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const startSellingHref = user ? "/seller" : `/auth/signin?redirect=${encodeURIComponent("/seller")}`;

  const valueProps = [
    { icon: Users, title: t("sell.reachBuyers"), description: t("sell.reachBuyersDesc"), color: "bg-primary/10 text-primary" },
    { icon: CreditCard, title: t("sell.multiplePayments"), description: t("sell.multiplePaymentsDesc"), color: "bg-info/10 text-info" },
    { icon: Truck, title: t("sell.localDelivery"), description: t("sell.localDeliveryDesc"), color: "bg-prime/10 text-prime" },
  ];

  const steps = [
    { number: "1", title: t("sell.step1Title"), description: t("sell.step1Desc") },
    { number: "2", title: t("sell.step2Title"), description: t("sell.step2Desc") },
    { number: "3", title: t("sell.step3Title"), description: t("sell.step3Desc") },
  ];

  const feeItems = [
    { icon: Store, label: t("sell.feeMonthly"), value: t("sell.feeMonthlyValue") },
    { icon: Package, label: t("sell.feePerItem"), value: t("sell.feePerItemValue") },
    { icon: Banknote, label: t("sell.feeCommission"), value: t("sell.feeCommissionValue") },
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

  const stats = [
    { value: "0 IQD", label: t("sell.statProducts") },
    { value: "25+ million", label: t("sell.statBuyers") },
    { value: "13", label: t("sell.statCities") },
    { value: "24/7", label: t("sell.statSupport") },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative">
        <div
          className="h-[300px] md:h-[400px] relative overflow-hidden bg-[hsl(var(--primary))]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 70% at 70% 40%, hsl(215 45% 28% / 0.9), transparent 50%),
              radial-gradient(ellipse 60% 50% at 20% 80%, hsl(215 35% 22% / 0.7), transparent 45%),
              linear-gradient(135deg, hsl(215 30% 18%) 0%, hsl(215 25% 14%) 50%, hsl(220 30% 12%) 100%)
            `,
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/50 to-transparent rtl:bg-gradient-to-l rtl:via-primary/50" />
          <div className="container relative h-full flex items-center">
            <div className="max-w-lg text-primary-foreground">
              <h1 className="page-title text-3xl md:text-4xl text-primary-foreground mb-4">{t("sell.heroTitle")}</h1>
              <p className="text-lg text-primary-foreground/80 mb-8">{t("sell.heroSubtitle")}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={startSellingHref} className="btn-cta px-8 py-3 inline-flex items-center justify-center gap-2">
                  {t("sell.startSelling")} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                </Link>
                <a href="#how-it-works" className="hero-secondary-link">{t("sell.learnMore")}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-card border-b border-border py-6">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm font-semibold mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Sell */}
      <section className="container py-14 md:py-20">
        <div className="max-w-2xl mb-8">
          <h2 className="section-header mb-3">{t("sell.whySellTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("sell.heroSubtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {valueProps.map((prop) => (
            <div key={prop.title} className="premium-card p-6">
              <div className={`w-12 h-12 mb-4 rounded-xl ${prop.color} flex items-center justify-center`}>
                <prop.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">{prop.title}</h3>
              <p className="text-sm text-muted-foreground">{prop.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-secondary/40 py-14 md:py-20 scroll-mt-28">
        <div className="container">
          <div className="max-w-2xl mb-8">
            <h2 className="section-header mb-3">{t("sell.howItWorksTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={step.number} className="relative premium-card p-6">
                <div className="w-10 h-10 mb-4 rounded-full bg-primary text-primary-foreground text-base font-bold flex items-center justify-center">
                  {step.number}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-3 w-6 h-6 text-muted-foreground/30 rtl:rotate-180" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container py-14 md:py-20">
        <div className="max-w-2xl mb-8">
          <h2 className="section-header mb-3">{t("sell.pricingTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("sell.pricingSubtitle")}</p>
        </div>
        <div className="max-w-md premium-card overflow-hidden">
          {feeItems.map((item, i) => (
            <div key={item.label} className={`flex items-center justify-between gap-4 p-5 ${i < feeItems.length - 1 ? "border-b border-border" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-primary text-right">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary/40 py-14 md:py-20">
        <div className="container">
          <div className="max-w-2xl mb-8">
            <h2 className="section-header mb-3">{t("sell.successStoriesTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((story) => (
              <div key={story.name} className="premium-card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-accent text-accent" />)}
                </div>
                <p className="text-sm text-muted-foreground italic mb-5">"{story.quote}"</p>
                <div>
                  <p className="font-semibold text-sm">{story.name}</p>
                  <p className="text-xs text-muted-foreground">{story.business}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-14 md:py-20">
        <div className="max-w-2xl mb-8">
          <h2 className="section-header mb-3">{t("sell.faqTitle")}</h2>
        </div>
        <div className="max-w-2xl space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="premium-card group">
              <summary className="p-5 font-medium cursor-pointer hover:text-primary transition-colors list-none flex items-center justify-between">
                {faq.q}
                <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-90 rtl:rotate-180 rtl:group-open:rotate-90" />
              </summary>
              <div className="px-5 pb-5 text-sm text-muted-foreground">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-14 pb-16">
        <div className="bg-primary text-primary-foreground rounded-2xl px-8 py-12">
          <div className="max-w-lg">
            <h2 className="page-title text-3xl md:text-4xl text-primary-foreground mb-4">{t("sell.ctaTitle")}</h2>
            <p className="text-lg text-primary-foreground/80 mb-8">{t("sell.ctaSubtitle")}</p>
            <Link to={startSellingHref} className="btn-cta px-10 py-3 inline-flex items-center justify-center gap-2">
              {t("sell.startSelling")} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
