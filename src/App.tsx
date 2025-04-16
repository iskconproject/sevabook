import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
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
                <Route path="/" element={<Layout />}>
                  {/* Public routes */}
                  <Route path="login" element={<LoginPage />} />
                  <Route path="signup" element={<SignupPage />} />

                  {/* Protected routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/inventory" element={
                    <ProtectedRoute>
                      <InventoryPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/pos" element={
                    <ProtectedRoute>
                      <POSPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/barcode" element={
                    <ProtectedRoute>
                      <BarcodePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <ReportsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/users" element={
                    <ProtectedRoute>
                      <UsersPage />
                    </ProtectedRoute>
                  } />

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </SidebarProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
