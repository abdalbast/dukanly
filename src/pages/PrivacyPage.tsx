import { Layout } from "@/components/Layout";
import { useLanguage } from "@/i18n/LanguageContext";

export default function PrivacyPage() {
  const { t } = useLanguage();
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto prose prose-sm dark:prose-invert">
          <h1 className="text-3xl font-bold mb-6">{t("privacy.title")}</h1>
          <p className="text-muted-foreground mb-8">{t("privacy.lastUpdated")}</p>
          {[
            { title: t("privacy.section1Title"), text: t("privacy.section1Text"), subtitle: t("privacy.section1Subtitle"), items: [t("privacy.section1Item1"), t("privacy.section1Item2"), t("privacy.section1Item3"), t("privacy.section1Item4"), t("privacy.section1Item5")] },
            { title: t("privacy.section2Title"), text: t("privacy.section2Text"), items: [t("privacy.section2Item1"), t("privacy.section2Item2"), t("privacy.section2Item3"), t("privacy.section2Item4"), t("privacy.section2Item5")] },
            { title: t("privacy.section3Title"), text: t("privacy.section3Text"), items: [t("privacy.section3Item1"), t("privacy.section3Item2"), t("privacy.section3Item3"), t("privacy.section3Item4")], extra: t("privacy.section3NoSell") },
            { title: t("privacy.section4Title"), text: t("privacy.section4Text") },
            { title: t("privacy.section5Title"), text: t("privacy.section5Text") },
            { title: t("privacy.section6Title"), text: t("privacy.section6Text"), items: [t("privacy.section6Item1"), t("privacy.section6Item2"), t("privacy.section6Item3"), t("privacy.section6Item4"), t("privacy.section6Item5")] },
            { title: t("privacy.section7Title"), text: t("privacy.section7Text") },
            { title: t("privacy.section8Title"), text: t("privacy.section8Text") },
          ].map((s) => (
            <section key={s.title} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{s.title}</h2>
              <p className="text-muted-foreground mb-4">{s.text}</p>
              {s.subtitle && <h3 className="font-medium mb-2">{s.subtitle}</h3>}
              {s.items && <ul className="list-disc pl-6 rtl:pr-6 rtl:pl-0 text-muted-foreground space-y-1">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>}
              {s.extra && <p className="text-muted-foreground mt-4">{s.extra}</p>}
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}
