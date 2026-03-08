import React, { createContext, useContext } from "react";
import type { SellerProfile, SellerProduct, SellerOrder, SellerAnalytics, SellerSettings } from "@/types/seller";
import { useSellerProfile } from "@/hooks/seller/useSellerProfile";
import { useSellerProducts } from "@/hooks/seller/useSellerProducts";
import { useSellerOrders } from "@/hooks/seller/useSellerOrders";
import { useSellerSettings } from "@/hooks/seller/useSellerSettings";
import { useSellerAnalytics } from "@/hooks/seller/useSellerAnalytics";

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

/**
 * Thin composition layer — delegates to focused hooks while keeping
 * the same `useSeller()` API so no consumers need changes.
 */
export function SellerProvider({ children }: { children: React.ReactNode }) {
  const { profile, updateProfile, isSeller, isSellerLoading, becomeSeller, sellerId, paymentSettings } =
    useSellerProfile();
  const { products, addProduct, updateProduct, deleteProduct } = useSellerProducts(sellerId);
  const { orders, updateOrderStatus, updateFulfillmentStatus } = useSellerOrders(sellerId);
  const { settings, updateSettings } = useSellerSettings(sellerId, paymentSettings);
  const analytics = useSellerAnalytics(orders, products);

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
