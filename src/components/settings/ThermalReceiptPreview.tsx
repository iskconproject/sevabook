import React, { useEffect, useRef } from 'react';
import { ReceiptItem, ReceiptSettings } from '@/lib/utils/receiptUtils';
import JsBarcode from 'jsbarcode';

interface ThermalReceiptPreviewProps {
  settings: ReceiptSettings;
  items?: ReceiptItem[];
}

export function ThermalReceiptPreview({
  settings,
  items = [
    { id: '1', name: 'Bhagavad Gita As It Is', price: 250, quantity: 1, language: 'english' },
    { id: '2', name: 'Incense Sticks (Sandalwood)', price: 50, quantity: 2, language: 'none' },
    { id: '3', name: 'Deity Dress (Small)', price: 350, quantity: 1, language: 'none' }
  ]
}: ThermalReceiptPreviewProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const transactionId = 'PREVIEW-123456';

  // Generate a simple HTML representation of the receipt for preview
  const generateReceiptHtml = () => {
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal; // Add tax calculation if needed

    // Format date
    const date = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Generate item rows
    const itemRows = items.map(item => {
      const itemTotal = item.price * item.quantity;
      const languageInfo = item.language && item.language !== 'none'
        ? `<span class="text-xs italic">(${item.language})</span>`
        : '';

      return `
        <div class="mb-1">
          <div>${item.name} ${languageInfo}</div>
          <div class="flex justify-between pl-4">
            <span>${item.quantity}x</span>
            <span>₹${item.price.toFixed(2)}</span>
            <span>₹${itemTotal.toFixed(2)}</span>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="font-mono text-sm">
        <div class="text-center font-bold text-lg mb-2">${settings.header}</div>

        <div class="border-t border-b border-gray-300 py-2 mb-2">
          <div class="flex justify-between">
            <span>Date:</span>
            <span>${date}</span>
          </div>
          <div class="flex justify-between">
            <span>Receipt #:</span>
            <span>${transactionId}</span>
          </div>
        </div>

        <div class="mb-2">
          ${itemRows}
        </div>

        <div class="border-t border-gray-300 pt-2 mb-2">
          <div class="flex justify-between">
            <span>Subtotal:</span>
            <span>₹${subtotal.toFixed(2)}</span>
          </div>
          <div class="flex justify-between font-bold">
            <span>Total:</span>
            <span>₹${total.toFixed(2)}</span>
          </div>
        </div>

        <div class="text-center border-t border-gray-300 pt-2">
          ${settings.customMessage ? `<div class="mb-1">${settings.customMessage}</div>` : ''}
          <div>${settings.footer}</div>

          ${settings.showBarcode ? `
          <div class="mt-2 flex flex-col items-center">
            <svg id="receipt-barcode"></svg>
            <div class="text-xs">${transactionId}</div>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  // Generate barcode after the component renders
  useEffect(() => {
    if (settings.showBarcode && receiptRef.current) {
      // Find the barcode element
      barcodeRef.current = receiptRef.current.querySelector('#receipt-barcode');

      // Generate barcode if the element exists
      if (barcodeRef.current) {
        try {
          JsBarcode(barcodeRef.current, transactionId, {
            format: 'CODE128',
            width: 1.5,
            height: 40,
            displayValue: false,
            margin: 0
          });
        } catch (error) {
          console.error('Error generating barcode:', error);
        }
      }
    }
  }, [settings.showBarcode, receiptRef.current]);

  return (
    <div className="thermal-receipt-preview-container border rounded-md p-4 max-w-full overflow-auto bg-white">
      <div
        ref={receiptRef}
        className="thermal-receipt-preview w-[80mm] mx-auto"
        dangerouslySetInnerHTML={{ __html: generateReceiptHtml() }}
      />
    </div>
  );
}
