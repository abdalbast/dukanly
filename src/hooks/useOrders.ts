import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OrderItem {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: OrderItem[];
}

export function useOrders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async (): Promise<Order[]> => {
      if (!user) return [];

      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at,
          order_items (
            id,
            quantity,
            unit_price,
            product_id,
            products (
              id,
              title,
              images
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!orders) return [];

      return (orders as unknown as Array<{
        id: string;
        order_number: string;
        status: string;
        total_amount: number;
        created_at: string;
        order_items: Array<{
          id: string;
          quantity: number;
          unit_price: number;
          product_id: string;
          products: { id: string; title: string; images: string[] } | null;
        }>;
      }>).map((o) => {
        const statusMap: Record<string, Order["status"]> = {
          pending: "processing",
          processing: "processing",
          shipped: "shipped",
          delivered: "delivered",
          cancelled: "cancelled",
        };

        return {
          id: o.id,
          orderNumber: o.order_number,
          date: o.created_at,
          status: statusMap[o.status] ?? "processing",
          total: Number(o.total_amount) || 0,
          items: (o.order_items ?? []).map((item) => ({
            id: item.products?.id ?? item.product_id,
            title: item.products?.title ?? "Product",
            image: (item.products?.images as string[])?.[0] ?? "/placeholder.svg",
            price: Number(item.unit_price) || 0,
            quantity: item.quantity,
          })),
        };
      });
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });
}
