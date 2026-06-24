import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cart-context";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import SellerApplication from "./pages/SellerApplication";
import SellerDashboard from "./pages/SellerDashboard";
import SellerProductForm from "./pages/SellerProductForm";
import SellerProfile from "./pages/SellerProfile";
import BulkListingForm from "./pages/BulkListingForm";
import RFQForm from "./pages/RFQForm";
import QuoteComparison from "./pages/QuoteComparison";
import BulkOrderDashboard from "./pages/BulkOrderDashboard";
import BusinessVerification from "./pages/BusinessVerification";
import ResellerApplication from "./pages/ResellerApplication";
import ResellerDashboard from "./pages/ResellerDashboard";
import ProductShare from "./pages/ProductShare";
import ServiceProviderRegistration from "./pages/ServiceProviderRegistration";
import ServiceProviderProfile from "./pages/ServiceProviderProfile";
import ServiceListingForm from "./pages/ServiceListingForm";
import SkillsMarketplace from "./pages/SkillsMarketplace";
import ServiceDetail from "./pages/ServiceDetail";
import ServiceRequests from "./pages/ServiceRequests";
import ServiceProposals from "./pages/ServiceProposals";
import ServiceChat from "./pages/ServiceChat";
import ServiceProjectsDashboard from "./pages/ServiceProjectsDashboard";
import { useAuth } from "@/features/auth/auth.store";
import {getCurrentUser} from "@/api/auth.api";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await getCurrentUser();
        if (res.data.user) {
          useAuth.getState().setUser(res.data.user);
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };
    loadUser();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />   
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/seller/application" element={<SellerApplication />} />
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/seller/products/new" element={<SellerProductForm />} />
              <Route path="/seller/:id" element={<SellerProfile />} />
              <Route path="/bulk/create" element={<BulkListingForm />} />
              <Route path="/rfq/:productId" element={<RFQForm />} />
              <Route path="/rfq/:rfqId/quotes" element={<QuoteComparison />} />
              <Route path="/bulk/orders" element={<BulkOrderDashboard />} />
              <Route path="/verify/business" element={<BusinessVerification />} />
              <Route path="/reseller/apply" element={<ResellerApplication />} />
              <Route path="/reseller/dashboard" element={<ResellerDashboard />} />
              <Route path="/share/:productId" element={<ProductShare />} />
              <Route path="/skills/register" element={<ServiceProviderRegistration />} />
              <Route path="/skills/profile" element={<ServiceProviderProfile />} />
              <Route path="/skills/create" element={<ServiceListingForm />} />
              <Route path="/skills/marketplace" element={<SkillsMarketplace />} />
              <Route path="/skills/:id" element={<ServiceDetail />} />
              <Route path="/skills/requests" element={<ServiceRequests />} />
              <Route path="/skills/requests/:requestId/proposals" element={<ServiceProposals />} />
              <Route path="/skills/chat/:projectId" element={<ServiceChat />} />
              <Route path="/skills/projects" element={<ServiceProjectsDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
)};

export default App;
