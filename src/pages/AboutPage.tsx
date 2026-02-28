import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Globe, Shield, Truck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{t("about.title")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("about.subtitle")}</p>
          </div>
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{t("about.ourMission")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("about.missionText")}</p>
          </section>
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{t("about.ourValues")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Users, color: "bg-primary/10 text-primary", title: t("about.customerObsession"), desc: t("about.customerObsessionDesc") },
                { icon: Globe, color: "bg-success/10 text-success", title: t("about.thinkBig"), desc: t("about.thinkBigDesc") },
                { icon: Shield, color: "bg-info/10 text-info", title: t("about.earnTrust"), desc: t("about.earnTrustDesc") },
                { icon: Truck, color: "bg-prime/10 text-prime", title: t("about.deliverResults"), desc: t("about.deliverResultsDesc") },
              ].map((v) => (
                <div key={v.title} className="bg-card border border-border rounded-lg p-6">
                  <div className={`w-12 h-12 ${v.color} rounded-lg flex items-center justify-center mb-4`}><v.icon className="w-6 h-6" /></div>
                  <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="bg-secondary/50 rounded-lg p-8 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { num: "10M+", label: t("about.activeCustomers") },
                { num: "500K+", label: t("about.sellersWorldwide") },
                { num: "50M+", label: t("about.productsListed") },
                { num: "190+", label: t("about.countriesServed") },
              ].map((s) => (<div key={s.label}><p className="text-3xl font-bold text-primary">{s.num}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>))}
            </div>
          </section>
          <section className="text-center">
            <h2 className="text-2xl font-bold mb-4">{t("about.readyToStart")}</h2>
            <p className="text-muted-foreground mb-6">{t("about.joinMillions")}</p>
            <div className="flex gap-4 justify-center">
              <Button asChild className="btn-cta"><Link to="/">{t("common.startShopping")}</Link></Button>
              <Button asChild variant="outline"><Link to="/seller">{t("about.becomeSeller")}</Link></Button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
