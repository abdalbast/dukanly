import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AddressBookDialog } from "@/components/address/AddressBookDialog";
import { Header } from "@/components/Header";
import { AddressBookProvider } from "@/contexts/AddressBookContext";
import { en } from "@/i18n/en";

const mockUseAuth = vi.fn();
const mockUseCart = vi.fn();
const mockUseOrders = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/contexts/CartContext", () => ({
  useCart: () => mockUseCart(),
}));

vi.mock("@/hooks/useOrders", () => ({
  useOrders: () => mockUseOrders(),
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

function AddressFlowHarness() {
  return (
    <MemoryRouter>
      <AddressBookProvider>
        <Header />
        <AddressBookDialog />
      </AddressBookProvider>
    </MemoryRouter>
  );
}

describe("Address book integrations", () => {
  const mockFetch = vi.fn();
  const getCurrentPosition = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();

    mockUseAuth.mockReturnValue({
      user: null,
      signOut: vi.fn(),
    });

    mockUseCart.mockReturnValue({
      activeItems: [],
      itemCount: 0,
      savedItems: [],
      subtotal: 0,
    });

    mockUseOrders.mockReturnValue({
      data: [],
      isLoading: false,
    });

    vi.stubGlobal("fetch", mockFetch);
    Object.defineProperty(window.navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition,
      },
    });
  });

  it("opens address management from the header and updates the deliver-to label", async () => {
    render(<AddressFlowHarness />);

    fireEvent.click(screen.getAllByRole("button", { name: "Deliver to Erbil, Kurdistan" })[0]);

    expect(screen.getByRole("dialog", { name: "Your Addresses" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Deliver Here" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Your Addresses" })).not.toBeInTheDocument();
    });

    expect(screen.getAllByRole("button", { name: "Deliver to Sulaymaniyah, Kurdistan" })).toHaveLength(2);
  });

  it("prefills a new address from GPS when users choose use my location", async () => {
    getCurrentPosition.mockImplementation((success: PositionCallback) => {
      success({
        coords: {
          latitude: 36.1911,
          longitude: 44.0092,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({}),
        },
        timestamp: Date.now(),
        toJSON: () => ({}),
      } as GeolocationPosition);
    });

    mockFetch.mockResolvedValue({
      json: async () => ({
        address: {
          road: "100 Gulan Street",
          suburb: "Gulan",
          city: "Erbil",
          state: "Erbil Governorate",
          amenity: "Near Dream City",
          postcode: "44001",
        },
      }),
    });

    render(<AddressFlowHarness />);

    fireEvent.click(screen.getAllByRole("button", { name: "Deliver to Erbil, Kurdistan" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Use My Location" })[0]);

    await waitFor(() => {
      expect(screen.getByLabelText("Street / Building")).toHaveValue("100 Gulan Street");
    });

    expect(screen.getByLabelText("Neighbourhood / Area")).toHaveValue("Gulan");
    expect(screen.getByLabelText("Nearest Landmark (optional)")).toHaveValue("Near Dream City");
    expect(screen.getByLabelText("Postal Code (optional)")).toHaveValue("44001");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("opens the orders preview and links back to the full orders page", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-1" },
      signOut: vi.fn(),
    });

    mockUseOrders.mockReturnValue({
      data: [
        {
          id: "order-1",
          orderNumber: "DK-1042",
          date: "2026-03-01T10:00:00.000Z",
          status: "shipped",
          total: 84500,
          currencyCode: "IQD",
          items: [
            {
              id: "item-1",
              title: "Kurdish Coffee Set",
              image: "/placeholder.svg",
              price: 35,
              quantity: 1,
            },
          ],
        },
      ],
      isLoading: false,
    });

    render(<AddressFlowHarness />);

    fireEvent.click(screen.getAllByRole("button", { name: /Returns & Orders/i })[0]);

    expect(screen.getByRole("dialog", { name: "Returns & Orders" })).toBeInTheDocument();
    expect(screen.getByText("DK-1042")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View All Orders" })).toHaveAttribute("href", "/orders");
  });

  it("opens the cart preview with checkout and cart links", async () => {
    mockUseCart.mockReturnValue({
      activeItems: [
        {
          id: "cart-1",
          quantity: 2,
          savedForLater: false,
          isGift: false,
          product: {
            id: "prod-1",
            title: "Erbil Home Speaker",
            images: ["/placeholder.svg"],
            offer: {
              price: 120,
            },
          },
        },
      ],
      itemCount: 2,
      savedItems: [],
      subtotal: 240,
    });

    render(<AddressFlowHarness />);

    fireEvent.click(screen.getByRole("button", { name: /Cart/i }));

    expect(screen.getByRole("dialog", { name: "Cart" })).toBeInTheDocument();
    expect(screen.getByText("Erbil Home Speaker")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Cart" })).toHaveAttribute("href", "/cart");
    expect(screen.getByRole("link", { name: "Proceed to Checkout" })).toHaveAttribute("href", "/checkout");
  });
});
