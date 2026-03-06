import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { CartProvider, useCart } from "@/contexts/CartContext";
import type { ProductWithOffer } from "@/types/product";

const TEST_PRODUCT: ProductWithOffer = {
  id: "prod-1",
  title: "Test Product",
  description: "A product used for cart tests.",
  images: ["/placeholder.svg"],
  category: "electronics",
  subcategory: "audio",
  brand: "Test Brand",
  rating: 4.5,
  reviewCount: 12,
  isPrime: true,
  offer: {
    id: "offer-1",
    productId: "prod-1",
    sellerId: "seller-1",
    sellerName: "Seller",
    price: 100,
    currency: "USD",
    stock: 5,
    fulfillmentType: "marketplace",
    deliveryDays: 2,
    condition: "new",
  },
};

function CartHarness() {
  const { itemCount, addToCart } = useCart();

  return (
    <div>
      <div data-testid="item-count">{itemCount}</div>
      <button type="button" onClick={() => addToCart(TEST_PRODUCT)}>
        Add
      </button>
    </div>
  );
}

describe("CartContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("hydrates cart items from localStorage", () => {
    window.localStorage.setItem(
      "dukanly.cart.v1",
      JSON.stringify([
        {
          id: "cart-1",
          product: TEST_PRODUCT,
          quantity: 2,
          savedForLater: false,
          isGift: false,
        },
      ]),
    );

    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>,
    );

    expect(screen.getByTestId("item-count")).toHaveTextContent("2");
  });

  it("persists new cart items to localStorage", () => {
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByTestId("item-count")).toHaveTextContent("1");

    const storedCart = JSON.parse(window.localStorage.getItem("dukanly.cart.v1") ?? "[]");
    expect(storedCart).toHaveLength(1);
    expect(storedCart[0]?.product?.id).toBe("prod-1");
  });
});
