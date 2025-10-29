import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Client, StockItem, Sale, Payment } from '../types';
import { useAuth } from './AuthContext';

interface Action {
  type: string;
  payload: any;
  timestamp: number;
}

interface RawData {
  clients: Client[];
  stockItems: StockItem[];
  sales: Sale[];
  payments: Payment[];
  actionQueue?: Action[];
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
  
  actionQueue: Action[];
  clearActionQueue: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  const storageKeyPrefix = currentUser ? currentUser.id : 'nouser';

  const [clients, setClients] = useLocalStorage<Client[]>(`clients_${storageKeyPrefix}`, []);
  const [stockItems, setStockItems] = useLocalStorage<StockItem[]>(`stockItems_${storageKeyPrefix}`, []);
  const [sales, setSales] = useLocalStorage<Sale[]>(`sales_${storageKeyPrefix}`, []);
  const [payments, setPayments] = useLocalStorage<Payment[]>(`payments_${storageKeyPrefix}`, []);
  const [actionQueue, setActionQueue] = useLocalStorage<Action[]>(`action_queue_${storageKeyPrefix}`, []);

  const clearActionQueue = () => {
    setActionQueue([]);
  };

  const addClient = (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = { ...clientData, id: crypto.randomUUID() };
    setClients(prev => [...prev, newClient]);
    setActionQueue(prev => [...prev, { type: 'ADD_CLIENT', payload: newClient, timestamp: Date.now() }]);
  };

  const updateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setActionQueue(prev => [...prev, { type: 'UPDATE_CLIENT', payload: updatedClient, timestamp: Date.now() }]);
  };

  const deleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    setActionQueue(prev => [...prev, { type: 'DELETE_CLIENT', payload: { id: clientId }, timestamp: Date.now() }]);
  };
  
  const getClientById = (clientId: string) => clients.find(c => c.id === clientId);

  const addStockItem = (itemData: Omit<StockItem, 'id'>) => {
    const newItem: StockItem = { ...itemData, id: crypto.randomUUID() };
    setStockItems(prev => [...prev, newItem]);
    setActionQueue(prev => [...prev, { type: 'ADD_STOCK_ITEM', payload: newItem, timestamp: Date.now() }]);
  };

  // Internal function for optimistic UI updates without creating a sync action
  const optimisticUpdateStock = (itemId: string, newQuantity: number) => {
    setStockItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
  };
  
  // Public function for direct stock updates (from StockManager) that should be synced
  const updateStockItemQuantity = (itemId: string, newQuantity: number) => {
    optimisticUpdateStock(itemId, newQuantity);
    setActionQueue(prev => [...prev, { type: 'UPDATE_STOCK_QUANTITY', payload: { id: itemId, quantity: newQuantity }, timestamp: Date.now() }]);
  };

  const deleteStockItem = (itemId: string) => {
    const itemToDelete = stockItems.find(item => item.id === itemId);
    setStockItems(prev => prev.filter(item => item.id !== itemId));
    if (itemToDelete) {
      setActionQueue(prev => [...prev, { type: 'DELETE_STOCK_ITEM', payload: itemToDelete, timestamp: Date.now() }]);
    }
  };

  const addSale = (saleData: Omit<Sale, 'id'|'total'>) => {
    const newSale: Sale = { 
        ...saleData, 
        id: crypto.randomUUID(),
        total: parseFloat((saleData.quantity * saleData.unitPrice).toFixed(2)),
    };
    setSales(prev => [...prev, newSale]);
    setActionQueue(prev => [...prev, { type: 'ADD_SALE', payload: newSale, timestamp: Date.now() }]);

    if (newSale.stockItemId) {
        const stockItem = stockItems.find(item => item.id === newSale.stockItemId);
        if (stockItem) {
            const newQuantity = stockItem.quantity - newSale.quantity;
            optimisticUpdateStock(newSale.stockItemId, newQuantity);
        }
    }
    return newSale;
  };
  
  const updateSale = (updatedSale: Sale) => {
    const originalSale = sales.find(s => s.id === updatedSale.id);
    if (!originalSale) return updatedSale;

    setStockItems(prevStock => {
        let newStock = [...prevStock];
        if (originalSale.stockItemId) {
            newStock = newStock.map(item => 
                item.id === originalSale.stockItemId ? { ...item, quantity: item.quantity + originalSale.quantity } : item
            );
        }
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

    setActionQueue(prev => [...prev, { type: 'UPDATE_SALE', payload: { original: originalSale, updated: finalSaleData }, timestamp: Date.now() }]);

    return finalSaleData;
  };


  const deleteSale = (saleId: string) => {
    const saleToDelete = sales.find(s => s.id === saleId);
    if (!saleToDelete) return;
    
    setActionQueue(prev => [...prev, { type: 'DELETE_SALE', payload: saleToDelete, timestamp: Date.now() }]);

    if (saleToDelete.stockItemId) {
        const stockItem = stockItems.find(item => item.id === saleToDelete.stockItemId);
        if (stockItem) {
            optimisticUpdateStock(saleToDelete.stockItemId, stockItem.quantity + saleToDelete.quantity);
        }
    }

    setSales(prev => prev.filter(s => s.id !== saleId));
  };

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = { ...paymentData, id: crypto.randomUUID() };
    setPayments(prev => [...prev, newPayment]);
    setActionQueue(prev => [...prev, { type: 'ADD_PAYMENT', payload: newPayment, timestamp: Date.now() }]);
  };
  
  const updatePayment = (updatedPayment: Payment) => {
    setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
    setActionQueue(prev => [...prev, { type: 'UPDATE_PAYMENT', payload: updatedPayment, timestamp: Date.now() }]);
  };

  const deletePayment = (paymentId: string) => {
    const paymentToDelete = payments.find(p => p.id === paymentId);
    setPayments(prev => prev.filter(p => p.id !== paymentId));
    if (paymentToDelete) {
      setActionQueue(prev => [...prev, { type: 'DELETE_PAYMENT', payload: paymentToDelete, timestamp: Date.now() }]);
    }
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
  
  const getRawData = () => ({ clients, stockItems, sales, payments, actionQueue });
  
  const loadRawData = (data: RawData) => {
      if (data && Array.isArray(data.clients) && Array.isArray(data.stockItems) && Array.isArray(data.sales) && Array.isArray(data.payments)) {
          setClients(data.clients);
          setStockItems(data.stockItems);
          setSales(data.sales);
          setPayments(data.payments);
          if (data.actionQueue && Array.isArray(data.actionQueue)) {
            setActionQueue(data.actionQueue);
          } else {
            setActionQueue([]);
          }
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
    actionQueue,
    clearActionQueue,
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