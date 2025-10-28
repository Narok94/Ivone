import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Client, StockItem, Sale, Payment } from '../types';

interface RawData {
  clients: Client[];
  stockItems: StockItem[];
  sales: Sale[];
  payments: Payment[];
}

interface DataContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;
  getClientById: (clientId: string) => Client | undefined;
  
  stockItems: StockItem[];
  addStockItem: (item: Omit<StockItem, 'id'>) => void;
  updateStockItemQuantity: (itemId: string, newQuantity: number) => void;
  deleteStockItem: (itemId: string) => void;

  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'total'>) => Sale;
  updateSale: (sale: Sale) => Sale;
  deleteSale: (saleId: string) => void;

  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (payment: Payment) => void;
  deletePayment: (paymentId: string) => void;

  clientBalances: Map<string, number>;

  getRawData: () => RawData;
  loadRawData: (data: RawData) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
  const [stockItems, setStockItems] = useLocalStorage<StockItem[]>('stockItems', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
  const [payments, setPayments] = useLocalStorage<Payment[]>('payments', []);

  const addClient = (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = { ...clientData, id: crypto.randomUUID() };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const deleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
  };
  
  const getClientById = (clientId: string) => clients.find(c => c.id === clientId);

  const addStockItem = (itemData: Omit<StockItem, 'id'>) => {
    const newItem: StockItem = { ...itemData, id: crypto.randomUUID() };
    setStockItems(prev => [...prev, newItem]);
  };

  const updateStockItemQuantity = (itemId: string, newQuantity: number) => {
    setStockItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
  };

  const deleteStockItem = (itemId: string) => {
    setStockItems(prev => prev.filter(item => item.id !== itemId));
  };

  const addSale = (saleData: Omit<Sale, 'id'|'total'>) => {
    const newSale: Sale = { 
        ...saleData, 
        id: crypto.randomUUID(),
        total: parseFloat((saleData.quantity * saleData.unitPrice).toFixed(2)),
    };
    setSales(prev => [...prev, newSale]);

    if (newSale.stockItemId) {
        const stockItem = stockItems.find(item => item.id === newSale.stockItemId);
        if (stockItem) {
            const newQuantity = stockItem.quantity - newSale.quantity;
            updateStockItemQuantity(newSale.stockItemId, newQuantity);
        }
    }
    return newSale;
  };
  
  const updateSale = (updatedSale: Sale) => {
    const originalSale = sales.find(s => s.id === updatedSale.id);
    if (!originalSale) return updatedSale;

    // Use functional updates to prevent race conditions with stock
    setStockItems(prevStock => {
        let newStock = [...prevStock];
        // Revert old stock quantity
        if (originalSale.stockItemId) {
            newStock = newStock.map(item => 
                item.id === originalSale.stockItemId ? { ...item, quantity: item.quantity + originalSale.quantity } : item
            );
        }
        // Apply new stock quantity
        if (updatedSale.stockItemId) {
            newStock = newStock.map(item =>
                item.id === updatedSale.stockItemId ? { ...item, quantity: item.quantity - updatedSale.quantity } : item
            );
        }
        return newStock;
    });

    const newTotal = parseFloat((updatedSale.quantity * updatedSale.unitPrice).toFixed(2));
    const finalSaleData = { ...updatedSale, total: newTotal };
    setSales(prev => prev.map(s => (s.id === updatedSale.id ? finalSaleData : s)));
    return finalSaleData;
  };


  const deleteSale = (saleId: string) => {
    const saleToDelete = sales.find(s => s.id === saleId);
    if (!saleToDelete) return;

    // Return item to stock if it was a stock item
    if (saleToDelete.stockItemId) {
        const stockItem = stockItems.find(item => item.id === saleToDelete.stockItemId);
        if (stockItem) {
            updateStockItemQuantity(saleToDelete.stockItemId, stockItem.quantity + saleToDelete.quantity);
        }
    }

    setSales(prev => prev.filter(s => s.id !== saleId));
  };

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = { ...paymentData, id: crypto.randomUUID() };
    setPayments(prev => [...prev, newPayment]);
  };
  
  const updatePayment = (updatedPayment: Payment) => {
    setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
  };

  const deletePayment = (paymentId: string) => {
    setPayments(prev => prev.filter(p => p.id !== paymentId));
  };

  const clientBalances = useMemo(() => {
    const balances = new Map<string, number>();
    clients.forEach(client => {
        const totalSales = sales.filter(s => s.clientId === client.id).reduce((sum, s) => sum + s.total, 0);
        const totalPayments = payments.filter(p => p.clientId === client.id).reduce((sum, p) => sum + p.amount, 0);
        balances.set(client.id, totalSales - totalPayments);
    });
    return balances;
  }, [clients, sales, payments]);
  
  const getRawData = () => ({ clients, stockItems, sales, payments });
  
  const loadRawData = (data: RawData) => {
      // Basic validation
      if (data && Array.isArray(data.clients) && Array.isArray(data.stockItems) && Array.isArray(data.sales) && Array.isArray(data.payments)) {
          setClients(data.clients);
          setStockItems(data.stockItems);
          setSales(data.sales);
          setPayments(data.payments);
      } else {
          throw new Error("Arquivo de backup inválido ou corrompido.");
      }
  };

  const value = {
    clients, addClient, updateClient, deleteClient, getClientById,
    stockItems, addStockItem, updateStockItemQuantity, deleteStockItem,
    sales, addSale, updateSale, deleteSale,
    payments, addPayment, updatePayment, deletePayment,
    clientBalances,
    getRawData,
    loadRawData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};