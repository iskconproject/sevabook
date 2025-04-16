import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Mock Google Pay API integration
// In a real app, this would use the actual Google Pay API

interface GooglePayButtonProps {
  amount: number;
  onSuccess: (paymentData: any) => void;
  onError: (error: Error) => void;
}

export function GooglePayButton({ amount, onSuccess, onError }: GooglePayButtonProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);

  // Simulate checking if Google Pay is available
  useEffect(() => {
    const checkGooglePayAvailability = async () => {
      // In a real app, this would check if Google Pay is available on the device
      // For this mock, we'll just simulate it being available after a short delay
      setTimeout(() => {
        setIsGooglePayAvailable(true);
      }, 1000);
    };

    checkGooglePayAvailability();
  }, []);

  const handleGooglePayClick = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would initiate a Google Pay payment
      // For this mock, we'll just simulate a successful payment after a short delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate a 90% success rate
      if (Math.random() < 0.9) {
        const mockPaymentData = {
          paymentMethodData: {
            type: 'CARD',
            info: {
              cardNetwork: 'VISA',
              cardDetails: '1234',
            },
          },
          transactionId: `gpay-${Date.now()}`,
          amount: amount,
        };
        
        onSuccess(mockPaymentData);
        toast.success(t('pos.googlePaySuccess'), {
          description: t('pos.transactionComplete'),
        });
      } else {
        // Simulate payment failure
        throw new Error('Payment failed');
      }
    } catch (error) {
      onError(error as Error);
      toast.error(t('pos.googlePayError'), {
        description: t('pos.transactionFailed'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isGooglePayAvailable) {
    return (
      <Button disabled className="w-full">
        {t('pos.googlePayNotAvailable')}
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleGooglePayClick} 
      disabled={isLoading}
      className="w-full bg-white text-black hover:bg-gray-100 hover:text-black"
    >
      <div className="flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#4285F4"/>
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#34A853"/>
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#FBBC05"/>
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#EA4335"/>
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="white"/>
        </svg>
        {isLoading ? t('common.loading') : t('pos.payWithGooglePay')}
      </div>
    </Button>
  );
}
