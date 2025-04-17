// Utility functions for barcode generation and printing

export interface BarcodeItem {
  id: string;
  name: string;
  price?: string;
  language?: string;
  category?: string;
}

export interface BarcodeSettings {
  type: 'CODE128' | 'EAN13' | 'UPC';
  size: '50x25' | '40x20' | '60x30';
  includePrice: boolean;
  includeTitle: boolean;
  includeLanguage: boolean;
  customHeading?: string;
}

// Sample barcode items for testing
export const sampleBarcodeItems: BarcodeItem[] = [
  { id: 'BG-001', name: 'Bhagavad Gita As It Is', price: '250', language: 'english', category: 'books' },
  { id: 'IN-002', name: 'Incense Sticks (Sandalwood)', price: '50', language: 'none', category: 'incense' },
  { id: 'DD-003', name: 'Deity Dress (Small)', price: '350', language: 'none', category: 'clothing' }
];

/**
 * Generate HTML for printing barcodes
 */
function generateBarcodesHtml(items: BarcodeItem[], settings: BarcodeSettings, quantity: number = 1): string {
  // Get dimensions from settings
  const [width, height] = settings.size.split('x').map(Number);

  // We'll format barcode values directly in the script

  // Generate barcode items HTML
  const barcodeItemsHtml = items.flatMap(item => {
    // Generate multiple copies based on quantity
    return Array.from({ length: quantity }, (_, index) => {
      const itemId = `barcode-${item.id}-${index}`;

      // Calculate font sizes based on dimensions - increased for better legibility
      const headingSize = Math.max(width * 0.1, 7) * 1.2;
      const detailSize = Math.max(width * 0.09, 6);

      // Calculate spacing
      const verticalSpacing = Math.max(1, height * 0.02);

      return `
        <div class="barcode-item" style="width: ${width}mm; height: ${height}mm; margin: 5mm; display: inline-block; text-align: center; overflow: hidden; padding: ${Math.max(0.5, width * 0.02)}mm;">
          ${settings.customHeading ? `<div style="font-size: ${headingSize}px; font-weight: bold; margin-bottom: ${verticalSpacing / 2}mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1;">${settings.customHeading}</div>` : ''}
          <div style="display: flex; align-items: center; justify-content: center; margin: 0;">
            <svg id="${itemId}" style="max-width: 100%;"></svg>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: ${detailSize}px; margin-top: ${verticalSpacing / 2}mm; min-height: ${Math.max(1, height * 0.08)}mm;">
            <!-- Left: Language -->
            <div style="text-align: left; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: bold;">
              ${settings.includeLanguage && item.language && item.language !== 'none' ? `<span>${item.language}</span>` : '<span></span>'}
            </div>
            <!-- Middle: Title -->
            <div style="text-align: center; flex: 2; margin: 0 1mm; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 50%; font-weight: bold;">
              ${settings.includeTitle ? `<span style="font-size: ${detailSize}px;">${item.name}</span>` : ''}
            </div>
            <!-- Right: Price -->
            <div style="text-align: right; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: bold;">
              ${settings.includePrice && item.price ? `<span>₹${item.price}</span>` : '<span></span>'}
            </div>
          </div>
        </div>
      `;
    });
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Barcodes</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 10mm;
          }
          .barcode-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-start;
          }
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 10mm;
            }
          }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      </head>
      <body>
        <div class="barcode-container">
          ${barcodeItemsHtml}
        </div>
        <script>
          // Generate barcodes after the page loads
          window.onload = function() {
            ${items.flatMap((item) => {
    return Array.from({ length: quantity }, (_, index) => {
      const itemId = `barcode-${item.id}-${index}`;
      return `
                  try {
                    // Format the barcode value based on the selected type
                    const barcodeValue = "${settings.type}" === "CODE128" ? "${item.id}" :
                                        "${settings.type}" === "EAN13" ? "590123412345" : "012345678905";

                    // Calculate appropriate barcode dimensions
                    const contentHeight = ${height};
                    const headingSpace = "${settings.customHeading}" ? contentHeight * 0.18 : 0; // Increased for larger font
                    const detailsSpace = contentHeight * 0.15; // Increased for larger font at bottom

                    // Available height for barcode - reduced to fit content
                    const availableHeight = contentHeight - headingSpace - detailsSpace;
                    const barcodeHeight = Math.min(availableHeight * 0.65, ${height} * 0.35); // Slightly reduced

                    JsBarcode("#${itemId}", barcodeValue, {
                      format: "${settings.type}",
                      width: Math.max(1, ${width} * 0.03),
                      height: barcodeHeight,
                      displayValue: true,
                      fontSize: Math.max(8, ${width} * 0.2),
                      margin: 0
                    });
                  } catch (error) {
                    console.error('Error generating barcode for ${item.id}:', error);
                    // Fallback to CODE128 if the selected format fails
                    JsBarcode("#${itemId}", "${item.id}", {
                      format: "CODE128",
                      width: Math.max(1, ${width} * 0.03),
                      height: barcodeHeight,
                      displayValue: true,
                      fontSize: Math.max(8, ${width} * 0.2),
                      margin: 0
                    });
                  }
                `;
    });
  }).join('')}

            // Print and close after a short delay to ensure barcodes render
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 500);
            }, 500);
          };
        </script>
      </body>
    </html>
  `;
}

/**
 * Print barcodes using the browser's print functionality
 */
export function printBarcodes(items: BarcodeItem[], settings: BarcodeSettings, quantity: number = 1): void {
  // Generate HTML for barcodes
  const html = generateBarcodesHtml(items, settings, quantity);

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print barcodes');
    return;
  }

  // Write the HTML to the new window
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
