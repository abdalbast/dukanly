import { useMemo } from "react";
import type { SellerAnalytics, SellerOrder, SellerProduct } from "@/types/seller";

/** Derives analytics from live order + product data — no extra DB calls needed. */
export function useSellerAnalytics(orders: SellerOrder[], products: SellerProduct[]): SellerAnalytics {
  return useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Revenue by day (last 7 days)
    const last7Days: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === dateStr);
      last7Days.push({
        date: dateStr,
        revenue: dayOrders.reduce((s, o) => s + o.total, 0),
        orders: dayOrders.length,
      });
    }

    // Top products by revenue
    const productRevenue = new Map<string, { title: string; sales: number; revenue: number }>();
    for (const order of orders) {
      for (const item of order.items) {
        const existing = productRevenue.get(item.productId) || { title: item.productTitle, sales: 0, revenue: 0 };
        existing.sales += item.quantity;
        existing.revenue += item.total;
        productRevenue.set(item.productId, existing);
      }
    }
    const topProducts = Array.from(productRevenue.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Orders by status
    const statusCounts = new Map<string, number>();
    for (const o of orders) {
      statusCounts.set(o.status, (statusCounts.get(o.status) || 0) + 1);
    }
    const ordersByStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count }));

    return {
      totalRevenue,
      totalOrders,
      totalProducts: products.length,
      averageOrderValue,
      conversionRate: 0,
      revenueChange: 0,
      ordersChange: 0,
      viewsChange: 0,
      revenueByDay: last7Days,
      topProducts,
      recentOrders: orders.slice(0, 5),
      ordersByStatus,
    };
  }, [orders, products]);
}
