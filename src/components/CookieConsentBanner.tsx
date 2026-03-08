import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, Settings } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const STORAGE_KEY = "dukanly_cookie_consent";

export function CookieConsentBanner() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const handleConsent = (value: "accepted" | "rejected") => {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6" role="dialog" aria-label={t("cookie.title")}>
      <div className="container max-w-4xl mx-auto rounded-lg border bg-card text-card-foreground shadow-lg p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Cookie className="h-6 w-6 shrink-0 text-primary" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{t("cookie.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("cookie.description")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild>
              <Link to="/privacy">
                <Settings className="h-3.5 w-3.5 mr-1" />
                {t("cookie.settings")}
              </Link>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleConsent("rejected")}>
              {t("cookie.rejectNonEssential")}
            </Button>
            <Button size="sm" onClick={() => handleConsent("accepted")}>
              {t("cookie.acceptAll")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
