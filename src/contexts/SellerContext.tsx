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

interface SellerContextType {
  // Profile
  profile: SellerProfile;
  updateProfile: (updates: Partial<SellerProfile>) => void;
  
  // Products
  products: SellerProduct[];
  addProduct: (product: Omit<SellerProduct, "id" | "sellerId" | "createdAt" | "updatedAt">) => void;
  updateProduct: (id: string, updates: Partial<SellerProduct>) => void;
  deleteProduct: (id: string) => void;
  
  // Orders
  orders: SellerOrder[];
  updateOrderStatus: (id: string, status: SellerOrder["status"]) => void;
  updateFulfillmentStatus: (id: string, status: SellerOrder["fulfillmentStatus"], trackingNumber?: string) => void;
  
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
    (product: Omit<SellerProduct, "id" | "sellerId" | "createdAt" | "updatedAt">) => {
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

  const updateProduct = useCallback((id: string, updates: Partial<SellerProduct>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateOrderStatus = useCallback((id: string, status: SellerOrder["status"]) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
      )
    );
  }, []);

  const updateFulfillmentStatus = useCallback(
    (id: string, fulfillmentStatus: SellerOrder["fulfillmentStatus"], trackingNumber?: string) => {
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
