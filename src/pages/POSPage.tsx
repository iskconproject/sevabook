import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusIcon, MinusIcon, SearchIcon, ShoppingCartIcon, BarcodeIcon, CreditCardIcon, TrashIcon, Loader2Icon } from 'lucide-react';
import { CheckoutDialog } from '@/components/pos/CheckoutDialog';
import { BarcodeScanner } from '@/components/pos/BarcodeScanner';
import { useInventory } from '@/hooks/useInventory';
import { InventoryItem } from '@/lib/types/inventory';
import { useLocation } from '@/contexts/LocationContext';



interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  language?: string;
}

export function POSPage() {
  const { t } = useTranslation();
  const { inventory, loading, error } = useInventory();
  const { currentLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Filter inventory based on search query
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.language && item.language.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle barcode scan
  const handleBarcodeScan = (barcodeData: string) => {
    // Find the item with the matching barcode/id
    const item = inventory.find(item => item.id === barcodeData);

    if (item) {
      addToCart(item);
      toast.success(t('pos.itemScanned'), {
        description: item.name,
      });
    } else {
      toast.error(t('pos.itemNotFound'), {
        description: t('pos.barcodeNotRecognized', { barcode: barcodeData }),
      });
    }
  };

  // Add item to cart
  const addToCart = (item: InventoryItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { id: item.id, name: item.name, price: item.price, quantity: 1, language: item.language }]);
      toast.success(t('pos.itemAdded'), {
        description: item.name,
      });
    }
  };

  // Remove item from cart
  const removeFromCart = (id: string) => {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item =>
        item.id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCart(cart.filter(item => item.id !== id));
      toast.info(t('pos.itemRemoved'));
    }
  };

  // Delete item from cart
  const deleteFromCart = (id: string) => {
    const item = cart.find(item => item.id === id);
    setCart(cart.filter(item => item.id !== id));
    if (item) {
      toast.info(t('pos.itemRemoved'), {
        description: item.name,
      });
    }
  };

  // Handle checkout completion
  const handleCheckoutComplete = () => {
    setIsCheckoutOpen(false);
    setCart([]);
    toast.success(t('pos.saleComplete'));
  };

  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('pos.title')}</h1>
        <p className="text-muted-foreground">{currentLocation?.name} - {t('pos.newSale')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left side - Product selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('pos.scanBarcode')}</CardTitle>
              <CardDescription>{t('pos.manualEntry')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('common.search')}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
                  <BarcodeIcon className="h-4 w-4" />
                </Button>

                {/* Barcode Scanner */}
                <BarcodeScanner
                  isOpen={isScannerOpen}
                  onClose={() => setIsScannerOpen(false)}
                  onScan={handleBarcodeScan}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('inventory.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="books">Books</TabsTrigger>
                  <TabsTrigger value="puja">Puja Items</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="m-0">
                  {loading ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2Icon className="h-6 w-6 animate-spin mr-2" />
                      {t('common.loading')}
                    </div>
                  ) : error ? (
                    <div className="text-center text-destructive p-4">
                      {t('errors.loadingFailed')}: {error.message}
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredInventory.map((item) => (
                        <Button
                          key={item.id}
                          variant="outline"
                          className="h-auto flex-col items-start p-3 text-left w-full"
                          onClick={() => addToCart(item)}
                        >
                          <div className="font-medium truncate w-full">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.language && item.language !== 'none' && `${t(`inventory.languages.${item.language}`)} - `}
                            ₹{item.price}
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="books" className="m-0">
                  {loading ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2Icon className="h-6 w-6 animate-spin mr-2" />
                      {t('common.loading')}
                    </div>
                  ) : error ? (
                    <div className="text-center text-destructive p-4">
                      {t('errors.loadingFailed')}: {error.message}
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredInventory
                        .filter(item => item.category === 'books')
                        .map((item) => (
                          <Button
                            key={item.id}
                            variant="outline"
                            className="h-auto flex-col items-start p-3 text-left w-full"
                            onClick={() => addToCart(item)}
                          >
                            <div className="font-medium truncate w-full">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.language && item.language !== 'none' && `${t(`inventory.languages.${item.language}`)} - `}
                              ₹{item.price}
                            </div>
                          </Button>
                        ))}
                    </div>
                  )}
                </TabsContent>

                {/* Other tabs would be similar */}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Cart */}
        <div>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCartIcon className="h-5 w-5" />
                {t('pos.cart')}
              </CardTitle>
              <CardDescription>
                {cart.length === 0 ? t('pos.emptyCart') : `${cart.length} ${t('dashboard.totalItems')}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {cart.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
                  <ShoppingCartIcon className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">{t('pos.emptyCart')}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('pos.addToCart')}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('inventory.name')}</TableHead>
                        <TableHead className="text-right">{t('inventory.price')}</TableHead>
                        <TableHead className="text-center">{t('inventory.stock')}</TableHead>
                        <TableHead className="text-right">{t('common.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">₹{item.price}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <MinusIcon className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  const inventoryItem = inventory.find(i => i.id === item.id);
                                  if (inventoryItem) addToCart(inventoryItem);
                                }}
                              >
                                <PlusIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteFromCart(item.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col border-t p-6">
              <div className="mb-4 space-y-2">
                <div className="flex justify-between">
                  <span>{t('pos.subtotal')}</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('pos.total')}</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={cart.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
              >
                <CreditCardIcon className="mr-2 h-4 w-4" />
                {t('pos.checkout')}
              </Button>

              <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0">
                  <div className="p-6 pb-0">
                    <DialogHeader>
                      <DialogTitle>{t('pos.checkout')}</DialogTitle>
                      <DialogDescription>
                        {t('pos.checkoutDescription')}
                      </DialogDescription>
                    </DialogHeader>
                  </div>

                  <div className="overflow-y-auto px-6 flex-1 max-h-[calc(90vh-16rem)]">
                    <CheckoutDialog
                      cart={cart}
                      subtotal={subtotal}
                      onComplete={handleCheckoutComplete}
                      onCancel={() => setIsCheckoutOpen(false)}
                      showFooter={false}
                    />
                  </div>

                  <div className="border-t mt-4 p-6 bg-background sticky bottom-0 shadow-sm">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>{t('pos.subtotal')}</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>{t('pos.total')}</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setIsCheckoutOpen(false)} className="w-full">
                      {t('common.cancel')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
