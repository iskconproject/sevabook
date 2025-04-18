import { InventoryItem } from './inventory';

export interface Transaction {
  id: string;
  user_id: string;
  total: number;
  payment_method: PaymentMethod;
  payment_details: PaymentDetails;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithItems extends Transaction {
  transaction_items: (TransactionItem & { inventory: InventoryItem })[];
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  inventory_id: string;
  quantity: number;
  price: number;
  created_at: string;
  inventory?: InventoryItem;
}

export type PaymentMethod = 'cash' | 'upi' | 'card';

export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

export interface PaymentDetails {
  amount_received?: number;
  change_due?: number;
  upi_id?: string;
  card_last4?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  language?: string;
  category?: string;
}
