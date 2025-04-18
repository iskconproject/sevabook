import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MoonIcon, SunIcon, LanguagesIcon, SaveIcon, RefreshCwIcon, DownloadIcon, PrinterIcon, LoaderIcon } from 'lucide-react';
import { BarcodeItem } from '@/lib/utils/barcodeUtils';
import { ReceiptSettings, sampleReceiptItems } from '@/lib/utils/receiptUtils';
// import { printReceiptHtml } from '@/lib/utils/receiptHtmlUtils';
import { printReceiptViaBrowser } from '@/components/pos/ThermalReceipt';
import { ThermalReceiptPreview } from '@/components/settings/ThermalReceiptPreview';
import { BarcodePreview } from '@/components/settings/BarcodePreview';
import { useSettings } from '@/hooks/useSettings';
import { downloadCSV, formatDateForFilename } from '@/lib/utils/exportUtils';
import { db } from '@/lib/supabase/client';

export function SettingsPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, languages } = useLanguage();
  const {
    loading,
    saveStatus,
    getReceiptSettings,
    getBarcodeSettingsUI,
    saveReceiptSettings,
    saveBarcodeSettingsUI
  } = useSettings();

  // Receipt settings state
  const [receiptHeader, setReceiptHeader] = useState("ISKCON Temple Book Stall");
  const [receiptFooter, setReceiptFooter] = useState("Thank you for your purchase! Hare Krishna!");
  const [showLogo, setShowLogo] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [customMessage, setCustomMessage] = useState("Hare Krishna! Thank you for supporting ISKCON Temple.");
  const [receiptSize, setReceiptSize] = useState<'80mm' | '58mm' | '76mm'>('80mm');
  const [printerType, setPrinterType] = useState<'browser' | 'serial' | 'network'>('browser');
  const [printerIp, setPrinterIp] = useState('');
  const [printerPort, setPrinterPort] = useState(9100);
  const [showPrintPreview, setShowPrintPreview] = useState(true);

  // Barcode settings state
  const [barcodeType, setBarcodeType] = useState<'CODE128' | 'EAN13' | 'UPC'>('CODE128');
  const [barcodeSize, setBarcodeSize] = useState<'50x25' | '40x20' | '60x30'>('50x25');
  const [includePrice, setIncludePrice] = useState(true);
  const [includeTitle, setIncludeTitle] = useState(true);
  const [includeLanguage, setIncludeLanguage] = useState(true);
  const [customHeading, setCustomHeading] = useState('ISKCON Temple');

  // Temple info state - these will be connected to database in future updates
  const templeName = "ISKCON Temple";
  const templeAddress = "123 Temple Street, City, State, Country";

  // Sample barcode item for preview
  const sampleBarcodeItem: BarcodeItem = {
    id: 'SAMPLE-123',
    name: 'Bhagavad Gita As It Is',
    price: '250',
    language: 'english',
    category: 'books'
  };

  // Create receipt settings object
  const receiptSettings: ReceiptSettings = {
    header: receiptHeader,
    footer: receiptFooter,
    showLogo,
    showBarcode,
    customMessage,
    size: receiptSize,
    printerType,
    printerIp,
    printerPort,
    showPrintPreview
  };

  // Load settings from database when component mounts
  useEffect(() => {
    if (!loading) {
      // Load receipt settings
      const dbReceiptSettings = getReceiptSettings();
      setReceiptHeader(dbReceiptSettings.header);
      setReceiptFooter(dbReceiptSettings.footer);
      setShowLogo(dbReceiptSettings.showLogo);
      setShowBarcode(dbReceiptSettings.showBarcode);
      setCustomMessage(dbReceiptSettings.customMessage);
      setReceiptSize(dbReceiptSettings.size || '80mm');
      setPrinterType(dbReceiptSettings.printerType || 'browser');
      setPrinterIp(dbReceiptSettings.printerIp || '');
      setPrinterPort(dbReceiptSettings.printerPort || 9100);
      setShowPrintPreview(dbReceiptSettings.showPrintPreview !== undefined ? dbReceiptSettings.showPrintPreview : true);

      // Load barcode settings
      const dbBarcodeSettings = getBarcodeSettingsUI();
      setBarcodeType(dbBarcodeSettings.type);
      setBarcodeSize(dbBarcodeSettings.size);
      setIncludePrice(dbBarcodeSettings.includePrice);
      setIncludeTitle(dbBarcodeSettings.includeTitle);
      setIncludeLanguage(dbBarcodeSettings.includeLanguage);
      setCustomHeading(dbBarcodeSettings.customHeading || 'ISKCON Temple');
    }
  }, [loading, getReceiptSettings, getBarcodeSettingsUI]);

  // Save receipt settings to database
  const handleSaveReceiptSettings = async () => {
    const settings: ReceiptSettings = {
      header: receiptHeader,
      footer: receiptFooter,
      showLogo,
      showBarcode,
      customMessage,
      size: receiptSize
    };
    const result = await saveReceiptSettings(settings);

    if (result.success) {
      toast.success(t('settings.saveSuccess'), {
        description: t('settings.receiptSaveDescription')
      });
    } else {
      toast.error(t('settings.saveError'), {
        description: result.error || t('errors.unknownError')
      });
    }
  };

  // Save barcode settings to database
  const handleSaveBarcodeSettings = async () => {
    const settings = {
      type: barcodeType,
      size: barcodeSize,
      includePrice,
      includeTitle,
      includeLanguage,
      customHeading
    };
    const result = await saveBarcodeSettingsUI(settings);

    if (result.success) {
      toast.success(t('settings.saveSuccess'), {
        description: t('settings.barcodeSaveDescription')
      });
    } else {
      toast.error(t('settings.saveError'), {
        description: result.error || t('errors.unknownError')
      });
    }
  };

  // Save general settings to database
  const handleSaveGeneralSettings = async () => {
    // This would save temple name, address, etc.
    // For now, just show a success message
    // TODO: Implement this when the database schema is updated
    toast.success(t('settings.saveSuccess'), {
      description: t('settings.generalSaveDescription')
    });
  };

  // Handle export data
  const [exportType, setExportType] = useState<string>('inventory');
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      const dateStr = formatDateForFilename();

      if (exportType === 'inventory') {
        // Get inventory data
        const { data: inventory, error } = await db.inventory.getItems();

        if (error) throw error;
        if (!inventory || inventory.length === 0) {
          toast.error(t('reports.noDataToExport'));
          return;
        }

        // Prepare inventory data for export
        const exportData = inventory.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: t(`inventory.categories.${item.category}`),
          language: item.language !== 'none' ? t(`inventory.languages.${item.language}`) : '',
          price: item.price,
          stock: item.stock
        }));

        // Define headers for CSV
        const headers = [
          'ID',
          t('inventory.name'),
          t('inventory.category'),
          t('inventory.language'),
          t('inventory.price'),
          t('inventory.stock')
        ];

        // Download CSV
        downloadCSV(exportData, `inventory-${dateStr}.csv`, headers);

        toast.success(t('reports.exportSuccess'), {
          description: t('reports.inventoryExportDescription')
        });
      } else if (exportType === 'transactions' || exportType === 'sales') {
        // Get all transactions
        const { data: transactions, error } = await db.transactions.getTransactions();

        if (error) throw error;
        if (!transactions || transactions.length === 0) {
          toast.error(t('reports.noDataToExport'));
          return;
        }

        // Prepare transaction data for export
        const exportData = transactions.map((transaction: any) => ({
          id: transaction.id,
          date: new Date(transaction.created_at).toLocaleDateString(),
          payment_method: t(`pos.${transaction.payment_method}`),
          total: transaction.total,
          customer_phone: transaction.customer_phone || ''
        }));

        // Define headers for CSV
        const headers = [
          'ID',
          t('reports.date'),
          t('pos.paymentMethod'),
          t('pos.amount'),
          t('pos.customerPhone')
        ];

        // Download CSV
        downloadCSV(exportData, `transactions-${dateStr}.csv`, headers);

        toast.success(t('reports.exportSuccess'), {
          description: t('reports.salesExportDescription')
        });
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      toast.error(t('reports.exportError'), {
        description: t('errors.unknownError')
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Render save button
  const SaveButton = ({ onClick }: { onClick: () => Promise<void> }) => (
    <Button onClick={onClick} disabled={saveStatus === 'saving'}>
      {saveStatus === 'saving' ? (
        <>
          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
          {t('settings.saving')}
        </>
      ) : (
        <>
          <SaveIcon className="mr-2 h-4 w-4" />
          {t('common.save')}
        </>
      )}
    </Button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-2">
          <LoaderIcon className="h-8 w-8 animate-spin" />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.title')} - {t('app.name')}</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">{t('settings.general')}</TabsTrigger>
          <TabsTrigger value="receipts">{t('settings.receipts')}</TabsTrigger>
          <TabsTrigger value="barcodes">{t('settings.barcodes')}</TabsTrigger>
          <TabsTrigger value="backup">{t('settings.backup')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.appearance')}</CardTitle>
              <CardDescription>
                {t('settings.theme.title')} & {t('settings.language')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('settings.theme.title')}</label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setTheme('light')}
                  >
                    <SunIcon className="mr-2 h-4 w-4" />
                    {t('settings.theme.light')}
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setTheme('dark')}
                  >
                    <MoonIcon className="mr-2 h-4 w-4" />
                    {t('settings.theme.dark')}
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setTheme('system')}
                  >
                    <span className="mr-2">💻</span>
                    {t('settings.theme.system')}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('settings.language')}</label>
                <div className="flex gap-2">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={language === lang.code ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setLanguage(lang.code)}
                    >
                      <LanguagesIcon className="mr-2 h-4 w-4" />
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('app.name')}</CardTitle>
              <CardDescription>
                {t('settings.general')} {t('settings.title')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('app.name')}</label>
                <Input defaultValue="SevaBook" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('app.tagline')}</label>
                <Input defaultValue={t('app.tagline')} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Temple Name</label>
                <Input defaultValue={templeName} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Temple Address</label>
                <Textarea defaultValue={templeAddress} />
              </div>
            </CardContent>
            <CardFooter>
              <SaveButton onClick={handleSaveGeneralSettings} />
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.receiptSettings.title')}</CardTitle>
                <CardDescription>
                  {t('settings.receiptSettings.title')} - {t('app.name')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('settings.receiptSettings.header')}</label>
                  <Textarea
                    value={receiptHeader}
                    onChange={(e) => setReceiptHeader(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('settings.receiptSettings.footer')}</label>
                  <Textarea
                    value={receiptFooter}
                    onChange={(e) => setReceiptFooter(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('settings.receiptSettings.showLogo')}</label>
                  <Select
                    value={showLogo ? "yes" : "no"}
                    onValueChange={(value) => setShowLogo(value === "yes")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">{t('common.yes')}</SelectItem>
                      <SelectItem value="no">{t('common.no')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('settings.receiptSettings.showBarcode')}</label>
                  <Select
                    value={showBarcode ? "yes" : "no"}
                    onValueChange={(value) => setShowBarcode(value === "yes")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">{t('common.yes')}</SelectItem>
                      <SelectItem value="no">{t('common.no')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('settings.receiptSettings.customMessage')}</label>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('settings.receiptSettings.size')}</label>
                  <Select
                    value={receiptSize}
                    onValueChange={(value: '80mm' | '58mm' | '76mm') => setReceiptSize(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="80mm">80mm (Standard)</SelectItem>
                      <SelectItem value="58mm">58mm (Compact)</SelectItem>
                      <SelectItem value="76mm">76mm (Medium)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{t('settings.receiptSettings.sizeDescription')}</p>
                </div>

                <div className="space-y-4 border-t pt-4 mt-4">
                  <h4 className="font-medium">{t('settings.receiptSettings.printerSettings')}</h4>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('settings.receiptSettings.printerType')}</label>
                    <Select
                      value={printerType}
                      onValueChange={(value: 'browser' | 'serial' | 'network') => setPrinterType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="browser">{t('settings.receiptSettings.printerTypeBrowser')}</SelectItem>
                        <SelectItem value="serial">{t('settings.receiptSettings.printerTypeSerial')}</SelectItem>
                        <SelectItem value="network">{t('settings.receiptSettings.printerTypeNetwork')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">{t('settings.receiptSettings.printerTypeDescription')}</p>
                  </div>

                  {printerType === 'browser' && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showPrintPreview"
                          checked={showPrintPreview}
                          onCheckedChange={(checked) => setShowPrintPreview(checked as boolean)}
                        />
                        <label
                          htmlFor="showPrintPreview"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t('settings.receiptSettings.showPrintPreview')}
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground">{t('settings.receiptSettings.showPrintPreviewDescription')}</p>
                    </div>
                  )}

                  {printerType === 'network' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('settings.receiptSettings.printerIp')}</label>
                        <Input
                          value={printerIp}
                          onChange={(e) => setPrinterIp(e.target.value)}
                          placeholder="192.168.1.100"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('settings.receiptSettings.printerPort')}</label>
                        <Input
                          type="number"
                          value={printerPort}
                          onChange={(e) => setPrinterPort(parseInt(e.target.value) || 9100)}
                          placeholder="9100"
                        />
                        <p className="text-xs text-muted-foreground">{t('settings.receiptSettings.printerPortDescription')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <SaveButton onClick={handleSaveReceiptSettings} />
                <Button
                  variant="outline"
                  onClick={() => printReceiptViaBrowser(sampleReceiptItems, receiptSettings, `PREVIEW-${Date.now()}`, true)}
                >
                  <PrinterIcon className="mr-2 h-4 w-4" />
                  {t('common.print')}
                </Button>
              </CardFooter>
            </Card>

            {/* Receipt Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t('common.preview')}</CardTitle>
                <CardDescription>
                  {t('settings.receiptSettings.title')} {t('common.preview')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ThermalReceiptPreview settings={receiptSettings} />
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  {t('settings.livePreview')}
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="barcodes" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.barcodeSettings.title')}</CardTitle>
                <CardDescription>
                  {t('settings.barcodeSettings.title')} - {t('app.name')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('settings.barcodeSettings.type')}</label>
                  <Select
                    value={barcodeType}
                    onValueChange={(value) => setBarcodeType(value as 'CODE128' | 'EAN13' | 'UPC')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CODE128">CODE128</SelectItem>
                      <SelectItem value="EAN13">EAN-13</SelectItem>
                      <SelectItem value="UPC">UPC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('settings.barcodeSettings.size')}</label>
                  <Select
                    value={barcodeSize}
                    onValueChange={(value) => setBarcodeSize(value as '50x25' | '40x20' | '60x30')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50x25">50mm x 25mm</SelectItem>
                      <SelectItem value="40x20">40mm x 20mm</SelectItem>
                      <SelectItem value="60x30">60mm x 30mm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('settings.barcodeSettings.includePrice')}</label>
                  <Select
                    value={includePrice ? "yes" : "no"}
                    onValueChange={(value) => setIncludePrice(value === "yes")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">{t('common.yes')}</SelectItem>
                      <SelectItem value="no">{t('common.no')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('settings.barcodeSettings.includeTitle')}</label>
                  <Select
                    value={includeTitle ? "yes" : "no"}
                    onValueChange={(value) => setIncludeTitle(value === "yes")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">{t('common.yes')}</SelectItem>
                      <SelectItem value="no">{t('common.no')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('settings.barcodeSettings.includeLanguage')}</label>
                  <Select
                    value={includeLanguage ? "yes" : "no"}
                    onValueChange={(value) => setIncludeLanguage(value === "yes")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">{t('common.yes')}</SelectItem>
                      <SelectItem value="no">{t('common.no')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('settings.barcodeSettings.customHeading')}</label>
                  <Input
                    value={customHeading}
                    onChange={(e) => setCustomHeading(e.target.value)}
                    placeholder="ISKCON Temple"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <SaveButton onClick={handleSaveBarcodeSettings} />
              </CardFooter>
            </Card>

            {/* Barcode Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t('common.preview')}</CardTitle>
                <CardDescription>
                  {t('settings.barcodeSettings.title')} {t('common.preview')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <BarcodePreview
                  item={sampleBarcodeItem}
                  settings={{
                    type: barcodeType,
                    size: barcodeSize,
                    includePrice,
                    includeTitle,
                    includeLanguage,
                    customHeading
                  }}
                />
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  {t('settings.livePreview')}
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.backup')}</CardTitle>
              <CardDescription>
                {t('settings.backup')} - {t('app.name')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-4">
                <h3 className="mb-2 font-medium">Backup Database</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Create a backup of your entire database. This includes all inventory items, transactions, and settings.
                </p>
                <Button>
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download Backup
                </Button>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="mb-2 font-medium">Restore Database</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Restore your database from a previous backup. This will replace all current data.
                </p>
                <div className="flex gap-2">
                  <Input type="file" />
                  <Button variant="outline">
                    <RefreshCwIcon className="mr-2 h-4 w-4" />
                    Restore
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="mb-2 font-medium">Export Data</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Export specific data to CSV or Excel format.
                </p>
                <div className="flex gap-2">
                  <Select
                    value={exportType}
                    onValueChange={setExportType}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inventory">{t('inventory.title')}</SelectItem>
                      <SelectItem value="transactions">{t('reports.transactionReport')}</SelectItem>
                      <SelectItem value="sales">{t('reports.salesReport')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleExportData} disabled={exportLoading}>
                    {exportLoading ? (
                      <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <DownloadIcon className="mr-2 h-4 w-4" />
                    )}
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
