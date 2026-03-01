import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { SellerProfile, SellerProduct, SellerOrder, SellerSettings } from "@/types/seller";
import {
  mockSellerProfile,
  mockSellerSettings,
  mockSellerAnalytics,
} from "@/data/sellerMockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { upsertSellerProduct, updateSellerOrder } from "@/lib/writeApi";

interface SellerContextType {
  // Profile
  profile: SellerProfile;
  updateProfile: (updates: Partial<SellerProfile>) => void;
  
  // Products
  products: SellerProduct[];
  addProduct: (product: Omit<SellerProduct, "id" | "sellerId" | "createdAt" | "updatedAt">) => Promise<void>;
  updateProduct: (id: string, updates: Partial<SellerProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Orders
  orders: SellerOrder[];
  updateOrderStatus: (id: string, status: SellerOrder["status"]) => Promise<void>;
  updateFulfillmentStatus: (
    id: string,
    status: SellerOrder["fulfillmentStatus"],
    trackingNumber?: string,
  ) => Promise<void>;
  
  // Settings
  settings: SellerSettings;
  updateSettings: (updates: Partial<SellerSettings>) => void;
  
  // Analytics
  analytics: typeof mockSellerAnalytics;
  
  // Role
  isSeller: boolean;
  isSellerLoading: boolean;
  becomeSeller: () => Promise<void>;
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

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isSeller, setIsSeller] = useState(false);
  const [isSellerLoading, setIsSellerLoading] = useState(true);
  const [profile, setProfile] = useState<SellerProfile>(mockSellerProfile);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [settings, setSettings] = useState<SellerSettings>(mockSellerSettings);
  const [sellerId, setSellerId] = useState<string | null>(null);

  // Check seller status from database
  useEffect(() => {
    const checkSellerStatus = async () => {
      if (!user) {
        setIsSeller(false);
        setIsSellerLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.rpc('is_seller');
        if (error) {
          console.error('Error checking seller status:', error);
          setIsSeller(false);
        } else {
          setIsSeller(!!data);
        }

        // Get seller ID
        const { data: sellerData } = await supabase
          .from('sellers')
          .select('id, store_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (sellerData) {
          setSellerId(sellerData.id);
          setProfile((prev) => ({
            ...prev,
            id: sellerData.id,
            userId: user.id,
            storeName: sellerData.store_name,
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

  // Fetch seller's products from database
  useEffect(() => {
    if (!sellerId) return;

    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts((data as unknown as DbProduct[]).map(mapDbToSellerProduct));
      }
    };

    fetchProducts();
  }, [sellerId]);

  // Fetch seller's orders from database
  useEffect(() => {
    if (!sellerId) return;

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          unit_price,
          line_total,
          order_id,
          product_id,
          products (id, title, images),
          orders (
            id,
            order_number,
            user_id,
            status,
            fulfillment_status,
            payment_status,
            total_amount,
            shipping_amount,
            tax_amount,
            subtotal_amount,
            currency_code,
            created_at,
            updated_at
          )
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error || !data) return;

      // Group order items by order_id
      const orderMap = new Map<string, SellerOrder>();
      for (const item of data as unknown as Array<{
        id: string;
        quantity: number;
        unit_price: number;
        line_total: number;
        order_id: string;
        product_id: string;
        products: { id: string; title: string; images: string[] } | null;
        orders: {
          id: string;
          order_number: string;
          user_id: string;
          status: string;
          fulfillment_status: string;
          payment_status: string;
          total_amount: number;
          shipping_amount: number;
          tax_amount: number;
          subtotal_amount: number;
          currency_code: string;
          created_at: string;
          updated_at: string;
        } | null;
      }>) {
        if (!item.orders) continue;
        const ord = item.orders;

        if (!orderMap.has(ord.id)) {
          const statusMap: Record<string, SellerOrder["status"]> = {
            pending: "pending",
            processing: "processing",
            shipped: "shipped",
            delivered: "delivered",
            cancelled: "cancelled",
          };
          const fulfillmentMap: Record<string, SellerOrder["fulfillmentStatus"]> = {
            unfulfilled: "unfulfilled",
            partial: "partial",
            fulfilled: "fulfilled",
          };
          const paymentMap: Record<string, SellerOrder["paymentStatus"]> = {
            pending: "pending",
            paid: "paid",
            refunded: "refunded",
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

  const updateProfile = useCallback((updates: Partial<SellerProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const addProduct = useCallback(
    async (product: Omit<SellerProduct, "id" | "sellerId" | "createdAt" | "updatedAt">) => {
      const write = await upsertSellerProduct({
        sku: product.sku,
        title: product.title,
        description: product.description,
        status: product.status,
        currencyCode: "USD",
        basePrice: product.price,
      });

      if (!write.ok) {
        throw new Error(write.failure?.message ?? "Failed to save product.");
      }

      // Refetch products
      if (sellerId) {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', sellerId)
          .order('created_at', { ascending: false });
        if (data) {
          setProducts((data as unknown as DbProduct[]).map(mapDbToSellerProduct));
        }
      }
    },
    [sellerId]
  );

  const updateProduct = useCallback(
    async (id: string, updates: Partial<SellerProduct>) => {
      const existing = products.find((p) => p.id === id);
      if (!existing) return;

      const merged = { ...existing, ...updates };

      const write = await upsertSellerProduct({
        sku: merged.sku,
        title: merged.title,
        description: merged.description,
        status: merged.status,
        currencyCode: "USD",
        basePrice: merged.price,
      });

      if (!write.ok) {
        throw new Error(write.failure?.message ?? "Failed to update product.");
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        )
      );
    },
    [products],
  );

  const deleteProduct = useCallback(async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: SellerOrder["status"]) => {
    const writeStatus = status === "pending" ? "confirmed" : status;
    const write = await updateSellerOrder({
      orderId: id,
      status: writeStatus as "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded",
    });

    if (!write.ok) {
      throw new Error(write.failure?.message ?? "Failed to update order status.");
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
      )
    );
  }, []);

  const updateFulfillmentStatus = useCallback(
    async (id: string, fulfillmentStatus: SellerOrder["fulfillmentStatus"], trackingNumber?: string) => {
      const nextStatus: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" =
        fulfillmentStatus === "fulfilled" ? "shipped" : "processing";

      const write = await updateSellerOrder({
        orderId: id,
        status: nextStatus,
        fulfillmentStatus,
        trackingNumber,
      });

      if (!write.ok) {
        throw new Error(write.failure?.message ?? "Failed to update fulfillment status.");
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                fulfillmentStatus,
                trackingNumber: trackingNumber || o.trackingNumber,
                status: fulfillmentStatus === "fulfilled" ? "shipped" : o.status,
                updatedAt: new Date().toISOString(),
              }
            : o
        )
      );
    },
    []
  );

  const updateSettings = useCallback((updates: Partial<SellerSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const becomeSeller = useCallback(async () => {
    if (!user) return;
    
    const { error } = await supabase.from('sellers').insert({
      user_id: user.id,
      store_name: 'My Store',
    });
    
    if (error) {
      console.error('Error becoming seller:', error);
      return;
    }
    
    setIsSeller(true);
  }, [user]);

  return (
    <SellerContext.Provider
      value={{
        profile,
        updateProfile,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        orders,
        updateOrderStatus,
        updateFulfillmentStatus,
        settings,
        updateSettings,
        analytics: mockSellerAnalytics,
        isSeller,
        isSellerLoading,
        becomeSeller,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
}

export function useSeller() {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error("useSeller must be used within a SellerProvider");
  }
  return context;
}
