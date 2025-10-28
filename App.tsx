
import React, { useState, useMemo, FC, useEffect, ReactNode } from 'react';
import { useData } from './context/DataContext';
import { Client, StockItem, Sale, Payment } from './types';
import { Card, Button, Input, Modal, TextArea, Select } from './components/common';

// --- ICONS ---
const UserPlusIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" x2="22" y1="8" y2="14"/><line x1="19" x2="25" y1="11" y2="11"/></svg>);
const ArchiveIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.5 22h-6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8.5"/><path d="M16 12h-6"/><path d="M16 8h-6"/><path d="M10 4v4"/><path d="M22 18a4 4 0 0 0-4-4h-2a4 4 0 0 0-4 4v.5a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-.5Z"/></svg>);
const CreditCardIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>);
const AddressBookIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M18 20a4 4 0 0 0-5-3.5c-1.3 0-2 .5-3 1.5-1 1-1.5 2.5-1.5 4"/></svg>);
const TrendingUpIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>);
const WalletIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h14.5"/><path d="M14 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>);
const ClockIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const ArrowLeftIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>);
const UsersIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>);
const ShoppingCartIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16"></path></svg>);
const BarChartIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>);
const HistoryIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M12 8v4l4 2"></path></svg>);
const EditIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const TrashIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const SparklesIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9a2 2 0 1 1-4 0a2 2 0 0 0-4-4a2 2 0 1 1 0-4a6 6 0 0 0-9-9a2 2 0 1 1 4 0a2 2 0 0 0 4 4a2 2 0 1 1 0 4Z"/></svg>);

// --- TOAST NOTIFICATION ---
const Toast: FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-24 right-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-5 rounded-xl shadow-lg flex items-center justify-between z-50 animate-slide-in">
      <SparklesIcon className="w-5 h-5 mr-3"/>
      <p className="font-semibold">{message}</p>
      <button onClick={onClose} className="ml-4 text-xl font-semibold leading-none hover:text-pink-100">&times;</button>
    </div>
  );
};

// --- EMPTY STATE ---
const EmptyState: FC<{ icon: FC<{className?: string}>; title: string; message: string; actionButton?: ReactNode }> = ({ icon: Icon, title, message, actionButton }) => (
    <div className="text-center py-12 px-6 bg-pink-50/50 rounded-2xl border-2 border-dashed border-pink-200">
        <div className="p-4 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full inline-block mb-4">
            <Icon className="w-12 h-12 text-pink-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">{message}</p>
        {actionButton}
    </div>
);

type View = 'dashboard' | 'clients' | 'add_client' | 'add_sale' | 'stock' | 'add_payment' | 'reports' | 'history' | 'pending_payments' | 'all_sales' | 'all_payments' | 'client_detail';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [paymentSuggestion, setPaymentSuggestion] = useState<Sale | null>(null);
  
  // State for pre-filling forms
  const [prefilledClientId, setPrefilledClientId] = useState<string | null>(null);

  const showToast = (message: string) => {
      setToastMessage(message);
  };
  
  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setActiveView('add_sale');
  };

  const handleViewClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setActiveView('client_detail');
  };

  const handleSaleSuccess = (sale: Sale, isEditing: boolean) => {
      showToast(isEditing ? 'Venda atualizada com sucesso!' : 'Venda cadastrada com sucesso!');
      setEditingSale(null);
      if (!isEditing) {
          setPaymentSuggestion(sale);
      } else {
          setActiveView('dashboard');
      }
  };
  
  const handleNavigate = (view: View, clientId?: string) => {
      setPrefilledClientId(clientId || null);
      setActiveView(view);
  };
  
  const handleClosePaymentSuggestion = () => {
      setPaymentSuggestion(null);
      setActiveView('dashboard');
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardNav setActiveView={setActiveView} />;
      case 'clients': return <ManageClients setActiveView={setActiveView} onViewClient={handleViewClient} showToast={showToast} />;
      case 'client_detail': return <ClientDetail clientId={selectedClientId!} onNavigate={handleNavigate} />;
      case 'add_client': return (
        <Card>
            <h1 className="text-2xl font-bold text-rose-800 mb-6">Adicionar Nova Cliente 📝</h1>
            <ClientForm onDone={() => {
                setActiveView('dashboard');
                showToast('Cliente cadastrada com sucesso!');
            }} />
        </Card>
      );
      case 'add_sale': return <SaleForm editingSale={editingSale} onSaleSuccess={handleSaleSuccess} prefilledClientId={prefilledClientId} />;
      case 'stock': return <StockManager />;
      case 'add_payment': return <PaymentForm onPaymentSuccess={() => {
          setActiveView('dashboard');
          showToast('Pagamento registrado com sucesso!');
      }} prefilledClientId={prefilledClientId} />;
      case 'reports': return <Reports />;
      case 'history': return <History />;
      case 'pending_payments': return <PendingPayments />;
      case 'all_sales': return <AllSales onEditSale={handleEditSale} showToast={showToast} />;
      case 'all_payments': return <AllPayments />;
      default: return <DashboardNav setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 text-gray-800">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {paymentSuggestion && <PaymentSuggestionModal sale={paymentSuggestion} onClose={handleClosePaymentSuggestion} showToast={showToast}/>}

      <header className="bg-white/70 backdrop-blur-lg p-4 shadow-md flex items-center justify-center sticky top-0 z-10">
         <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-rose-500 text-transparent bg-clip-text whitespace-nowrap">Sistema de vendas Ivone 💖✨</h1>
      </header>
      
      <HeaderSummary setActiveView={setActiveView} />
      
       {activeView !== 'dashboard' && (
        <div className="px-4 md:px-10 pt-6">
            <Button variant="secondary" onClick={() => {
                setActiveView('dashboard');
                setEditingSale(null);
                setSelectedClientId(null);
                setPrefilledClientId(null);
            }}>
                <ArrowLeftIcon className="w-5 h-5 mr-2 inline-block"/>
                Voltar
            </Button>
        </div>
      )}

      <main className="p-4 md:p-10">
        {renderView()}
      </main>
    </div>
  );
};

