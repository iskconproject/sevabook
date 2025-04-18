import { createClient } from '@supabase/supabase-js';
import { InventoryItem } from '../types/inventory';
import { Transaction, TransactionItem, TransactionWithItems } from '../types/transaction';
import { BarcodeSettings, AppSettings } from '../types/settings';
import { UserProfile } from '../types/user';

// These values should be stored in environment variables in a production environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Abstract the database operations to allow for future swapping of backend
export const db = {
  // Auth operations
  auth: {
    signInWithGoogle: async () => {
      return await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
    },
    signInWithPassword: async (email: string, password: string) => {
      return await supabase.auth.signInWithPassword({ email, password });
    },
    signUp: async (email: string, password: string) => {
      return await supabase.auth.signUp({ email, password });
    },
    signOut: async () => {
      return await supabase.auth.signOut();
    },
    getUser: async () => {
      return await supabase.auth.getUser();
    },
    getSession: async () => {
      return await supabase.auth.getSession();
    },
    onAuthStateChange: (callback: any) => {
      return supabase.auth.onAuthStateChange(callback);
    }
  },

  // Inventory operations
  inventory: {
    getItems: async () => {
      return await supabase.from('inventory').select('*') as { data: InventoryItem[] | null, error: any };
    },
    getItemById: async (id: string) => {
      return await supabase.from('inventory').select('*').eq('id', id).single() as { data: InventoryItem | null, error: any };
    },
    addItem: async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
      return await supabase.from('inventory').insert(item) as { data: InventoryItem[] | null, error: any };
    },
    updateItem: async (id: string, updates: Partial<InventoryItem>) => {
      return await supabase.from('inventory').update(updates).eq('id', id) as { data: InventoryItem[] | null, error: any };
    },
    deleteItem: async (id: string) => {
      return await supabase.from('inventory').delete().eq('id', id);
    },
    searchItems: async (query: string) => {
      return await supabase
        .from('inventory')
        .select('*')
        .or(`name.ilike.%${query}%, description.ilike.%${query}%`) as { data: InventoryItem[] | null, error: any };
    },
    getItemsByCategory: async (category: string) => {
      return await supabase
        .from('inventory')
        .select('*')
        .eq('category', category) as { data: InventoryItem[] | null, error: any };
    },
    getItemsByLanguage: async (language: string) => {
      return await supabase
        .from('inventory')
        .select('*')
        .eq('language', language) as { data: InventoryItem[] | null, error: any };
    },
    getLowStockItems: async (threshold: number = 10) => {
      return await supabase
        .from('inventory')
        .select('*')
        .lt('stock', threshold) as { data: InventoryItem[] | null, error: any };
    }
  },

  // Transaction operations
  transactions: {
    getTransactions: async () => {
      return await supabase.from('transactions').select('*') as { data: Transaction[] | null, error: any };
    },
    getTransactionById: async (id: string) => {
      return await supabase
        .from('transactions')
        .select('*, transaction_items(*, inventory(*))')
        .eq('id', id)
        .single() as { data: TransactionWithItems | null, error: any };
    },
    addTransaction: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>, items: Omit<TransactionItem, 'id' | 'transaction_id' | 'created_at'>[]) => {
      // First insert the transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single() as { data: Transaction | null, error: any };

      if (transactionError || !transactionData) {
        return { error: transactionError || new Error('Failed to create transaction') };
      }

      // Then insert the transaction items
      const transactionItems = items.map(item => ({
        transaction_id: transactionData.id,
        inventory_id: item.inventory_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems);

      if (itemsError) {
        return { error: itemsError };
      }

      return { data: transactionData, error: null };
    },
    getTransactionsByDateRange: async (startDate: string, endDate: string) => {
      return await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate) as { data: Transaction[] | null, error: any };
    },
    getTransactionsByUser: async (userId: string) => {
      return await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId) as { data: Transaction[] | null, error: any };
    },
    getTransactionItems: async (transactionId: string) => {
      return await supabase
        .from('transaction_items')
        .select('*, inventory(*)')
        .eq('transaction_id', transactionId) as { data: (TransactionItem & { inventory: InventoryItem })[] | null, error: any };
    }
  },

  // User operations
  users: {
    getUsers: async () => {
      return await supabase.from('users').select('*') as { data: UserProfile[] | null, error: any };
    },
    getUserById: async (id: string) => {
      return await supabase.from('users').select('*').eq('id', id).single() as { data: UserProfile | null, error: any };
    },
    updateUser: async (id: string, updates: Partial<UserProfile>) => {
      return await supabase.from('users').update(updates).eq('id', id) as { data: UserProfile[] | null, error: any };
    },
    createUserIfNotExists: async (profile: Omit<UserProfile, 'created_at' | 'updated_at'>) => {
      // First check if user exists
      const { data } = await supabase.from('users').select('*').eq('id', profile.id).single() as { data: UserProfile | null, error: any };

      // If user doesn't exist, create them
      if (!data) {
        return await supabase.from('users').insert(profile) as { data: UserProfile[] | null, error: any };
      }

      return { data, error: null };
    }
  },

  // Barcode settings operations
  barcodeSettings: {
    getSettings: async () => {
      return await supabase.from('barcode_settings').select('*').limit(1).single() as { data: BarcodeSettings | null, error: any };
    },
    updateSettings: async (id: string, updates: Partial<BarcodeSettings>) => {
      return await supabase.from('barcode_settings').update(updates).eq('id', id) as { data: BarcodeSettings[] | null, error: any };
    },
    createSettings: async (settings: Omit<BarcodeSettings, 'id' | 'created_at' | 'updated_at'>) => {
      return await supabase.from('barcode_settings').insert(settings) as { data: BarcodeSettings[] | null, error: any };
    }
  },

  // App settings operations
  appSettings: {
    getSettings: async () => {
      return await supabase.from('app_settings').select('*').limit(1).single() as { data: AppSettings | null, error: any };
    },
    updateSettings: async (id: string, updates: Partial<AppSettings>) => {
      return await supabase.from('app_settings').update(updates).eq('id', id) as { data: AppSettings[] | null, error: any };
    },
    createSettings: async (settings: Omit<AppSettings, 'id' | 'created_at' | 'updated_at'>) => {
      return await supabase.from('app_settings').insert(settings) as { data: AppSettings[] | null, error: any };
    }
  }
};
