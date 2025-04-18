import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { BanknoteIcon, SmartphoneIcon, PrinterIcon, MailIcon, CheckIcon, ArrowRightIcon, EyeIcon } from 'lucide-react';
import { ReceiptItem, ReceiptSettings } from '@/lib/utils/receiptUtils';
import { printThermalReceipt, generateThermalReceiptPreview } from './ThermalReceipt';
import { db } from '@/lib/supabase/client';
import { TransactionStatus } from '@/lib/types/transaction';

interface CheckoutDialogProps {
  cart: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  onComplete: () => void;
  onCancel: () => void;
}

export function CheckoutDialog({ cart, subtotal, onComplete, onCancel }: CheckoutDialogProps) {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [upiId, setUpiId] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [receiptHtml, setReceiptHtml] = useState('');

  // Calculate change due for cash payments
  const changeDue = cashReceived ? parseFloat(cashReceived) - subtotal : 0;

  const handlePaymentComplete = async () => {
    setIsProcessing(true);

    try {
      // Get current user session
      const { data: { session } } = await db.auth.getSession();
      const userId = session?.user?.id;

      // Create transaction object
      const transaction = {
        total: subtotal,
        payment_method: paymentMethod,
        payment_details: paymentMethod === 'cash'
          ? { amount_received: parseFloat(cashReceived), change_due: changeDue }
          : { upi_id: upiId },
        customer_phone: customerPhone,
        status: 'completed' as TransactionStatus,
        user_id: userId || ''
      };

      // Create transaction items
      const items = cart.map(item => ({
        inventory_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      // Save transaction to database
      const { error } = await db.transactions.addTransaction(transaction, items);

      if (error) {
        throw new Error(error.message);
      }

      setIsProcessing(false);
      setIsCompleted(true);

      toast.success(t('pos.transactionComplete'), {
        description: t('pos.transactionSuccessful'),
      });
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error(t('pos.transactionFailed'), {
        description: t('pos.errorSavingTransaction'),
      });
      setIsProcessing(false);
    }
  };

  // No longer needed as Google Pay is removed

  // Generate receipt preview
  const generateReceiptPreview = async () => {
    // Convert cart items to receipt items
    const receiptItems: ReceiptItem[] = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    // Create receipt settings
    const receiptSettings: ReceiptSettings = {
      header: 'ISKCON Temple Book Stall',
      footer: 'Thank you for your purchase! Hare Krishna!',
      showLogo: true,
      showBarcode: true,
      customMessage: 'Hare Krishna! Thank you for supporting ISKCON Temple.'
    };

    try {
      const html = await generateThermalReceiptPreview(receiptItems, receiptSettings, `PREVIEW-${Date.now()}`);
      setReceiptHtml(html);
      setShowReceiptPreview(true);
    } catch (error) {
      console.error('Error generating receipt preview:', error);
      toast.error(t('pos.previewError'), {
        description: t('pos.previewErrorDescription'),
      });
    }
  };

  const handlePrintReceipt = () => {
    toast.info(t('pos.printingReceipt'), {
      description: t('pos.printingReceiptDescription'),
    });

    // Convert cart items to receipt items
    const receiptItems: ReceiptItem[] = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    // Create receipt settings
    const receiptSettings: ReceiptSettings = {
      header: 'ISKCON Temple Book Stall',
      footer: 'Thank you for your purchase! Hare Krishna!',
      showLogo: true,
      showBarcode: true,
      customMessage: 'Hare Krishna! Thank you for supporting ISKCON Temple.'
    };

    // Print receipt using thermal printer
    printThermalReceipt(receiptItems, receiptSettings, `TR-${Date.now()}`)
      .catch(error => {
        console.error('Error printing receipt:', error);
        toast.error(t('pos.printingError'), {
          description: t('pos.printingErrorDescription'),
        });
      });

    // Complete checkout after a short delay
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const handleEmailReceipt = () => {
    toast.info(t('pos.emailingReceipt'), {
      description: t('pos.emailingReceiptDescription'),
    });

    // In a real app, this would send an email receipt
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  if (isCompleted) {
    if (showReceiptPreview) {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">{t('pos.receiptPreview')}</h2>
            <p className="text-muted-foreground">
              {t('pos.receiptPreviewDescription')}
            </p>
          </div>

          <div className="bg-white p-4 rounded-md border max-h-[500px] overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: receiptHtml }} />
          </div>

          <div className="flex gap-4">
            <Button
              className="flex-1"
              onClick={handlePrintReceipt}
            >
              <PrinterIcon className="mr-2 h-4 w-4" />
              {t('pos.printReceipt')}
            </Button>

            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowReceiptPreview(false)}
            >
              <ArrowRightIcon className="mr-2 h-4 w-4" />
              {t('pos.back')}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="rounded-full bg-primary/10 p-3 text-primary w-12 h-12 mx-auto">
          <CheckIcon className="h-6 w-6" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">{t('pos.transactionComplete')}</h2>
          <p className="text-muted-foreground">
            {t('pos.transactionSuccessful')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('pos.receiptOptions')}</CardTitle>
            <CardDescription>
              {t('pos.receiptOptionsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={generateReceiptPreview}
            >
              <EyeIcon className="mr-2 h-4 w-4" />
              {t('pos.previewReceipt')}
            </Button>

            <Button
              className="w-full"
              onClick={handlePrintReceipt}
            >
              <PrinterIcon className="mr-2 h-4 w-4" />
              {t('pos.printReceipt')}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleEmailReceipt}
            >
              <MailIcon className="mr-2 h-4 w-4" />
              {t('pos.emailReceipt')}
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={onComplete}
            >
              <ArrowRightIcon className="mr-2 h-4 w-4" />
              {t('pos.newSale')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cash" onValueChange={(value) => setPaymentMethod(value as any)}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="cash">
            <BanknoteIcon className="mr-2 h-4 w-4" />
            {t('pos.cash')}
          </TabsTrigger>
          <TabsTrigger value="upi">
            <SmartphoneIcon className="mr-2 h-4 w-4" />
            {t('pos.upi')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cash" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('pos.cashPayment')}</CardTitle>
              <CardDescription>
                {t('pos.cashPaymentDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('pos.amountReceived')}
                </label>
                <Input
                  type="number"
                  min={subtotal}
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                />
              </div>

              {parseFloat(cashReceived) >= subtotal && (
                <div className="rounded-md bg-primary/10 p-4">
                  <div className="flex justify-between font-medium">
                    <span>{t('pos.changeDue')}</span>
                    <span>₹{changeDue.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={!cashReceived || parseFloat(cashReceived) < subtotal || isProcessing}
                onClick={handlePaymentComplete}
              >
                {isProcessing ? t('common.loading') : t('pos.completeTransaction')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="upi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('pos.upiPayment')}</CardTitle>
              <CardDescription>
                {t('pos.upiPaymentDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('pos.upiId')}
                </label>
                <Input
                  placeholder="username@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>

              <div className="rounded-md bg-muted p-8 text-center">
                <div className="mx-auto h-32 w-32 bg-white rounded-md flex items-center justify-center">
                  <span className="text-xs">QR Code Placeholder</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('pos.scanQrPrompt')}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={isProcessing}
                onClick={handlePaymentComplete}
              >
                {isProcessing ? t('common.loading') : t('pos.completeTransaction')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>{t('pos.customerInfo')}</CardTitle>
          <CardDescription>
            {t('pos.customerInfoDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('pos.customerPhone')}
            </label>
            <Input
              placeholder="+91 XXXXX XXXXX"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{t('pos.subtotal')}</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>{t('pos.total')}</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      </DialogFooter>
    </div>
  );
}
