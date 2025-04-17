import { useEffect, useRef } from 'react';
import { BarcodeItem } from '@/lib/utils/barcodeUtils';
import JsBarcode from 'jsbarcode';

interface BarcodePreviewProps {
  item: BarcodeItem;
  type: 'CODE128' | 'EAN13' | 'UPC';
  includeTitle: boolean;
  includePrice: boolean;
  includeLanguage: boolean;
}

export function BarcodePreview({ 
  item, 
  type, 
  includeTitle, 
  includePrice, 
  includeLanguage 
}: BarcodePreviewProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  
  // Generate the barcode when props change
  useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, item.id, {
          format: type,
          width: 2,
          height: 50,
          displayValue: true,
          textMargin: 6,
          fontSize: 14
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
        
        // Fallback to CODE128 if the selected format fails
        if (type !== 'CODE128') {
          JsBarcode(barcodeRef.current, item.id, {
            format: 'CODE128',
            width: 2,
            height: 50,
            displayValue: true,
            textMargin: 6,
            fontSize: 14
          });
        }
      }
    }
  }, [item.id, type]);
  
  return (
    <div className="barcode-preview-container flex flex-col items-center">
      <div className="mb-4 rounded-md border p-6 bg-white">
        <svg ref={barcodeRef}></svg>
      </div>
      
      {includeTitle && (
        <p className="font-medium">{item.name}</p>
      )}
      
      <div className="flex items-center gap-2 mt-1">
        {includeLanguage && item.language && item.language !== 'none' && (
          <span className="text-sm text-muted-foreground">{item.language}</span>
        )}
        
        {includePrice && item.price && (
          <span className="text-sm font-medium">₹{item.price}</span>
        )}
      </div>
    </div>
  );
}
