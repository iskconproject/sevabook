// Utility functions for receipt generation and printing

import { jsPDF } from 'jspdf';

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  language?: string;
}

export interface ReceiptSettings {
  header: string;
  footer: string;
  showLogo: boolean;
  showBarcode: boolean;
  customMessage: string;
}

// Function to generate a PDF receipt
export function generateReceiptPDF(
  items: ReceiptItem[],
  settings: ReceiptSettings,
  transactionId: string = `TR-${Date.now()}`
): jsPDF {
  // Create a new PDF document (receipt size)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200] // Standard thermal receipt width (80mm)
  });

  const pageWidth = 80; // mm
  const margin = 5; // mm
  const contentWidth = pageWidth - (2 * margin);
  let yPos = margin;
  
  // Set font
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Add header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const headerLines = doc.splitTextToSize(settings.header, contentWidth);
  doc.text(headerLines, pageWidth / 2, yPos, { align: 'center' });
  yPos += (headerLines.length * 5) + 5;
  
  // Add date and transaction ID
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const date = new Date().toLocaleString();
  doc.text(`Date: ${date}`, margin, yPos);
  yPos += 4;
  doc.text(`Transaction ID: ${transactionId}`, margin, yPos);
  yPos += 8;
  
  // Add divider
  doc.setDrawColor(0);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;
  
  // Add items header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Item', margin, yPos);
  doc.text('Qty', pageWidth - margin - 25, yPos, { align: 'right' });
  doc.text('Price', pageWidth - margin - 15, yPos, { align: 'right' });
  doc.text('Total', pageWidth - margin, yPos, { align: 'right' });
  yPos += 4;
  
  // Add divider
  doc.setDrawColor(0);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;
  
  // Add items
  doc.setFont('helvetica', 'normal');
  let subtotal = 0;
  
  items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    // Item name (possibly truncated)
    const itemName = item.name.length > 20 ? item.name.substring(0, 18) + '..' : item.name;
    doc.text(itemName, margin, yPos);
    
    // Add language if available
    if (item.language && item.language !== 'none') {
      doc.setFontSize(6);
      doc.text(`(${item.language})`, margin + 2, yPos + 3);
      doc.setFontSize(8);
    }
    
    // Quantity, price, and total
    doc.text(item.quantity.toString(), pageWidth - margin - 25, yPos, { align: 'right' });
    doc.text(`₹${item.price.toFixed(2)}`, pageWidth - margin - 15, yPos, { align: 'right' });
    doc.text(`₹${itemTotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
    
    yPos += 6;
  });
  
  // Add divider
  doc.setDrawColor(0);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;
  
  // Add subtotal
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', pageWidth - margin - 30, yPos);
  doc.text(`₹${subtotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;
  
  // Add total
  doc.setFontSize(10);
  doc.text('Total:', pageWidth - margin - 30, yPos);
  doc.text(`₹${subtotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 10;
  
  // Add barcode if enabled
  if (settings.showBarcode) {
    // In a real app, this would use a barcode library
    // For this mock, we'll just draw a placeholder
    doc.setDrawColor(0);
    doc.setFillColor(0);
    const barcodeHeight = 10;
    const barcodeWidth = 40;
    doc.rect(pageWidth / 2 - barcodeWidth / 2, yPos, barcodeWidth, barcodeHeight, 'F');
    yPos += barcodeHeight + 5;
    
    // Add transaction ID below barcode
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(transactionId, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
  }
  
  // Add custom message
  if (settings.customMessage) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const messageLines = doc.splitTextToSize(settings.customMessage, contentWidth);
    doc.text(messageLines, pageWidth / 2, yPos, { align: 'center' });
    yPos += (messageLines.length * 4) + 5;
  }
  
  // Add footer
  doc.setFont('helvetica', 'normal');
  const footerLines = doc.splitTextToSize(settings.footer, contentWidth);
  doc.text(footerLines, pageWidth / 2, yPos, { align: 'center' });
  
  return doc;
}

// Function to print receipt
export function printReceipt(
  items: ReceiptItem[],
  settings: ReceiptSettings,
  transactionId: string = `TR-${Date.now()}`
): void {
  const doc = generateReceiptPDF(items, settings, transactionId);
  
  // In a real app, this would send the PDF to a printer
  // For this mock, we'll just open it in a new window
  doc.output('dataurlnewwindow');
}

// Function to generate a receipt preview
export function generateReceiptPreview(
  items: ReceiptItem[],
  settings: ReceiptSettings
): string {
  const doc = generateReceiptPDF(items, settings);
  
  // Return as data URL
  return doc.output('datauristring');
}

// Sample receipt items for preview
export const sampleReceiptItems: ReceiptItem[] = [
  { id: '1', name: 'Bhagavad Gita As It Is', price: 250, quantity: 1, language: 'english' },
  { id: '2', name: 'Incense Sticks (Sandalwood)', price: 50, quantity: 2, language: 'none' },
  { id: '3', name: 'Deity Dress (Small)', price: 350, quantity: 1, language: 'none' }
];
