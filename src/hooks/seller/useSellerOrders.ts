import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { updateSellerOrder } from "@/lib/writeApi";
import type { SellerOrder } from "@/types/seller";

export function useSellerOrders(sellerId: string | null) {
  const [orders, setOrders] = useState<SellerOrder[]>([]);

  useEffect(() => {
    if (!sellerId) return;

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          id, quantity, unit_price, line_total, order_id, product_id,
          products (id, title, images),
          orders (id, order_number, user_id, status, fulfillment_status, payment_status, total_amount, shipping_amount, tax_amount, subtotal_amount, currency_code, created_at, updated_at)
        `)
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (error || !data) return;

      const orderMap = new Map<string, SellerOrder>();
      for (const item of data as unknown as Array<{
        id: string; quantity: number; unit_price: number; line_total: number;
        order_id: string; product_id: string;
        products: { id: string; title: string; images: string[] } | null;
        orders: {
          id: string; order_number: string; user_id: string; status: string;
          fulfillment_status: string; payment_status: string; total_amount: number;
          shipping_amount: number; tax_amount: number; subtotal_amount: number;
          currency_code: string; created_at: string; updated_at: string;
        } | null;
      }>) {
        if (!item.orders) continue;
        const ord = item.orders;

        if (!orderMap.has(ord.id)) {
          const statusMap: Record<string, SellerOrder["status"]> = {
            pending: "pending", processing: "processing", shipped: "shipped",
            delivered: "delivered", cancelled: "cancelled",
          };
          const fulfillmentMap: Record<string, SellerOrder["fulfillmentStatus"]> = {
            unfulfilled: "unfulfilled", partial: "partial", fulfilled: "fulfilled",
          };
          const paymentMap: Record<string, SellerOrder["paymentStatus"]> = {
            pending: "pending", paid: "paid", refunded: "refunded",
          };

          orderMap.set(ord.id, {
            id: ord.id,
            orderNumber: ord.order_number,
            sellerId: sellerId!,
            customerId: ord.user_id,
            customerName: "Customer",
            customerEmail: "",
            items: [],
            subtotal: Number(ord.subtotal_amount) || 0,
            shippingCost: Number(ord.shipping_amount) || 0,
            tax: Number(ord.tax_amount) || 0,
            total: Number(ord.total_amount) || 0,
            status: statusMap[ord.status] ?? "pending",
            fulfillmentStatus: fulfillmentMap[ord.fulfillment_status] ?? "unfulfilled",
            paymentStatus: paymentMap[ord.payment_status] ?? "pending",
            shippingAddress: { name: "", street: "", city: "", state: "", zip: "", country: "" },
            shippingMethod: "Standard",
            createdAt: ord.created_at,
            updatedAt: ord.updated_at,
          });
        }

        const order = orderMap.get(ord.id)!;
        order.items.push({
          id: item.id,
          productId: item.product_id,
          productTitle: item.products?.title ?? "Product",
          productImage: (item.products?.images as string[])?.[0] ?? "/placeholder.svg",
          quantity: item.quantity,
          price: Number(item.unit_price),
          total: Number(item.line_total) || Number(item.unit_price) * item.quantity,
        });
      }

      setOrders(Array.from(orderMap.values()));
    };

    fetchOrders();
  }, [sellerId]);

  const updateOrderStatus = useCallback(async (id: string, status: SellerOrder["status"]) => {
    const writeStatus = status === "pending" ? "confirmed" : status;
    const write = await updateSellerOrder({
      orderId: id,
      status: writeStatus as "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded",
    });
    if (!write.ok) throw new Error(write.failure?.message ?? "Failed to update order.");
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o));
  }, []);

  const updateFulfillmentStatus = useCallback(
    async (id: string, fulfillmentStatus: SellerOrder["fulfillmentStatus"], trackingNumber?: string) => {
      const nextStatus: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" =
        fulfillmentStatus === "fulfilled" ? "shipped" : "processing";
      const write = await updateSellerOrder({ orderId: id, status: nextStatus, fulfillmentStatus, trackingNumber });
      if (!write.ok) throw new Error(write.failure?.message ?? "Failed to update fulfillment.");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, fulfillmentStatus, trackingNumber: trackingNumber || o.trackingNumber, status: fulfillmentStatus === "fulfilled" ? "shipped" : o.status, updatedAt: new Date().toISOString() }
            : o,
        ),
      );
    },
    [],
  );

  return { orders, updateOrderStatus, updateFulfillmentStatus };
}
