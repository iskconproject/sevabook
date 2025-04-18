// Utility functions for receipt generation and printing

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
  size?: '80mm' | '58mm' | '76mm';
  printerType?: 'browser' | 'serial' | 'network';
  printerIp?: string;
  printerPort?: number;
  showPrintPreview?: boolean;
}

// Sample receipt items for preview
export const sampleReceiptItems: ReceiptItem[] = [
  { id: '1', name: 'Bhagavad Gita As It Is', price: 250, quantity: 1, language: 'english' },
  { id: '2', name: 'Incense Sticks (Sandalwood)', price: 50, quantity: 2, language: 'none' },
  { id: '3', name: 'Deity Dress (Small)', price: 350, quantity: 1, language: 'none' }
];
