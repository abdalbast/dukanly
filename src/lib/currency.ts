import { getCurrentLanguage, getNumberLocale, type AppLanguage } from "@/lib/locale";

/**
 * Identity conversion — products are stored natively in IQD.
 * Kept for backward compatibility with existing call sites.
 */
export function convertToIQD(amount: number): number {
  return Math.round(amount);
}

export function formatIQDParts(iqdAmount: number, language: AppLanguage = getCurrentLanguage()) {
  const formatter = new Intl.NumberFormat(getNumberLocale(language), {
    maximumFractionDigits: 0,
  });

  return {
    amount: formatter.format(Math.round(iqdAmount)),
    currency: language === "ckb" ? "د.ع" : "IQD",
  };
}

/** Format an IQD amount with thousand separators, e.g. "45,500 IQD". */
export function formatIQD(iqdAmount: number, language: AppLanguage = getCurrentLanguage()): string {
  const parts = formatIQDParts(iqdAmount, language);
  return `${parts.amount} ${parts.currency}`;
}

/** Free-shipping threshold in IQD */
export const FREE_SHIPPING_THRESHOLD_IQD = 45_000;
