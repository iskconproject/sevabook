import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Toaster } from 'sonner';
// Auth context is not used directly in this component

export function SellerLayout() {
  // User is not used in this component

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-6 px-6">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
