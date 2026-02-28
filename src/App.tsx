import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { SellerProvider } from "@/contexts/SellerContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Main pages
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import CategoryPage from "./pages/CategoryPage";
import NotFound from "./pages/NotFound";

// User pages
import AccountPage from "./pages/AccountPage";
import OrdersPage from "./pages/OrdersPage";
import ListsPage from "./pages/ListsPage";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import { RequireAuth } from "./components/auth/RequireAuth";

// Info pages
import AboutPage from "./pages/AboutPage";
import HelpPage from "./pages/HelpPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import ReturnsPage from "./pages/ReturnsPage";
import ShippingPage from "./pages/ShippingPage";

// Seller pages
import { SellerLayout } from "./components/seller/SellerLayout";
import SellerOverview from "./pages/seller/SellerOverview";
import SellerProducts from "./pages/seller/SellerProducts";
import AddProduct from "./pages/seller/AddProduct";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerAnalytics from "./pages/seller/SellerAnalytics";
import SellerSettings from "./pages/seller/SellerSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <SellerProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Main Shopping Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/category/:slug/:subcategory" element={<CategoryPage />} />
                  
                  {/* Auth Routes */}
                  <Route path="/auth/signin" element={<SignInPage />} />
                  <Route path="/auth/signup" element={<SignUpPage />} />
                  <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
                  
                  {/* User Account Routes */}
                  <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
                  <Route path="/account/security" element={<RequireAuth><AccountPage /></RequireAuth>} />
                  <Route path="/account/addresses" element={<RequireAuth><AccountPage /></RequireAuth>} />
                  <Route path="/account/payment" element={<RequireAuth><AccountPage /></RequireAuth>} />
                  <Route path="/account/notifications" element={<RequireAuth><AccountPage /></RequireAuth>} />
                  <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
                  <Route path="/lists" element={<RequireAuth><ListsPage /></RequireAuth>} />
                  <Route path="/lists/wishlist" element={<RequireAuth><ListsPage /></RequireAuth>} />
                  <Route path="/gift-cards" element={<RequireAuth><AccountPage /></RequireAuth>} />
                  
                  {/* Info Pages */}
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
                  
                  {/* Footer Link Routes */}
                  <Route path="/careers" element={<AboutPage />} />
                  <Route path="/press" element={<AboutPage />} />
                  <Route path="/investors" element={<AboutPage />} />
                  <Route path="/sell" element={<AboutPage />} />
                  <Route path="/affiliate" element={<AboutPage />} />
                  <Route path="/advertise" element={<AboutPage />} />
                  <Route path="/publish" element={<AboutPage />} />
                  <Route path="/card" element={<AccountPage />} />
                  <Route path="/points" element={<AccountPage />} />
                  <Route path="/reload" element={<AccountPage />} />
                  
                  {/* Seller Dashboard Routes */}
                  <Route path="/seller" element={<SellerLayout />}>
                    <Route index element={<SellerOverview />} />
                    <Route path="products" element={<SellerProducts />} />
                    <Route path="products/new" element={<AddProduct />} />
                    <Route path="products/:id/edit" element={<AddProduct />} />
                    <Route path="orders" element={<SellerOrders />} />
                    <Route path="analytics" element={<SellerAnalytics />} />
                    <Route path="settings" element={<SellerSettings />} />
                  </Route>
                  
                  {/* Placeholder Routes */}
                  <Route path="/deals" element={<SearchResultsPage />} />
                  <Route path="/bestsellers" element={<SearchResultsPage />} />
                  <Route path="/trending" element={<SearchResultsPage />} />
                  <Route path="/brand/:brand" element={<SearchResultsPage />} />
                  <Route path="/seller/:sellerId" element={<SearchResultsPage />} />
                  
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </SellerProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
