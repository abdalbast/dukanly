import { Layout } from "@/components/Layout";
import { useLanguage } from "@/i18n/LanguageContext";

export default function TermsPage() {
  const { t } = useLanguage();
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto prose prose-sm dark:prose-invert">
          <h1 className="text-3xl font-bold mb-6">{t("terms.title")}</h1>
          <p className="text-muted-foreground mb-8">{t("terms.lastUpdated")}</p>
          <section className="mb-8"><h2 className="text-xl font-semibold mb-4">{t("terms.section1Title")}</h2><p className="text-muted-foreground">{t("terms.section1Text")}</p></section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("terms.section2Title")}</h2>
            <p className="text-muted-foreground mb-4">{t("terms.section2Text")}</p>
            <p className="text-muted-foreground">{t("terms.section2Agree")}</p>
            <ul className="list-disc pl-6 rtl:pr-6 rtl:pl-0 text-muted-foreground space-y-1 mt-2">
              {[t("terms.section2Item1"), t("terms.section2Item2"), t("terms.section2Item3"), t("terms.section2Item4"), t("terms.section2Item5")].map((i) => <li key={i}>{i}</li>)}
            </ul>
          </section>
          {[
            { title: t("terms.section3Title"), text: t("terms.section3Text") },
            { title: t("terms.section4Title"), text: t("terms.section4Text1") },
            { title: t("terms.section5Title"), text: t("terms.section5Text") },
            { title: t("terms.section6Title"), text: t("terms.section6Text") },
            { title: t("terms.section7Title"), text: t("terms.section7Text") },
            { title: t("terms.section8Title"), text: t("terms.section8Text") },
            { title: t("terms.section9Title"), text: t("terms.section9Text") },
            { title: t("terms.section10Title"), text: t("terms.section10Text") },
          ].map((s) => (
            <section key={s.title} className="mb-8"><h2 className="text-xl font-semibold mb-4">{s.title}</h2><p className="text-muted-foreground">{s.text}</p></section>
          ))}
        </div>
      </div>
    </Layout>
  );
}
