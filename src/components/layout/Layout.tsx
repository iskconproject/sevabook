import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Toaster } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function Layout() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen">
      <Header />
      {user && <Sidebar />}
      <main className={`min-h-[calc(100vh-4rem)] ${user ? 'lg:pl-64' : ''}`}>
        <div className="container py-6">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
