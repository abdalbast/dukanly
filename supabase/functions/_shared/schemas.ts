import { z } from "npm:zod@3.23.8";

const id = z.string().min(1).max(128);
const currencyCode = z.string().length(3).transform((v) => v.toUpperCase());

export const checkoutSchema = z.object({
  cartId: id,
  shippingAddressId: id,
  billingAddressId: id.optional(),
  paymentMethod: z.enum(["fib", "cod"]),
  deliveryOption: z.enum(["standard", "express", "next-day"]),
  currencyCode,
  clientTotal: z.number().nonnegative(),
  regionCode: z.string().min(2).max(16).default("KRD"),
  countryCode: z.string().min(2).max(2).transform((v) => v.toUpperCase()).default("IQ"),
  customerPhone: z.string().min(5).max(40).optional(),
  description: z.string().max(50).optional(),
  lineItems: z.array(
    z.object({
      productRef: z.string().min(1).max(128),
      title: z.string().min(1).max(300),
      quantity: z.number().int().positive(),
      unitPrice: z.number().nonnegative(),
      currencyCode,
    }),
  ).min(1),
});

export const createOrderSchema = z.object({
  sourceCartId: id,
  shippingAddressId: id,
  billingAddressId: id.optional(),
  currencyCode,
  note: z.string().max(500).optional(),
});

export const sellerProductUpsertSchema = z.object({
  sku: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  currencyCode,
  basePrice: z.number().nonnegative(),
});

export const sellerOrderUpdateSchema = z.object({
  orderId: id,
  status: z.enum(["confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]),
  fulfillmentStatus: z.enum(["unfulfilled", "partial", "fulfilled", "returned"]).optional(),
  trackingNumber: z.string().max(120).optional(),
});

export const paymentStatusSchema = z.object({
  orderId: id,
});

export const paymentSupportQuerySchema = z.object({
  orderId: id.optional(),
  providerPaymentId: z.string().min(1).max(200).optional(),
}).refine((value) => Boolean(value.orderId || value.providerPaymentId), {
  message: "orderId or providerPaymentId is required",
});

export const fibCallbackSchema = z.object({
  id: z.string().min(1).max(200),
  status: z.enum(["PAID", "UNPAID", "DECLINED"]),
});

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
});
