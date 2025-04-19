export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  language: string;
  price: number;
  stock: number;
  description?: string;
  location_id?: string;
  created_at: string;
  updated_at: string;
}

export type InventoryCategory = 'books' | 'incense' | 'clothing' | 'jewelry' | 'puja' | 'deities' | 'other';

export type InventoryLanguage = 'english' | 'bengali' | 'hindi' | 'none';

export interface InventoryFormData {
  name: string;
  category: string;
  language: string;
  price: string;
  stock: string;
  description?: string;
  location_id?: string;
}
