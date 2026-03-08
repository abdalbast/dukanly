import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { SellerProfile, SellerProduct, SellerOrder, SellerAnalytics, SellerSettings } from "@/types/seller";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { upsertSellerProduct, updateSellerOrder } from "@/lib/writeApi";

interface SellerContextType {
  profile: SellerProfile;
  updateProfile: (updates: Partial<SellerProfile>) => Promise<void>;
  products: SellerProduct[];
  addProduct: (product: Omit<SellerProduct, "id" | "sellerId" | "createdAt" | "updatedAt">) => Promise<void>;
  updateProduct: (id: string, updates: Partial<SellerProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  orders: SellerOrder[];
  updateOrderStatus: (id: string, status: SellerOrder["status"]) => Promise<void>;
  updateFulfillmentStatus: (id: string, status: SellerOrder["fulfillmentStatus"], trackingNumber?: string) => Promise<void>;
  settings: SellerSettings;
  updateSettings: (updates: Partial<SellerSettings>) => Promise<void>;
  analytics: SellerAnalytics;
  isSeller: boolean;
  isSellerLoading: boolean;
  becomeSeller: () => Promise<void>;
  sellerId: string | null;
}

const SellerContext = createContext<SellerContextType | undefined>(undefined);

interface DbProduct {
  id: string;
  seller_id: string;
  sku: string;
  title: string;
  description: string | null;
  status: string;
  base_price: number;
  original_price: number | null;
  brand: string | null;
  category: string | null;
  subcategory: string | null;
  images: string[];
  stock: number;
  created_at: string;
  updated_at: string;
}

function mapDbToSellerProduct(row: DbProduct): SellerProduct {
  return {
    id: row.id,
    sellerId: row.seller_id,
    title: row.title,
    description: row.description ?? "",
    images: Array.isArray(row.images) ? row.images : [],
    category: row.category ?? "",
    subcategory: row.subcategory ?? undefined,
    brand: row.brand ?? "",
    sku: row.sku,
    price: Number(row.base_price),
    compareAtPrice: row.original_price ? Number(row.original_price) : undefined,
    stock: row.stock ?? 0,
    lowStockThreshold: 20,
    status: (row.status as "active" | "draft" | "archived") ?? "draft",
    tags: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const DEFAULT_PROFILE: SellerProfile = {
  id: "",
  userId: "",
  storeName: "My Store",
  storeDescription: "",
  email: "",
  phone: "",
  address: { street: "", city: "", state: "", zip: "", country: "Iraq" },
  businessType: "individual",
  isVerified: false,
  createdAt: new Date().toISOString(),
  rating: 0,
  reviewCount: 0,
};

const DEFAULT_SETTINGS: SellerSettings = {
  notifications: { orderAlerts: true, lowStockAlerts: true, reviewAlerts: true, marketingEmails: false },
  shipping: { freeShippingThreshold: 50000, handlingTime: 2, returnPolicy: "30-day returns on all items in original condition" },
  payments: { payoutMethod: "bank", payoutSchedule: "weekly" },
};

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isSeller, setIsSeller] = useState(false);
  const [isSellerLoading, setIsSellerLoading] = useState(true);
  const [profile, setProfile] = useState<SellerProfile>(DEFAULT_PROFILE);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [settings, setSettings] = useState<SellerSettings>(DEFAULT_SETTINGS);
  const [sellerId, setSellerId] = useState<string | null>(null);

  // Compute analytics from real data
  const analytics: SellerAnalytics = useMemo(() => {
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
      conversionRate: totalOrders > 0 ? 3.2 : 0,
      revenueChange: 0,
      ordersChange: 0,
      viewsChange: 0,
      revenueByDay: last7Days,
      topProducts,
      recentOrders: orders.slice(0, 5),
      ordersByStatus,
    };
  }, [orders, products]);

