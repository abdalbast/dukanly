import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Globe, Shield, Truck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <Layout>
      <div className="container py-14 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="page-title text-4xl mb-5">{t("about.title")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t("about.subtitle")}</p>
          </div>
          <section className="mb-14">
            <h2 className="section-header text-2xl mb-5">{t("about.ourMission")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("about.missionText")}</p>
          </section>
          <section className="mb-14">
            <h2 className="section-header text-2xl mb-8">{t("about.ourValues")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Users, color: "bg-primary/10 text-primary", title: t("about.customerObsession"), desc: t("about.customerObsessionDesc") },
                { icon: Globe, color: "bg-success/10 text-success", title: t("about.thinkBig"), desc: t("about.thinkBigDesc") },
                { icon: Shield, color: "bg-info/10 text-info", title: t("about.earnTrust"), desc: t("about.earnTrustDesc") },
                { icon: Truck, color: "bg-prime/10 text-prime", title: t("about.deliverResults"), desc: t("about.deliverResultsDesc") },
              ].map((v) => (
                <div key={v.title} className="premium-card p-6">
                  <div className={`w-12 h-12 ${v.color} rounded-xl flex items-center justify-center mb-4`}><v.icon className="w-6 h-6" /></div>
                  <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="bg-secondary/50 rounded-2xl p-10 mb-14">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">{t("about.growingMarketplace")}</p>
              <p className="text-sm text-muted-foreground">{t("about.growingMarketplaceDesc")}</p>
            </div>
          </section>
          <section className="text-center">
            <h2 className="section-header text-2xl mb-5">{t("about.readyToStart")}</h2>
            <p className="text-muted-foreground mb-8">{t("about.joinMillions")}</p>
            <div className="flex gap-4 justify-center">
              <Button asChild className="btn-cta"><Link to="/">{t("common.startShopping")}</Link></Button>
              <Button asChild variant="outline" className="rounded-full"><Link to="/seller">{t("about.becomeSeller")}</Link></Button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
