import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/erp/ProtectedRoute";
import ScrollToTop from "@/components/layout/ScrollToTop";

const About = lazy(() => import("./pages/About"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
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
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const RouteScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

import { AnimatePresence, motion } from "framer-motion";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/products" element={<PageTransition><Products /></PageTransition>} />
        <Route path="/products/:slug" element={<PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
        <Route path="/media" element={<PageTransition><Media /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
        <Route path="/support" element={<PageTransition><Support /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/environment" element={<PageTransition><Environment /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />

        {/* ERP Portal Routes */}
        <Route path="/erp/login" element={<PageTransition><ERPLogin /></PageTransition>} />
        <Route path="/erp/register" element={<PageTransition><ERPRegister /></PageTransition>} />
        <Route path="/erp/dashboard" element={<ProtectedRoute><PageTransition><ERPDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/erp/products" element={<ProtectedRoute><PageTransition><ERPMyProducts /></PageTransition></ProtectedRoute>} />
        <Route path="/erp/request-sample" element={<ProtectedRoute><PageTransition><ERPRequestSample /></PageTransition></ProtectedRoute>} />
        <Route path="/erp/subscription" element={<ProtectedRoute><PageTransition><ERPRenewSubscription /></PageTransition></ProtectedRoute>} />
        <Route path="/erp/payments" element={<ProtectedRoute><PageTransition><ERPPaymentHistory /></PageTransition></ProtectedRoute>} />
        <Route path="/erp/profile" element={<ProtectedRoute><PageTransition><ERPMyProfile /></PageTransition></ProtectedRoute>} />
        <Route path="/erp/cart" element={<ProtectedRoute><PageTransition><ERPCart /></PageTransition></ProtectedRoute>} />
        <Route path="/erp/checkout" element={<ProtectedRoute><PageTransition><ERPCheckout /></PageTransition></ProtectedRoute>} />
        <Route path="/erp/orders" element={<ProtectedRoute><PageTransition><ERPOrderHistory /></PageTransition></ProtectedRoute>} />
        <Route path="/erp/subscriptions" element={<ProtectedRoute><PageTransition><ERPMySubscriptions /></PageTransition></ProtectedRoute>} />
        <Route path="/erp/track" element={<ProtectedRoute><PageTransition><ERPLiveTracking /></PageTransition></ProtectedRoute>} />
        <Route path="/erp/track/:orderId" element={<ProtectedRoute><PageTransition><ERPOrderTracking /></PageTransition></ProtectedRoute>} />
        <Route path="/erp/wallet" element={<ProtectedRoute><PageTransition><ERPWallet /></PageTransition></ProtectedRoute>} />

        {/* Admin Portal Routes */}
        <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path="/admin" element={<AdminProtectedRoute />}>
          <Route element={<PageTransition><AdminLayout /></PageTransition>}>
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
            <Route path="messages" element={<AdminMessages />} />
          </Route>
        </Route>

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteScrollToTop />
        <ScrollToTop />
        <Suspense fallback={<Loading />}>
          <AnimatedRoutes />
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
