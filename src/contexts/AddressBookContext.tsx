import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { KURDISTAN_COUNTRY } from "@/lib/kurdistan";
import type { AddressDraft, SavedAddress } from "@/types/address";

// ---------------------------------------------------------------------------
// Field mapping: SavedAddress ↔ DB `addresses` table
// ---------------------------------------------------------------------------
// name          → full_name
// phone         → phone
// street+district → line1  (combined as "street, district")
// landmark      → line2
// city          → city
// governorate   → state_region
// postalCode    → postal_code
// countryCode   → country_code
// isDefault     → is_default
// ---------------------------------------------------------------------------

interface DbAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state_region: string | null;
  postal_code: string | null;
  country_code: string;
  is_default: boolean | null;
}

function dbToSavedAddress(row: DbAddress): SavedAddress {
  // line1 was stored as "street, district" — split back
  const parts = row.line1.split(", ");
  const street = parts[0] ?? "";
  const district = parts.slice(1).join(", ");

  return {
    id: row.id,
    name: row.full_name,
    phone: row.phone ?? "",
    street,
    district,
    city: row.city,
    governorate: row.state_region ?? "",
    landmark: row.line2 ?? "",
    postalCode: row.postal_code ?? "",
    countryCode: (row.country_code === "IQ" ? "IQ" : KURDISTAN_COUNTRY.code) as "IQ",
    isDefault: row.is_default ?? false,
  };
}

function savedAddressToDbFields(draft: AddressDraft) {
  return {
    full_name: draft.name,
    phone: draft.phone || null,
    line1: [draft.street, draft.district].filter(Boolean).join(", "),
    line2: draft.landmark || null,
    city: draft.city,
    state_region: draft.governorate || null,
    postal_code: draft.postalCode || null,
    country_code: "IQ" as const,
    is_default: draft.isDefault,
  };
}

// ---------------------------------------------------------------------------
// Guest-only fallback (localStorage)
// ---------------------------------------------------------------------------
const ADDRESS_STORAGE_KEY = "dukanly.addresses.v1";
const SELECTED_ADDRESS_STORAGE_KEY = "dukanly.addresses.selected.v1";

const seededAddresses: SavedAddress[] = [
  {
    id: "addr-1", name: "Ahmed Karim", phone: "+9647501234567",
    street: "100 Gulan Street", district: "Gulan", city: "Erbil",
    governorate: "Erbil Governorate", landmark: "Near Dream City",
    postalCode: "44001", countryCode: "IQ", isDefault: true,
  },
  {
    id: "addr-2", name: "Shilan Omer", phone: "+9647712345678",
    street: "21 Salim Street", district: "Sarchnar", city: "Sulaymaniyah",
    governorate: "Sulaymaniyah Governorate", landmark: "Close to Family Mall",
    postalCode: "46001", countryCode: "IQ", isDefault: false,
  },
];

function readGuestAddresses(): SavedAddress[] {
  if (typeof window === "undefined") return seededAddresses;
  try {
    const raw = window.localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (!raw) return seededAddresses;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return seededAddresses;
    return parsed as SavedAddress[];
  } catch {
    return seededAddresses;
  }
}

function persistGuestAddresses(addresses: SavedAddress[]) {
  try { window.localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addresses)); } catch { /* noop */ }
}

function readGuestSelectedId(addresses: SavedAddress[]) {
  try {
    const raw = window.localStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY);
    if (raw && addresses.some((a) => a.id === raw)) return raw;
  } catch { /* noop */ }
  return addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null;
}

function persistGuestSelectedId(id: string | null) {
  try {
    if (id) window.localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, id);
    else window.localStorage.removeItem(SELECTED_ADDRESS_STORAGE_KEY);
  } catch { /* noop */ }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AddressBookContextType {
  addresses: SavedAddress[];
  selectedAddressId: string | null;
  selectedAddress: SavedAddress | null;
  isManagerOpen: boolean;
  openAddressManager: () => void;
  closeAddressManager: () => void;
  selectAddress: (addressId: string) => void;
  saveAddress: (draft: AddressDraft, existingAddressId?: string | null) => string;
  deleteAddress: (addressId: string) => void;
}

const AddressBookContext = createContext<AddressBookContextType | undefined>(undefined);

