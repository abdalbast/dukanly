import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import SignInPage from "@/pages/auth/SignInPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";

const mockUseAuth = vi.fn();
const mockToast = vi.fn();
const setLanguage = vi.fn();
let authState: Record<string, unknown>;

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/i18n/LanguageContext", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: "en",
    setLanguage,
    dir: "ltr",
    isRTL: false,
  }),
}));

vi.mock("@/components/Layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}${location.hash}`}</div>;
}

describe("Auth integrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    authState = {
      user: null,
      session: null,
      loading: false,
      signIn: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn(),
      requestPasswordReset: vi.fn().mockResolvedValue({ error: null }),
      updatePassword: vi.fn(),
      resendVerificationEmail: vi.fn(),
      signOut: vi.fn(),
    };

    mockUseAuth.mockImplementation(() => authState);
  });

  it("redirects unauthenticated users from protected routes with encoded return path", () => {
    render(
      <MemoryRouter initialEntries={["/account?tab=security#section"]}>
        <Routes>
          <Route
            path="/account"
            element={
              <RequireAuth>
                <div>Account Area</div>
              </RequireAuth>
            }
          />
          <Route path="/auth/signin" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/auth/signin?redirect=%2Faccount%3Ftab%3Dsecurity%23section",
    );
  });

  it("renders protected content for authenticated users", () => {
    authState = {
      ...authState,
      user: { id: "user-1" },
      loading: false,
    };

    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route
            path="/account"
            element={
              <RequireAuth>
                <div>Account Area</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Account Area")).toBeInTheDocument();
  });

  it("sign-in redirects to safe internal redirect target", async () => {
    const signIn = vi.fn().mockResolvedValue({ error: null });

    authState = { ...authState, signIn };

    render(
      <MemoryRouter initialEntries={["/auth/signin?redirect=/orders"]}>
        <Routes>
          <Route path="/auth/signin" element={<SignInPage />} />
          <Route path="/orders" element={<div>Orders Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("auth.email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("auth.password"), {
      target: { value: "secret-123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "auth.signIn" }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("test@example.com", "secret-123");
    });

    expect(screen.getByText("Orders Page")).toBeInTheDocument();
  });

  it("sign-in ignores unsafe external redirect targets", async () => {
    const signIn = vi.fn().mockResolvedValue({ error: null });

    authState = { ...authState, signIn };

    render(
      <MemoryRouter initialEntries={["/auth/signin?redirect=https://evil.example"]}>
        <Routes>
          <Route path="/auth/signin" element={<SignInPage />} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("auth.email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("auth.password"), {
      target: { value: "secret-123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "auth.signIn" }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalled();
    });

    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("forgot-password submits reset request", async () => {
    const requestPasswordReset = vi.fn().mockResolvedValue({ error: null });

    authState = { ...authState, requestPasswordReset };

    render(
      <MemoryRouter initialEntries={["/auth/forgot-password"]}>
        <Routes>
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("auth.email"), {
      target: { value: "reset@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "auth.sendResetLink" }));

    await waitFor(() => {
      expect(requestPasswordReset).toHaveBeenCalledWith("reset@example.com");
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "auth.resetEmailSent" }),
    );
  });
});
