// Utility functions for HTML-based receipt generation and printing

import { ReceiptItem, ReceiptSettings } from './receiptUtils';

/**
 * Generate HTML for a receipt
 * @param items Items in the receipt
 * @param settings Receipt settings
 * @param transactionId Optional transaction ID
 * @returns HTML string for the receipt
 */
export function generateReceiptHtml(
  items: ReceiptItem[],
  settings: ReceiptSettings,
  transactionId: string = `TR-${Date.now()}`
): string {
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
      ? `<span class="language">(${item.language})</span>` 
      : '';
    
    return `
      <tr>
        <td>${item.name} ${languageInfo}</td>
        <td class="text-right">${item.quantity}</td>
        <td class="text-right">₹${item.price.toFixed(2)}</td>
        <td class="text-right">₹${itemTotal.toFixed(2)}</td>
      </tr>
    `;
  }).join('');
  
  // Generate HTML
  return `
    <div class="receipt">
      <style>
        .receipt {
          font-family: 'Courier New', monospace;
          width: 80mm;
          max-width: 80mm;
          margin: 0 auto;
          padding: 5mm;
          color: #000;
        }
        .receipt-header {
          text-align: center;
          margin-bottom: 10px;
        }
        .receipt-header h1 {
          font-size: 18px;
          font-weight: bold;
          margin: 0;
          padding: 0;
        }
        .receipt-header p {
          margin: 5px 0;
          font-size: 12px;
        }
        .receipt-info {
          margin: 10px 0;
          font-size: 12px;
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 5px 0;
        }
        .receipt-info p {
          margin: 5px 0;
          display: flex;
          justify-content: space-between;
        }
        .items {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 12px;
        }
        .items th {
          text-align: left;
          border-bottom: 1px solid #000;
          padding: 5px 0;
        }
        .items td {
          padding: 3px 0;
        }
        .text-right {
          text-align: right;
        }
        .language {
          font-size: 10px;
          font-style: italic;
        }
        .receipt-totals {
          margin: 10px 0;
          font-size: 12px;
          border-top: 1px solid #000;
          padding-top: 5px;
        }
        .receipt-totals p {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .grand-total {
          font-weight: bold;
          font-size: 14px;
        }
        .receipt-footer {
          margin-top: 15px;
          text-align: center;
          font-size: 12px;
          border-top: 1px dashed #000;
          padding-top: 10px;
        }
        .receipt-footer p {
          margin: 5px 0;
        }
        .barcode-container {
          margin: 10px auto;
          text-align: center;
        }
        .transaction-id {
          font-size: 10px;
          margin-top: 5px;
        }
      </style>
      
      <div class="receipt-header">
        <h1>${settings.header}</h1>
      </div>
      
      <div class="receipt-info">
        <p>
          <span>Date:</span>
          <span>${date}</span>
        </p>
        <p>
          <span>Receipt #:</span>
          <span>${transactionId}</span>
        </p>
      </div>
      
      <table class="items">
        <thead>
          <tr>
            <th>Item</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
      
      <div class="receipt-totals">
        <p>
          <span>Subtotal:</span>
          <span>₹${subtotal.toFixed(2)}</span>
        </p>
        <p class="grand-total">
          <span>Total:</span>
          <span>₹${total.toFixed(2)}</span>
        </p>
      </div>
      
      <div class="receipt-footer">
        ${settings.customMessage ? `<p>${settings.customMessage}</p>` : ''}
        <p>${settings.footer}</p>
        
        ${settings.showBarcode ? `
        <div class="barcode-container">
          <svg id="receipt-barcode"></svg>
          <div class="transaction-id">${transactionId}</div>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Print a receipt using the browser's print functionality
 * @param items Items in the receipt
 * @param settings Receipt settings
 * @param transactionId Optional transaction ID
 */
export function printReceiptHtml(
  items: ReceiptItem[],
  settings: ReceiptSettings,
  transactionId: string = `TR-${Date.now()}`
): void {
  const receiptHtml = generateReceiptHtml(items, settings, transactionId);
  
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
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      </head>
      <body>
        ${receiptHtml}
        <script>
          // Generate barcode after the page loads
          window.onload = function() {
            if (document.getElementById('receipt-barcode')) {
              JsBarcode("#receipt-barcode", "${transactionId}", {
                format: "CODE128",
                width: 1.5,
                height: 40,
                displayValue: false
              });
            }
            // Print and close after a short delay to ensure barcode renders
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 500);
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
}

/**
 * Generate a receipt preview as an HTML string
 * @param items Items in the receipt
 * @param settings Receipt settings
 * @returns HTML string for the receipt preview
 */
export function generateReceiptPreviewHtml(
  items: ReceiptItem[],
  settings: ReceiptSettings
): string {
  const transactionId = 'PREVIEW-123456';
  return generateReceiptHtml(items, settings, transactionId);
}

// Sample receipt items for preview
export const sampleReceiptItems: ReceiptItem[] = [
  { id: '1', name: 'Bhagavad Gita As It Is', price: 250, quantity: 1, language: 'english' },
  { id: '2', name: 'Incense Sticks (Sandalwood)', price: 50, quantity: 2, language: 'none' },
  { id: '3', name: 'Deity Dress (Small)', price: 350, quantity: 1, language: 'none' }
];
