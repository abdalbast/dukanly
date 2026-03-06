import { Outlet, Navigate, Link } from "react-router-dom";
import { SellerSidebar } from "./SellerSidebar";
import { useSeller } from "@/contexts/SellerContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Store, Loader2 } from "lucide-react";

export function SellerLayout() {
  const { user, loading: authLoading } = useAuth();
  const { isSeller, isSellerLoading, becomeSeller } = useSeller();
  const { t } = useLanguage();

  // Wait for auth and seller status to load
  if (authLoading || isSellerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect unauthenticated users to sign in
  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (!isSeller) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md text-center p-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-3">{t("sellerLayout.startSelling")}</h1>
          <p className="text-muted-foreground mb-6">
            {t("sellerLayout.startSellingDesc")}
          </p>
          <div className="space-y-3">
            <Button className="w-full btn-cta" onClick={becomeSeller}>
              {t("sellerLayout.becomeSeller")}
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/">{t("sellerLayout.backToShopping")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Seller Header */}
      <header className="h-16 bg-card border-b border-border flex items-center px-6">
        <Link to="/seller" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Store className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">{t("sellerLayout.sellerCentral")}</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {t("sellerLayout.needHelp")}{" "}
            <a href="#" className="text-info hover:underline">
              {t("sellerLayout.sellerSupport")}
            </a>
          </span>
        </div>
      </header>

      <div className="flex">
        <SellerSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
