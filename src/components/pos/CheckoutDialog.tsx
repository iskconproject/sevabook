import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DialogFooter } from '@/components/ui/dialog';
import { GooglePayButton } from './GooglePayButton';
import { toast } from 'sonner';
import { CreditCardIcon, BanknoteIcon, SmartphoneIcon, PrinterIcon, MailIcon, CheckIcon, ArrowRightIcon } from 'lucide-react';

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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'googlepay'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Calculate change due for cash payments
  const changeDue = cashReceived ? parseFloat(cashReceived) - subtotal : 0;
  
  const handlePaymentComplete = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      
      toast.success(t('pos.transactionComplete'), {
        description: t('pos.transactionSuccessful'),
      });
    }, 1500);
  };
  
  const handleGooglePaySuccess = (paymentData: any) => {
    setIsCompleted(true);
  };
  
  const handleGooglePayError = (error: Error) => {
    toast.error(t('pos.paymentFailed'), {
      description: error.message,
    });
  };
  
  const handlePrintReceipt = () => {
    toast.info(t('pos.printingReceipt'), {
      description: t('pos.printingReceiptDescription'),
    });
    
    // In a real app, this would trigger receipt printing
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
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="cash">
            <BanknoteIcon className="mr-2 h-4 w-4" />
            {t('pos.cash')}
          </TabsTrigger>
          <TabsTrigger value="card">
            <CreditCardIcon className="mr-2 h-4 w-4" />
            {t('pos.card')}
          </TabsTrigger>
          <TabsTrigger value="upi">
            <SmartphoneIcon className="mr-2 h-4 w-4" />
            {t('pos.upi')}
          </TabsTrigger>
          <TabsTrigger value="googlepay">
            <span className="mr-2">G</span>
            {t('pos.googlePay')}
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
                disabled={parseFloat(cashReceived) < subtotal || isProcessing}
                onClick={handlePaymentComplete}
              >
                {isProcessing ? t('common.loading') : t('pos.completeTransaction')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="card" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('pos.cardPayment')}</CardTitle>
              <CardDescription>
                {t('pos.cardPaymentDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted p-8 text-center">
                <CreditCardIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('pos.swipeCardPrompt')}
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
        
        <TabsContent value="googlepay" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('pos.googlePayPayment')}</CardTitle>
              <CardDescription>
                {t('pos.googlePayPaymentDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GooglePayButton 
                amount={subtotal} 
                onSuccess={handleGooglePaySuccess} 
                onError={handleGooglePayError} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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