// --- PAYMENT SUGGESTION MODAL ---
const PaymentSuggestionModal: FC<{sale: Sale; onClose: () => void; showToast: (message: string) => void}> = ({ sale, onClose, showToast }) => {
    const { addPayment } = useData();
    const [partialAmount, setPartialAmount] = useState('');
    const [showPartialInput, setShowPartialInput] = useState(false);

    const handleRegisterPayment = (amount: number) => {
        addPayment({
            clientId: sale.clientId,
            paymentDate: new Date().toISOString().split('T')[0],
            amount: amount,
            observation: `Referente à venda #${sale.id.substring(0,6)}`,
        });
        showToast(`Pagamento de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrado!`);
        onClose();
    };

    const handlePartialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(partialAmount);
        if (amount > 0) {
            handleRegisterPayment(amount);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Registrar Pagamento?">
            <div className="text-center">
                <p className="text-lg mb-6">A venda de <span className="font-bold">{sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> foi registrada. O pagamento já foi recebido?</p>
                {!showPartialInput ? (
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => handleRegisterPayment(sale.total)}>Sim, valor total</Button>
                        <Button variant="secondary" onClick={() => setShowPartialInput(true)}>Sim, valor parcial</Button>
                        <Button variant="secondary" onClick={onClose}>Não, registrar depois</Button>
                    </div>
                ) : (
                    <form onSubmit={handlePartialSubmit} className="space-y-4">
                        <Input 
                            label="Valor Parcial Recebido (R$)" 
                            id="partialAmount" 
                            type="number" 
                            step="0.01" 
                            value={partialAmount} 
                            onChange={(e) => setPartialAmount(e.target.value)} 
                            autoFocus
                        />
                        <div className="flex justify-center gap-4">
                            <Button type="submit">Registrar Parcial</Button>
                            <Button variant="secondary" onClick={() => setShowPartialInput(false)}>Cancelar</Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
};


// --- HEADER SUMMARY ---
const HeaderSummary: FC<{ setActiveView: (view: View) => void }> = ({ setActiveView }) => {
    const { clients, sales, payments } = useData();
    
    const totalSalesValue = useMemo(() => sales.reduce((sum, s) => sum + s.total, 0), [sales]);
    const totalReceived = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
    const totalPending = totalSalesValue - totalReceived;

    const summaryItems = [
        { title: 'Clientes', value: clients.length, icon: UsersIcon, view: 'clients' },
        { title: 'Vendas', value: totalSalesValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: TrendingUpIcon, view: 'all_sales' },
        { title: 'Recebimentos', value: totalReceived.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: WalletIcon, view: 'all_payments' },
        { title: 'Pendente', value: totalPending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: ClockIcon, view: 'pending_payments' },
    ];

    return (
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-2 md:p-4 shadow-lg">
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 max-w-7xl mx-auto">
                 {summaryItems.map(item => (
                    <div key={item.title} onClick={() => setActiveView(item.view as View)} className="p-2 flex items-center bg-white/20 backdrop-blur-sm rounded-xl shadow-md cursor-pointer hover:bg-white/30 transform hover:scale-105 transition-all duration-300">
                        <div className="p-2 rounded-full mr-3 text-pink-500 bg-white/90 shadow-inner">
                            <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-rose-100 font-medium">{item.title}</p>
                            <p className="text-base md:text-xl font-bold text-white">{item.value}</p>
                        </div>
                    </div>
                 ))}
             </div>
        </div>
    );
};

// --- DASHBOARD NAV ---
const DashboardNav: FC<{ setActiveView: (view: View) => void; }> = ({ setActiveView }) => {
    const navItems = [
        { id: 'add_client', icon: UserPlusIcon, title: 'Cadastrar Cliente', description: 'Adicionar novos clientes' },
        { id: 'stock', icon: ArchiveIcon, title: 'Estoque', description: 'Gerenciar produtos' },
        { id: 'add_sale', icon: ShoppingCartIcon, title: 'Nova Venda', description: 'Registrar uma venda' },
        { id: 'add_payment', icon: CreditCardIcon, title: 'Receber Pagamento', description: 'Registrar pagamentos' },
        { id: 'clients', icon: AddressBookIcon, title: 'Gerenciar Clientes', description: 'Visualizar e editar' },
        { id: 'reports', icon: BarChartIcon, title: 'Relatórios', description: 'Análises e estatísticas' },
        { id: 'history', icon: HistoryIcon, title: 'Histórico', description: 'Todas as transações' },
    ];
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {navItems.map(item => (
                <Card 
                    key={item.id} 
                    onClick={() => setActiveView(item.id as View)} 
                    className="text-center flex flex-col items-center justify-center space-y-2 !p-4 sm:!p-6"
                >
                     <div className="p-3 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full mb-2">
                        <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500" />
                     </div>
                     <h2 className="text-sm sm:text-base font-bold text-gray-700">{item.title}</h2>
                     <p className="text-xs sm:text-sm text-gray-500">{item.description}</p>
                </Card>
            ))}
        </div>
    );
};

// --- ALL SALES ---
const AllSales: FC<{ onEditSale: (sale: Sale) => void; showToast: (msg: string) => void; }> = ({ onEditSale, showToast }) => {
    const { sales, getClientById, deleteSale } = useData();
    
    const handleDelete = (saleId: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta venda? O estoque será ajustado.')) {
            deleteSale(saleId);
            showToast('Venda excluída com sucesso!');
        }
    };

    const sortedSales = useMemo(() => 
        [...sales].sort((a,b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()),
    [sales]);

    return (
        <Card>
            <h1 className="text-2xl font-bold text-rose-800 mb-6">Todas as Vendas 🛒</h1>
            <div className="space-y-4">
                {sortedSales.length > 0 ? sortedSales.map(sale => {
                     const client = getClientById(sale.clientId);
                     return (
                        <div key={sale.id} className="p-4 bg-rose-50 border border-rose-100 rounded-lg flex justify-between items-center">
                            <div className="flex-grow">
                                <p className="font-bold text-gray-700">Venda para {client?.fullName || 'Cliente não encontrado'}</p>
                                <p className="text-sm text-gray-600">{sale.quantity}x {sale.productName}</p>
                                <p className="text-xs text-gray-500">{new Date(sale.saleDate).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="flex flex-col items-end justify-center ml-4">
                                <p className="font-bold text-rose-600 whitespace-nowrap">-{sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                <div className="flex gap-3 mt-2">
                                    <button onClick={() => onEditSale(sale)} className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors" aria-label="Editar venda"><EditIcon/></button>
                                    <button onClick={() => handleDelete(sale.id)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors" aria-label="Excluir venda"><TrashIcon/></button>
                                </div>
                            </div>
                        </div>
                     )
                }) : <EmptyState icon={ShoppingCartIcon} title="Nenhuma venda registrada" message="Quando você registrar uma nova venda, ela aparecerá aqui."/>}
            </div>
        </Card>
    );
}

// --- ALL PAYMENTS ---
const AllPayments: FC = () => {
    const { payments, getClientById } = useData();
    const sortedPayments = useMemo(() =>
        [...payments].sort((a,b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()),
    [payments]);
    
    return (
        <Card>
            <h1 className="text-2xl font-bold text-rose-800 mb-6">Todos os Recebimentos 💰</h1>
            <div className="space-y-4">
                 {sortedPayments.length > 0 ? sortedPayments.map(payment => {
                    const client = getClientById(payment.clientId);
                    return (
                        <div key={payment.id} className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex justify-between items-start">
                            <div>
                                <p className="font-bold text-gray-700">Pagamento de {client?.fullName || 'Cliente não encontrado'}</p>
                                <p className="text-xs text-gray-500">{new Date(payment.paymentDate).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <p className="font-bold text-emerald-600">+{payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    )
                }) : <EmptyState icon={WalletIcon} title="Nenhum pagamento recebido" message="Todos os pagamentos registrados pelos clientes aparecerão aqui."/>}
            </div>
        </Card>
    );
}

// --- PENDING PAYMENTS ---
const PendingPayments: FC = () => {
    const { clients, clientBalances } = useData();
    const pendingClients = useMemo(() => {
        return clients.map(c => ({
            ...c,
            balance: clientBalances.get(c.id) || 0
        })).filter(c => c.balance > 0).sort((a,b) => b.balance - a.balance);
    }, [clients, clientBalances]);

    return (
        <Card>
            <h1 className="text-2xl font-bold text-rose-800 mb-6">Clientes com Pagamentos Pendentes ⏰</h1>
             {pendingClients.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-pink-100/70 text-pink-800 font-semibold uppercase text-sm">
                                <th className="p-3 rounded-l-lg">Cliente</th>
                                <th className="p-3">Telefone</th>
                                <th className="p-3 text-right rounded-r-lg">Valor Pendente</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingClients.map(client => (
                                <tr key={client.id} className="border-b border-pink-100/50 hover:bg-pink-50/50">
                                    <td className="p-3 font-medium">{client.fullName}</td>
                                    <td className="p-3">{client.phone}</td>
                                    <td className="p-3 text-right font-bold text-rose-600">{client.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                 <EmptyState icon={SparklesIcon} title="Tudo em dia!" message="Nenhum cliente com pagamentos pendentes no momento. 🎉"/>
            )}
        </Card>
    )
}

// --- CLIENT FORM ---
const ClientForm: FC<{ client?: Client | null; onDone: () => void }> = ({ client, onDone }) => {
    const { addClient, updateClient } = useData();
    const [formData, setFormData] = useState({
        fullName: client?.fullName || '',
        address: client?.address || '',
        phone: client?.phone || '',
        email: client?.email || '',
        cpf: client?.cpf || '',
        observation: client?.observation || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(client){
            updateClient({ ...client, ...formData });
        } else {
            addClient(formData);
        }
        onDone();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nome Completo" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
            <Input label="Endereço Completo" id="address" name="address" value={formData.address} onChange={handleChange} />
            <Input label="Telefone" id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
            <Input label="E-mail" id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            <Input label="CPF" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} />
            <TextArea label="Observação" id="observation" name="observation" value={formData.observation} onChange={handleChange} />
            <div className="flex justify-end pt-4">
                <Button type="submit">{client ? 'Atualizar Cliente' : 'Cadastrar Cliente'}</Button>
            </div>
        </form>
    );
};

// --- MANAGE CLIENTS ---
const ManageClients: FC<{ setActiveView: (view: View) => void; onViewClient: (clientId: string) => void; showToast: (msg: string) => void; }> = ({ setActiveView, onViewClient, showToast }) => {
    const { clients, deleteClient } = useData();
    const [filter, setFilter] = useState('');
   
    const filteredClients = useMemo(() => {
        if (!filter) return clients;
        const lowercasedFilter = filter.toLowerCase();
        return clients.filter(c =>
            c.fullName.toLowerCase().includes(lowercasedFilter) ||
            c.phone.toLowerCase().includes(lowercasedFilter) ||
            c.email.toLowerCase().includes(lowercasedFilter) ||
            c.address.toLowerCase().includes(lowercasedFilter)
        );
    }, [clients, filter]);

    const handleAdd = () => {
        setActiveView('add_client');
    };

    const handleDelete = (e: React.MouseEvent, clientId: string) => {
        e.stopPropagation(); // Prevent row click when deleting
        if (window.confirm('Tem certeza que deseja excluir este cliente? Todas as vendas e pagamentos associados permanecerão no histórico, mas não será possível associar novas transações a ele.')) {
            deleteClient(clientId);
            showToast('Cliente excluído com sucesso!');
        }
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-2xl font-bold text-rose-800">Gerenciar Clientes 📋</h1>
                <Button onClick={handleAdd}>Adicionar Cliente</Button>
            </div>
            <Input
                label="Buscar por nome, telefone, e-mail ou endereço"
                id="search-client"
                placeholder="Digite para buscar..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="mb-6"
            />
             {filteredClients.length > 0 ? (
                <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-pink-100/70 text-pink-800 font-semibold uppercase text-sm">
                            <tr>
                                <th className="p-3 rounded-l-lg">Nome</th>
                                <th className="p-3 hidden md:table-cell">Telefone</th>
                                <th className="p-3 hidden lg:table-cell">E-mail</th>
                                <th className="p-3 rounded-r-lg text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map(client => (
                                <tr key={client.id} onClick={() => onViewClient(client.id)} className="border-b border-pink-100/50 hover:bg-pink-50/50 cursor-pointer">
                                    <td className="p-3 font-medium">{client.fullName}</td>
                                    <td className="p-3 hidden md:table-cell">{client.phone}</td>
                                    <td className="p-3 hidden lg:table-cell">{client.email}</td>
                                    <td className="p-3">
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={(e) => handleDelete(e, client.id)} className="text-red-600 hover:text-red-800 p-1"><TrashIcon/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                 <EmptyState 
                    icon={UsersIcon} 
                    title={clients.length === 0 ? "Nenhum cliente cadastrado" : "Nenhum cliente encontrado"} 
                    message={clients.length === 0 ? "Vamos começar? Adicione seu primeiro cliente para registrar vendas e pagamentos." : "Tente refinar sua busca ou adicione um novo cliente."} 
                    actionButton={clients.length === 0 ? <Button onClick={handleAdd}>Cadastrar Primeiro Cliente</Button> : undefined}
                />
            )}
        </Card>
    );
};

// --- STOCK MANAGER ---
const StockManager: FC = () => {
    const { stockItems, addStockItem, updateStockItemQuantity, deleteStockItem } = useData();
    const [newItem, setNewItem] = useState({ name: '', size: '', code: '', quantity: '0' });
    const [editingQuantities, setEditingQuantities] = useState<Record<string, string>>({});

    const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewItem(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || !newItem.code) {
            alert('Nome do produto e código são obrigatórios.');
            return;
        }
        addStockItem({ ...newItem, quantity: parseInt(newItem.quantity, 10) || 0 });
        setNewItem({ name: '', size: '', code: '', quantity: '0' });
    };

    const handleQuantityChange = (itemId: string, value: string) => {
        setEditingQuantities(prev => ({...prev, [itemId]: value}));
    };

    const handleUpdateQuantity = (itemId: string) => {
        const newQuantity = parseInt(editingQuantities[itemId], 10);
        if (!isNaN(newQuantity)) {
            updateStockItemQuantity(itemId, newQuantity);
        }
    };
    
    useEffect(() => {
        const initialQuantities = stockItems.reduce((acc, item) => {
            acc[item.id] = String(item.quantity);
            return acc;
        }, {} as Record<string, string>);
        setEditingQuantities(initialQuantities);
    }, [stockItems]);

    return (
        <div className="space-y-8">
            <Card>
                <h2 className="text-xl font-bold text-rose-800 mb-4">Adicionar Item ao Estoque 📦</h2>
                <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <Input label="Nome do Produto" name="name" value={newItem.name} onChange={handleNewItemChange} required />
                    <Input label="Tamanho" name="size" value={newItem.size} onChange={handleNewItemChange} />
                    <Input label="Código" name="code" value={newItem.code} onChange={handleNewItemChange} required />
                    <Input label="Quantidade" name="quantity" type="number" min="0" value={newItem.quantity} onChange={handleNewItemChange} />
                    <Button type="submit" className="md:col-start-5">Adicionar</Button>
                </form>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-rose-800 mb-4">Estoque Atual 🌸</h2>
                {stockItems.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                             <thead className="bg-pink-100/70 text-pink-800 font-semibold uppercase text-sm">
                                <tr>
                                    <th className="p-3 rounded-l-lg">Produto</th>
                                    <th className="p-3 hidden sm:table-cell">Tamanho</th>
                                    <th className="p-3">Código</th>
                                    <th className="p-3">Quantidade</th>
                                    <th className="p-3 rounded-r-lg">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockItems.map(item => (
                                    <tr key={item.id} className="border-b border-pink-100/50 hover:bg-pink-50/50">
                                        <td className="p-3 font-medium">{item.name}</td>
                                        <td className="p-3 hidden sm:table-cell">{item.size}</td>
                                        <td className="p-3">{item.code}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number" 
                                                    value={editingQuantities[item.id] ?? item.quantity}
                                                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                    onBlur={() => handleUpdateQuantity(item.id)}
                                                    className="w-20 px-2 py-1 border rounded-md focus:ring-pink-400 focus:border-pink-400"
                                                />
                                            </div>
                                        </td>
                                        <td className="p-3">
                                           <button onClick={() => deleteStockItem(item.id)} className="text-red-600 hover:text-red-800"><TrashIcon/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 ) : (
                    <EmptyState icon={ArchiveIcon} title="Estoque vazio" message="Adicione seu primeiro produto para começar a controlar o estoque." />
                 )}
            </Card>
        </div>
    );
};

// --- SALE FORM ---
const SaleForm: FC<{ editingSale?: Sale | null; onSaleSuccess: (sale: Sale, isEditing: boolean) => void; prefilledClientId: string | null; }> = ({ editingSale, onSaleSuccess, prefilledClientId }) => {
    const { clients, stockItems, addSale, updateSale } = useData();
    const isEditing = !!editingSale;

    const initialFormState = {
        clientId: prefilledClientId || '',
        saleDate: new Date().toISOString().split('T')[0],
        productCode: '',
        productName: '',
        stockItemId: null as string | null,
        quantity: '1',
        unitPrice: '0',
        observation: '',
    };
    
    const [saleData, setSaleData] = useState(initialFormState);

    useEffect(() => {
        if (editingSale) {
            setSaleData({
                clientId: editingSale.clientId,
                saleDate: editingSale.saleDate,
                productCode: editingSale.productCode,
                productName: editingSale.productName,
                stockItemId: editingSale.stockItemId,
                quantity: String(editingSale.quantity),
                unitPrice: String(editingSale.unitPrice),
                observation: editingSale.observation,
            });
        } else {
             setSaleData(initialFormState);
        }
    }, [editingSale, prefilledClientId]);


    useEffect(() => {
        if (saleData.productCode) {
            const item = stockItems.find(i => i.code.toLowerCase() === saleData.productCode.toLowerCase());
            if (item) {
                setSaleData(prev => ({
                    ...prev,
                    productName: item.name,
                    stockItemId: item.id
                }));
            } else {
                setSaleData(prev => ({ ...prev, stockItemId: null }));
            }
        }
    }, [saleData.productCode, stockItems]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSaleData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const quantity = parseFloat(saleData.quantity) || 0;
        const unitPrice = parseFloat(saleData.unitPrice) || 0;

        if(!saleData.clientId || !saleData.productName || quantity <= 0 || unitPrice < 0){
            alert('Preencha todos os campos obrigatórios (Cliente, Produto, Quantidade e Valor).');
            return;
        }

        const salePayload = {
            ...saleData,
            quantity: quantity,
            unitPrice: unitPrice,
        };

        if (isEditing && editingSale) {
            const updatedSale = updateSale({ ...salePayload, id: editingSale.id, total: 0 }); // total is recalculated in context
            onSaleSuccess(updatedSale, true);
        } else {
            const newSale = addSale(salePayload);
            onSaleSuccess(newSale, false);
        }
    };

    const total = useMemo(() => (parseFloat(saleData.quantity) || 0) * (parseFloat(saleData.unitPrice) || 0), [saleData.quantity, saleData.unitPrice]);

    return (
        <Card>
            <h1 className="text-2xl font-bold text-rose-800 mb-6">{isEditing ? 'Editar Venda' : 'Cadastrar Venda'} 🛍️</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Cliente" name="clientId" value={saleData.clientId} onChange={handleChange} required>
                        <option value="">Selecione um cliente</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                    </Select>
                    <Input label="Data da Venda" name="saleDate" type="date" value={saleData.saleDate} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Código do Produto (opcional)" name="productCode" placeholder="Puxa do estoque" value={saleData.productCode} onChange={handleChange} />
                    <Input label="Nome do Produto" name="productName" value={saleData.productName} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Quantidade" name="quantity" type="number" min="1" value={saleData.quantity} onChange={handleChange} required />
                    <Input label="Valor Unitário (R$)" name="unitPrice" type="number" min="0" step="0.01" value={saleData.unitPrice} onChange={handleChange} required />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total</label>
                        <p className="w-full px-3 py-2 border bg-gray-100 border-gray-300 rounded-lg font-bold text-lg text-pink-600">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </div>
                <TextArea label="Observação" name="observation" value={saleData.observation} onChange={handleChange} />
                <div className="flex justify-end pt-4">
                    <Button type="submit">{isEditing ? 'Atualizar Venda' : 'Registrar Venda'}</Button>
                </div>
            </form>
        </Card>
    );
};

// --- PAYMENT FORM ---
const PaymentForm: FC<{ onPaymentSuccess: () => void; prefilledClientId: string | null; }> = ({ onPaymentSuccess, prefilledClientId }) => {
    const { clients, addPayment } = useData();
    const [paymentData, setPaymentData] = useState({
        clientId: prefilledClientId || '',
        paymentDate: new Date().toISOString().split('T')[0],
        amount: '0',
        observation: ''
    });

    useEffect(() => {
        if(prefilledClientId) {
            setPaymentData(prev => ({ ...prev, clientId: prefilledClientId }));
        }
    }, [prefilledClientId]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!paymentData.clientId || Number(paymentData.amount) <= 0){
            alert('Selecione um cliente e informe um valor maior que zero.');
            return;
        }
        addPayment({
            ...paymentData,
            amount: Number(paymentData.amount)
        });
        
        onPaymentSuccess();
    };
    
    return (
         <Card>
            <h1 className="text-2xl font-bold text-rose-800 mb-6">Receber Pagamento 💸</h1>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
                <Select label="Cliente" name="clientId" value={paymentData.clientId} onChange={handleChange} required>
                    <option value="">Selecione um cliente</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </Select>
                 <Input label="Data do Pagamento" name="paymentDate" type="date" value={paymentData.paymentDate} onChange={handleChange} required />
                 <Input label="Valor Recebido (R$)" name="amount" type="number" min="0.01" step="0.01" value={paymentData.amount} onChange={handleChange} required />
                 <TextArea label="Observação" name="observation" value={paymentData.observation} onChange={handleChange} />
                 <div className="flex justify-end pt-4">
                    <Button type="submit">Registrar Pagamento</Button>
                </div>
            </form>
        </Card>
    );
};

// --- REPORTS ---
const Reports: FC = () => {
    const { sales, clients, getClientById } = useData();

    const topClients = useMemo(() => {
        // FIX: Correctly type the initial value for `reduce` to ensure proper type inference.
        const clientTotals = sales.reduce((acc, sale) => {
            acc[sale.clientId] = (acc[sale.clientId] || 0) + sale.total;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(clientTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([clientId, total]) => ({
                client: getClientById(clientId),
                total
            }));
    }, [sales, getClientById]);
    
    const topProducts = useMemo(() => {
        // FIX: Correctly type the initial value for `reduce` to ensure proper type inference.
        const productTotals = sales.reduce((acc, sale) => {
            if (!acc[sale.productName]) {
                 acc[sale.productName] = { quantity: 0, total: 0 };
            }
            acc[sale.productName].quantity += sale.quantity;
            acc[sale.productName].total += sale.total;
            return acc;
        }, {} as Record<string, { quantity: number; total: number }>);

        return Object.entries(productTotals)
            .sort(([, a], [, b]) => b.quantity - a.quantity)
            .slice(0, 5)
            .map(([productName, data]) => ({ productName, ...data }));
    }, [sales]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-rose-800 text-center">Relatórios 📊</h1>
            {sales.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <h2 className="text-xl font-bold text-rose-800 mb-4">Top 5 Clientes (por valor de compra) 🏆</h2>
                        <ul className="space-y-3">
                            {topClients.map(({ client, total }, index) => (
                                <li key={client?.id || index} className="flex justify-between items-center p-3 bg-rose-50 rounded-lg border border-rose-100">
                                    <span className="font-medium text-gray-700">{index + 1}. {client?.fullName || 'Cliente Removido'}</span>
                                    <span className="font-bold text-rose-600">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Card>
                        <h2 className="text-xl font-bold text-rose-800 mb-4">Top 5 Produtos (por quantidade vendida) ⭐</h2>
                         <ul className="space-y-3">
                            {topProducts.map(({ productName, quantity }, index) => (
                                <li key={productName} className="flex justify-between items-center p-3 bg-rose-50 rounded-lg border border-rose-100">
                                    <span className="font-medium text-gray-700">{index + 1}. {productName}</span>
                                    <span className="font-bold text-rose-600">{quantity} unidades</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            ) : (
                <Card>
                    <EmptyState icon={BarChartIcon} title="Dados insuficientes para relatórios" message="Realize algumas vendas para que os relatórios possam ser gerados." />
                </Card>
            )}
        </div>
    );
};

// --- HISTORY ---
const History: FC = () => {
    const { sales, payments, getClientById } = useData();

    type Transaction = (Sale & { type: 'sale' }) | (Payment & { type: 'payment' });
    
    const transactions = useMemo(() => {
        const allTransactions: Transaction[] = [
            ...sales.map(s => ({ ...s, type: 'sale' as const })),
            ...payments.map(p => ({ ...p, type: 'payment' as const }))
        ];
        
        return allTransactions.sort((a, b) => {
            const dateA = new Date(a.type === 'sale' ? a.saleDate : a.paymentDate);
            const dateB = new Date(b.type === 'sale' ? b.saleDate : b.paymentDate);
            return dateB.getTime() - dateA.getTime();
        });
    }, [sales, payments]);

    return (
        <Card>
            <h1 className="text-2xl font-bold text-rose-800 mb-6">Histórico de Transações 📜</h1>
            {transactions.length > 0 ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {transactions.map(tx => {
                        const client = getClientById(tx.clientId);
                        if (tx.type === 'sale') {
                            return (
                                <div key={`sale-${tx.id}`} className="p-4 bg-rose-50 border border-rose-100 rounded-lg flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-700">Venda para {client?.fullName || 'Cliente Removido'}</p>
                                        <p className="text-sm text-gray-600">{tx.quantity}x {tx.productName}</p>
                                        <p className="text-xs text-gray-500">{new Date(tx.saleDate).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <p className="font-bold text-rose-600">-{tx.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                            )
                        } else {
                            return (
                                 <div key={`payment-${tx.id}`} className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-700">Pagamento de {client?.fullName || 'Cliente Removido'}</p>
                                        <p className="text-xs text-gray-500">{new Date(tx.paymentDate).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <p className="font-bold text-emerald-600">+{tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                            )
                        }
                    })}
                </div>
            ) : (
                <EmptyState icon={HistoryIcon} title="Nenhuma transação" message="Todas as suas vendas e pagamentos aparecerão aqui." />
            )}
        </Card>
    );
};

// --- CLIENT DETAIL ---
const ClientDetail: FC<{ clientId: string; onNavigate: (view: View, clientId?: string) => void; }> = ({ clientId, onNavigate }) => {
    const { getClientById, sales, payments, clientBalances } = useData();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const client = getClientById(clientId);
    const balance = clientBalances.get(clientId) || 0;

    type ClientTransaction = (Sale & { type: 'sale' }) | (Payment & { type: 'payment' });

    const transactions = useMemo(() => {
        const clientSales = sales.filter(s => s.clientId === clientId).map(s => ({ ...s, type: 'sale' as const }));
        const clientPayments = payments.filter(p => p.clientId === clientId).map(p => ({ ...p, type: 'payment' as const }));
        
        const all: ClientTransaction[] = [...clientSales, ...clientPayments];

        return all.sort((a, b) => {
            const dateA = new Date(a.type === 'sale' ? a.saleDate : a.paymentDate);
            const dateB = new Date(b.type === 'sale' ? b.saleDate : b.paymentDate);
            return dateB.getTime() - dateA.getTime();
        });
    }, [sales, payments, clientId]);

    if (!client) {
        return <Card><p className="text-center text-red-500">Cliente não encontrado.</p></Card>;
    }
    
    return (
        <div className="space-y-8">
            <Card>
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-rose-800">{client.fullName}</h1>
                        <p className="text-gray-600">{client.phone}</p>
                        <p className="text-gray-600">{client.address}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-500">Saldo Devedor</p>
                        <p className={`text-3xl font-extrabold ${balance > 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                </div>
                <div className="border-t border-pink-200 mt-4 pt-4 flex gap-4 flex-wrap">
                    <Button onClick={() => onNavigate('add_sale', client.id)}>Nova Venda</Button>
                    <Button onClick={() => onNavigate('add_payment', client.id)} variant="secondary">Registrar Pagamento</Button>
                    <Button onClick={() => setIsEditModalOpen(true)} variant="secondary">Editar Cliente</Button>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-rose-800 mb-4">Extrato do Cliente</h2>
                {transactions.length > 0 ? (
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                        {transactions.map(tx => (
                            tx.type === 'sale' ? (
                                <div key={`sale-${tx.id}`} className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800">{tx.productName} (x{tx.quantity})</p>
                                        <p className="text-xs text-gray-500">{new Date(tx.saleDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <p className="font-bold text-rose-600">-{tx.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                            ) : (
                                <div key={`payment-${tx.id}`} className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800">Pagamento Recebido</p>
                                        <p className="text-xs text-gray-500">{new Date(tx.paymentDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <p className="font-bold text-emerald-600">+{tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                            )
                        ))}
                    </div>
                ) : (
                    <EmptyState icon={HistoryIcon} title="Nenhuma transação" message="Este cliente ainda não possui vendas ou pagamentos registrados." />
                )}
            </Card>
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Cliente">
                <ClientForm client={client} onDone={() => setIsEditModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default App;