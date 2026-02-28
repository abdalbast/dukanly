import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import CheckoutPage from "@/pages/CheckoutPage";
import { SellerLayout } from "@/components/seller/SellerLayout";

const mockUseCart = vi.fn();
const mockUseAuth = vi.fn();
const mockUseSeller = vi.fn();

let cartState: Record<string, unknown>;
let authState: Record<string, unknown>;
let sellerState: Record<string, unknown>;

vi.mock("@/contexts/CartContext", () => ({
  useCart: () => mockUseCart(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/contexts/SellerContext", () => ({
  useSeller: () => mockUseSeller(),
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

    mockUseCart.mockImplementation(() => cartState);
    mockUseAuth.mockImplementation(() => authState);
    mockUseSeller.mockImplementation(() => sellerState);
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

  it("places order, clears cart, and navigates to confirmation", async () => {
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
