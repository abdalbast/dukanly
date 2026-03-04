export const EXCHANGE_RATE_USD_TO_IQD = 1300;

/** Convert a USD amount to IQD (whole dinars). */
export function convertToIQD(usdAmount: number): number {
  return Math.round(usdAmount * EXCHANGE_RATE_USD_TO_IQD);
}

/** Format an IQD amount with thousand separators, e.g. "45,500 IQD". */
export function formatIQD(iqdAmount: number): string {
  return `${iqdAmount.toLocaleString()} IQD`;
}

/** Convert USD → IQD and format in one step. */
export function formatUSDasIQD(usdAmount: number): string {
  return formatIQD(convertToIQD(usdAmount));
}

/** Free-shipping threshold in IQD */
export const FREE_SHIPPING_THRESHOLD_IQD = 45_000;
export const FREE_SHIPPING_THRESHOLD_USD = FREE_SHIPPING_THRESHOLD_IQD / EXCHANGE_RATE_USD_TO_IQD;
