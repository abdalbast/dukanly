export type AppLanguage = "en" | "ckb";

function isKurdishLocale(locale: string) {
  const normalized = locale.toLowerCase();
  return normalized.startsWith("ckb") || normalized.startsWith("ku");
}

export function detectPreferredLanguage(): AppLanguage {
  if (typeof navigator === "undefined") return "en";

  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  return candidates.some(isKurdishLocale) ? "ckb" : "en";
}

export function getCurrentLanguage(): AppLanguage {
  if (typeof document === "undefined") return "en";
  return document.documentElement.lang === "ckb" ? "ckb" : "en";
}

export function getNumberLocale(language: AppLanguage = getCurrentLanguage()) {
  return language === "ckb"
    ? ["ckb-IQ", "ku-Arab-IQ", "ar-IQ", "en-IQ"]
    : ["en-IQ", "en-US"];
}

export function getDateLocale(language: AppLanguage = getCurrentLanguage()) {
  return getNumberLocale(language);
}
