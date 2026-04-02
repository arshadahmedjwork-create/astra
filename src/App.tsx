import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/erp/ProtectedRoute";

const About = lazy(() => import("./pages/About"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const NonDairy = lazy(() => import("./pages/NonDairy"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Media = lazy(() => import("./pages/Media"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Support = lazy(() => import("./pages/Support"));
const Contact = lazy(() => import("./pages/Contact"));
const Environment = lazy(() => import("./pages/Environment"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));

// ERP Pages
const ERPLogin = lazy(() => import("./pages/erp/Login"));
const ERPRegister = lazy(() => import("./pages/erp/Register"));
const ERPDashboard = lazy(() => import("./pages/erp/Dashboard"));
const ERPMyProducts = lazy(() => import("./pages/erp/MyProducts"));
const ERPRequestSample = lazy(() => import("./pages/erp/RequestSample"));
const ERPRenewSubscription = lazy(() => import("./pages/erp/RenewSubscription"));
const ERPPaymentHistory = lazy(() => import("./pages/erp/PaymentHistory"));
const ERPMyProfile = lazy(() => import("./pages/erp/MyProfile"));
const ERPCart = lazy(() => import("./pages/erp/Cart"));
const ERPCheckout = lazy(() => import("./pages/erp/Checkout"));
const ERPOrderHistory = lazy(() => import("./pages/erp/OrderHistory"));
const ERPMySubscriptions = lazy(() => import("./pages/erp/MySubscriptions"));
const ERPOrderTracking = lazy(() => import("./pages/erp/OrderTracking"));
const ERPLiveTracking = lazy(() => import("./pages/erp/LiveTrackingSearch"));
const ERPWallet = lazy(() => import("./pages/erp/Wallet"));

// Admin Pages
import AdminLayout from "./components/admin/AdminLayout";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));
const AdminSamples = lazy(() => import("./pages/admin/AdminSamples"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminDrivers = lazy(() => import("./pages/admin/AdminDrivers"));
const AdminAllOrders = lazy(() => import("./pages/admin/AdminAllOrders"));
const AdminOrderTracking = lazy(() => import("./pages/admin/AdminOrderTracking"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/non-dairy" element={<NonDairy />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/media" element={<Media />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/support" element={<Support />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/environment" element={<Environment />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* ERP Portal Routes */}
            <Route path="/erp/login" element={<ERPLogin />} />
            <Route path="/erp/register" element={<ERPRegister />} />
            <Route path="/erp/dashboard" element={<ProtectedRoute><ERPDashboard /></ProtectedRoute>} />
            <Route path="/erp/products" element={<ProtectedRoute><ERPMyProducts /></ProtectedRoute>} />
            <Route path="/erp/request-sample" element={<ProtectedRoute><ERPRequestSample /></ProtectedRoute>} />
            <Route path="/erp/subscription" element={<ProtectedRoute><ERPRenewSubscription /></ProtectedRoute>} />
            <Route path="/erp/payments" element={<ProtectedRoute><ERPPaymentHistory /></ProtectedRoute>} />
            <Route path="/erp/profile" element={<ProtectedRoute><ERPMyProfile /></ProtectedRoute>} />
            <Route path="/erp/cart" element={<ProtectedRoute><ERPCart /></ProtectedRoute>} />
            <Route path="/erp/checkout" element={<ProtectedRoute><ERPCheckout /></ProtectedRoute>} />
            <Route path="/erp/orders" element={<ProtectedRoute><ERPOrderHistory /></ProtectedRoute>} />
            <Route path="/erp/subscriptions" element={<ProtectedRoute><ERPMySubscriptions /></ProtectedRoute>} />
            <Route path="/erp/track" element={<ProtectedRoute><ERPLiveTracking /></ProtectedRoute>} />
            <Route path="/erp/track/:orderId" element={<ProtectedRoute><ERPOrderTracking /></ProtectedRoute>} />
            <Route path="/erp/wallet" element={<ProtectedRoute><ERPWallet /></ProtectedRoute>} />

            {/* Admin Portal Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/track/:orderId" element={<AdminOrderTracking />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="samples" element={<AdminSamples />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="drivers" element={<AdminDrivers />} />
                <Route path="all-orders" element={<AdminAllOrders />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
