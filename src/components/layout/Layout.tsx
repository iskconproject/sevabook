import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Toaster } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function Layout() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen flex">
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto py-6 px-6">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
