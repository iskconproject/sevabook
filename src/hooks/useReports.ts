import { useState } from 'react';
import { db } from '@/lib/supabase/client';
import { Transaction, TransactionItem } from '@/lib/types/transaction';
import { InventoryItem } from '@/lib/types/inventory';

interface SalesReportItem extends Transaction {
  items_count: number;
}

interface InventoryReportItem extends InventoryItem {
  sold: number;
  revenue: number;
}

interface ReportSummary {
  totalSales: number;
  totalItems: number;
  averageSale: number;
  transactionCount: number;
}

export function useReports() {
  const [salesData, setSalesData] = useState<SalesReportItem[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryReportItem[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    totalSales: 0,
    totalItems: 0,
    averageSale: 0,
    transactionCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch transactions by date range
  const fetchTransactionsByDateRange = async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Format dates for database query
      const formattedStartDate = startDate ? `${startDate}T00:00:00.000Z` : undefined;
      const formattedEndDate = endDate ? `${endDate}T23:59:59.999Z` : undefined;
      
      // Get transactions in date range
      const { data: transactions, error: transactionsError } = await db.transactions.getTransactionsByDateRange(
        formattedStartDate || '1970-01-01T00:00:00.000Z',
        formattedEndDate || new Date().toISOString()
      );
      
      if (transactionsError) {
        throw new Error(transactionsError.message);
      }
      
      if (!transactions || transactions.length === 0) {
        setSalesData([]);
        setSummary({
          totalSales: 0,
          totalItems: 0,
          averageSale: 0,
          transactionCount: 0
        });
        setLoading(false);
        return;
      }
      
      // Get transaction items for each transaction
      const salesReportItems: SalesReportItem[] = [];
      let totalItems = 0;
      
      for (const transaction of transactions) {
        const { data: items } = await db.transactions.getTransactionItems(transaction.id);
        const itemsCount = items ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        
        totalItems += itemsCount;
        
        salesReportItems.push({
          ...transaction,
          items_count: itemsCount
        });
      }
      
      // Calculate summary statistics
      const totalSales = salesReportItems.reduce((sum, sale) => sum + sale.total, 0);
      const transactionCount = salesReportItems.length;
      const averageSale = transactionCount > 0 ? totalSales / transactionCount : 0;
      
      // Update state
      setSalesData(salesReportItems);
      setSummary({
        totalSales,
        totalItems,
        averageSale,
        transactionCount
      });
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch transactions'));
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch inventory report data
  const fetchInventoryReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get all inventory items
      const { data: inventory, error: inventoryError } = await db.inventory.getItems();
      
      if (inventoryError) {
        throw new Error(inventoryError.message);
      }
      
      if (!inventory || inventory.length === 0) {
        setInventoryData([]);
        setLoading(false);
        return;
      }
      
      // Get all transactions
      const { data: transactions, error: transactionsError } = await db.transactions.getTransactions();
      
      if (transactionsError) {
        throw new Error(transactionsError.message);
      }
      
      // Get all transaction items
      const inventoryReportItems: InventoryReportItem[] = [];
      const soldQuantities: Record<string, number> = {};
      const revenues: Record<string, number> = {};
      
      if (transactions && transactions.length > 0) {
        for (const transaction of transactions) {
          if (transaction.status === 'completed') {
            const { data: items } = await db.transactions.getTransactionItems(transaction.id);
            
            if (items) {
              for (const item of items) {
                if (!soldQuantities[item.inventory_id]) {
                  soldQuantities[item.inventory_id] = 0;
                }
                if (!revenues[item.inventory_id]) {
                  revenues[item.inventory_id] = 0;
                }
                
                soldQuantities[item.inventory_id] += item.quantity;
                revenues[item.inventory_id] += item.price * item.quantity;
              }
            }
          }
        }
      }
      
      // Create inventory report items
      for (const item of inventory) {
        inventoryReportItems.push({
          ...item,
          sold: soldQuantities[item.id] || 0,
          revenue: revenues[item.id] || 0
        });
      }
      
      // Update state
      setInventoryData(inventoryReportItems);
      
    } catch (err) {
      console.error('Error fetching inventory report:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch inventory report'));
    } finally {
      setLoading(false);
    }
  };
  
  return {
    salesData,
    inventoryData,
    summary,
    loading,
    error,
    fetchTransactionsByDateRange,
    fetchInventoryReport
  };
}
