import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Toaster } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { PackageIcon, BarcodeIcon } from 'lucide-react';

export function ManagerLayout() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto py-6 px-6">
        <div className="flex gap-4 mb-6">
          <Button asChild variant="outline" size="lg" className="flex-1">
            <Link to="/inventory" className="flex items-center gap-2">
              <PackageIcon className="h-5 w-5" />
              <span>{t('inventory.title')}</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1">
            <Link to="/barcode" className="flex items-center gap-2">
              <BarcodeIcon className="h-5 w-5" />
              <span>{t('barcode.title')}</span>
            </Link>
          </Button>
        </div>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
