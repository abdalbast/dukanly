import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { SellerProvider } from "@/contexts/SellerContext";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import CategoryPage from "./pages/CategoryPage";
import NotFound from "./pages/NotFound";

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
    <CartProvider>
      <SellerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/category/:slug/:subcategory" element={<CategoryPage />} />
              
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
              
              {/* Placeholder routes */}
              <Route path="/deals" element={<SearchResultsPage />} />
              <Route path="/bestsellers" element={<SearchResultsPage />} />
              <Route path="/trending" element={<SearchResultsPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SellerProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
