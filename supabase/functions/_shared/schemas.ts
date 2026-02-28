import { z } from "npm:zod@3.23.8";

const uuid = z.string().uuid();

export const checkoutSchema = z.object({
  cartId: uuid,
  shippingAddressId: uuid,
  billingAddressId: uuid.optional(),
  paymentMethodId: z.string().min(1).max(128),
  deliveryOption: z.enum(["standard", "express", "next-day"]),
  currencyCode: z.string().length(3).transform((v) => v.toUpperCase()),
  clientTotal: z.number().nonnegative(),
});

export const createOrderSchema = z.object({
  sourceCartId: uuid,
  shippingAddressId: uuid,
  billingAddressId: uuid.optional(),
  currencyCode: z.string().length(3).transform((v) => v.toUpperCase()),
  note: z.string().max(500).optional(),
});

export const sellerProductUpsertSchema = z.object({
  sku: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  currencyCode: z.string().length(3).transform((v) => v.toUpperCase()),
  basePrice: z.number().nonnegative(),
});

export const sellerOrderUpdateSchema = z.object({
  orderId: uuid,
  status: z.enum(["confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]),
  fulfillmentStatus: z.enum(["unfulfilled", "partial", "fulfilled", "returned"]).optional(),
  trackingNumber: z.string().max(120).optional(),
});
