import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DownloadIcon, FilterIcon, PrinterIcon, BarChart3Icon, PieChartIcon, LineChartIcon } from 'lucide-react';

// Mock sales data
const mockSalesData = [
  { id: '1', date: '2023-06-15', items: 3, amount: '₹1,200', paymentMethod: 'cash' },
  { id: '2', date: '2023-06-14', items: 2, amount: '₹850', paymentMethod: 'upi' },
  { id: '3', date: '2023-06-14', items: 5, amount: '₹3,400', paymentMethod: 'card' },
  { id: '4', date: '2023-06-13', items: 1, amount: '₹450', paymentMethod: 'cash' },
  { id: '5', date: '2023-06-13', items: 4, amount: '₹1,800', paymentMethod: 'upi' },
  { id: '6', date: '2023-06-12', items: 2, amount: '₹900', paymentMethod: 'cash' },
  { id: '7', date: '2023-06-12', items: 3, amount: '₹1,350', paymentMethod: 'card' },
  { id: '8', date: '2023-06-11', items: 6, amount: '₹2,700', paymentMethod: 'upi' },
];

// Mock inventory data
const mockInventoryData = [
  { id: '1', name: 'Bhagavad Gita As It Is', category: 'books', language: 'english', price: '₹250', stock: 45, sold: 120 },
  { id: '2', name: 'Bhagavad Gita As It Is', category: 'books', language: 'bengali', price: '₹220', stock: 32, sold: 85 },
  { id: '3', name: 'Bhagavad Gita As It Is', category: 'books', language: 'hindi', price: '₹230', stock: 28, sold: 92 },
  { id: '4', name: 'Sri Chaitanya Charitamrita', category: 'books', language: 'english', price: '₹450', stock: 15, sold: 45 },
  { id: '5', name: 'Incense Sticks (Sandalwood)', category: 'incense', language: 'none', price: '₹50', stock: 120, sold: 350 },
  { id: '6', name: 'Deity Dress (Small)', category: 'clothing', language: 'none', price: '₹350', stock: 8, sold: 12 },
  { id: '7', name: 'Japa Mala', category: 'puja', language: 'none', price: '₹180', stock: 25, sold: 40 },
  { id: '8', name: 'Krishna Murti (Brass, 8")', category: 'deities', language: 'none', price: '₹1200', stock: 5, sold: 8 },
];

export function ReportsPage() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calculate summary statistics
  const totalSales = mockSalesData.reduce((sum, sale) => sum + parseInt(sale.amount.replace(/[₹,]/g, '')), 0);
  const totalItems = mockSalesData.reduce((sum, sale) => sum + sale.items, 0);
  const averageSale = totalSales / mockSalesData.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('reports.title')}</h1>
        <p className="text-muted-foreground">{t('reports.title')} - {t('app.name')}</p>
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
            <div className="text-2xl font-bold">₹{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
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
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
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
            <div className="text-2xl font-bold">₹{averageSale.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
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
              <Button>
                <FilterIcon className="mr-2 h-4 w-4" />
                {t('reports.filter')}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="sales">
            <TabsList className="mb-4">
              <TabsTrigger value="sales">{t('reports.salesReport')}</TabsTrigger>
              <TabsTrigger value="inventory">{t('reports.inventoryReport')}</TabsTrigger>
            </TabsList>

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
                    {mockSalesData.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.date}</TableCell>
                        <TableCell>{sale.items}</TableCell>
                        <TableCell>{t(`pos.${sale.paymentMethod}`)}</TableCell>
                        <TableCell className="text-right">{sale.amount}</TableCell>
                      </TableRow>
                    ))}
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
                    {mockInventoryData.map((item) => (
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
                        <TableCell className="text-right">{item.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {mockSalesData.length} {t('reports.transactions')}
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <PrinterIcon className="mr-2 h-4 w-4" />
              {t('reports.print')}
            </Button>
            <Button>
              <DownloadIcon className="mr-2 h-4 w-4" />
              {t('reports.export')}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