export function AddressBookProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ---- Fetch addresses on auth change ----
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (isAuthenticated) {
        const { data, error } = await supabase
          .from("addresses")
          .select("*")
          .order("is_default", { ascending: false });

        if (!cancelled && !error && data) {
          const mapped = (data as unknown as DbAddress[]).map(dbToSavedAddress);
          setAddresses(mapped);
          setSelectedAddressId(mapped.find((a) => a.isDefault)?.id ?? mapped[0]?.id ?? null);
        }
      } else {
        const guest = readGuestAddresses();
        if (!cancelled) {
          setAddresses(guest);
          setSelectedAddressId(readGuestSelectedId(guest));
        }
      }
      if (!cancelled) setLoaded(true);
    };

    load();
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.id]);

  // ---- Persist guest addresses to localStorage ----
  useEffect(() => {
    if (!loaded || isAuthenticated) return;
    persistGuestAddresses(addresses);
  }, [addresses, loaded, isAuthenticated]);

  useEffect(() => {
    if (!loaded || isAuthenticated) return;
    persistGuestSelectedId(selectedAddressId);
  }, [selectedAddressId, loaded, isAuthenticated]);

  // ---- Keep selectedAddressId in sync ----
  useEffect(() => {
    if (!loaded) return;
    if (addresses.length === 0) {
      if (selectedAddressId !== null) setSelectedAddressId(null);
      return;
    }
    if (!selectedAddressId || !addresses.some((a) => a.id === selectedAddressId)) {
      setSelectedAddressId(addresses.find((a) => a.isDefault)?.id ?? addresses[0].id);
    }
  }, [addresses, selectedAddressId, loaded]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const openAddressManager = () => setIsManagerOpen(true);
  const closeAddressManager = () => setIsManagerOpen(false);

  // ---- Select (set default) ----
  const selectAddress = useCallback((addressId: string) => {
    setAddresses((current) =>
      current.map((a) => ({ ...a, isDefault: a.id === addressId })),
    );
    setSelectedAddressId(addressId);

    if (isAuthenticated) {
      // Clear old default, set new one
      supabase.from("addresses").update({ is_default: false }).neq("id", addressId).then(() =>
        supabase.from("addresses").update({ is_default: true }).eq("id", addressId),
      );
    }
  }, [isAuthenticated]);

  // ---- Save (create / update) ----
  const saveAddress = useCallback((draft: AddressDraft, existingAddressId?: string | null): string => {
    const tempId = existingAddressId ?? `addr-${Date.now()}`;

    // Optimistic local update
    setAddresses((current) => {
      const shouldSetDefault =
        draft.isDefault || current.length === 0 ||
        current.find((a) => a.id === existingAddressId)?.isDefault === true;

      const nextAddress: SavedAddress = {
        id: tempId,
        name: draft.name, phone: draft.phone, street: draft.street,
        district: draft.district, city: draft.city, governorate: draft.governorate,
        landmark: draft.landmark, postalCode: draft.postalCode,
        countryCode: KURDISTAN_COUNTRY.code as "IQ",
        isDefault: shouldSetDefault,
      };

      const updated = current
        .filter((a) => a.id !== existingAddressId)
        .map((a) => ({ ...a, isDefault: shouldSetDefault ? false : a.isDefault }));

      const result = [...updated, nextAddress];
      if (!result.some((a) => a.isDefault) && result[0]) {
        result[0] = { ...result[0], isDefault: true };
      }
      return result;
    });

    if (!selectedAddressId || selectedAddressId === existingAddressId || draft.isDefault) {
      setSelectedAddressId(tempId);
    }

    // Persist to DB for authenticated users
    if (isAuthenticated && user) {
      const dbFields = savedAddressToDbFields(draft);
      if (existingAddressId) {
        supabase.from("addresses").update(dbFields).eq("id", existingAddressId).then(({ error }) => {
          if (error) console.error("Address update failed:", error);
        });
      } else {
        supabase
          .from("addresses")
          .insert({ ...dbFields, user_id: user.id })
          .select("id")
          .single()
          .then(({ data, error }) => {
            if (error) { console.error("Address insert failed:", error); return; }
            // Replace temp ID with real DB ID
            const realId = data.id;
            setAddresses((prev) => prev.map((a) => a.id === tempId ? { ...a, id: realId } : a));
            setSelectedAddressId((prev) => prev === tempId ? realId : prev);
          });
      }
    }

    return tempId;
  }, [isAuthenticated, user, selectedAddressId]);

  // ---- Delete ----
  const deleteAddress = useCallback((addressId: string) => {
    let nextSelected: string | null = null;

    setAddresses((current) => {
      const filtered = current.filter((a) => a.id !== addressId);
      if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0] = { ...filtered[0], isDefault: true };
      }
      nextSelected = filtered.find((a) => a.isDefault)?.id ?? filtered[0]?.id ?? null;
      return filtered;
    });

    if (selectedAddressId === addressId) {
      setSelectedAddressId(nextSelected);
    }

    if (isAuthenticated) {
      supabase.from("addresses").delete().eq("id", addressId).then(({ error }) => {
        if (error) console.error("Address delete failed:", error);
      });
    }
  }, [isAuthenticated, selectedAddressId]);

  return (
    <AddressBookContext.Provider
      value={{
        addresses, selectedAddressId, selectedAddress,
        isManagerOpen, openAddressManager, closeAddressManager,
        selectAddress, saveAddress, deleteAddress,
      }}
    >
      {children}
    </AddressBookContext.Provider>
  );
}

export function useAddressBook() {
  const context = useContext(AddressBookContext);
  if (!context) throw new Error("useAddressBook must be used within AddressBookProvider");
  return context;
}
