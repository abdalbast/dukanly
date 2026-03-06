import { getCurrentLanguage, getNumberLocale, type AppLanguage } from "@/lib/locale";

export const EXCHANGE_RATE_USD_TO_IQD = 1300;

/** Convert a USD amount to IQD (whole dinars). */
export function convertToIQD(usdAmount: number): number {
  return Math.round(usdAmount * EXCHANGE_RATE_USD_TO_IQD);
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

/** Convert USD → IQD and format in one step. */
export function formatUSDasIQD(usdAmount: number, language: AppLanguage = getCurrentLanguage()): string {
  return formatIQD(convertToIQD(usdAmount), language);
}

/** Free-shipping threshold in IQD */
export const FREE_SHIPPING_THRESHOLD_IQD = 45_000;
export const FREE_SHIPPING_THRESHOLD_USD = FREE_SHIPPING_THRESHOLD_IQD / EXCHANGE_RATE_USD_TO_IQD;