  // Check seller status
  useEffect(() => {
    const checkSellerStatus = async () => {
      if (!user) {
        setIsSeller(false);
        setIsSellerLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.rpc("is_seller");
        if (error) {
          setIsSeller(false);
        } else {
          setIsSeller(!!data);
        }

        const { data: sellerData } = await supabase
          .from("sellers")
          .select("id, store_name, support_email, phone, business_type, tax_id, is_verified, payout_schedule, bank_name, bank_account_last4, created_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (sellerData) {
          setSellerId(sellerData.id);
          setProfile((prev) => ({
            ...prev,
            id: sellerData.id,
            userId: user.id,
            storeName: sellerData.store_name,
            email: sellerData.support_email || user.email || "",
            phone: sellerData.phone || "",
            businessType: (sellerData.business_type as "individual" | "business") || "individual",
            taxId: sellerData.tax_id || undefined,
            isVerified: sellerData.is_verified,
            createdAt: sellerData.created_at,
          }));
          setSettings((prev) => ({
            ...prev,
            payments: {
              ...prev.payments,
              payoutSchedule: (sellerData.payout_schedule as "daily" | "weekly" | "monthly") || "weekly",
              payoutMethod: sellerData.bank_name ? "bank" : "paypal",
              bankAccount: sellerData.bank_name
                ? { bankName: sellerData.bank_name, accountLast4: sellerData.bank_account_last4 || "" }
                : undefined,
            },
          }));
        }
      } catch {
        setIsSeller(false);
      }
      setIsSellerLoading(false);
    };

    setIsSellerLoading(true);
    checkSellerStatus();
  }, [user]);

  // Fetch seller's products
  useEffect(() => {
    if (!sellerId) return;
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setProducts((data as unknown as DbProduct[]).map(mapDbToSellerProduct));
      }
    };
    fetchProducts();
  }, [sellerId]);

  // Fetch seller's orders
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

  const updateProfile = useCallback(async (updates: Partial<SellerProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    if (sellerId) {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.storeName !== undefined) dbUpdates.store_name = updates.storeName;
      if (updates.email !== undefined) dbUpdates.support_email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.businessType !== undefined) dbUpdates.business_type = updates.businessType;
      if (updates.taxId !== undefined) dbUpdates.tax_id = updates.taxId;
      if (Object.keys(dbUpdates).length > 0) {
        await supabase.from("sellers").update(dbUpdates).eq("id", sellerId);
      }
    }
  }, [sellerId]);

  const addProduct = useCallback(
    async (product: Omit<SellerProduct, "id" | "sellerId" | "createdAt" | "updatedAt">) => {
      const write = await upsertSellerProduct({
        sku: product.sku, title: product.title, description: product.description,
        status: product.status, currencyCode: "IQD", basePrice: product.price,
      });
      if (!write.ok) throw new Error(write.failure?.message ?? "Failed to add product.");
      if (sellerId) {
        const { data } = await supabase.from("products").select("*").eq("seller_id", sellerId).order("created_at", { ascending: false });
        if (data) setProducts((data as unknown as DbProduct[]).map(mapDbToSellerProduct));
      }
    },
    [sellerId],
  );

  const updateProduct = useCallback(
    async (id: string, updates: Partial<SellerProduct>) => {
      const existing = products.find((p) => p.id === id);
      if (!existing) return;
      const merged = { ...existing, ...updates };
      const write = await upsertSellerProduct({
        sku: merged.sku, title: merged.title, description: merged.description,
        status: merged.status, currencyCode: "IQD", basePrice: merged.price,
      });
      if (!write.ok) throw new Error(write.failure?.message ?? "Failed to update product.");
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
    },
    [products],
  );

  const deleteProduct = useCallback(async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message ?? "Failed to delete product.");
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

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

  const updateSettings = useCallback(async (updates: Partial<SellerSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    if (sellerId && updates.payments) {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.payments.payoutSchedule) dbUpdates.payout_schedule = updates.payments.payoutSchedule;
      if (updates.payments.bankAccount) {
        dbUpdates.bank_name = updates.payments.bankAccount.bankName;
        dbUpdates.bank_account_last4 = updates.payments.bankAccount.accountLast4;
      }
      if (Object.keys(dbUpdates).length > 0) {
        await supabase.from("sellers").update(dbUpdates).eq("id", sellerId);
      }
    }
  }, [sellerId]);

  const becomeSeller = useCallback(async () => {
    if (!user) return;
    const { data: newSeller, error } = await supabase
      .from("sellers")
      .insert({ user_id: user.id, store_name: "My Store" })
      .select("id, store_name")
      .single();
    if (error) { console.error("Error becoming seller:", error); return; }
    setSellerId(newSeller.id);
    setProfile((prev) => ({ ...prev, id: newSeller.id, userId: user.id, storeName: newSeller.store_name }));
    setIsSeller(true);
  }, [user]);

  return (
    <SellerContext.Provider
      value={{
        profile, updateProfile, products, addProduct, updateProduct, deleteProduct,
        orders, updateOrderStatus, updateFulfillmentStatus,
        settings, updateSettings, analytics,
        isSeller, isSellerLoading, becomeSeller, sellerId,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
}

export function useSeller() {
  const context = useContext(SellerContext);
  if (!context) throw new Error("useSeller must be used within a SellerProvider");
  return context;
}
