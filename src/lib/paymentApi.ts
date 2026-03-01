import {
  getPaymentStatus,
  type PaymentStatusRequest,
  type PaymentStatusResponse,
} from "@/lib/writeApi";

export { type PaymentStatusRequest, type PaymentStatusResponse };

export async function fetchPaymentStatus(payload: PaymentStatusRequest) {
  return getPaymentStatus(payload);
}
