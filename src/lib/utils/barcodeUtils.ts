// Utility functions for barcode generation and printing

import { jsPDF } from 'jspdf';

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
}

// Function to generate a PDF with barcodes for printing
export function generateBarcodePDF(items: BarcodeItem[], settings: BarcodeSettings, quantity: number = 1): jsPDF {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Get dimensions from settings
  const [width, height] = settings.size.split('x').map(Number);

  // Calculate how many barcodes can fit on a page
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const margin = 10; // Margin in mm

  const cols = Math.floor((pageWidth - 2 * margin) / width);
  const rows = Math.floor((pageHeight - 2 * margin) / height);

  let currentPage = 1;
  let currentRow = 0;
  let currentCol = 0;

  // Generate barcodes for each item
  items.forEach((item) => {
    // Generate multiple copies based on quantity
    for (let q = 0; q < quantity; q++) {
      // Calculate position
      const x = margin + (currentCol * width);
      const y = margin + (currentRow * height);

      // Add a new page if needed
      if (currentPage > 1 && currentRow === 0 && currentCol === 0) {
        doc.addPage();
      }

      // Draw barcode placeholder (in a real app, this would use a barcode library)
      doc.setDrawColor(0);
      doc.setFillColor(255, 255, 255);
      doc.rect(x, y, width, height, 'FD');

      // Draw barcode representation
      doc.setFillColor(0, 0, 0);
      const barcodeHeight = height * 0.4;
      doc.rect(x + width * 0.1, y + height * 0.2, width * 0.8, barcodeHeight, 'F');

      // Add text
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);

      // Add item ID as barcode number
      doc.text(item.id, x + width / 2, y + height * 0.2 + barcodeHeight + 3, { align: 'center' });

      // Add item name if enabled
      if (settings.includeTitle) {
        doc.setFontSize(6);
        doc.text(
          item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
          x + width / 2,
          y + height * 0.1,
          { align: 'center' }
        );
      }

      // Add price if enabled
      if (settings.includePrice && item.price) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(`₹${item.price}`, x + width / 2, y + height * 0.9, { align: 'center' });
      }

      // Add language if enabled
      if (settings.includeLanguage && item.language && item.language !== 'none') {
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.text(item.language, x + width * 0.8, y + height * 0.15, { align: 'right' });
      }

      // Move to next position
      currentCol++;
      if (currentCol >= cols) {
        currentCol = 0;
        currentRow++;
        if (currentRow >= rows) {
          currentRow = 0;
          currentPage++;
        }
      }
    }
  });

  return doc;
}

// Function to print barcodes
export function printBarcodes(items: BarcodeItem[], settings: BarcodeSettings, quantity: number = 1): void {
  const doc = generateBarcodePDF(items, settings, quantity);

  // In a real app, this would send the PDF to a printer
  // For this mock, we'll just open it in a new window
  doc.output('dataurlnewwindow');
}

// Function to generate a single barcode for preview
export function generateBarcodePreview(item: BarcodeItem, settings: BarcodeSettings): string {
  const doc = generateBarcodePDF([item], settings);

  // Return as data URL
  return doc.output('datauristring');
}
