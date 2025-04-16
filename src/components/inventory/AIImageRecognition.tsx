import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CameraIcon, UploadIcon, CheckIcon, XIcon, LoaderIcon } from 'lucide-react';
import { captureImageFromCamera, recognizeItemFromImage, RecognizedItem } from '@/lib/ai/imageRecognition';
import { toast } from 'sonner';

interface AIImageRecognitionProps {
  onRecognized: (item: RecognizedItem) => void;
  onCancel: () => void;
}

export function AIImageRecognition({ onRecognized, onCancel }: AIImageRecognitionProps) {
  const { t } = useTranslation();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognizedItem, setRecognizedItem] = useState<RecognizedItem | null>(null);

  const handleCaptureImage = async () => {
    setIsCapturing(true);
    try {
      const imageData = await captureImageFromCamera();
      setCapturedImage(imageData);
      
      if (imageData) {
        // Start recognition process
        setIsRecognizing(true);
        const item = await recognizeItemFromImage(imageData);
        setIsRecognizing(false);
        
        if (item) {
          setRecognizedItem(item);
          toast.success(t('inventory.itemRecognized'), {
            description: item.name,
          });
        } else {
          toast.error(t('inventory.itemNotRecognized'), {
            description: t('inventory.tryAgain'),
          });
        }
      }
    } catch (error) {
      toast.error(t('inventory.cameraError'), {
        description: t('errors.unknownError'),
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleConfirmRecognition = () => {
    if (recognizedItem) {
      onRecognized(recognizedItem);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        {capturedImage ? (
          <div className="relative">
            <img 
              src={capturedImage} 
              alt={t('inventory.capturedImage')} 
              className="max-h-64 rounded-md border"
            />
            {isRecognizing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        ) : (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t('inventory.takePhoto')}</CardTitle>
              <CardDescription>
                {t('inventory.takePhotoDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button 
                size="lg" 
                onClick={handleCaptureImage}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CameraIcon className="mr-2 h-4 w-4" />
                )}
                {isCapturing ? t('common.loading') : t('inventory.takePhoto')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {recognizedItem && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-primary" />
              {t('inventory.itemRecognized')}
            </CardTitle>
            <CardDescription>
              {t('inventory.confidence')}: {(recognizedItem.confidence * 100).toFixed(0)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">{t('inventory.name')}:</span> {recognizedItem.name}
              </div>
              <div>
                <span className="font-medium">{t('inventory.category')}:</span> {t(`inventory.categories.${recognizedItem.category}`)}
              </div>
              {recognizedItem.language && (
                <div>
                  <span className="font-medium">{t('inventory.language')}:</span> {t(`inventory.languages.${recognizedItem.language}`)}
                </div>
              )}
              {recognizedItem.price && (
                <div>
                  <span className="font-medium">{t('inventory.price')}:</span> ₹{recognizedItem.price}
                </div>
              )}
              {recognizedItem.description && (
                <div>
                  <span className="font-medium">{t('inventory.description')}:</span> {recognizedItem.description}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => {
              setCapturedImage(null);
              setRecognizedItem(null);
            }}>
              <XIcon className="mr-2 h-4 w-4" />
              {t('common.tryAgain')}
            </Button>
            <Button onClick={handleConfirmRecognition}>
              <CheckIcon className="mr-2 h-4 w-4" />
              {t('common.confirm')}
            </Button>
          </CardFooter>
        </Card>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      </DialogFooter>
    </div>
  );
}
