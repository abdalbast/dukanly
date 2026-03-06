import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { KURDISTAN_COUNTRY } from "@/lib/kurdistan";
import type { AddressDraft, SavedAddress } from "@/types/address";

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

const ADDRESS_STORAGE_KEY = "dukanly.addresses.v1";
const SELECTED_ADDRESS_STORAGE_KEY = "dukanly.addresses.selected.v1";

const seededAddresses: SavedAddress[] = [
  {
    id: "addr-1",
    name: "Ahmed Karim",
    phone: "+9647501234567",
    street: "100 Gulan Street",
    district: "Gulan",
    city: "Erbil",
    governorate: "Erbil Governorate",
    landmark: "Near Dream City",
    postalCode: "44001",
    countryCode: "IQ",
    isDefault: true,
  },
  {
    id: "addr-2",
    name: "Shilan Omer",
    phone: "+9647712345678",
    street: "21 Salim Street",
    district: "Sarchnar",
    city: "Sulaymaniyah",
    governorate: "Sulaymaniyah Governorate",
    landmark: "Close to Family Mall",
    postalCode: "46001",
    countryCode: "IQ",
    isDefault: false,
  },
];

const AddressBookContext = createContext<AddressBookContextType | undefined>(undefined);

function normalizeStoredAddress(raw: unknown): SavedAddress | null {
  if (!raw || typeof raw !== "object") return null;

  const value = raw as Partial<SavedAddress>;
  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.phone !== "string" ||
    typeof value.street !== "string" ||
    typeof value.district !== "string" ||
    typeof value.city !== "string" ||
    typeof value.governorate !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    phone: value.phone,
    street: value.street,
    district: value.district,
    city: value.city,
    governorate: value.governorate,
    landmark: typeof value.landmark === "string" ? value.landmark : "",
    postalCode: typeof value.postalCode === "string" ? value.postalCode : "",
    countryCode: value.countryCode === "IQ" ? "IQ" : KURDISTAN_COUNTRY.code,
    isDefault: Boolean(value.isDefault),
  };
}

function readStoredAddresses() {
  if (typeof window === "undefined") return seededAddresses;

  try {
    const raw = window.localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (!raw) return seededAddresses;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seededAddresses;

    const normalized = parsed
      .map(normalizeStoredAddress)
      .filter((address): address is SavedAddress => address !== null);

    return normalized.length > 0 ? normalized : seededAddresses;
  } catch {
    return seededAddresses;
  }
}

function readStoredSelectedAddressId(addresses: SavedAddress[]) {
  if (typeof window === "undefined") {
    return addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? null;
  }

  try {
    const raw = window.localStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY);
    if (raw && addresses.some((address) => address.id === raw)) {
      return raw;
    }
  } catch {
    // ignore invalid storage
  }

  return addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? null;
}

export function AddressBookProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<SavedAddress[]>(readStoredAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() =>
    readStoredSelectedAddressId(readStoredAddresses()),
  );
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!selectedAddressId) {
      window.localStorage.removeItem(SELECTED_ADDRESS_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, selectedAddressId);
  }, [selectedAddressId]);

  useEffect(() => {
    if (addresses.length === 0) {
      if (selectedAddressId !== null) setSelectedAddressId(null);
      return;
    }

    if (!selectedAddressId || !addresses.some((address) => address.id === selectedAddressId)) {
      setSelectedAddressId(addresses.find((address) => address.isDefault)?.id ?? addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const openAddressManager = () => setIsManagerOpen(true);
  const closeAddressManager = () => setIsManagerOpen(false);

  const selectAddress = (addressId: string) => {
    setAddresses((current) =>
      current.map((address) => ({
        ...address,
        isDefault: address.id === addressId,
      })),
    );
    setSelectedAddressId(addressId);
  };

  const saveAddress = (draft: AddressDraft, existingAddressId?: string | null) => {
    const nextId = existingAddressId ?? `addr-${Date.now()}`;

    setAddresses((current) => {
      const shouldSetDefault =
        draft.isDefault ||
        current.length === 0 ||
        current.find((address) => address.id === existingAddressId)?.isDefault === true;

      const nextAddress: SavedAddress = {
        id: nextId,
        name: draft.name,
        phone: draft.phone,
        street: draft.street,
        district: draft.district,
        city: draft.city,
        governorate: draft.governorate,
        landmark: draft.landmark,
        postalCode: draft.postalCode,
        countryCode: KURDISTAN_COUNTRY.code,
        isDefault: shouldSetDefault,
      };

      const updated = current
        .filter((address) => address.id !== existingAddressId)
        .map((address) => ({
          ...address,
          isDefault: shouldSetDefault ? false : address.isDefault,
        }));

      const result = [...updated, nextAddress];
      if (!result.some((address) => address.isDefault) && result[0]) {
        result[0] = { ...result[0], isDefault: true };
      }

      return result;
    });

    if (!selectedAddressId || selectedAddressId === existingAddressId || draft.isDefault) {
      setSelectedAddressId(nextId);
    }

    return nextId;
  };

  const deleteAddress = (addressId: string) => {
    let nextSelectedAddressId: string | null = null;

    setAddresses((current) => {
      const filtered = current.filter((address) => address.id !== addressId);

      if (filtered.length > 0 && !filtered.some((address) => address.isDefault)) {
        filtered[0] = { ...filtered[0], isDefault: true };
      }

      nextSelectedAddressId = filtered.find((address) => address.isDefault)?.id ?? filtered[0]?.id ?? null;

      return filtered;
    });

    if (selectedAddressId === addressId) {
      setSelectedAddressId(nextSelectedAddressId);
    }
  };

  return (
    <AddressBookContext.Provider
      value={{
        addresses,
        selectedAddressId,
        selectedAddress,
        isManagerOpen,
        openAddressManager,
        closeAddressManager,
        selectAddress,
        saveAddress,
        deleteAddress,
      }}
    >
      {children}
    </AddressBookContext.Provider>
  );
}

export function useAddressBook() {
  const context = useContext(AddressBookContext);
  if (!context) {
    throw new Error("useAddressBook must be used within AddressBookProvider");
  }
  return context;
}
