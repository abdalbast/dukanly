import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, RotateCcw, Truck, Clock, CheckCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ReturnsPage() {
  const { t } = useLanguage();
  const steps = [
    { icon: Package, title: t("returns.step1Title"), desc: t("returns.step1Desc") },
    { icon: RotateCcw, title: t("returns.step2Title"), desc: t("returns.step2Desc") },
    { icon: Truck, title: t("returns.step3Title"), desc: t("returns.step3Desc") },
    { icon: CheckCircle, title: t("returns.step4Title"), desc: t("returns.step4Desc") },
  ];

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{t("returns.title")}</h1>
          <p className="text-muted-foreground mb-8">{t("returns.subtitle")}</p>
          <section className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("returns.policyTitle")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Clock, color: "bg-primary/10 text-primary", title: t("returns.30dayReturns"), desc: t("returns.30dayReturnsDesc") },
                { icon: Truck, color: "bg-success/10 text-success", title: t("returns.freeReturns"), desc: t("returns.freeReturnsDesc") },
                { icon: RotateCcw, color: "bg-info/10 text-info", title: t("returns.easyProcess"), desc: t("returns.easyProcessDesc") },
              ].map((p) => (
                <div key={p.title} className="text-center">
                  <div className={`w-16 h-16 ${p.color} rounded-full flex items-center justify-center mx-auto mb-3`}><p.icon className="w-8 h-8" /></div>
                  <h3 className="font-semibold mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6">{t("returns.howToReturn")}</h2>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0"><step.icon className="w-6 h-6 text-primary" /></div>
                    {index < steps.length - 1 && <div className="w-0.5 h-full bg-border mt-2" />}
                  </div>
                  <div className="pb-6">
                    <h3 className="font-semibold mb-1">{t("returns.step")} {index + 1}: {step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">{t("returns.windowsTitle")}</h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="text-left rtl:text-right p-4 font-semibold">{t("returns.category")}</th><th className="text-left rtl:text-right p-4 font-semibold">{t("returns.returnWindow")}</th><th className="text-left rtl:text-right p-4 font-semibold">{t("returns.conditionLabel")}</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {[
                    [t("returns.mostItems"), t("returns.days30"), t("returns.newUnused")],
                    [t("returns.electronics"), t("returns.days15"), t("returns.unopenedDefective")],
                    [t("returns.clothingShoes"), t("returns.days30"), t("returns.unwornWithTags")],
                    [t("returns.booksMedia"), t("returns.days30"), t("returns.undamagedNoMarks")],
                    [t("returns.beautyPersonalCare"), t("returns.days30"), t("returns.unopenedOnly")],
                  ].map(([cat, window, cond]) => (<tr key={cat}><td className="p-4">{cat}</td><td className="p-4">{window}</td><td className="p-4">{cond}</td></tr>))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">{t("returns.nonReturnableTitle")}</h2>
            <div className="bg-secondary/50 rounded-lg p-6">
              <p className="text-muted-foreground mb-4">{t("returns.nonReturnableText")}</p>
              <ul className="list-disc pl-6 rtl:pr-6 rtl:pl-0 text-muted-foreground space-y-1">
                {[t("returns.nonReturnItem1"), t("returns.nonReturnItem2"), t("returns.nonReturnItem3"), t("returns.nonReturnItem4"), t("returns.nonReturnItem5"), t("returns.nonReturnItem6")].map((i) => <li key={i}>{i}</li>)}
              </ul>
            </div>
          </section>
          <section className="text-center bg-card border border-border rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-2">{t("returns.readyToStart")}</h2>
            <p className="text-muted-foreground mb-4">{t("returns.goToOrdersDesc")}</p>
            <div className="flex gap-4 justify-center">
              <Button asChild className="btn-cta"><Link to="/orders">{t("returns.goToOrders")}</Link></Button>
              <Button asChild variant="outline"><Link to="/help">{t("returns.getHelp")}</Link></Button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
