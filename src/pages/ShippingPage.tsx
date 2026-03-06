import { Layout } from "@/components/Layout";
import { Truck, Clock, Package, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { formatIQD } from "@/lib/currency";

export default function ShippingPage() {
  const { t } = useLanguage();
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{t("shipping.title")}</h1>
          <p className="text-muted-foreground mb-8">{t("shipping.subtitle")}</p>
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6">{t("shipping.shippingOptions")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4"><Package className="w-6 h-6 text-muted-foreground" /></div>
                <h3 className="font-semibold mb-2">{t("shipping.standardShipping")}</h3>
                <p className="text-2xl font-bold text-primary mb-2">{formatIQD(6500)}</p>
                <p className="text-sm text-muted-foreground">{t("shipping.businessDays57")}</p>
                <p className="text-xs text-success mt-2">{t("shipping.freeOnOrders35")}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4"><Truck className="w-6 h-6 text-info" /></div>
                <h3 className="font-semibold mb-2">{t("shipping.expressShipping")}</h3>
                <p className="text-2xl font-bold text-primary mb-2">{formatIQD(13000)}</p>
                <p className="text-sm text-muted-foreground">{t("shipping.businessDays23")}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 border-prime">
                <div className="w-12 h-12 bg-prime/10 rounded-lg flex items-center justify-center mb-4"><Clock className="w-6 h-6 text-prime" /></div>
                <h3 className="font-semibold mb-2">{t("shipping.nextDayDelivery")}</h3>
                <p className="text-2xl font-bold text-primary mb-2">{formatIQD(19500)}</p>
                <p className="text-sm text-muted-foreground">{t("shipping.nextBusinessDay")}</p>
                <p className="text-xs text-muted-foreground mt-2">{t("shipping.orderBy2pm")}</p>
              </div>
            </div>
          </section>
          <section className="bg-success/10 border border-success/30 rounded-lg p-6 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center shrink-0"><Truck className="w-6 h-6 text-success" /></div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{t("shipping.freeShipping35")}</h3>
                <p className="text-muted-foreground">{t("shipping.freeShipping35Desc")}</p>
              </div>
            </div>
          </section>
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">{t("shipping.deliveryInfo")}</h2>
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              {[
                { title: t("shipping.deliveryDates"), desc: t("shipping.deliveryDatesDesc") },
                { title: t("shipping.trackingOrder"), desc: t("shipping.trackingOrderDesc") },
                { title: t("shipping.deliveryAttempts"), desc: t("shipping.deliveryAttemptsDesc") },
                { title: t("shipping.missingPackages"), desc: t("shipping.missingPackagesDesc") },
              ].map((d) => (<div key={d.title} className="p-4"><h3 className="font-medium mb-2">{d.title}</h3><p className="text-sm text-muted-foreground">{d.desc}</p></div>))}
            </div>
          </section>
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">{t("shipping.restrictions")}</h2>
            <div className="bg-secondary/50 rounded-lg p-6">
              <p className="text-muted-foreground mb-4">{t("shipping.restrictionsText")}</p>
              <ul className="list-disc pl-6 rtl:pr-6 rtl:pl-0 text-muted-foreground space-y-2">
                <li><strong>{t("shipping.hazardousMaterials")}</strong> {t("shipping.hazardousDesc")}</li>
                <li><strong>{t("shipping.oversizedItems")}</strong> {t("shipping.oversizedDesc")}</li>
                <li><strong>{t("shipping.temperatureSensitive")}</strong> {t("shipping.temperatureDesc")}</li>
                <li><strong>{t("shipping.international")}</strong> {t("shipping.internationalDesc")}</li>
              </ul>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-4">{t("shipping.internationalShipping")}</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0"><MapPin className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-medium mb-2">{t("shipping.weShipTo190")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t("shipping.internationalRates")}</p>
                  <p className="text-sm text-muted-foreground">{t("shipping.optionsPricesAtCheckout")}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
