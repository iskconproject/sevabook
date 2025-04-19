import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DownloadIcon, FilterIcon, PrinterIcon, BarChart3Icon, PieChartIcon, LineChartIcon, Loader2Icon } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useLocation } from '@/contexts/LocationContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { downloadCSV, formatDateForFilename } from '@/lib/utils/exportUtils';



export function ReportsPage() {
  const { t } = useTranslation();
  const { currentLocation } = useLocation();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('sales');

  const {
    salesData,
    inventoryData,
    summary,
    loading,
    error,
    fetchTransactionsByDateRange,
    fetchInventoryReport
  } = useReports();

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Default to last 30 days if no date range is selected
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const formattedStartDate = format(thirtyDaysAgo, 'yyyy-MM-dd');
        const formattedEndDate = format(new Date(), 'yyyy-MM-dd');

        setStartDate(formattedStartDate);
        setEndDate(formattedEndDate);

        await fetchTransactionsByDateRange(formattedStartDate, formattedEndDate, currentLocation?.id);
        await fetchInventoryReport(currentLocation?.id);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        toast.error(t('errors.fetchFailed'), {
          description: t('reports.fetchError')
        });
      }
    };

    fetchInitialData();
  }, [currentLocation]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle filter button click
  const handleFilterClick = async () => {
    try {
      if (activeTab === 'sales') {
        await fetchTransactionsByDateRange(startDate, endDate, currentLocation?.id);
      } else {
        await fetchInventoryReport(currentLocation?.id);
      }
    } catch (err) {
      console.error('Error applying filter:', err);
      toast.error(t('errors.fetchFailed'), {
        description: t('reports.filterError')
      });
    }
  };

  // Handle export button click
  const handleExport = () => {
    try {
      const dateStr = formatDateForFilename();

      if (activeTab === 'sales') {
        if (salesData.length === 0) {
          toast.error(t('reports.noDataToExport'));
          return;
        }

        // Prepare sales data for export
        const exportData = salesData.map(sale => ({
          date: format(new Date(sale.created_at), 'yyyy-MM-dd'),
          items: sale.items_count,
          payment_method: t(`pos.${sale.payment_method}`),
          amount: sale.total
        }));

        // Define headers for CSV
        const headers = [
          t('reports.date'),
          t('inventory.title'),
          t('pos.paymentMethod'),
          t('pos.amount')
        ];

        // Download CSV
        downloadCSV(exportData, `sales-report-${dateStr}.csv`, headers);

        toast.success(t('reports.exportSuccess'), {
          description: t('reports.salesExportDescription')
        });
      } else {
        if (inventoryData.length === 0) {
          toast.error(t('reports.noDataToExport'));
          return;
        }

        // Prepare inventory data for export
        const exportData = inventoryData.map(item => ({
          name: item.name + (item.language && item.language !== 'none' ? ` (${t(`inventory.languages.${item.language}`)})` : ''),
          category: t(`inventory.categories.${item.category}`),
          stock: item.stock,
          sold: item.sold,
          price: item.price
        }));

        // Define headers for CSV
        const headers = [
          t('inventory.name'),
          t('inventory.category'),
          t('inventory.stock'),
          t('reports.sold'),
          t('inventory.price')
        ];

        // Download CSV
        downloadCSV(exportData, `inventory-report-${dateStr}.csv`, headers);

        toast.success(t('reports.exportSuccess'), {
          description: t('reports.inventoryExportDescription')
        });
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      toast.error(t('reports.exportError'), {
        description: t('errors.unknownError')
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('reports.title')}</h1>
        <p className="text-muted-foreground">
          {currentLocation ? `${t('reports.title')} - ${currentLocation.name}` : `${t('reports.title')} - ${t('app.name')}`}
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.totalSales')}
            </CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {currentLocation?.name || t('app.name')}
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.totalItems')}
            </CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {currentLocation?.name || t('app.name')}
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.averageSale')}
            </CardTitle>
            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.averageSale.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {currentLocation?.name || t('app.name')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('reports.title')}</CardTitle>
          <CardDescription>
            {t('reports.dateRange')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="grid flex-1 gap-2">
              <label className="text-sm font-medium">{t('reports.startDate')}</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid flex-1 gap-2">
              <label className="text-sm font-medium">{t('reports.endDate')}</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleFilterClick} disabled={loading}>
                {loading ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FilterIcon className="mr-2 h-4 w-4" />
                )}
                {t('reports.filter')}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="sales" onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="sales">{t('reports.salesReport')}</TabsTrigger>
              <TabsTrigger value="inventory">{t('reports.inventoryReport')}</TabsTrigger>
            </TabsList>

            {error && (
              <div className="my-4 rounded-md bg-destructive/15 p-3 text-destructive">
                <p>{t('errors.fetchFailed')}</p>
                <p className="text-sm">{error.message}</p>
              </div>
            )}

            <TabsContent value="sales" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('reports.date')}</TableHead>
                      <TableHead>{t('inventory.title')}</TableHead>
                      <TableHead>{t('pos.paymentMethod')}</TableHead>
                      <TableHead className="text-right">{t('pos.amount')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          <Loader2Icon className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : salesData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          {t('reports.noTransactions')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      salesData.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{format(new Date(sale.created_at), 'yyyy-MM-dd')}</TableCell>
                          <TableCell>{sale.items_count}</TableCell>
                          <TableCell>{t(`pos.${sale.payment_method}`)}</TableCell>
                          <TableCell className="text-right">₹{sale.total.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('inventory.name')}</TableHead>
                      <TableHead>{t('inventory.category')}</TableHead>
                      <TableHead>{t('inventory.stock')}</TableHead>
                      <TableHead>{t('reports.sold')}</TableHead>
                      <TableHead className="text-right">{t('inventory.price')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <Loader2Icon className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : inventoryData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          {t('reports.noInventory')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventoryData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.name}
                            {item.language && item.language !== 'none' && <span className="ml-1 text-xs text-muted-foreground">
                              ({t(`inventory.languages.${item.language}`)})
                            </span>}
                          </TableCell>
                          <TableCell>{t(`inventory.categories.${item.category}`)}</TableCell>
                          <TableCell>{item.stock}</TableCell>
                          <TableCell>{item.sold}</TableCell>
                          <TableCell className="text-right">₹{item.price}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {activeTab === 'sales' ? (
              <>{summary.transactionCount} {t('reports.transactions')}</>
            ) : (
              <>{inventoryData.length} {t('inventory.items')}</>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <PrinterIcon className="mr-2 h-4 w-4" />
              {t('reports.print')}
            </Button>
            <Button onClick={handleExport} disabled={loading || (activeTab === 'sales' ? salesData.length === 0 : inventoryData.length === 0)}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              {t('reports.export')}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
