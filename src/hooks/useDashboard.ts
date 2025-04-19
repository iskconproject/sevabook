import { useState, useEffect } from 'react';
import { db } from '@/lib/supabase/client';
import { useLocation } from '@/contexts/LocationContext';
import { Transaction } from '@/lib/types/transaction';
import { InventoryItem } from '@/lib/types/inventory';

interface DashboardStats {
  totalSales: string;
  totalItems: string;
  lowStockItems: string;
  recentTransactions: {
    id: string;
    date: string;
    amount: string;
    items: number;
    customer: string;
  }[];
  isLoading: boolean;
  error: string | null;
}

export function useDashboard() {
  const { currentLocation } = useLocation();
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: '₹0',
    totalItems: '0',
    lowStockItems: '0',
    recentTransactions: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentLocation) return;

      setStats(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Fetch transactions for the current location
        const { data: transactions, error: transactionsError } = await db.transactions.getTransactions(currentLocation.id);
        
        if (transactionsError) {
          throw new Error(transactionsError.message);
        }

        // Fetch inventory for the current location
        const { data: inventory, error: inventoryError } = await db.inventory.getItems(currentLocation.id);
        
        if (inventoryError) {
          throw new Error(inventoryError.message);
        }

        // Calculate total sales
        const totalSales = transactions ? transactions.reduce((sum, transaction) => sum + transaction.total, 0) : 0;
        
        // Count low stock items
        const lowStockItems = inventory ? inventory.filter(item => item.stock < 10).length : 0;
        
        // Get recent transactions (last 5)
        const recentTransactions = transactions 
          ? transactions
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 5)
          : [];

        // Format recent transactions for display
        const formattedRecentTransactions = await Promise.all(
          recentTransactions.map(async (transaction) => {
            const { data: items } = await db.transactions.getTransactionItems(transaction.id);
            const itemsCount = items ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;
            
            return {
              id: transaction.id.slice(0, 8),
              date: new Date(transaction.created_at).toLocaleDateString(),
              amount: `₹${transaction.total.toFixed(2)}`,
              items: itemsCount,
              customer: transaction.customer_phone || 'Walk-in'
            };
          })
        );

        // Update stats
        setStats({
          totalSales: `₹${totalSales.toFixed(2)}`,
          totalItems: inventory ? inventory.length.toString() : '0',
          lowStockItems: lowStockItems.toString(),
          recentTransactions: formattedRecentTransactions,
          isLoading: false,
          error: null
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch dashboard data'
        }));
      }
    };

    fetchDashboardData();
  }, [currentLocation]);

  return stats;
}
