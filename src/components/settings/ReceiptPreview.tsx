import { useEffect, useRef } from 'react';
import { ReceiptItem, ReceiptSettings } from '@/lib/utils/receiptUtils';
import { generateReceiptPreviewHtml, sampleReceiptItems } from '@/lib/utils/receiptHtmlUtils';
import JsBarcode from 'jsbarcode';

interface ReceiptPreviewProps {
  settings: ReceiptSettings;
}

export function ReceiptPreview({ settings }: ReceiptPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  
  // Generate the receipt HTML and update the preview
  useEffect(() => {
    if (previewRef.current) {
      const receiptHtml = generateReceiptPreviewHtml(sampleReceiptItems, settings);
      previewRef.current.innerHTML = receiptHtml;
      
      // Find the barcode element and render it if it exists
      barcodeRef.current = previewRef.current.querySelector('#receipt-barcode');
      if (barcodeRef.current && settings.showBarcode) {
        try {
          JsBarcode(barcodeRef.current, 'PREVIEW-123456', {
            format: 'CODE128',
            width: 1.5,
            height: 40,
            displayValue: false
          });
        } catch (error) {
          console.error('Error generating barcode:', error);
        }
      }
    }
  }, [settings]);
  
  return (
    <div className="receipt-preview-container border rounded-md p-4 max-w-full overflow-auto bg-white">
      <div ref={previewRef} className="receipt-preview"></div>
    </div>
  );
}
