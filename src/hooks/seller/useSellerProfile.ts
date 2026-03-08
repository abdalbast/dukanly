import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { SellerProfile, SellerSettings } from "@/types/seller";

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

export function useSellerProfile() {
  const { user } = useAuth();
  const [isSeller, setIsSeller] = useState(false);
  const [isSellerLoading, setIsSellerLoading] = useState(true);
  const [profile, setProfile] = useState<SellerProfile>(DEFAULT_PROFILE);
  const [sellerId, setSellerId] = useState<string | null>(null);

  // Partial settings state populated from the sellers row (payout info)
  const [paymentSettings, setPaymentSettings] = useState<SellerSettings["payments"] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (!user) {
        setIsSeller(false);
        setIsSellerLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("is_seller");
        if (!cancelled) setIsSeller(!error && !!data);

        const { data: sellerData } = await supabase
          .from("sellers")
          .select("id, store_name, support_email, phone, business_type, tax_id, is_verified, payout_schedule, bank_name, bank_account_last4, created_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!cancelled && sellerData) {
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
          setPaymentSettings({
            payoutSchedule: (sellerData.payout_schedule as "daily" | "weekly" | "monthly") || "weekly",
            payoutMethod: sellerData.bank_name ? "bank" : "paypal",
            bankAccount: sellerData.bank_name
              ? { bankName: sellerData.bank_name, accountLast4: sellerData.bank_account_last4 || "" }
              : undefined,
          });
        }
      } catch {
        if (!cancelled) setIsSeller(false);
      }
      if (!cancelled) setIsSellerLoading(false);
    };

    setIsSellerLoading(true);
    check();
    return () => { cancelled = true; };
  }, [user]);

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

  return { profile, updateProfile, isSeller, isSellerLoading, becomeSeller, sellerId, paymentSettings };
}
