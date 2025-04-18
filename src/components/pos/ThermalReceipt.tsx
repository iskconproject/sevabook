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
  try {
    const receiptJSX = (
      <ThermalReceipt
        items={items}
        settings={settings}
        transactionId={transactionId}
      />
    );

    // Render the receipt to HTML
    const html = await render(receiptJSX);
    // Convert Uint8Array to string if needed
    return typeof html === 'string' ? html : new TextDecoder().decode(html);
  } catch (error) {
    console.error('Error generating thermal receipt preview:', error);
    // Return a simple fallback receipt in case of error
    return generateFallbackReceiptHtml(items, settings, transactionId);
  }
};

/**
 * Generate a simple HTML receipt as fallback in case the thermal receipt preview fails
 */
const generateFallbackReceiptHtml = (
  items: ReceiptItem[],
  settings: ReceiptSettings,
  transactionId: string
): string => {
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
      ? `<span style="font-size: 0.8em; font-style: italic;">(${item.language})</span>`
      : '';

    return `
      <div style="margin-bottom: 4px;">
        <div>${item.name} ${languageInfo}</div>
        <div style="display: flex; justify-content: space-between; padding-left: 16px;">
          <span>${item.quantity}x</span>
          <span>₹${item.price.toFixed(2)}</span>
          <span>₹${itemTotal.toFixed(2)}</span>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="font-family: 'Courier New', monospace; font-size: 12px;">
      <div style="text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 8px;">${settings.header}</div>

      <div style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 8px 0; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between;">
          <span>Date:</span>
          <span>${date}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Receipt #:</span>
          <span>${transactionId}</span>
        </div>
      </div>

      <div style="margin-bottom: 8px;">
        ${itemRows}
      </div>

      <div style="border-top: 1px solid #ccc; padding-top: 8px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between;">
          <span>Subtotal:</span>
          <span>₹${subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
          <span>Total:</span>
          <span>₹${total.toFixed(2)}</span>
        </div>
      </div>

      <div style="text-align: center; border-top: 1px solid #ccc; padding-top: 8px;">
        ${settings.customMessage ? `<div style="margin-bottom: 4px;">${settings.customMessage}</div>` : ''}
        <div>${settings.footer}</div>
      </div>
    </div>
  `;
};

/**
 * Print a receipt using the browser's print functionality
 */
export const printThermalReceipt = async (
  items: ReceiptItem[],
  settings: ReceiptSettings,
  transactionId: string = `TR-${Date.now()}`
): Promise<void> => {
  try {
    // Create a complete Printer component with all required props
    const receiptJSX = (
      <Printer type="epson" width={42} characterSet="korea">
        {/* Header */}
        <Text align="center" bold={true} size={{ width: 2, height: 2 }}>
          {settings.header}
        </Text>
        <Line />

        {/* Transaction Info */}
        <Text>Date: {new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</Text>
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
        <Text>Subtotal:{' '.repeat(30)}₹{items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</Text>
        <Text bold={true}>Total:{' '.repeat(33)}₹{items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</Text>

        <Line />

        {/* Footer */}
        {settings.customMessage && (
          <Text align="center">{settings.customMessage}</Text>
        )}
        <Text align="center">{settings.footer}</Text>

        {/* Barcode */}
        {settings.showBarcode && (
          <>
            <Barcode content={transactionId} type="CODE128" align="center" />
            <Text align="center" size={{ width: 1, height: 1 }}>{transactionId}</Text>
          </>
        )}

        {/* Cut the paper */}
        <Cut />
      </Printer>
    );

    // Render the receipt to HTML
    const htmlResult = await render(receiptJSX);
    // Convert Uint8Array to string if needed
    const html = typeof htmlResult === 'string' ? htmlResult : new TextDecoder().decode(htmlResult);

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print receipts');
      return;
    }

    // Set up the print window content using DOM manipulation instead of document.write
    printWindow.document.title = 'Receipt';

    // Create style element
    const style = printWindow.document.createElement('style');
    style.textContent = `
      body {
        font-family: 'Courier New', monospace;
        margin: 0;
        padding: 0;
        background-color: white;
      }
      .receipt-container {
        width: ${settings.size || '80mm'};
        margin: 0 auto;
        padding: 5mm;
      }
    `;
    printWindow.document.head.appendChild(style);

    // Create container for receipt
    const container = printWindow.document.createElement('div');
    container.className = 'receipt-container';
    container.innerHTML = html;
    printWindow.document.body.appendChild(container);

    // Create script for printing
    const script = printWindow.document.createElement('script');
    script.textContent = `
      // Print and close after a short delay
      setTimeout(() => {
        window.print();
        setTimeout(() => window.close(), 500);
      }, 300);
    `;
    printWindow.document.body.appendChild(script);
  } catch (error) {
    console.error('Error in printThermalReceipt:', error);
    // Fallback to a simpler receipt printing method
    const fallbackHtml = generateFallbackReceiptHtml(items, settings, transactionId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print receipts');
      return;
    }

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
              width: ${settings.size || '80mm'};
              margin: 0 auto;
              padding: 5mm;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${fallbackHtml}
          </div>
          <script>
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 500);
            }, 300);
          </script>
        </body>
      </html>
    `);
  }
};
