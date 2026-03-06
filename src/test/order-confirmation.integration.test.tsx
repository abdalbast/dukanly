import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";

import { en } from "@/i18n/en";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";

const mockClearCart = vi.fn();
const mockFetchPaymentStatus = vi.fn();

vi.mock("@/hooks/useProducts", () => ({
  useProducts: () => ({ data: [] }),
}));

vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ clearCart: mockClearCart }),
}));

vi.mock("@/lib/paymentApi", () => ({
  fetchPaymentStatus: (...args: unknown[]) => mockFetchPaymentStatus(...args),
}));

vi.mock("@/i18n/LanguageContext", () => ({
  useLanguage: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      let text = (en as Record<string, string>)[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([name, value]) => {
          text = text.replace(`{${name}}`, String(value));
        });
      }
      return text;
    },
    language: "en",
    dir: "ltr",
    isRTL: false,
  }),
}));

vi.mock("@/components/Layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe("Order confirmation flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects direct confirmation visits without order context", () => {
    render(
      <MemoryRouter initialEntries={["/order-confirmation"]}>
        <Routes>
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Order Not Found")).toBeInTheDocument();
    expect(screen.queryByText("Order Confirmed!")).not.toBeInTheDocument();
  });

  it("shows a pending state when a Stripe return is not yet verified", async () => {
    mockFetchPaymentStatus.mockResolvedValue({
      ok: true,
      data: {
        orderId: "order-1",
        paymentId: "payment-1",
        paymentMethod: "stripe",
        paymentState: "payment_pending",
        terminal: false,
        providerStatus: "open",
        validUntil: null,
        paidAt: null,
        declineReason: null,
        lastReconciledAt: new Date().toISOString(),
      },
    });

    render(
      <MemoryRouter initialEntries={["/order-confirmation?order_id=order-1&session_id=session-1"]}>
        <Routes>
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Payment Still Processing")).toBeInTheDocument();
    });

    expect(mockClearCart).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Order Confirmed!")).not.toBeInTheDocument();
  });
});
