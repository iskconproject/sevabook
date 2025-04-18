export interface BarcodeSettings {
  id: string;
  type: BarcodeType;
  size: BarcodeSize;
  include_price: boolean;
  include_title: boolean;
  include_language: boolean;
  custom_heading?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export type BarcodeType = 'CODE128' | 'EAN13' | 'UPC';

export type BarcodeSize = '50x25' | '40x20' | '60x30';

export interface AppSettings {
  id: string;
  temple_name: string;
  receipt_header: string;
  receipt_footer: string;
  show_logo: boolean;
  show_barcode: boolean;
  custom_message?: string;
  receipt_size?: '80mm' | '58mm' | '76mm';
  printer_type?: 'browser' | 'serial' | 'network';
  printer_ip?: string;
  printer_port?: number;
  show_print_preview?: boolean;
  user_id?: string;
  created_at: string;
  updated_at: string;
}
