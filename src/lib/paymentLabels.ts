import type { TranslationKey } from "@/i18n/en";
import type { PaymentMethod, PaymentState } from "@/types/payment";

export function getPaymentMethodTranslationKey(method: PaymentMethod | null | undefined): TranslationKey {
  switch (method) {
    case "fib":
      return "payment.method.fib";
    case "cod":
      return "payment.method.cod";
    case "stripe":
      return "payment.method.stripe";
    default:
      return "payment.method.unavailable";
  }
}

export function getPaymentStateTranslationKey(state: PaymentState | string | null | undefined): TranslationKey {
  switch (state) {
    case "payment_pending":
      return "payment.state.payment_pending";
    case "payment_authorised":
      return "payment.state.payment_authorised";
    case "payment_failed":
      return "payment.state.payment_failed";
    case "payment_expired":
      return "payment.state.payment_expired";
    case "payment_cancelled":
      return "payment.state.payment_cancelled";
    case "cod_pending":
      return "payment.state.cod_pending";
    case "paid":
      return "payment.state.paid";
    default:
      return "payment.state.unavailable";
  }
}
