import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { en, TranslationKey } from "./en";
import { ckb } from "./ckb";
import { detectPreferredLanguage } from "@/lib/locale";

export type Language = "en" | "ckb";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = { en, ckb };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const storedLanguage = localStorage.getItem("lang");
    if (storedLanguage === "en" || storedLanguage === "ckb") {
      return storedLanguage;
    }

    return detectPreferredLanguage();
  });

  const dir = language === "ckb" ? "rtl" : "ltr";
  const isRTL = language === "ckb";

  useEffect(() => {
    localStorage.setItem("lang", language);
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", language === "ckb" ? "ckb" : "en");
  }, [language, dir]);

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = translations[language]?.[key] || translations.en[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
