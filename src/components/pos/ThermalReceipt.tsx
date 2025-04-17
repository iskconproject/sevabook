import React from 'react';
import {
  Printer,
  Text,
  Line,
  Barcode,
  render,
  Cut
} from 'react-thermal-printer';
import { ReceiptItem, ReceiptSettings } from '@/lib/utils/receiptUtils';

interface ThermalReceiptProps {
  items: ReceiptItem[];
  settings: ReceiptSettings;
  transactionId: string;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  items,
  settings,
  transactionId
}) => {
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

  return (
    <Printer type="epson" width={42} characterSet="korea">
      {/* Header */}
      <Text align="center" bold={true} size={{ width: 2, height: 2 }}>
        {settings.header}
      </Text>
      <Line />

      {/* Transaction Info */}
      <Text>Date: {date}</Text>
      <Text>Receipt #: {transactionId}</Text>
      <Line />

      {/* Items */}
      <Text>Item                 Qty   Price     Total</Text>
      <Line />

      {items.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        return (
          <React.Fragment key={index}>
            <Text>{item.name}</Text>
            {item.language && item.language !== 'none' && (
              <Text size={{ width: 1, height: 1 }}>({item.language})</Text>
            )}
            <Text>
              {' '.repeat(20)}
              {item.quantity.toString().padStart(4, ' ')}
              {'₹' + item.price.toFixed(2).padStart(8, ' ')}
              {'₹' + itemTotal.toFixed(2).padStart(10, ' ')}
            </Text>
          </React.Fragment>
        );
      })}

      <Line />

      {/* Totals */}
      <Text>Subtotal:{' '.repeat(30)}₹{subtotal.toFixed(2)}</Text>
      <Text bold={true}>Total:{' '.repeat(33)}₹{total.toFixed(2)}</Text>

      <Line />

      {/* Footer */}
      {settings.customMessage && (
        <Text align="center">{settings.customMessage}</Text>
      )}
      <Text align="center">{settings.footer}</Text>

      {/* Barcode */}
      {settings.showBarcode && (
        <>
          <Barcode value={transactionId} type="CODE128" align="center" />
          <Text align="center" size={{ width: 1, height: 1 }}>{transactionId}</Text>
        </>
      )}

      {/* Cut the paper */}
      <Cut />
    </Printer>
  );
};

/**
 * Generate a preview of the receipt as HTML
 */
export const generateThermalReceiptPreview = async (
  items: ReceiptItem[],
  settings: ReceiptSettings,
  transactionId: string = 'PREVIEW-123456'
): Promise<string> => {
  const receiptJSX = (
    <ThermalReceipt
      items={items}
      settings={settings}
      transactionId={transactionId}
    />
  );

  // Render the receipt to HTML
  const html = await render(receiptJSX);
  return html;
};

/**
 * Print a receipt using the browser's print functionality
 */
export const printThermalReceipt = async (
  items: ReceiptItem[],
  settings: ReceiptSettings,
  transactionId: string = `TR-${Date.now()}`
): Promise<void> => {
  const receiptJSX = (
    <ThermalReceipt
      items={items}
      settings={settings}
      transactionId={transactionId}
    />
  );

  // Render the receipt to HTML
  const html = await render(receiptJSX);

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print receipts');
    return;
  }

  // Write the receipt HTML to the new window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 0;
            background-color: white;
          }
          .receipt-container {
            width: 80mm;
            margin: 0 auto;
            padding: 5mm;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          ${html}
        </div>
        <script>
          // Print and close after a short delay
          setTimeout(() => {
            window.print();
            setTimeout(() => window.close(), 500);
          }, 300);
        </script>
      </body>
    </html>
  `);
};
