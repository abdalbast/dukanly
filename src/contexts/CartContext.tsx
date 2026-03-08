import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CartItem, ProductWithOffer } from "@/types/product";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: ProductWithOffer, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  toggleSaveForLater: (itemId: string) => void;
  toggleGift: (itemId: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  savedItems: CartItem[];
  activeItems: CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "dukanly.cart.v1";

function readStoredCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCartItems);

  // Single source of truth for localStorage persistence
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: ProductWithOffer, quantity = 1) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (item) => item.product.id === product.id && !item.savedForLater
      );
      return existingItem
        ? prev.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
        : [
          ...prev,
          {
            id: `cart-${product.id}-${Date.now()}`,
            product,
            quantity,
            savedForLater: false,
            isGift: false,
          },
        ];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  }, []);

  const toggleSaveForLater = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, savedForLater: !item.savedForLater } : item
      )
    );
  }, []);

  const toggleGift = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isGift: !item.isGift } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const activeItems = items.filter((item) => !item.savedForLater);
  const savedItems = items.filter((item) => item.savedForLater);

  const itemCount = activeItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = activeItems.reduce(
    (sum, item) => sum + item.product.offer.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleSaveForLater,
        toggleGift,
        clearCart,
        itemCount,
        subtotal,
        savedItems,
        activeItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
