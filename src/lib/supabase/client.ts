import { createClient } from '@supabase/supabase-js';

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
      return await supabase.from('inventory').select('*');
    },
    getItemById: async (id: string) => {
      return await supabase.from('inventory').select('*').eq('id', id).single();
    },
    addItem: async (item: any) => {
      return await supabase.from('inventory').insert(item);
    },
    updateItem: async (id: string, updates: any) => {
      return await supabase.from('inventory').update(updates).eq('id', id);
    },
    deleteItem: async (id: string) => {
      return await supabase.from('inventory').delete().eq('id', id);
    },
    searchItems: async (query: string) => {
      return await supabase
        .from('inventory')
        .select('*')
        .or(`name.ilike.%${query}%, description.ilike.%${query}%`);
    }
  },

  // Transaction operations
  transactions: {
    getTransactions: async () => {
      return await supabase.from('transactions').select('*');
    },
    getTransactionById: async (id: string) => {
      return await supabase.from('transactions').select('*').eq('id', id).single();
    },
    addTransaction: async (transaction: any) => {
      return await supabase.from('transactions').insert(transaction);
    }
  },

  // User operations
  users: {
    getUsers: async () => {
      return await supabase.from('users').select('*');
    },
    getUserById: async (id: string) => {
      return await supabase.from('users').select('*').eq('id', id).single();
    },
    updateUser: async (id: string, updates: any) => {
      return await supabase.from('users').update(updates).eq('id', id);
    }
  }
};
