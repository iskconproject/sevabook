import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboardIcon, 
  PackageIcon, 
  ShoppingCartIcon, 
  BarChartIcon, 
  SettingsIcon, 
  UsersIcon, 
  BarcodeIcon 
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

function SidebarItem({ icon, label, href, active }: SidebarItemProps) {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 px-2",
        active && "bg-sidebar-accent text-sidebar-accent-foreground"
      )}
    >
      <Link to={href}>
        {icon}
        <span>{label}</span>
      </Link>
    </Button>
  );
}

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const pathname = location.pathname;

  const routes = [
    {
      icon: <LayoutDashboardIcon className="h-5 w-5" />,
      label: t('dashboard.title'),
      href: '/',
    },
    {
      icon: <PackageIcon className="h-5 w-5" />,
      label: t('inventory.title'),
      href: '/inventory',
    },
    {
      icon: <ShoppingCartIcon className="h-5 w-5" />,
      label: t('pos.title'),
      href: '/pos',
    },
    {
      icon: <BarcodeIcon className="h-5 w-5" />,
      label: t('barcode.title'),
      href: '/barcode',
    },
    {
      icon: <BarChartIcon className="h-5 w-5" />,
      label: t('reports.title'),
      href: '/reports',
    },
    {
      icon: <UsersIcon className="h-5 w-5" />,
      label: t('users.title'),
      href: '/users',
    },
    {
      icon: <SettingsIcon className="h-5 w-5" />,
      label: t('settings.title'),
      href: '/settings',
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-sidebar-primary">{t('app.name')}</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {routes.map((route) => (
          <SidebarItem
            key={route.href}
            icon={route.icon}
            label={route.label}
            href={route.href}
            active={pathname === route.href}
          />
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="text-xs text-sidebar-foreground/70">
          <p>{t('app.name')} &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </aside>
  );
}
