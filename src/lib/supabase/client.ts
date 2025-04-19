import { createClient } from '@supabase/supabase-js';
import { InventoryItem } from '../types/inventory';
import { Transaction, TransactionItem, TransactionWithItems } from '../types/transaction';
import { BarcodeSettings, AppSettings } from '../types/settings';
import { UserProfile } from '../types/user';
import { Location } from '../types/location';

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
    getItems: async (locationId?: string) => {
      const query = supabase.from('inventory').select('*');
      if (locationId) {
        return await query.eq('location_id', locationId) as { data: InventoryItem[] | null, error: any };
      }
      return await query as { data: InventoryItem[] | null, error: any };
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
    searchItems: async (query: string, locationId?: string) => {
      const dbQuery = supabase
        .from('inventory')
        .select('*')
        .or(`name.ilike.%${query}%, description.ilike.%${query}%`);

      if (locationId) {
        return await dbQuery.eq('location_id', locationId) as { data: InventoryItem[] | null, error: any };
      }
      return await dbQuery as { data: InventoryItem[] | null, error: any };
    },
    getItemsByCategory: async (category: string, locationId?: string) => {
      const query = supabase
        .from('inventory')
        .select('*')
        .eq('category', category);

      if (locationId) {
        return await query.eq('location_id', locationId) as { data: InventoryItem[] | null, error: any };
      }
      return await query as { data: InventoryItem[] | null, error: any };
    },
    getItemsByLanguage: async (language: string, locationId?: string) => {
      const query = supabase
        .from('inventory')
        .select('*')
        .eq('language', language);

      if (locationId) {
        return await query.eq('location_id', locationId) as { data: InventoryItem[] | null, error: any };
      }
      return await query as { data: InventoryItem[] | null, error: any };
    },
    getLowStockItems: async (threshold: number = 10, locationId?: string) => {
      const query = supabase
        .from('inventory')
        .select('*')
        .lt('stock', threshold);

      if (locationId) {
        return await query.eq('location_id', locationId) as { data: InventoryItem[] | null, error: any };
      }
      return await query as { data: InventoryItem[] | null, error: any };
    },
    transferItems: async (itemId: string, fromLocationId: string, toLocationId: string, quantity: number) => {
      // Get the item from the source location
      const { data: sourceItem, error: sourceError } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', itemId)
        .eq('location_id', fromLocationId)
        .single() as { data: InventoryItem | null, error: any };

      if (sourceError || !sourceItem) {
        return { error: sourceError || new Error('Source item not found') };
      }

      if (sourceItem.stock < quantity) {
        return { error: new Error('Not enough stock in source location') };
      }

      // Check if the item exists in the destination location
      const { data: destItem, error: destError } = await supabase
        .from('inventory')
        .select('*')
        .eq('name', sourceItem.name)
        .eq('category', sourceItem.category)
        .eq('language', sourceItem.language)
        .eq('location_id', toLocationId)
        .single() as { data: InventoryItem | null, error: any };

      // Start a transaction
      // Decrease stock in source location
      const { error: updateSourceError } = await supabase
        .from('inventory')
        .update({ stock: sourceItem.stock - quantity })
        .eq('id', sourceItem.id);

      if (updateSourceError) {
        return { error: updateSourceError };
      }

      if (destItem) {
        // If item exists in destination, increase stock
        const { error: updateDestError } = await supabase
          .from('inventory')
          .update({ stock: destItem.stock + quantity })
          .eq('id', destItem.id);

        if (updateDestError) {
          // Rollback source update
          await supabase
            .from('inventory')
            .update({ stock: sourceItem.stock })
            .eq('id', sourceItem.id);

          return { error: updateDestError };
        }
      } else {
        // If item doesn't exist in destination, create it
        const newItem = {
          name: sourceItem.name,
          category: sourceItem.category,
          language: sourceItem.language,
          price: sourceItem.price,
          stock: quantity,
          description: sourceItem.description,
          location_id: toLocationId
        };

        const { error: insertError } = await supabase
          .from('inventory')
          .insert(newItem);

        if (insertError) {
          // Rollback source update
          await supabase
            .from('inventory')
            .update({ stock: sourceItem.stock })
            .eq('id', sourceItem.id);

          return { error: insertError };
        }
      }

      return { success: true };
    }
  },

  // Transaction operations
  transactions: {
    getTransactions: async (locationId?: string) => {
      const query = supabase.from('transactions').select('*');
      if (locationId) {
        return await query.eq('location_id', locationId) as { data: Transaction[] | null, error: any };
      }
      return await query as { data: Transaction[] | null, error: any };
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
    getTransactionsByDateRange: async (startDate: string, endDate: string, locationId?: string) => {
      const query = supabase
        .from('transactions')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (locationId) {
        return await query.eq('location_id', locationId) as { data: Transaction[] | null, error: any };
      }
      return await query as { data: Transaction[] | null, error: any };
    },
    getTransactionsByUser: async (userId: string, locationId?: string) => {
      const query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (locationId) {
        return await query.eq('location_id', locationId) as { data: Transaction[] | null, error: any };
      }
      return await query as { data: Transaction[] | null, error: any };
    },
    getTransactionItems: async (transactionId: string) => {
      return await supabase
        .from('transaction_items')
        .select('*, inventory(*)')
        .eq('transaction_id', transactionId) as { data: (TransactionItem & { inventory: InventoryItem })[] | null, error: any };
    },

    getTransactionsWithItems: async (startDate?: string, endDate?: string, locationId?: string) => {
      // Build the query
      let query = supabase
        .from('transactions')
        .select(`
          *,
          transaction_items!transaction_items_transaction_id_fkey (*, inventory(*))
        `);

      // Add date range filters if provided
      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      // Add location filter if provided
      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      return await query as {
        data: (Transaction & {
          transaction_items: (TransactionItem & {
            inventory: InventoryItem
          })[]
        })[] | null,
        error: any
      };
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
    getSettings: async (locationId?: string) => {
      const query = supabase.from('app_settings').select('*');
      if (locationId) {
        return await query.eq('location_id', locationId).limit(1).single() as { data: AppSettings | null, error: any };
      }
      return await query.limit(1).single() as { data: AppSettings | null, error: any };
    },
    updateSettings: async (id: string, updates: Partial<AppSettings>) => {
      return await supabase.from('app_settings').update(updates).eq('id', id) as { data: AppSettings[] | null, error: any };
    },
    createSettings: async (settings: Omit<AppSettings, 'id' | 'created_at' | 'updated_at'>) => {
      return await supabase.from('app_settings').insert(settings) as { data: AppSettings[] | null, error: any };
    }
  },

  // Location operations
  locations: {
    getLocations: async () => {
      return await supabase.from('locations').select('*') as { data: Location[] | null, error: any };
    },
    getLocationById: async (id: string) => {
      return await supabase.from('locations').select('*').eq('id', id).single() as { data: Location | null, error: any };
    },
    getDefaultLocation: async () => {
      return await supabase.from('locations').select('*').eq('is_default', true).single() as { data: Location | null, error: any };
    },
    addLocation: async (location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
      return await supabase.from('locations').insert(location) as { data: Location[] | null, error: any };
    },
    updateLocation: async (id: string, updates: Partial<Location>) => {
      return await supabase.from('locations').update(updates).eq('id', id) as { data: Location[] | null, error: any };
    },
    deleteLocation: async (id: string) => {
      return await supabase.from('locations').delete().eq('id', id);
    }
  }
};
