import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { SellerProfile, SellerProduct, SellerOrder, SellerSettings } from "@/types/seller";
import {
  mockSellerProfile,
  mockSellerProducts,
  mockSellerOrders,
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

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isSeller, setIsSeller] = useState(false);
  const [isSellerLoading, setIsSellerLoading] = useState(true);
  const [profile, setProfile] = useState<SellerProfile>(mockSellerProfile);
  const [products, setProducts] = useState<SellerProduct[]>(mockSellerProducts);
  const [orders, setOrders] = useState<SellerOrder[]>(mockSellerOrders);
  const [settings, setSettings] = useState<SellerSettings>(mockSellerSettings);

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
      } catch {
        setIsSeller(false);
      }
      setIsSellerLoading(false);
    };
    
    setIsSellerLoading(true);
    checkSellerStatus();
  }, [user]);

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

      const now = new Date().toISOString();
      const newProduct: SellerProduct = {
        ...product,
        id: `sp-${Date.now()}`,
        sellerId: profile.id,
        createdAt: now,
        updatedAt: now,
      };
      setProducts((prev) => [newProduct, ...prev]);
    },
    [profile.id]
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
    const write = await updateSellerOrder({
      orderId: id,
      status,
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
      const nextStatus: SellerOrder["status"] =
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
