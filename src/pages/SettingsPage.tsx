import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MoonIcon, SunIcon, LanguagesIcon, SaveIcon, RefreshCwIcon, DownloadIcon, PrinterIcon } from 'lucide-react';
import { BarcodeItem } from '@/lib/utils/barcodeUtils';
import { ReceiptSettings, sampleReceiptItems } from '@/lib/utils/receiptUtils';
// import { printReceiptHtml } from '@/lib/utils/receiptHtmlUtils';
import { printThermalReceipt } from '@/components/pos/ThermalReceipt';
import { ThermalReceiptPreview } from '@/components/settings/ThermalReceiptPreview';
import { BarcodePreview } from '@/components/settings/BarcodePreview';

export function SettingsPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, languages } = useLanguage();

  // Receipt settings state
  const [receiptHeader, setReceiptHeader] = useState("ISKCON Temple Book Stall");
  const [receiptFooter, setReceiptFooter] = useState("Thank you for your purchase! Hare Krishna!");
  const [showLogo, setShowLogo] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [customMessage, setCustomMessage] = useState("Hare Krishna! Thank you for supporting ISKCON Temple.");

  // Barcode settings state
  const [barcodeType, setBarcodeType] = useState<'CODE128' | 'EAN13' | 'UPC'>('CODE128');
  const [barcodeSize, setBarcodeSize] = useState<'50x25' | '40x20' | '60x30'>('50x25');
  const [includePrice, setIncludePrice] = useState(true);
  const [includeTitle, setIncludeTitle] = useState(true);
  const [includeLanguage, setIncludeLanguage] = useState(true);
  const [customHeading, setCustomHeading] = useState('ISKCON Temple');

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
    customMessage
  };

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
                <Input defaultValue="ISKCON Temple" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Temple Address</label>
                <Textarea defaultValue="123 Temple Street, City, State, Country" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <SaveIcon className="mr-2 h-4 w-4" />
                {t('common.save')}
              </Button>
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
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  {t('common.save')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => printThermalReceipt(sampleReceiptItems, receiptSettings)}
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
                <Button>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  {t('common.save')}
                </Button>
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
                  <Select defaultValue="inventory">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inventory">{t('inventory.title')}</SelectItem>
                      <SelectItem value="transactions">{t('reports.transactionReport')}</SelectItem>
                      <SelectItem value="sales">{t('reports.salesReport')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <DownloadIcon className="mr-2 h-4 w-4" />
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
