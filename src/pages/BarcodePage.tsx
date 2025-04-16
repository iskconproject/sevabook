import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import Barcode from 'react-barcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PrinterIcon, SearchIcon, CheckIcon } from 'lucide-react';
import { BarcodeItem, BarcodeSettings, printBarcodes } from '@/lib/utils/barcodeUtils';

// Mock inventory data
const mockInventory = [
  { id: '1', name: 'Bhagavad Gita As It Is', category: 'books', language: 'english', price: '₹250', stock: 45 },
  { id: '2', name: 'Bhagavad Gita As It Is', category: 'books', language: 'bengali', price: '₹220', stock: 32 },
  { id: '3', name: 'Bhagavad Gita As It Is', category: 'books', language: 'hindi', price: '₹230', stock: 28 },
  { id: '4', name: 'Sri Chaitanya Charitamrita', category: 'books', language: 'english', price: '₹450', stock: 15 },
  { id: '5', name: 'Incense Sticks (Sandalwood)', category: 'incense', language: '', price: '₹50', stock: 120 },
  { id: '6', name: 'Deity Dress (Small)', category: 'clothing', language: '', price: '₹350', stock: 8 },
  { id: '7', name: 'Japa Mala', category: 'puja', language: '', price: '₹180', stock: 25 },
  { id: '8', name: 'Krishna Murti (Brass, 8")', category: 'deities', language: '', price: '₹1200', stock: 5 },
];

export function BarcodePage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [barcodeType, setBarcodeType] = useState<'CODE128' | 'EAN13' | 'UPC'>('CODE128');
  const [barcodeSize, setBarcodeSize] = useState<'50x25' | '40x20' | '60x30'>('50x25');
  const [includePrice, setIncludePrice] = useState<boolean>(true);
  const [includeTitle, setIncludeTitle] = useState<boolean>(true);
  const [includeLanguage, setIncludeLanguage] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [previewItem, setPreviewItem] = useState<typeof mockInventory[0] | null>(null);

  // Filter inventory based on search query
  const filteredInventory = mockInventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.language.toLowerCase().includes(searchQuery.toLowerCase())
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
  const previewBarcode = (item: typeof mockInventory[0]) => {
    setPreviewItem(item);
  };

  // Print selected barcodes
  const printSelectedBarcodes = () => {
    const items: BarcodeItem[] = selectedItems.map(id => {
      const item = mockInventory.find(i => i.id === id)!;
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        language: item.language,
        category: item.category
      };
    });

    const settings: BarcodeSettings = {
      type: barcodeType,
      size: barcodeSize,
      includePrice,
      includeTitle,
      includeLanguage
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
                    {filteredInventory.length === 0 ? (
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
                            {item.language ? t(`inventory.languages.${item.language}`) : '-'}
                          </TableCell>
                          <TableCell>{item.price}</TableCell>
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
                  <Barcode
                    value={previewItem.id}
                    format={barcodeType as any}
                    width={2}
                    height={50}
                    displayValue={true}
                    textMargin={6}
                    fontSize={14}
                  />
                </div>
                <div className="text-center">
                  <p className="font-medium">{previewItem.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {previewItem.language ? t(`inventory.languages.${previewItem.language}`) : ''} - {previewItem.price}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button
                  onClick={() => {
                    const item: BarcodeItem = {
                      id: previewItem.id,
                      name: previewItem.name,
                      price: previewItem.price,
                      language: previewItem.language,
                      category: previewItem.category
                    };

                    const settings: BarcodeSettings = {
                      type: barcodeType,
                      size: barcodeSize,
                      includePrice,
                      includeTitle,
                      includeLanguage
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
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => {
                  // Get all inventory items
                  const items: BarcodeItem[] = mockInventory.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    language: item.language,
                    category: item.category
                  }));

                  const settings: BarcodeSettings = {
                    type: barcodeType,
                    size: barcodeSize,
                    includePrice,
                    includeTitle,
                    includeLanguage
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
