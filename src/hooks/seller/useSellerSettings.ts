import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SellerSettings } from "@/types/seller";

const DEFAULT_SETTINGS: SellerSettings = {
  notifications: { orderAlerts: true, lowStockAlerts: true, reviewAlerts: true, marketingEmails: false },
  shipping: { freeShippingThreshold: 50000, handlingTime: 2, returnPolicy: "30-day returns on all items in original condition" },
  payments: { payoutMethod: "bank", payoutSchedule: "weekly" },
};

export function useSellerSettings(
  sellerId: string | null,
  /** Initial payment settings hydrated from the seller profile fetch */
  initialPayments: SellerSettings["payments"] | null,
) {
  const [settings, setSettings] = useState<SellerSettings>(DEFAULT_SETTINGS);

  // Hydrate payment settings once the profile hook provides them
  useEffect(() => {
    if (initialPayments) {
      setSettings((prev) => ({ ...prev, payments: { ...prev.payments, ...initialPayments } }));
    }
  }, [initialPayments]);

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

  return { settings, updateSettings };
}
