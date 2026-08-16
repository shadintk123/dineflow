import { BrowserRouter, Routes, Route, Navigate, useLocation, type RouteProps } from 'react-router-dom';
import { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { ToastProvider } from '@/context/ToastContext';
import { ReservationProvider } from '@/context/ReservationContext';
import type { UserRole } from '@/types';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

import { LandingPage } from '@/pages/LandingPage';
import { ExplorePage } from '@/pages/customer/ExplorePage';
import { RestaurantDetailsPage } from '@/pages/customer/RestaurantDetailsPage';
import { ReservationFlow } from '@/pages/customer/ReservationFlow';
import { CustomerDashboard } from '@/pages/customer/CustomerDashboard';
import { CustomerReservations, CustomerOrders, CustomerFavorites, CustomerProfile } from '@/pages/customer/CustomerPages';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { OwnerRegisterPage } from '@/pages/auth/OwnerRegisterPage';
import { AdminLoginPage } from '@/pages/auth/AdminLoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { AuthCallbackPage } from '@/pages/auth/AuthCallbackPage';

import {
  OwnerDashboard, OwnerRestaurants, OwnerMenu, OwnerTables,
  OwnerReservations, OwnerOrders, OwnerKitchen, OwnerReviews, OwnerAnalytics
} from '@/pages/owner/OwnerPages';
import { OwnerWhatsApp } from '@/pages/owner/OwnerWhatsApp';

import {
  AdminDashboard, AdminRestaurants, AdminOwners, AdminCustomers,
  AdminReservations, AdminComplaints, AdminCategories, AdminAnalytics
} from '@/pages/admin/AdminPages';

function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: UserRole[] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory p-4">
        <div className="max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <svg className="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" /></svg>
          </div>
          <h1 className="font-display text-xl font-bold text-ink">Access Denied</h1>
          <p className="mt-2 text-sm text-muted">You don't have permission to access this page.</p>
          <a href={user.role === 'customer' ? '/customer/dashboard' : user.role === 'owner' ? '/owner/dashboard' : '/admin/dashboard'} className="mt-4 inline-block text-sm font-bold text-primary-700 hover:text-primary-800">Go to your dashboard →</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
      <Route path="/explore" element={<PublicLayout><ExplorePage /></PublicLayout>} />
      <Route path="/restaurants" element={<Navigate to="/explore" replace />} />
      <Route path="/restaurants/:id" element={<PublicLayout><RestaurantDetailsPage /></PublicLayout>} />
      <Route path="/reserve" element={<PublicLayout><ReservationFlow /></PublicLayout>} />

      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/owner/register" element={<OwnerRegisterPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Customer routes */}
      <Route path="/customer/dashboard" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/reservations" element={<ProtectedRoute roles={['customer']}><CustomerReservations /></ProtectedRoute>} />
      <Route path="/customer/orders" element={<ProtectedRoute roles={['customer']}><CustomerOrders /></ProtectedRoute>} />
      <Route path="/customer/favorites" element={<ProtectedRoute roles={['customer']}><CustomerFavorites /></ProtectedRoute>} />
      <Route path="/customer/profile" element={<ProtectedRoute roles={['customer']}><CustomerProfile /></ProtectedRoute>} />
      <Route path="/customer/cart" element={<ProtectedRoute roles={['customer']}><ReservationFlow /></ProtectedRoute>} />

      {/* Owner routes */}
      <Route path="/owner/dashboard" element={<ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/owner/restaurants" element={<ProtectedRoute roles={['owner']}><OwnerRestaurants /></ProtectedRoute>} />
      <Route path="/owner/menu" element={<ProtectedRoute roles={['owner']}><OwnerMenu /></ProtectedRoute>} />
      <Route path="/owner/tables" element={<ProtectedRoute roles={['owner']}><OwnerTables /></ProtectedRoute>} />
      <Route path="/owner/reservations" element={<ProtectedRoute roles={['owner']}><OwnerReservations /></ProtectedRoute>} />
      <Route path="/owner/orders" element={<ProtectedRoute roles={['owner']}><OwnerOrders /></ProtectedRoute>} />
      <Route path="/owner/kitchen" element={<ProtectedRoute roles={['owner']}><OwnerKitchen /></ProtectedRoute>} />
      <Route path="/owner/reviews" element={<ProtectedRoute roles={['owner']}><OwnerReviews /></ProtectedRoute>} />
      <Route path="/owner/analytics" element={<ProtectedRoute roles={['owner']}><OwnerAnalytics /></ProtectedRoute>} />
      <Route path="/owner/whatsapp" element={<ProtectedRoute roles={['owner']}><OwnerWhatsApp /></ProtectedRoute>} />
      <Route path="/owner/profile" element={<ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/restaurants" element={<ProtectedRoute roles={['admin']}><AdminRestaurants /></ProtectedRoute>} />
      <Route path="/admin/owners" element={<ProtectedRoute roles={['admin']}><AdminOwners /></ProtectedRoute>} />
      <Route path="/admin/customers" element={<ProtectedRoute roles={['admin']}><AdminCustomers /></ProtectedRoute>} />
      <Route path="/admin/reservations" element={<ProtectedRoute roles={['admin']}><AdminReservations /></ProtectedRoute>} />
      <Route path="/admin/complaints" element={<ProtectedRoute roles={['admin']}><AdminComplaints /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute roles={['admin']}><AdminCategories /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><AdminAnalytics /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <FavoritesProvider>
            <CartProvider>
              <ReservationProvider>
                <AppRoutes />
              </ReservationProvider>
            </CartProvider>
          </FavoritesProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
