import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PackageIcon, ShoppingCartIcon, AlertTriangleIcon, ReceiptIcon, PlusIcon, Loader2Icon } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { useLocation } from '@/contexts/LocationContext';

export function DashboardPage() {
  const { t } = useTranslation();
  const { currentLocation } = useLocation();
  const stats = useDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">
          {currentLocation ? `${t('dashboard.welcome')} - ${currentLocation.name}` : t('dashboard.welcome')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalSales')}
            </CardTitle>
            <ShoppingCartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span>{t('common.loading')}</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalSales}</div>
                <p className="text-xs text-muted-foreground">
                  {currentLocation?.name}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Items Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalItems')}
            </CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span>{t('common.loading')}</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalItems}</div>
                <p className="text-xs text-muted-foreground">
                  {t('inventory.title')} - {currentLocation?.name}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Items Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.lowStock')}
            </CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span>{t('common.loading')}</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.lowStockItems}</div>
                <p className="text-xs text-muted-foreground">
                  {t('inventory.lowStockAlert')} - {currentLocation?.name}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.recentTransactions')}
            </CardTitle>
            <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span>{t('common.loading')}</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.recentTransactions.length}</div>
                <p className="text-xs text-muted-foreground">
                  {currentLocation?.name}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:border-primary hover:shadow-md transition-all">
          <Link to="/pos" className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {t('pos.title')}
              </CardTitle>
              <ShoppingCartIcon className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t('pos.newSale')}
              </p>
              <Button variant="default" className="w-full">
                <ShoppingCartIcon className="mr-2 h-4 w-4" />
                {t('pos.startNewSale')}
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary hover:shadow-md transition-all">
          <Link to="/inventory" className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {t('inventory.title')}
              </CardTitle>
              <PackageIcon className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t('inventory.manageInventory')}
              </p>
              <Button variant="default" className="w-full">
                <PlusIcon className="mr-2 h-4 w-4" />
                {t('inventory.addItem')}
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentTransactions')}</CardTitle>
          <CardDescription>
            Recent sales and transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2Icon className="h-8 w-8 animate-spin mr-2" />
              <span>{t('common.loading')}</span>
            </div>
          ) : stats.recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('dashboard.noRecentTransactions')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium">ID</th>
                    <th className="pb-2 text-left font-medium">Date</th>
                    <th className="pb-2 text-left font-medium">Customer</th>
                    <th className="pb-2 text-left font-medium">Items</th>
                    <th className="pb-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b">
                      <td className="py-3">{transaction.id}</td>
                      <td className="py-3">{transaction.date}</td>
                      <td className="py-3">{transaction.customer}</td>
                      <td className="py-3">{transaction.items}</td>
                      <td className="py-3 text-right">{transaction.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
