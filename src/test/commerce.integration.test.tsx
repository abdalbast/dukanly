import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import { en } from "@/i18n/en";
import CheckoutPage from "@/pages/CheckoutPage";
import { SellerLayout } from "@/components/seller/SellerLayout";

const mockUseCart = vi.fn();
const mockUseAuth = vi.fn();
const mockUseSeller = vi.fn();
const mockUseAddressBook = vi.fn();

let cartState: Record<string, unknown>;
let authState: Record<string, unknown>;
let sellerState: Record<string, unknown>;
let addressBookState: Record<string, unknown>;

vi.mock("@/contexts/CartContext", () => ({
  useCart: () => mockUseCart(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/contexts/SellerContext", () => ({
  useSeller: () => mockUseSeller(),
}));

vi.mock("@/contexts/AddressBookContext", () => ({
  useAddressBook: () => mockUseAddressBook(),
}));

vi.mock("@/i18n/LanguageContext", () => ({
  useLanguage: () => ({
    language: "en",
    setLanguage: vi.fn(),
    t: (key: keyof typeof en, params?: Record<string, string | number>) => {
      let text = en[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([name, value]) => {
          text = text.replace(`{${name}}`, String(value));
        });
      }
      return text;
    },
    dir: "ltr",
    isRTL: false,
  }),
}));

vi.mock("@/components/Layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/seller/SellerSidebar", () => ({
  SellerSidebar: () => <aside>Seller Sidebar</aside>,
}));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}${location.hash}`}</div>;
}

describe("Commerce integrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    cartState = {
      activeItems: [],
      subtotal: 0,
      clearCart: vi.fn(),
    };

    authState = {
      user: null,
      loading: false,
    };

    sellerState = {
      isSeller: false,
      isSellerLoading: false,
      becomeSeller: vi.fn().mockResolvedValue(undefined),
    };

    addressBookState = {
      addresses: [
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
      ],
      selectedAddressId: "addr-1",
      selectedAddress: {
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
      selectAddress: vi.fn(),
      openAddressManager: vi.fn(),
    };

    mockUseCart.mockImplementation(() => cartState);
    mockUseAuth.mockImplementation(() => authState);
    mockUseSeller.mockImplementation(() => sellerState);
    mockUseAddressBook.mockImplementation(() => addressBookState);
  });

  it("shows empty-cart state in checkout when there are no active items", () => {
    render(
      <MemoryRouter initialEntries={["/checkout"]}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue Shopping" })).toHaveAttribute("href", "/");
  });

  it("places COD order, clears cart, and navigates to confirmation", async () => {
    const clearCart = vi.fn();
    vi.useFakeTimers();
    try {
      cartState = {
        ...cartState,
        clearCart,
        subtotal: 99,
        activeItems: [
          {
            id: "item-1",
            quantity: 1,
            product: {
              title: "Test Product",
              images: ["/placeholder.svg"],
              offer: {
                price: 99,
              },
            },
          },
        ],
      };

      render(
        <MemoryRouter initialEntries={["/checkout"]}>
          <Routes>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<div>Order Confirmed Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByText("Cash on Delivery"));
      fireEvent.click(screen.getByRole("button", { name: "Place Order" }));
      expect(screen.getByRole("button", { name: "Processing..." })).toBeDisabled();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });

      expect(clearCart).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Order Confirmed Page")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("redirects unauthenticated users from seller area to sign-in", () => {
    render(
      <MemoryRouter initialEntries={["/seller"]}>
        <Routes>
          <Route path="/seller" element={<SellerLayout />} />
          <Route path="/auth/signin" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("location")).toHaveTextContent("/auth/signin");
  });

  it("shows onboarding for authenticated non-seller and triggers becomeSeller", async () => {
    const becomeSeller = vi.fn().mockResolvedValue(undefined);

    authState = {
      ...authState,
      user: { id: "user-1" },
    };

    sellerState = {
      ...sellerState,
      isSeller: false,
      becomeSeller,
    };

    render(
      <MemoryRouter initialEntries={["/seller"]}>
        <Routes>
          <Route path="/seller" element={<SellerLayout />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Start Selling")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Become a Seller" }));
    expect(becomeSeller).toHaveBeenCalledTimes(1);
  });
});
