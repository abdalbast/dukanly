import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { SellerProvider } from "@/contexts/SellerContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AddressBookProvider } from "@/contexts/AddressBookContext";
import { RequireAuth } from "./components/auth/RequireAuth";
import { Skeleton } from "@/components/ui/skeleton";

const HomePage = lazy(() => import("./pages/HomePage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const CheckoutPaymentPage = lazy(() => import("./pages/CheckoutPaymentPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AccountPage = lazy(() => import("./pages/AccountPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ListsPage = lazy(() => import("./pages/ListsPage"));
const SignInPage = lazy(() => import("./pages/auth/SignInPage"));
const SignUpPage = lazy(() => import("./pages/auth/SignUpPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));

const AboutPage = lazy(() => import("./pages/AboutPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const ReturnsPage = lazy(() => import("./pages/ReturnsPage"));
const ShippingPage = lazy(() => import("./pages/ShippingPage"));

const SellerLayout = lazy(() => import("./components/seller/SellerLayout").then((m) => ({ default: m.SellerLayout })));
const SellerOverview = lazy(() => import("./pages/seller/SellerOverview"));
const SellerProducts = lazy(() => import("./pages/seller/SellerProducts"));
const AddProduct = lazy(() => import("./pages/seller/AddProduct"));
const SellerOrders = lazy(() => import("./pages/seller/SellerOrders"));

const SellerSettings = lazy(() => import("./pages/seller/SellerSettings"));
const SellerInventory = lazy(() => import("./pages/seller/SellerInventory"));
const SellerShipping = lazy(() => import("./pages/seller/SellerShipping"));
const SellerReturns = lazy(() => import("./pages/seller/SellerReturns"));
const SellerPayments = lazy(() => import("./pages/seller/SellerPayments"));
const SellerPerformance = lazy(() => import("./pages/seller/SellerPerformance"));
const SellerReports = lazy(() => import("./pages/seller/SellerReports"));
const SellerSupport = lazy(() => import("./pages/seller/SellerSupport"));
const SellOnDukanlyPage = lazy(() => import("./pages/SellOnDukanlyPage"));
const BrandPage = lazy(() => import("./pages/BrandPage"));

const queryClient = new QueryClient();

function RouteFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="text-2xl font-bold tracking-tight">
        <span className="text-primary">Dukan</span><span className="text-foreground">ly</span>
      </div>
      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        <Skeleton className="h-2 w-48 rounded-full" />
        <Skeleton className="h-2 w-32 rounded-full" />
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
        <AuthProvider>
          <AddressBookProvider>
            <CartProvider>
              <SellerProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/checkout/payment/:orderId" element={<CheckoutPaymentPage />} />
                    <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/category/:slug/:subcategory" element={<CategoryPage />} />

                    <Route path="/auth/signin" element={<SignInPage />} />
                    <Route path="/auth/signup" element={<SignUpPage />} />
                    <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/auth/verify-email" element={<VerifyEmailPage />} />

                    <Route
                      path="/account"
                      element={
                        <RequireAuth>
                          <AccountPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/account/security"
                      element={
                        <RequireAuth>
                          <AccountPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/account/addresses"
                      element={
                        <RequireAuth>
                          <AccountPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/account/payment"
                      element={
                        <RequireAuth>
                          <AccountPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/account/notifications"
                      element={
                        <RequireAuth>
                          <AccountPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <RequireAuth>
                          <OrdersPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/lists"
                      element={
                        <RequireAuth>
                          <ListsPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/lists/wishlist"
                      element={
                        <RequireAuth>
                          <ListsPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/gift-cards"
                      element={
                        <RequireAuth>
                          <AccountPage />
                        </RequireAuth>
                      }
                    />

                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/help/orders" element={<HelpPage />} />
                    <Route path="/help/shipping" element={<HelpPage />} />
                    <Route path="/help/payments" element={<HelpPage />} />
                    <Route path="/help/contact" element={<HelpPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/conditions" element={<TermsPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/returns" element={<ReturnsPage />} />
                    <Route path="/shipping" element={<ShippingPage />} />
                    <Route path="/interest-ads" element={<PrivacyPage />} />

                    <Route path="/careers" element={<AboutPage />} />
                    <Route path="/press" element={<AboutPage />} />
                    <Route path="/investors" element={<AboutPage />} />
                    <Route path="/sell" element={<SellOnDukanlyPage />} />
                    <Route path="/affiliate" element={<AboutPage />} />
                    <Route path="/advertise" element={<AboutPage />} />
                    <Route path="/publish" element={<AboutPage />} />
                    <Route
                      path="/card"
                      element={
                        <RequireAuth>
                          <AccountPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/points"
                      element={
                        <RequireAuth>
                          <AccountPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/reload"
                      element={
                        <RequireAuth>
                          <AccountPage />
                        </RequireAuth>
                      }
                    />

                    <Route
                      path="/seller"
                      element={
                        <RequireAuth>
                          <SellerLayout />
                        </RequireAuth>
                      }
                    >
                      <Route index element={<SellerOverview />} />
                      <Route path="products" element={<SellerProducts />} />
                      <Route path="products/new" element={<AddProduct />} />
                      <Route path="products/:id/edit" element={<AddProduct />} />
                      <Route path="orders" element={<SellerOrders />} />
                      <Route path="inventory" element={<SellerInventory />} />
                      <Route path="shipping" element={<SellerShipping />} />
                      <Route path="returns" element={<SellerReturns />} />
                      <Route path="payments" element={<SellerPayments />} />
                      <Route path="performance" element={<SellerPerformance />} />
                      <Route path="reports" element={<SellerReports />} />
                      <Route path="support" element={<SellerSupport />} />
                      
                      <Route path="settings" element={<SellerSettings />} />
                    </Route>

                    <Route path="/deals" element={<SearchResultsPage />} />
                    <Route path="/bestsellers" element={<SearchResultsPage />} />
                    <Route path="/trending" element={<SearchResultsPage />} />
                    <Route path="/brand/:brand" element={<SearchResultsPage />} />
                    <Route path="/seller/:sellerId" element={<SearchResultsPage />} />

                    <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </TooltipProvider>
              </SellerProvider>
            </CartProvider>
          </AddressBookProvider>
        </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
