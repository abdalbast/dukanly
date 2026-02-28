import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const NotFound = () => {
  const { t } = useLanguage();
  return (
    <Layout>
      <div className="container py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-8xl font-bold text-muted-foreground/30 mb-4">404</div>
          <h1 className="text-2xl font-bold mb-3">{t("notFound.title")}</h1>
          <p className="text-muted-foreground mb-8">{t("notFound.message")}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="btn-cta"><Link to="/"><Home className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />{t("notFound.goHome")}</Link></Button>
            <Button asChild variant="outline"><Link to="/search"><Search className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />{t("notFound.searchProducts")}</Link></Button>
          </div>
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">{t("notFound.helpfulLinks")}</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/" className="text-info hover:underline">{t("common.home")}</Link>
              <Link to="/deals" className="text-info hover:underline">{t("notFound.todaysDeals")}</Link>
              <Link to="/orders" className="text-info hover:underline">{t("header.orders")}</Link>
              <Link to="/account" className="text-info hover:underline">{t("header.account")}</Link>
              <Link to="/help" className="text-info hover:underline">{t("notFound.helpCenter")}</Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
