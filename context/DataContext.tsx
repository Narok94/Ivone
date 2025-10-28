
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Client, StockItem, Sale, Payment } from '../types';

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
  addSale: (sale: Omit<Sale, 'id' | 'total'>) => void;

  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;

  clientBalances: Map<string, number>;
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
        total: saleData.quantity * saleData.unitPrice,
    };
    setSales(prev => [...prev, newSale]);

    if (newSale.stockItemId) {
        const stockItem = stockItems.find(item => item.id === newSale.stockItemId);
        if (stockItem) {
            const newQuantity = stockItem.quantity - newSale.quantity;
            updateStockItemQuantity(newSale.stockItemId, newQuantity);
        }
    }
  };

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = { ...paymentData, id: crypto.randomUUID() };
    setPayments(prev => [...prev, newPayment]);
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

  const value = {
    clients, addClient, updateClient, deleteClient, getClientById,
    stockItems, addStockItem, updateStockItemQuantity, deleteStockItem,
    sales, addSale,
    payments, addPayment,
    clientBalances
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
