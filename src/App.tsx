import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { Layout } from './components/layout/Layout';
import { SellerLayout } from './components/layout/SellerLayout';
import { ManagerLayout } from './components/layout/ManagerLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { RoleBasedRoute } from './components/layout/RoleBasedRoute';
import { RedirectIfAuthenticated } from './components/layout/RedirectIfAuthenticated';
import { LoginPage } from './pages/LoginPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { POSPage } from './pages/POSPage';
import { BarcodePage } from './pages/BarcodePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';

// Import i18n configuration
import './lib/i18n/i18n';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SidebarProvider>
              <Routes>
                {/* Public routes */}
                <Route path="login" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
                <Route path="auth/callback" element={<AuthCallbackPage />} />

                {/* Redirect based on role - This should be first to handle initial routing */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <RoleRedirect />
                  </ProtectedRoute>
                } />

                {/* Admin and Super Admin Layout */}
                <Route path="/admin" element={
                  <RoleBasedRoute allowedRoles={['superAdmin', 'admin']} redirectTo="/">
                    <Layout />
                  </RoleBasedRoute>
                }>
                  <Route index element={<DashboardPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="pos" element={<POSPage />} />
                  <Route path="barcode" element={<BarcodePage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="users" element={<UsersPage />} />
                </Route>

                {/* Seller Layout - POS Only */}
                <Route path="/seller" element={
                  <RoleBasedRoute allowedRoles={['seller']} redirectTo="/">
                    <SellerLayout />
                  </RoleBasedRoute>
                }>
                  <Route index element={<Navigate to="/seller/pos" replace />} />
                  <Route path="pos" element={<POSPage />} />
                </Route>

                {/* Manager Layout - Inventory and Barcode Only */}
                <Route path="/manager" element={
                  <RoleBasedRoute allowedRoles={['manager']} redirectTo="/">
                    <ManagerLayout />
                  </RoleBasedRoute>
                }>
                  <Route index element={<Navigate to="/manager/inventory" replace />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="barcode" element={<BarcodePage />} />
                </Route>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SidebarProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

// Component to redirect users based on their role
function RoleRedirect() {
  const { userRole, loading } = useAuth();

  // Show loading indicator while determining the role
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (userRole === 'seller') {
    return <Navigate to="/seller" replace />;
  } else if (userRole === 'manager') {
    return <Navigate to="/manager" replace />;
  } else if (userRole === 'admin' || userRole === 'superAdmin') {
    // Admin and Super Admin go to the admin dashboard
    return <Navigate to="/admin" replace />;
  } else {
    // If no valid role is found, redirect to login
    return <Navigate to="/login" replace />;
  }
}

export default App;
