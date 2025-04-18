import { useState, useEffect } from 'react';
import { db } from '@/lib/supabase/client';
import { InventoryItem } from '@/lib/types/inventory';

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all inventory items
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await db.inventory.getItems();
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data) {
        setInventory(data);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch inventory'));
    } finally {
      setLoading(false);
    }
  };

  // Add a new inventory item
  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await db.inventory.addItem(item);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Refresh inventory after adding
      await fetchInventory();
      return { success: true, data };
    } catch (err) {
      console.error('Error adding inventory item:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to add inventory item' 
      };
    }
  };

  // Update an existing inventory item
  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { data, error } = await db.inventory.updateItem(id, updates);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Refresh inventory after updating
      await fetchInventory();
      return { success: true, data };
    } catch (err) {
      console.error('Error updating inventory item:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update inventory item' 
      };
    }
  };

  // Delete an inventory item
  const deleteInventoryItem = async (id: string) => {
    try {
      const { error } = await db.inventory.deleteItem(id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Refresh inventory after deleting
      await fetchInventory();
      return { success: true };
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete inventory item' 
      };
    }
  };

  // Search inventory items
  const searchInventoryItems = async (query: string) => {
    try {
      const { data, error } = await db.inventory.searchItems(query);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Error searching inventory:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to search inventory',
        data: [] as InventoryItem[]
      };
    }
  };

  // Get low stock items
  const getLowStockItems = async (threshold: number = 10) => {
    try {
      const { data, error } = await db.inventory.getLowStockItems(threshold);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Error fetching low stock items:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to fetch low stock items',
        data: [] as InventoryItem[]
      };
    }
  };

  // Fetch inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory,
    loading,
    error,
    fetchInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    searchInventoryItems,
    getLowStockItems
  };
}
