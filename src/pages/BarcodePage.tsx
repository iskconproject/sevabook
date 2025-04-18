import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PrinterIcon, SearchIcon, CheckIcon, Loader2Icon } from 'lucide-react';
import { BarcodeItem, BarcodeSettings, printBarcodes } from '@/lib/utils/barcodeUtils';
import { BarcodePreview } from '@/components/settings/BarcodePreview';
import { useInventory } from '@/hooks/useInventory';
import { InventoryItem } from '@/lib/types/inventory';



export function BarcodePage() {
  const { t } = useTranslation();
  const { inventory, loading, error } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [barcodeType, setBarcodeType] = useState<'CODE128' | 'EAN13' | 'UPC'>('CODE128');
  const [barcodeSize, setBarcodeSize] = useState<'50x25' | '40x20' | '60x30'>('50x25');
  const [includePrice, setIncludePrice] = useState<boolean>(true);
  const [includeTitle, setIncludeTitle] = useState<boolean>(true);
  const [includeLanguage, setIncludeLanguage] = useState<boolean>(true);
  const [customHeading, setCustomHeading] = useState<string>('ISKCON Temple');
  const [quantity, setQuantity] = useState<number>(1);
  const [previewItem, setPreviewItem] = useState<InventoryItem | null>(null);

  // Filter inventory based on search query
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.language && item.language.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Preview barcode for an item
  const previewBarcode = (item: InventoryItem) => {
    setPreviewItem(item);
  };

  // Print selected barcodes
  const printSelectedBarcodes = () => {
    const items: BarcodeItem[] = selectedItems.map(id => {
      const item = inventory.find(i => i.id === id)!;
      return {
        id: item.id,
        name: item.name,
        price: `₹${item.price}`,
        language: item.language,
        category: item.category
      };
    });

    const settings: BarcodeSettings = {
      type: barcodeType,
      size: barcodeSize,
      includePrice,
      includeTitle,
      includeLanguage,
      customHeading
    };

    try {
      printBarcodes(items, settings, quantity);
      toast.success(t('barcode.printSuccess'), {
        description: t('barcode.printSuccessDescription', { count: items.length * quantity })
      });
    } catch (error) {
      toast.error(t('barcode.printError'), {
        description: t('errors.unknownError')
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('barcode.title')}</h1>
        <p className="text-muted-foreground">{t('barcode.generate')}</p>
      </div>

      <Tabs defaultValue="generate">
        <TabsList className="mb-4">
          <TabsTrigger value="generate">{t('barcode.generate')}</TabsTrigger>
          <TabsTrigger value="print">{t('barcode.print')}</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('barcode.generate')}</CardTitle>
              <CardDescription>
                {t('barcode.generate')} - {t('app.name')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('common.search')}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={barcodeType} onValueChange={setBarcodeType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Barcode Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CODE128">CODE128</SelectItem>
                    <SelectItem value="EAN13">EAN-13</SelectItem>
                    <SelectItem value="UPC">UPC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>{t('inventory.name')}</TableHead>
                      <TableHead>{t('inventory.category')}</TableHead>
                      <TableHead>{t('inventory.language')}</TableHead>
                      <TableHead>{t('inventory.price')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex justify-center items-center">
                            <Loader2Icon className="h-6 w-6 animate-spin mr-2" />
                            {t('common.loading')}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-destructive">
                          {t('errors.loadingFailed')}: {error.message}
                        </TableCell>
                      </TableRow>
                    ) : filteredInventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          {t('common.noResults')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleItemSelection(item.id)}
                              className={selectedItems.includes(item.id) ? 'text-primary' : ''}
                            >
                              {selectedItems.includes(item.id) && <CheckIcon className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{t(`inventory.categories.${item.category}`)}</TableCell>
                          <TableCell>
                            {item.language && item.language !== 'none' ? t(`inventory.languages.${item.language}`) : '-'}
                          </TableCell>
                          <TableCell>₹{item.price}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => previewBarcode(item)}
                            >
                              {t('barcode.preview')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedItems.length} {t('inventory.title')} {t('common.selected')}
              </div>
              <Button
                disabled={selectedItems.length === 0}
                onClick={printSelectedBarcodes}
              >
                <PrinterIcon className="mr-2 h-4 w-4" />
                {t('barcode.print')}
              </Button>
            </CardFooter>
          </Card>

          {previewItem && (
            <Card>
              <CardHeader>
                <CardTitle>{t('barcode.preview')}</CardTitle>
                <CardDescription>
                  {previewItem.name} - {previewItem.language ? t(`inventory.languages.${previewItem.language}`) : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="mb-4 rounded-md border p-6">
                  <BarcodePreview
                    item={{
                      id: previewItem.id,
                      name: previewItem.name,
                      price: `₹${previewItem.price}`,
                      language: previewItem.language,
                      category: previewItem.category
                    }}
                    settings={{
                      type: barcodeType,
                      size: barcodeSize,
                      includePrice,
                      includeTitle,
                      includeLanguage,
                      customHeading
                    }}
                  />
                </div>

              </CardContent>
              <CardFooter className="flex justify-center">
                <Button
                  onClick={() => {
                    const item: BarcodeItem = {
                      id: previewItem.id,
                      name: previewItem.name,
                      price: `₹${previewItem.price}`,
                      language: previewItem.language,
                      category: previewItem.category
                    };

                    const settings: BarcodeSettings = {
                      type: barcodeType,
                      size: barcodeSize,
                      includePrice,
                      includeTitle,
                      includeLanguage,
                      customHeading
                    };

                    try {
                      printBarcodes([item], settings, quantity);
                      toast.success(t('barcode.printSuccess'), {
                        description: t('barcode.singlePrintSuccessDescription')
                      });
                    } catch (error) {
                      toast.error(t('barcode.printError'), {
                        description: t('errors.unknownError')
                      });
                    }
                  }}
                >
                  <PrinterIcon className="mr-2 h-4 w-4" />
                  {t('barcode.print')}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="print" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('barcode.batchPrint')}</CardTitle>
              <CardDescription>
                {t('barcode.printSettings')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('barcode.labelSize')}</label>
                    <Select
                      value={barcodeSize}
                      onValueChange={(value) => setBarcodeSize(value as '50x25' | '40x20' | '60x30')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Label Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50x25">50mm x 25mm</SelectItem>
                        <SelectItem value="40x20">40mm x 20mm</SelectItem>
                        <SelectItem value="60x30">60mm x 30mm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('barcode.quantity')}</label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
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
                  <label className="text-sm font-medium">{t('barcode.customHeading')}</label>
                  <Input
                    value={customHeading}
                    onChange={(e) => setCustomHeading(e.target.value)}
                    placeholder="ISKCON Temple"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => {
                  // Get all inventory items
                  const items: BarcodeItem[] = inventory.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: `₹${item.price}`,
                    language: item.language,
                    category: item.category
                  }));

                  const settings: BarcodeSettings = {
                    type: barcodeType,
                    size: barcodeSize,
                    includePrice,
                    includeTitle,
                    includeLanguage,
                    customHeading
                  };

                  try {
                    printBarcodes(items, settings, quantity);
                    toast.success(t('barcode.printSuccess'), {
                      description: t('barcode.batchPrintSuccessDescription', { count: items.length * quantity })
                    });
                  } catch (error) {
                    toast.error(t('barcode.printError'), {
                      description: t('errors.unknownError')
                    });
                  }
                }}
              >
                <PrinterIcon className="mr-2 h-4 w-4" />
                {t('barcode.print')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
