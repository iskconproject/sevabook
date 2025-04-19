import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { FlashlightIcon, SwitchCameraIcon } from 'lucide-react';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcodeData: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<string | null>(null);
  const [stopStream, setStopStream] = useState(false);
  const [torch, setTorch] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Handle successful scan
  useEffect(() => {
    if (data) {
      onScan(data);
      handleClose();
    }
  }, [data, onScan]);

  // Handle dialog close
  const handleClose = () => {
    // Stop the stream before closing to prevent browser freeze
    setStopStream(true);
    // Wait a tick before closing the dialog
    setTimeout(() => {
      onClose();
      // Reset state for next time
      setData(null);
      setStopStream(false);
      setTorch(false);
    }, 0);
  };

  // Toggle camera facing mode
  const toggleCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
  };

  // Toggle flashlight
  const toggleFlashlight = () => {
    setTorch(!torch);
  };

  // Handle scanner errors
  const handleError = (error: string | DOMException) => {
    console.error('Barcode scanner error:', error);
    if (typeof error === 'object' && error.name === 'NotAllowedError') {
      toast.error(t('pos.cameraPermissionDenied'), {
        description: t('pos.enableCameraPermission'),
      });
      handleClose();
    } else {
      toast.error(t('pos.scannerError'), {
        description: typeof error === 'string' ? error : error.message,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('pos.scanBarcode')}</DialogTitle>
          <DialogDescription>{t('pos.scanBarcodeDescription')}</DialogDescription>
        </DialogHeader>

        <div className="relative aspect-square w-full overflow-hidden rounded-md">
          {isOpen && (
            <BarcodeScannerComponent
              width="100%"
              height="100%"
              onUpdate={(_err, result) => {
                if (result && typeof result === 'object' && 'getText' in result) {
                  setData(result.getText());
                }
              }}
              onError={handleError}
              facingMode={facingMode}
              torch={torch}
              stopStream={stopStream}
            />
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleCamera}
              title={t('pos.switchCamera')}
            >
              <SwitchCameraIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFlashlight}
              title={t('pos.toggleFlashlight')}
              className={torch ? 'bg-yellow-100' : ''}
            >
              <FlashlightIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="secondary" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
