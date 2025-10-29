import React, { useState, useMemo, FC, useEffect, ReactNode, useRef } from 'react';
import { GoogleGenAI, Chat, Modality } from "@google/genai";
import { useData } from './contexto/DataContext';
import { Client, StockItem, Sale, Payment, User } from './types';
import { Card, Button, Input, Modal, TextArea, Select } from './components/common';
import { useAuth } from './contexto/AuthContext';

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
const ShieldIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>);
const BotMessageSquareIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/></svg>);
const MicrophoneIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>);
const SendIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>);
const LogOutIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
const HomeIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>);
const UsersCogIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><circle cx="19" cy="11" r="2"/><path d="M19 8v1"/><path d="M19 13v1"/><path d="m21.6 9.5-.87.5"/><path d="m17.27 12-.87.5"/><path d="m21.6 12.5-.87-.5"/><path d="m17.27 10-.87-.5"/></svg>);
const KeyIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>);
const DogIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 5.172C10 3.782 8.423 2.679 7.12 3.373A4 4 0 0 0 4.783 7.12C5.321 8.423 6.218 10 5.172 10H5a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3a2 2 0 0 1 2-2h1.172c1.046 0 1.577-1.33 1.046-2.124A4.002 4.002 0 0 0 10 5.172Z"/><path d="M14 12a2 2 0 0 0-2-2h-2"/><path d="M16.63 12.87a2 2 0 1 1 2.24 2.24"/><path d="M18 16c-2 0-3-1-3-2V8a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2.172c-1.046 0-1.577 1.33-1.046 2.124A4.002 4.002 0 0 1 18 16Z"/></svg>);
const CatIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5c.67 0 1.35.09 2 .26 1.78.47 2.94 2.13 2.5 3.92A4.015 4.015 0 0 1 12 10c-.67 0-1.35-.09-2-.26-1.78-.47-2.94-2.13-2.5-3.92A4.015 4.015 0 0 1 12 5Z"/><path d="M19.62 9.24c.32.44.58.93.78 1.46 1.34 3.54-1.26 7.3-4.4 7.3h-1c-1.33 0-2.5 .54-3.34 1.34-1.34 1.34-3.56 1.34-4.89 0-1.34-1.34-1.34-3.56 0-4.89 1.33-1.33 3.55-1.33 4.88 0A4.015 4.015 0 0 1 12 18c2.4 0 4.1-1.68 4.7-4 .37-1.42.3-2.82-.2-4.1-.17-.42-.38-.83-.62-1.22"/><path d="M18 10a1 1 0 1 0-2 0"/><path d="M6 10a1 1 0 1 0-2 0"/></svg>);
const MenuIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);

const CleanMagicIcon: FC<{className?: string}> = ({className}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M21 12a9 9 0 1 1-9-9" strokeLinecap="round"/>
        <path d="M12 5.5L14.5 10.5L12 15.5L9.5 10.5L12 5.5Z" fill="currentColor" stroke="none" />
        <path d="M18 4L19 6L18 8L17 6L18 4Z" fill="currentColor" stroke="none" />
        <path d="M20.5 8L21.5 10L20.5 12L19.5 10L20.5 8Z" fill="currentColor" stroke="none" />
    </svg>
);


// --- VIEWS & FORMS (defined globally to be used by both layouts) ---
type View = 'dashboard' | 'clients' | 'add_client' | 'add_sale' | 'stock' | 'add_payment' | 'reports' | 'history' | 'pending_payments' | 'sales_view' | 'all_payments' | 'client_detail' | 'manage_users';

// --- TOAST NOTIFICATION ---
const Toast: FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-24 right-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-5 rounded-2xl shadow-lg flex items-center justify-between z-50 animate-slide-in">
      <SparklesIcon className="w-5 h-5 mr-3"/>
      <p className="font-semibold">{message}</p>
      <button onClick={onClose} className="ml-4 text-xl font-semibold leading-none hover:text-pink-100">&times;</button>
    </div>
  );
};

// --- EMPTY STATE ---
const EmptyState: FC<{ icon: FC<{className?: string}>; title: string; message: string; actionButton?: ReactNode }> = ({ icon: Icon, title, message, actionButton }) => (
    <div className="text-center py-12 px-6 bg-pink-50/50 rounded-3xl border-2 border-dashed border-pink-200">
        <div className="p-4 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full inline-block mb-4">
            <Icon className="w-12 h-12 text-pink-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">{message}</p>
        {actionButton}
    </div>
);

// --- APP ROUTER ---
const App: React.FC = () => {
    const { currentUser } = useAuth();

    useEffect(() => {
        // Apply theme based on logged-in user's gender
        if (currentUser?.gender === 'male') {
            document.documentElement.classList.add('theme-male');
        } else {
            document.documentElement.classList.remove('theme-male');
        }
    }, [currentUser]);

    if (!currentUser) {
        return <LoginScreen />;
    }

    if (currentUser.role === 'admin') {
        return <AdminLayout />;
    }

    return <IvoneLayout />;
};

// --- LOGIN SCREEN ---
const LoginScreen: FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    useEffect(() => {
        const rememberedUser = localStorage.getItem('rememberedUsername');
        if (rememberedUser) {
            setUsername(rememberedUser);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            login(username, password);
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 relative overflow-hidden">
             {/* Decorative Blobs */}
            <div className="absolute w-96 h-96 bg-purple-300 rounded-full -top-20 -left-20 opacity-30 mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute w-96 h-96 bg-rose-300 rounded-full -bottom-24 right-10 opacity-30 mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute w-72 h-72 bg-pink-300 rounded-full -bottom-10 -left-10 opacity-30 mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>

            <DogIcon className="absolute -left-5 bottom-0 text-gray-300/50 opacity-50"/>
            <CatIcon className="absolute -right-5 top-0 text-gray-300/50 opacity-50"/>

            <main className="z-10 w-full max-w-md mx-auto p-6">
                <Card className="!p-8">
                     <h1 className="text-3xl font-extrabold text-center tracking-tight bg-gradient-to-r from-pink-500 to-rose-500 text-transparent bg-clip-text mb-2">
                        Sistema de Vendas
                    </h1>
                    <p className="text-center text-gray-500 mb-8">Acesse sua conta para continuar.</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input 
                            label="Usuário" 
                            id="username" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)}
                            autoComplete="username"
                            required 
                        />
                        <Input 
                            label="Senha" 
                            id="password" 
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required 
                        />
                         <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Lembrar usuário
                                </label>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
                        <Button type="submit" className="w-full !py-3 !text-base !mt-6">Entrar</Button>
                    </form>
                </Card>
            </main>
        </div>
    );
};


// --- IVONE (STANDARD) LAYOUT ---
const IvoneLayout: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [paymentSuggestion, setPaymentSuggestion] = useState<Sale | null>(null);
  
  const [prefilledClientId, setPrefilledClientId] = useState<string | null>(null);
  const { logout, currentUser } = useAuth();

  const isMaleTheme = currentUser?.gender === 'male';

  const showToast = (message: string) => {
      setToastMessage(message);
  };
  
  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setActiveView('add_sale');
  };
  
  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setActiveView('add_payment');
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
  
  const handlePaymentSuccess = (isEditing: boolean) => {
      showToast(isEditing ? 'Pagamento atualizado com sucesso!' : 'Pagamento registrado com sucesso!');
      setEditingPayment(null);
      setActiveView('dashboard');
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
      case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
      case 'clients': return <ManageClients setActiveView={setActiveView} onViewClient={handleViewClient} showToast={showToast} />;
      case 'client_detail': return <ClientDetail clientId={selectedClientId!} onNavigate={handleNavigate} />;
      case 'add_client': return (
        <Card>
            <h1 className="text-2xl font-bold text-rose-800 mb-6">Adicionar Novo Cliente 📝</h1>
            <ClientForm onDone={() => {
                setActiveView('dashboard');
                showToast('Cliente cadastrado com sucesso!');
            }} />
        </Card>
      );
      case 'add_sale': return <SaleForm editingSale={editingSale} onSaleSuccess={handleSaleSuccess} prefilledClientId={prefilledClientId} />;
      case 'stock': return <StockManager />;
      case 'add_payment': return <PaymentForm editingPayment={editingPayment} onPaymentSuccess={handlePaymentSuccess} prefilledClientId={prefilledClientId} />;
      case 'reports': return <Reports />;
      case 'history': return <History />;
      case 'pending_payments': return <PendingPayments onViewClient={handleViewClient} />;
      case 'sales_view': return <SalesView onEditSale={handleEditSale} showToast={showToast} />;
      case 'all_payments': return <AllPayments onEditPayment={handleEditPayment} showToast={showToast} />;
      default: return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 text-gray-800">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {paymentSuggestion && <PaymentSuggestionModal sale={paymentSuggestion} onClose={handleClosePaymentSuggestion} showToast={showToast}/>}

      <header className="bg-white/70 backdrop-blur-lg p-4 shadow-md flex items-center justify-center relative sticky top-0 z-10">
         <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-rose-500 text-transparent bg-clip-text whitespace-nowrap">
            {isMaleTheme ? `Bem vindo ${currentUser?.username} 💪🔧` : `Bem vinda ${currentUser?.username} 💖✨`}
         </h1>
         <button onClick={logout} title="Sair" className="absolute right-4 p-2 rounded-full hover:bg-pink-100 text-pink-600 transition-colors">
            <LogOutIcon className="w-6 h-6"/>
         </button>
      </header>
      
      <HeaderSummary setActiveView={setActiveView} />
      
       {activeView !== 'dashboard' && (
        <div className="px-4 md:px-10 pt-6">
            <Button variant="secondary" onClick={() => {
                setActiveView('dashboard');
                setEditingSale(null);
                setEditingPayment(null);
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

      <AIAssistant showToast={showToast} />
    </div>
  );
};


// --- ADMIN LAYOUT ---
const AdminLayout: FC = () => {
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isBackupModalOpen, setBackupModalOpen] = useState(false);
    const [editingSale, setEditingSale] = useState<Sale | null>(null);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [prefilledClientId, setPrefilledClientId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { logout, currentUser } = useAuth();
    
    const showToast = (message: string) => {
        setToastMessage(message);
    };

    const handleEditSale = (sale: Sale) => {
        setEditingSale(sale);
        setActiveView('add_sale');
    };

    const handleEditPayment = (payment: Payment) => {
        setEditingPayment(payment);
        setActiveView('add_payment');
    };

    const handleViewClient = (clientId: string) => {
        setSelectedClientId(clientId);
        setActiveView('client_detail');
    };
    
    const handleNavigate = (view: View, clientId?: string) => {
        setPrefilledClientId(clientId || null);
        setActiveView(view);
    };

    const handleSaleSuccess = (sale: Sale, isEditing: boolean) => {
      showToast(isEditing ? 'Venda atualizada!' : 'Venda cadastrada!');
      setEditingSale(null);
      setActiveView('sales_view');
    };
    
    const handlePaymentSuccess = (isEditing: boolean) => {
        showToast(isEditing ? 'Pagamento atualizado!' : 'Pagamento registrado!');
        setEditingPayment(null);
        setActiveView('all_payments');
    };

    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <AdminDashboard />;
            case 'clients': return <ManageClients setActiveView={setActiveView} onViewClient={handleViewClient} showToast={showToast} />;
            case 'client_detail': return <ClientDetail clientId={selectedClientId!} onNavigate={handleNavigate} />;
            case 'add_client': return ( <ClientForm onDone={() => { setActiveView('clients'); showToast('Cliente salvo!'); }} /> );
            case 'add_sale': return <SaleForm editingSale={editingSale} onSaleSuccess={handleSaleSuccess} prefilledClientId={prefilledClientId} />;
            case 'stock': return <StockManager />;
            case 'add_payment': return <PaymentForm editingPayment={editingPayment} onPaymentSuccess={handlePaymentSuccess} prefilledClientId={prefilledClientId} />;
            case 'reports': return <Reports />;
            case 'history': return <History />;
            case 'pending_payments': return <PendingPayments onViewClient={handleViewClient} />;
            case 'sales_view': return <SalesView onEditSale={handleEditSale} showToast={showToast} />;
            case 'all_payments': return <AllPayments onEditPayment={handleEditPayment} showToast={showToast} />;
            case 'manage_users': return <ManageUsers showToast={showToast} />;
            default: return <AdminDashboard />;
        }
    };

    const navItems = [
        { id: 'dashboard', icon: HomeIcon, title: 'Dashboard' },
        { id: 'sales_view', icon: ShoppingCartIcon, title: 'Vendas' },
        { id: 'all_payments', icon: CreditCardIcon, title: 'Recebimentos' },
        { id: 'clients', icon: UsersIcon, title: 'Clientes' },
        { id: 'stock', icon: ArchiveIcon, title: 'Estoque' },
        { id: 'reports', icon: BarChartIcon, title: 'Relatórios' },
        { id: 'manage_users', icon: UsersCogIcon, title: 'Usuários' },
        { id: 'backup_restore', icon: ShieldIcon, title: 'Backup/Restore' },
    ];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800">
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
            <BackupRestoreModal isOpen={isBackupModalOpen} onClose={() => setBackupModalOpen(false)} showToast={showToast}/>
            
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-800 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 text-center border-b border-slate-700">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
                        <button 
                            key={item.id} 
                            onClick={() => {
                                if (item.id === 'backup_restore') {
                                    setBackupModalOpen(true);
                                } else {
                                    setActiveView(item.id as View);
                                }
                                setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${activeView === item.id ? 'bg-slate-700 text-white' : 'hover:bg-slate-700/50'}`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.title}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left hover:bg-slate-700/50">
                        <LogOutIcon className="w-5 h-5"/>
                        <span>Sair ({currentUser?.username})</span>
                    </button>
                </div>
            </aside>
            
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}


            {/* Main Content */}
            <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
                <header className="bg-white p-4 shadow-sm z-10 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-600 p-1">
                        <MenuIcon className="w-6 h-6"/>
                    </button>
                    <h2 className="text-xl font-bold text-slate-700">
                        {navItems.find(i => i.id === activeView)?.title || 'Dashboard'}
                    </h2>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
        </div>
    );
}

// --- ADMIN DASHBOARD ---
const AdminDashboard: FC = () => {
    const { users } = useAuth();

    const userStats = useMemo(() => ({
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        standard: users.filter(u => u.role === 'user').length,
    }), [users]);
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="!bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-100 rounded-full">
                            <UsersIcon className="w-6 h-6 text-slate-600"/>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total de Usuários</p>
                            <p className="text-3xl font-bold text-slate-800">{userStats.total}</p>
                        </div>
                    </div>
                </Card>
                 <Card className="!bg-white">
                    <div className="flex items-center gap-4">
                         <div className="p-3 bg-slate-100 rounded-full">
                            <ShieldIcon className="w-6 h-6 text-slate-600"/>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Administradores</p>
                            <p className="text-3xl font-bold text-slate-800">{userStats.admins}</p>
                        </div>
                    </div>
                </Card>
                 <Card className="!bg-white">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-100 rounded-full">
                            <UsersCogIcon className="w-6 h-6 text-slate-600"/>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Usuários Padrão</p>
                            <p className="text-3xl font-bold text-slate-800">{userStats.standard}</p>
                        </div>
                    </div>
                </Card>
            </div>
            
            <Card className="!bg-white">
                <h3 className="font-bold text-lg mb-4 text-slate-700">Visão Geral dos Usuários</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 uppercase text-xs font-semibold text-slate-600">
                                <th className="p-3">Nome de Usuário</th>
                                <th className="p-3">Permissão</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="p-3 font-medium text-slate-800">{user.username}</td>
                                    <td className="p-3 text-slate-600">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.role === 'admin' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-green-100 text-green-800'
                                        }`}>
                                            {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

// --- MANAGE USERS (ADMIN ONLY) ---
const ManageUsers: FC<{showToast: (msg: string) => void;}> = ({ showToast }) => {
    const { users, addUser, updatePassword, deleteUser } = useAuth();
    const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setEditUserModalOpen] = useState<User | null>(null);
    const [newUser, setNewUser] = useState({ username: '', password: '', gender: 'female' as 'male' | 'female' });
    const [newPassword, setNewPassword] = useState('');

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            addUser(newUser.username, newUser.password, newUser.gender);
            showToast(`Usuário ${newUser.username} criado!`);
            setNewUser({ username: '', password: '', gender: 'female' });
            setAddUserModalOpen(false);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditUserModalOpen && newPassword) {
            try {
                updatePassword(isEditUserModalOpen.id, newPassword);
                showToast(`Senha de ${isEditUserModalOpen.username} atualizada!`);
                setNewPassword('');
                setEditUserModalOpen(null);
            } catch (error: any) {
                alert(error.message);
            }
        }
    };

    const handleDeleteUser = (user: User) => {
        if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.username}? Esta ação não pode ser desfeita.`)) {
            try {
                deleteUser(user.id);
                showToast(`Usuário ${user.username} excluído!`);
            } catch (error: any) {
                alert(error.message);
            }
        }
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
                <Button onClick={() => setAddUserModalOpen(true)}>Criar Usuário</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-100 uppercase text-sm font-semibold">
                            <th className="p-3">Usuário</th>
                            <th className="p-3">Permissão</th>
                            <th className="p-3">Gênero</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b">
                                <td className="p-3 font-medium">{user.username}</td>
                                <td className="p-3 capitalize">{user.role}</td>
                                <td className="p-3 capitalize">{user.gender === 'male' ? 'Masculino' : 'Feminino'}</td>
                                <td className="p-3 text-right">
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => setEditUserModalOpen(user)} className="text-blue-600 hover:text-blue-800" title="Mudar Senha"><KeyIcon /></button>
                                        {user.role !== 'admin' && <button onClick={() => handleDeleteUser(user)} className="text-red-600 hover:text-red-800" title="Excluir"><TrashIcon /></button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            <Modal isOpen={isAddUserModalOpen} onClose={() => setAddUserModalOpen(false)} title="Criar Novo Usuário">
                <form onSubmit={handleAddUser} className="space-y-4">
                    <Input label="Nome de usuário" id="newUsername" value={newUser.username} onChange={e => setNewUser(p => ({...p, username: e.target.value}))} />
                    <Input label="Senha" id="newPassword" type="password" value={newUser.password} onChange={e => setNewUser(p => ({...p, password: e.target.value}))} />
                    <Select label="Gênero" id="newGender" value={newUser.gender} onChange={e => setNewUser(p => ({...p, gender: e.target.value as 'male' | 'female'}))}>
                        <option value="female">Feminino</option>
                        <option value="male">Masculino</option>
                    </Select>
                    <Button type="submit">Criar</Button>
                </form>
            </Modal>
            
            {/* Edit User Modal */}
            <Modal isOpen={!!isEditUserModalOpen} onClose={() => setEditUserModalOpen(null)} title={`Mudar senha de ${isEditUserModalOpen?.username}`}>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <Input label="Nova Senha" id="editPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoFocus/>
                    <Button type="submit">Atualizar Senha</Button>
                </form>
            </Modal>
        </Card>
    );
};

// --- AUDIO HELPERS ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


// --- AI ASSISTANT ---
const AIAssistant: FC<{ showToast: (message: string) => void }> = ({ showToast }) => {
    const { addClient, addSale, addPayment, clients } = useData();
    const { currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string | ReactNode }[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
    const [isDragging, setIsDragging] = useState(false);
    const wasDraggedRef = useRef(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const orbRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<Chat | null>(null);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const lastPlayedMessageRef = useRef<ReactNode | null>(null);
    const [initialGreetingAudio, setInitialGreetingAudio] = useState<AudioBuffer | null>(null);

    const isMaleTheme = currentUser?.gender === 'male';

    useEffect(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
    }, []);

    const textToSpeechAndPlay = async (text: string) => {
        if (!process.env.API_KEY || !audioCtxRef.current || !text) return;
        
        setIsLoading(true);
        try {
            if (audioCtxRef.current.state === 'suspended') {
                await audioCtxRef.current.resume();
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                          prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioCtxRef.current) {
                const audioData = decode(base64Audio);
                const audioBuffer = await decodeAudioData(audioData, audioCtxRef.current, 24000, 1);
                const source = audioCtxRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtxRef.current.destination);
                source.start();
            }
        } catch (error) {
            console.error("TTS Error:", error);
            showToast("Desculpe, tive um problema com minha voz.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const preloadGreetingAudio = async (text: string) => {
        if (!process.env.API_KEY || !audioCtxRef.current || !text) return;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                          prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioCtxRef.current) {
                const audioData = decode(base64Audio);
                const audioBuffer = await decodeAudioData(audioData, audioCtxRef.current, 24000, 1);
                setInitialGreetingAudio(audioBuffer);
            }
        } catch (error) {
            console.error("TTS Preload Error:", error);
            // Fail silently, the audio will be generated on-demand if preload fails.
        }
    };
    
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

        const lastMessage = messages[messages.length - 1];
        if (
            lastMessage?.sender === 'ai' &&
            typeof lastMessage.text === 'string' &&
            lastMessage.text !== lastPlayedMessageRef.current
        ) {
            lastPlayedMessageRef.current = lastMessage.text;
            textToSpeechAndPlay(lastMessage.text);
        }
    }, [messages, isOpen]);

    useEffect(() => {
        if (!process.env.API_KEY) {
            console.error("API_KEY not found.");
            return;
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const clientNames = clients.map(c => c.fullName).join(', ') || 'Nenhum';
        
        const assistantName = isMaleTheme ? 'Rob' : 'Rebeca';
        const emojis = isMaleTheme ? '🤖🔧🚀' : '💖✨🎉';
        const userGreetingName = currentUser?.username || 'pessoa incrível';
        const systemInstruction = `Você é '${assistantName}', um assistente virtual SUPER extrovertido, divertido e simpático para o app 'Sistema de Vendas'. Seu objetivo é ajudar o usuário, ${userGreetingName}, a cadastrar clientes, vendas e pagamentos de uma forma leve e descontraída. Clientes existentes: ${clientNames}. Ações disponíveis: 1. 'add_client': Campos obrigatórios: fullName, address, phone, cpf. Campos opcionais: email, observation. 2. 'add_sale': Campos obrigatórios: clientName (deve ser um dos clientes existentes da lista), productName, quantity, unitPrice. Campos opcionais: observation. 3. 'add_payment': Campos obrigatórios: clientName (deve ser um dos clientes existentes da lista), amount. Campos opcionais: observation. COMO PROCEDER: Use uma linguagem bem humorada, muitos emojis ${emojis} e seja super proativo! Peça UMA informação de cada vez, como se estivesse batendo um papo. Quando tiver TODOS os campos obrigatórios para uma ação, responda APENAS com um JSON no seguinte formato: {"action": "action_name", "data": { ...dados... }}. NÃO adicione nenhum texto antes ou depois do JSON, seja direto ao ponto nessa hora! Se o usuário pedir para cancelar, diga algo como "Sem problemas! Missão abortada. 🚀 O que vamos fazer agora?". Se o usuário conversar sobre qualquer outra coisa, entre na brincadeira e responda de forma divertida antes de voltar ao foco. Ao cumprimentar, sempre use o nome do usuário (${userGreetingName}) e se apresente com entusiasmo!`;

        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
        });

        const initialMessage = isMaleTheme
            ? `E aí, ${currentUser?.username}! 🤘 Sou o Rob, seu parceiro robótico pra deixar tudo em ordem por aqui. O que a gente vai aprontar hoje? Cadastrar um cliente novo, registrar uma venda bombástica ou receber uma grana? Manda a braba! 🚀`
            : `Oii, ${currentUser?.username}! 💖 Aqui é a Rebeca, sua assistente pessoal, pronta para deixar tudo organizado! Vamos começar? Me conta, vamos cadastrar uma cliente super especial, lançar uma venda incrível ou registrar um pagamento? Tô prontíssima! ✨`;

        setMessages([{ sender: 'ai', text: initialMessage }]);
        preloadGreetingAudio(initialMessage);
    }, [clients, isMaleTheme, currentUser]);

     useEffect(() => {
        // FIX: Cast window to `any` to access non-standard SpeechRecognition APIs
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'pt-BR';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setUserInput(transcript);
                sendMessageToAI(transcript);
            };
            recognitionRef.current = recognition;
        }
    }, []);

    const handleAction = (action: string, data: any) => {
        let successMessage = '';
        try {
            switch (action) {
                case 'add_client':
                    addClient(data);
                    successMessage = `Cliente ${data.fullName} cadastrado com sucesso! ✅`;
                    break;
                case 'add_sale': {
                    const client = clients.find(c => c.fullName.toLowerCase() === data.clientName.toLowerCase());
                    if (!client) throw new Error(`Cliente ${data.clientName} não encontrada.`);
                    addSale({
                        clientId: client.id,
                        saleDate: new Date().toISOString().split('T')[0],
                        productCode: '',
                        productName: data.productName,
                        stockItemId: null,
                        quantity: parseFloat(data.quantity),
                        unitPrice: parseFloat(data.unitPrice),
                        observation: data.observation || '',
                    });
                    successMessage = `Venda para ${client.fullName} registrada com sucesso! 🛒`;
                    break;
                }
                case 'add_payment': {
                    const client = clients.find(c => c.fullName.toLowerCase() === data.clientName.toLowerCase());
                    if (!client) throw new Error(`Cliente ${data.clientName} não encontrada.`);
                    addPayment({
                        clientId: client.id,
                        paymentDate: new Date().toISOString().split('T')[0],
                        amount: parseFloat(data.amount),
                        observation: data.observation || '',
                    });
                     successMessage = `Pagamento de ${client.fullName} registrado com sucesso! 💸`;
                    break;
                }
                default:
                    throw new Error('Ação desconhecida.');
            }
            showToast(successMessage);
            setMessages(prev => [...prev, { sender: 'ai', text: successMessage }]);

        } catch (error: any) {
            const errorMessage = `Desculpe, ocorreu um erro: ${error.message} 😥`;
            setMessages(prev => [...prev, { sender: 'ai', text: errorMessage }]);
        }
    };
    
    const sendMessageToAI = async (message: string) => {
        if (!message.trim() || !chatRef.current) return;
        
        const newMessages = [...messages, { sender: 'user' as const, text: message }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const result = await chatRef.current.sendMessage({ message });
            const responseText = result.text.trim();
            
            if (responseText.startsWith('{') && responseText.endsWith('}')) {
                try {
                    const jsonResponse = JSON.parse(responseText);
                    if (jsonResponse.action && jsonResponse.data) {
                        handleAction(jsonResponse.action, jsonResponse.data);
                    }
                } catch (e) {
                    setMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
                }
            } else {
                 setMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { sender: 'ai', text: 'Desculpe, estou com um problema para me conectar. Tente novamente. 😥' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessageToAI(userInput);
    };
    
    const handleListen = () => {
        if (!recognitionRef.current) {
            alert('Desculpe, seu navegador não suporta comandos de voz.');
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    // Drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (orbRef.current) {
            orbRef.current.style.transition = 'none';
        }
        wasDraggedRef.current = false;
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (orbRef.current) {
            orbRef.current.style.transition = 'none';
        }
        wasDraggedRef.current = false;
        setIsDragging(true);
        const touch = e.touches[0];
        dragStartPos.current = {
            x: touch.clientX - position.x,
            y: touch.clientY - position.y
        };
    };


    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        wasDraggedRef.current = true;
        const newX = Math.max(0, Math.min(window.innerWidth - 64, e.clientX - dragStartPos.current.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 64, e.clientY - dragStartPos.current.y));
        setPosition({ x: newX, y: newY });
    };
    
    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging) return;
        wasDraggedRef.current = true;
        const touch = e.touches[0];
        const newX = Math.max(0, Math.min(window.innerWidth - 64, touch.clientX - dragStartPos.current.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 64, touch.clientY - dragStartPos.current.y));
        setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        if (orbRef.current) {
            orbRef.current.style.transition = ''; // Reset to use CSS class
        }
        setIsDragging(false);
    };

    const handleTouchEnd = () => {
        if (orbRef.current) {
            orbRef.current.style.transition = '';
        }
        setIsDragging(false);
    };

    const handleOrbClick = () => {
        if (wasDraggedRef.current) return;

        const playGreeting = () => {
            const greetingMessage = messages.find(m => m.sender === 'ai');
            if (greetingMessage && typeof greetingMessage.text === 'string') {
                lastPlayedMessageRef.current = greetingMessage.text;
                if (initialGreetingAudio && audioCtxRef.current) {
                    try {
                        const source = audioCtxRef.current.createBufferSource();
                        source.buffer = initialGreetingAudio;
                        source.connect(audioCtxRef.current.destination);
                        source.start();
                    } catch (e) {
                        console.error("Error playing preloaded audio", e);
                        textToSpeechAndPlay(greetingMessage.text);
                    }
                } else {
                    textToSpeechAndPlay(greetingMessage.text);
                }
            }
        };

        // Resume audio context on user gesture for mobile compatibility
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume().then(playGreeting);
        } else {
             playGreeting();
        }
        setIsOpen(true);
    };

    useEffect(() => {
        if (isDragging) {
            const moveHandler = (e: MouseEvent) => handleMouseMove(e);
            const upHandler = () => handleMouseUp();
            const touchMoveHandler = (e: TouchEvent) => handleTouchMove(e);
            const touchEndHandler = () => handleTouchEnd();
    
            window.addEventListener('mousemove', moveHandler);
            window.addEventListener('mouseup', upHandler);
            window.addEventListener('touchmove', touchMoveHandler);
            window.addEventListener('touchend', touchEndHandler);
            
            return () => {
                window.removeEventListener('mousemove', moveHandler);
                window.removeEventListener('mouseup', upHandler);
                window.removeEventListener('touchmove', touchMoveHandler);
                window.removeEventListener('touchend', touchEndHandler);
            };
        }
    }, [isDragging]);
    
    return (
        <>
            {/* Orb */}
            <div
                ref={orbRef}
                style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
                className={`fixed top-0 left-0 z-30 w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-transform duration-300 ${isDragging ? 'scale-110 cursor-grabbing' : 'hover:scale-110 cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onClick={handleOrbClick}
            >
                <div className="absolute inset-0 rounded-full animate-gentle-pulse"></div>
                <CleanMagicIcon className="w-10 h-10 text-pink-500 relative" />
            </div>

            {/* Window */}
            {isOpen && (
                 <div className="fixed inset-0 bg-black/30 z-40 flex justify-center items-center p-4">
                     <div className="w-full max-w-lg h-[80vh] max-h-[700px] bg-white/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-200/50 flex flex-col animate-slide-in">
                         {/* Header */}
                         <div className="p-4 border-b border-pink-200/50 flex justify-between items-center">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                                     <BotMessageSquareIcon className="w-5 h-5 text-white"/>
                                 </div>
                                 <h2 className="text-xl font-bold text-rose-800">{isMaleTheme ? 'Assistente Rob' : 'Assistente Rebeca'}</h2>
                             </div>
                             <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-800 text-2xl font-bold">&times;</button>
                         </div>
                         {/* Messages */}
                         <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                    {msg.sender === 'ai' && <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex-shrink-0"></div>}
                                    <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-pink-500 text-white rounded-br-none' : 'bg-white/80 text-gray-700 rounded-bl-none'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-end gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex-shrink-0"></div>
                                    <div className="max-w-[80%] p-3 rounded-2xl bg-white/80 text-gray-700 rounded-bl-none">
                                        <div className="flex gap-1.5 items-center">
                                            <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-0"></span>
                                            <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-150"></span>
                                            <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-300"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                             <div ref={messagesEndRef} />
                         </div>
                         {/* Input */}
                         <div className="p-4 border-t border-pink-200/50">
                             <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                                <button type="button" onClick={handleListen} className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-pink-100 text-pink-600 hover:bg-pink-200'}`}>
                                    <MicrophoneIcon className="w-6 h-6"/>
                                </button>
                                 <input 
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder={isListening ? 'Ouvindo...' : 'Digite sua mensagem...'}
                                    className="flex-1 px-4 py-2 bg-white/70 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400"
                                    disabled={isLoading}
                                 />
                                <button type="submit" className="p-2 rounded-full bg-pink-500 text-white hover:bg-rose-500 disabled:bg-pink-300 transition-colors" disabled={isLoading || !userInput}>
                                    <SendIcon className="w-6 h-6"/>
                                </button>
                             </form>
                         </div>
                     </div>
                 </div>
            )}
        </>
    );
};

// --- BACKUP RESTORE MODAL ---
const BackupRestoreModal: FC<{isOpen: boolean; onClose: () => void; showToast: (msg: string) => void}> = ({isOpen, onClose, showToast}) => {
    const { users } = useAuth();
    const { getRawData, loadRawData } = useData();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedUserForBackup, setSelectedUserForBackup] = useState('');
    const [selectedUserForRestore, setSelectedUserForRestore] = useState('');


    const handleBackup = async () => {
        if (!selectedUserForBackup) {
            showToast('Por favor, selecione um usuário para o backup.');
            return;
        }
        try {
            const data = await getRawData(selectedUserForBackup);
            
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().split('T')[0];
            const user = users.find(u => u.id === selectedUserForBackup);
            a.download = `backup-vendas-${user?.username || 'desconhecido'}-${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Backup baixado com sucesso!');
        } catch (error) {
            console.error("Erro ao criar backup:", error);
            showToast('Ocorreu um erro ao criar o backup.');
        }
    };

    const handleRestoreClick = () => {
        if (!selectedUserForRestore) {
            showToast('Por favor, selecione um usuário para restaurar os dados.');
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedUserForRestore) return;

        if (window.confirm(`Tem certeza que deseja restaurar os dados para o usuário ${users.find(u=>u.id === selectedUserForRestore)?.username}? TODOS os dados atuais DESTE USUÁRIO serão substituídos. Esta ação não pode ser desfeita.`)) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text !== 'string') {
                       throw new Error("Não foi possível ler o arquivo.");
                    }
                    const data = JSON.parse(text);
                    await loadRawData(data, selectedUserForRestore);
                    showToast(`Dados para ${users.find(u=>u.id === selectedUserForRestore)?.username} restaurados com sucesso!`);
                    onClose();
                } catch (error: any) {
                    console.error("Erro ao restaurar backup:", error);
                    showToast(`Erro ao restaurar: ${error.message}`);
                }
            };
            reader.readAsText(file);
        }
        // Reset file input
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Backup e Restauração de Dados">
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-lg text-gray-700 mb-2">Fazer Backup</h3>
                    <p className="text-sm text-gray-600 mb-4">Salve todos os dados de um usuário específico em um arquivo seguro no seu computador.</p>
                    <div className="space-y-4">
                        <Select label="Usuário para Backup" id="user-backup" value={selectedUserForBackup} onChange={e => setSelectedUserForBackup(e.target.value)}>
                            <option value="">Selecione um usuário...</option>
                            {users.map(user => <option key={user.id} value={user.id}>{user.username}</option>)}
                        </Select>
                        <Button onClick={handleBackup} disabled={!selectedUserForBackup}>Baixar Arquivo de Backup</Button>
                    </div>
                </div>
                <div className="border-t pt-6">
                    <h3 className="font-bold text-lg text-gray-700 mb-2">Restaurar de um Arquivo</h3>
                    <p className="text-sm text-gray-600 mb-4">Recupere os dados de um usuário a partir de um arquivo de backup que você salvou.</p>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4">
                       <span className="font-bold">Atenção:</span> Isso substituirá TODOS os dados do usuário selecionado.
                    </div>
                    <div className="space-y-4">
                        <Select label="Restaurar para o Usuário" id="user-restore" value={selectedUserForRestore} onChange={e => setSelectedUserForRestore(e.target.value)}>
                            <option value="">Selecione um usuário...</option>
                            {users.map(user => <option key={user.id} value={user.id}>{user.username}</option>)}
                        </Select>
                        <Button onClick={handleRestoreClick} variant="secondary" disabled={!selectedUserForRestore}>Selecionar Arquivo para Restaurar</Button>
                    </div>
                    <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>
            </div>
        </Modal>
    )
}

// --- PAYMENT SUGGESTION MODAL ---
const PaymentSuggestionModal: FC<{sale: Sale; onClose: () => void; showToast: (message: string) => void}> = ({ sale, onClose, showToast }) => {
    const { addPayment } = useData();
    const [partialAmount, setPartialAmount] = useState('');
    const [showPartialInput, setShowPartialInput] = useState(false);

    const handleRegisterPayment = async (amount: number) => {
        await addPayment({
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
        { title: 'Clientes', value: clients.length, icon: UsersIcon, view: 'clients', color: 'from-purple-400 to-pink-400' },
        { title: 'Vendas', value: totalSalesValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: TrendingUpIcon, view: 'sales_view', color: 'from-pink-400 to-rose-400' },
        { title: 'Recebidos', value: totalReceived.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: WalletIcon, view: 'all_payments', color: 'from-emerald-400 to-green-400' },
        { title: 'Pendente', value: totalPending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: ClockIcon, view: 'pending_payments', color: 'from-amber-400 to-orange-400' },
    ];

    return (
        <div className="bg-white/60 backdrop-blur-md p-2 shadow-lg">
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-w-7xl mx-auto">
                 {summaryItems.map(item => (
                    <div 
                        key={item.title} 
                        onClick={() => setActiveView(item.view as View)} 
                        className={`p-3 flex items-center bg-gradient-to-br ${item.color} rounded-2xl shadow-md text-white cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
                    >
                        <div className="p-2 rounded-full mr-2 bg-white/20">
                            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] sm:text-xs font-medium [text-shadow:1px_1px_2px_rgba(0,0,0,0.3)]">{item.title}</p>
                            <p className="text-sm sm:text-base font-bold [text-shadow:1px_1px_2px_rgba(0,0,0,0.3)]">{item.value}</p>
                        </div>
                    </div>
                 ))}
             </div>
        </div>
    );
};

// --- NEW DASHBOARD ---
const Dashboard: FC<{ onNavigate: (view: View, clientId?: string) => void; }> = ({ onNavigate }) => {
    const navItems = [
        { id: 'add_client', icon: UserPlusIcon, title: 'Cadastrar Cliente', description: 'Adicionar novos clientes' },
        { id: 'stock', icon: ArchiveIcon, title: 'Estoque', description: 'Gerenciar produtos' },
        { id: 'clients', icon: AddressBookIcon, title: 'Ver Todos Clientes', description: 'Visualizar e editar' },
        { id: 'reports', icon: BarChartIcon, title: 'Análise de Vendas', description: 'Ver estatísticas' },
        { id: 'history', icon: HistoryIcon, title: 'Histórico Completo', description: 'Todas as transações' },
    ];

    return (
        <div className="space-y-8">
            {/* Quick Actions */}
            <Card>
                <h2 className="text-xl font-bold text-rose-800 mb-1">Ações Rápidas</h2>
                <p className="text-gray-500 text-sm mb-4">Comece por aqui para as tarefas mais comuns.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => onNavigate('add_sale')} className="p-4 bg-gradient-to-br from-pink-50 to-rose-100 border-2 border-rose-200 rounded-2xl flex items-center text-left space-x-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <ShoppingCartIcon className="w-8 h-8 text-rose-500 flex-shrink-0" />
                        <div>
                            <h3 className="text-base font-bold text-gray-800">Nova Venda</h3>
                            <p className="text-gray-600 text-xs sm:text-sm">Registrar uma nova venda.</p>
                        </div>
                    </button>
                    <button onClick={() => onNavigate('add_payment')} className="p-4 bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-green-200 rounded-2xl flex items-center text-left space-x-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <CreditCardIcon className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                        <div>
                            <h3 className="text-base font-bold text-gray-800">Receber Pagamento</h3>
                            <p className="text-gray-600 text-xs sm:text-sm">Registrar um pagamento.</p>
                        </div>
                    </button>
                </div>
            </Card>

            {/* Other Options */}
            <div>
                 <h2 className="text-xl font-bold text-rose-800 mb-4 ml-2">Outras Opções</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {navItems.map(item => (
                        <Card 
                            key={item.id} 
                            onClick={() => onNavigate(item.id as View)} 
                            className="text-center flex flex-col items-center justify-center space-y-2 !p-4 sm:!p-6"
                        >
                             <div className="p-3 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full mb-2">
                                <item.icon className="w-8 h-8 text-pink-500" />
                             </div>
                             <h2 className="text-sm sm:text-base font-bold text-gray-700 text-center">{item.title}</h2>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};


// --- SALES VIEW ---
const SalesView: FC<{ onEditSale: (sale: Sale) => void; showToast: (msg: string) => void; }> = ({ onEditSale, showToast }) => {
    const { clients, sales, deleteSale, clientBalances } = useData();
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [filter, setFilter] = useState('');

    const filteredClients = useMemo(() => {
        const sorted = [...clients].sort((a,b) => a.fullName.localeCompare(b.fullName));
        if (!filter) return sorted;
        const lowercasedFilter = filter.toLowerCase();
        return sorted.filter(c =>
            c.fullName.toLowerCase().includes(lowercasedFilter) ||
            c.phone.toLowerCase().includes(lowercasedFilter) ||
            c.email.toLowerCase().includes(lowercasedFilter) ||
            c.address.toLowerCase().includes(lowercasedFilter)
        );
    }, [clients, filter]);

    const clientSales = useMemo(() => {
        if (!selectedClient) return [];
        return sales
            .filter(s => s.clientId === selectedClient.id)
            .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
    }, [sales, selectedClient]);

    const handleDelete = async (e: React.MouseEvent, saleId: string) => {
        e.stopPropagation();
        if (window.confirm('Tem certeza que deseja excluir esta venda? O estoque será ajustado.')) {
            await deleteSale(saleId);
            showToast('Venda excluída com sucesso!');
        }
    };

    const handleEdit = (e: React.MouseEvent, sale: Sale) => {
        e.stopPropagation();
        onEditSale(sale);
    };

    if (selectedClient) {
        return (
            <Card>
                <div className="flex items-center mb-6">
                     <Button variant="secondary" onClick={() => setSelectedClient(null)}>
                        <ArrowLeftIcon className="w-5 h-5 mr-2 inline-block"/>
                        Voltar para Clientes
                    </Button>
                </div>
                <h1 className="text-2xl font-bold text-rose-800 mb-4">Extrato de Vendas: {selectedClient.fullName}</h1>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {clientSales.length > 0 ? clientSales.map(sale => (
                        <div key={sale.id} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex justify-between items-center flex-wrap gap-2">
                            <div className="flex-grow">
                                <p className="font-bold text-gray-700">{sale.productName}</p>
                                <p className="text-sm text-gray-600">{sale.quantity}x {sale.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                <p className="text-xs text-gray-500">{new Date(sale.saleDate).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="flex flex-col items-end justify-center ml-4">
                                <p className="font-bold text-rose-600 whitespace-nowrap">{sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                <div className="flex gap-3 mt-2">
                                    <button onClick={(e) => handleEdit(e, sale)} className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors" aria-label="Editar venda"><EditIcon/></button>
                                    <button onClick={(e) => handleDelete(e, sale.id)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors" aria-label="Excluir venda"><TrashIcon/></button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <EmptyState icon={ShoppingCartIcon} title="Nenhuma venda encontrada" message={`${selectedClient.fullName} ainda não tem nenhuma compra registrada.`} />
                    )}
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-2xl font-bold text-rose-800">Vendas por Cliente 🛒</h1>
            </div>
             <Input
                label="Buscar cliente..."
                id="search-client-sales-view"
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
                                <th className="p-3 rounded-l-2xl">Nome</th>
                                <th className="p-3 hidden md:table-cell">Telefone</th>
                                <th className="p-3 rounded-r-2xl">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map(client => {
                                const balance = clientBalances.get(client.id) || 0;
                                return (
                                <tr key={client.id} onClick={() => setSelectedClient(client)} className="border-b border-pink-100/50 hover:bg-pink-50/50 cursor-pointer">
                                    <td className="p-3 font-medium">{client.fullName}</td>
                                    <td className="p-3 hidden md:table-cell">{client.phone}</td>
                                    <td className="p-3">
                                        {balance > 0 ? (
                                            <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-rose-700 bg-rose-100 whitespace-nowrap">
                                                Devendo {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-emerald-700 bg-emerald-100 whitespace-nowrap">
                                                Em dia
                                            </span>
                                        )}
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                 <EmptyState 
                    icon={UsersIcon} 
                    title={clients.length === 0 ? "Nenhum cliente cadastrado" : "Nenhum cliente encontrado"} 
                    message={clients.length === 0 ? "Cadastre um cliente primeiro para poder visualizar suas vendas." : "Tente refinar sua busca."} 
                />
            )}
        </Card>
    );
};

// --- ALL PAYMENTS ---
const AllPayments: FC<{ onEditPayment: (payment: Payment) => void; showToast: (msg: string) => void; }> = ({ onEditPayment, showToast }) => {
    const { payments, getClientById, deletePayment } = useData();
    const sortedPayments = useMemo(() =>
        [...payments].sort((a,b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()),
    [payments]);
    
    const handleDelete = async (paymentId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este recebimento?')) {
            await deletePayment(paymentId);
            showToast('Recebimento excluído com sucesso!');
        }
    };

    return (
        <Card>
            <h1 className="text-2xl font-bold text-rose-800 mb-6">Todos os Recebimentos 💰</h1>
            <div className="space-y-4">
                 {sortedPayments.length > 0 ? sortedPayments.map(payment => {
                    const client = getClientById(payment.clientId);
                    return (
                        <div key={payment.id} className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-700">Pagamento de {client?.fullName || 'Cliente não encontrado'}</p>
                                <p className="text-xs text-gray-500">{new Date(payment.paymentDate).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="flex flex-col items-end justify-center ml-4">
                                <p className="font-bold text-emerald-600 whitespace-nowrap">+{payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                <div className="flex gap-3 mt-2">
                                    <button onClick={() => onEditPayment(payment)} className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors" aria-label="Editar recebimento"><EditIcon/></button>
                                    <button onClick={() => handleDelete(payment.id)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors" aria-label="Excluir recebimento"><TrashIcon/></button>
                                </div>
                            </div>
                        </div>
                    )
                }) : <EmptyState icon={WalletIcon} title="Nenhum pagamento recebido" message="Todos os pagamentos registrados pelos clientes aparecerão aqui."/>}
            </div>
        </Card>
    );
}

// --- PENDING PAYMENTS ---
const PendingPayments: FC<{onViewClient: (clientId: string) => void;}> = ({onViewClient}) => {
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
                                <th className="p-3 rounded-l-2xl">Cliente</th>
                                <th className="p-3">Telefone</th>
                                <th className="p-3 text-right rounded-r-2xl">Valor Pendente</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingClients.map(client => (
                                <tr key={client.id} onClick={() => onViewClient(client.id)} className="border-b border-pink-100/50 hover:bg-pink-50/50 cursor-pointer">
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

    const capitalizeWords = (str: string): string => {
        if (!str) return '';
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatPhone = (value: string): string => {
        if (!value) return '';
        const digits = value.replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 2) return digits;
        if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let finalValue = value;
        if (name === 'fullName') {
            finalValue = capitalizeWords(value);
        } else if (name === 'phone') {
            finalValue = formatPhone(value);
        }
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleEmailDomainClick = (domain: string) => {
        setFormData(prev => {
            const email = prev.email.split('@')[0];
            return { ...prev, email: email + domain };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(client){
            await updateClient({ ...client, ...formData });
        } else {
            await addClient(formData);
        }
        onDone();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nome Completo" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} />
            <Input label="Endereço Completo" id="address" name="address" value={formData.address} onChange={handleChange} />
            <Input label="Telefone" id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} maxLength={15} />
            <div>
                <Input label="E-mail" id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                <div className="flex gap-2 mt-1.5 flex-wrap">
                    {['@gmail.com', '@hotmail.com', '@yahoo.com', '@yahoo.com.br'].map(domain => (
                        <button
                            type="button"
                            key={domain}
                            onClick={() => handleEmailDomainClick(domain)}
                            className="px-2 py-1 text-xs bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200 transition-colors"
                        >
                            {domain}
                        </button>
                    ))}
                </div>
            </div>
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
    const { clients, deleteClient, clientBalances } = useData();
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

    const handleDelete = async (e: React.MouseEvent, clientId: string) => {
        e.stopPropagation(); // Prevent row click when deleting
        if (window.confirm('Tem certeza que deseja excluir este cliente? Todas as vendas e pagamentos associados permanecerão no histórico, mas não será possível associar novas transações a ele.')) {
            await deleteClient(clientId);
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
                                <th className="p-3 rounded-l-2xl">Nome</th>
                                <th className="p-3 hidden md:table-cell">Telefone</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 hidden lg:table-cell">E-mail</th>
                                <th className="p-3 rounded-r-2xl text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map(client => {
                                const balance = clientBalances.get(client.id) || 0;
                                return (
                                <tr key={client.id} onClick={() => onViewClient(client.id)} className="border-b border-pink-100/50 hover:bg-pink-50/50 cursor-pointer">
                                    <td className="p-3 font-medium">{client.fullName}</td>
                                    <td className="p-3 hidden md:table-cell">{client.phone}</td>
                                    <td className="p-3">
                                        {balance > 0 ? (
                                            <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-rose-700 bg-rose-100 whitespace-nowrap">
                                                Devendo {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-emerald-700 bg-emerald-100 whitespace-nowrap">
                                                Em dia
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 hidden lg:table-cell">{client.email}</td>
                                    <td className="p-3">
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={(e) => handleDelete(e, client.id)} className="text-red-600 hover:text-red-800 p-1"><TrashIcon/></button>
                                        </div>
                                    </td>
                                </tr>
                                )
                            })}
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

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        await addStockItem({ ...newItem, quantity: parseInt(newItem.quantity, 10) || 0 });
        setNewItem({ name: '', size: '', code: '', quantity: '0' });
    };

    const handleQuantityChange = (itemId: string, value: string) => {
        setEditingQuantities(prev => ({...prev, [itemId]: value}));
    };

    const handleUpdateQuantity = async (itemId: string) => {
        const newQuantity = parseInt(editingQuantities[itemId], 10);
        if (!isNaN(newQuantity)) {
            await updateStockItemQuantity(itemId, newQuantity);
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
                    <Input label="Nome do Produto" name="name" value={newItem.name} onChange={handleNewItemChange} />
                    <Input label="Tamanho" name="size" value={newItem.size} onChange={handleNewItemChange} />
                    <Input label="Código" name="code" type="number" value={newItem.code} onChange={handleNewItemChange} />
                    <Input
                        label="Quantidade"
                        name="quantity"
                        type="number"
                        min="0"
                        value={newItem.quantity}
                        onChange={handleNewItemChange}
                        onFocus={(e) => e.target.value === '0' && setNewItem(prev => ({...prev, quantity: ''}))}
                        onBlur={(e) => e.target.value === '' && setNewItem(prev => ({...prev, quantity: '0'}))}
                    />
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
                                    <th className="p-3 rounded-l-2xl">Produto</th>
                                    <th className="p-3 hidden sm:table-cell">Tamanho</th>
                                    <th className="p-3">Código</th>
                                    <th className="p-3">Quantidade</th>
                                    <th className="p-3 rounded-r-2xl">Ações</th>
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
                                                    className="w-20 px-2 py-1 border rounded-xl focus:ring-pink-400 focus:border-pink-400"
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const quantity = parseFloat(saleData.quantity) || 0;
        const unitPrice = parseFloat(saleData.unitPrice) || 0;

        if (quantity <= 0) {
            alert('A quantidade da venda deve ser maior que zero.');
            return;
        }

        const salePayload = {
            ...saleData,
            quantity: quantity,
            unitPrice: unitPrice,
        };

        if (isEditing && editingSale) {
            const updatedSale = await updateSale({ ...salePayload, id: editingSale.id, total: 0 }); // total is recalculated in context
            onSaleSuccess(updatedSale, true);
        } else {
            const newSale = await addSale(salePayload);
            onSaleSuccess(newSale, false);
        }
    };

    const total = useMemo(() => (parseFloat(saleData.quantity) || 0) * (parseFloat(saleData.unitPrice) || 0), [saleData.quantity, saleData.unitPrice]);

    return (
        <Card>
            <h1 className="text-2xl font-bold text-rose-800 mb-6">{isEditing ? 'Editar Venda' : 'Cadastrar Venda'} 🛍️</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Cliente" name="clientId" value={saleData.clientId} onChange={handleChange}>
                        <option value="">Selecione um cliente</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                    </Select>
                    <Input label="Data da Venda" name="saleDate" type="date" value={saleData.saleDate} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Código do Produto (opcional)" name="productCode" type="number" placeholder="Puxa do estoque" value={saleData.productCode} onChange={handleChange} />
                    <Input label="Nome do Produto" name="productName" value={saleData.productName} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Quantidade" name="quantity" type="number" min="1" value={saleData.quantity} onChange={handleChange} />
                    <Input
                        label="Valor Unitário (R$)"
                        name="unitPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={saleData.unitPrice}
                        onChange={handleChange}
                        onFocus={(e) => e.target.value === '0' && setSaleData(prev => ({...prev, unitPrice: ''}))}
                        onBlur={(e) => e.target.value === '' && setSaleData(prev => ({...prev, unitPrice: '0'}))}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total</label>
                        <p className="w-full px-3 py-2 border bg-gray-100 border-gray-300 rounded-xl font-bold text-lg text-pink-600">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
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
const PaymentForm: FC<{ 
    editingPayment?: Payment | null; 
    onPaymentSuccess: (isEditing: boolean) => void; 
    prefilledClientId: string | null; 
}> = ({ onPaymentSuccess, prefilledClientId, editingPayment }) => {
    const { clients, addPayment, updatePayment, clientBalances } = useData();
    const isEditing = !!editingPayment;

    const [paymentData, setPaymentData] = useState({
        clientId: prefilledClientId || '',
        paymentDate: new Date().toISOString().split('T')[0],
        amount: '0',
        observation: ''
    });
    const [selectedClientBalance, setSelectedClientBalance] = useState<number | null>(null);

    useEffect(() => {
        if (editingPayment) {
            setPaymentData({
                clientId: editingPayment.clientId,
                paymentDate: editingPayment.paymentDate,
                amount: String(editingPayment.amount),
                observation: editingPayment.observation
            });
        } else if (prefilledClientId) {
            setPaymentData(prev => ({ ...prev, clientId: prefilledClientId, amount: '0', observation: '' }));
        }
    }, [editingPayment, prefilledClientId]);
    
    useEffect(() => {
        if (paymentData.clientId) {
            const balance = clientBalances.get(paymentData.clientId);
            const adjustedBalance = isEditing && editingPayment && paymentData.clientId === editingPayment.clientId
                ? (balance || 0) + editingPayment.amount
                : balance;
            setSelectedClientBalance(adjustedBalance || 0);
        } else {
            setSelectedClientBalance(null);
        }
    }, [paymentData.clientId, clientBalances, editingPayment, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (Number(paymentData.amount) <= 0) {
            alert('O valor do pagamento deve ser maior que zero.');
            return;
        }
        const paymentPayload = {
            ...paymentData,
            amount: Number(paymentData.amount)
        };
        
        if (isEditing && editingPayment) {
            await updatePayment({ ...paymentPayload, id: editingPayment.id });
        } else {
            await addPayment(paymentPayload);
        }
        
        onPaymentSuccess(isEditing);
    };
    
    return (
         <Card>
            <h1 className="text-2xl font-bold text-rose-800 mb-6">{isEditing ? 'Editar Recebimento' : 'Receber Pagamento'} 💸</h1>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
                <Select label="Cliente" name="clientId" value={paymentData.clientId} onChange={handleChange} disabled={isEditing}>
                    <option value="">Selecione uma cliente</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </Select>
                {selectedClientBalance !== null && (
                    <div className={`p-3 rounded-xl text-center ${selectedClientBalance > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        Saldo devedor atual: <span className="font-bold">{selectedClientBalance.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                    </div>
                )}
                 <Input label="Data do Pagamento" name="paymentDate" type="date" value={paymentData.paymentDate} onChange={handleChange} />
                 <div>
                    <Input
                        label="Valor Recebido (R$)"
                        name="amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={paymentData.amount}
                        onChange={handleChange}
                        onFocus={(e) => e.target.value === '0' && setPaymentData(prev => ({...prev, amount: ''}))}
                        onBlur={(e) => e.target.value === '' && setPaymentData(prev => ({...prev, amount: '0'}))}
                    />
                     {selectedClientBalance !== null && selectedClientBalance > 0 && (
                        <button type="button" onClick={() => setPaymentData(prev => ({...prev, amount: String(selectedClientBalance)}))} className="text-sm text-pink-600 hover:underline mt-1">
                            Preencher com valor total
                        </button>
                    )}
                 </div>
                 <TextArea label="Observação" name="observation" value={paymentData.observation} onChange={handleChange} />
                 <div className="flex justify-end pt-4">
                    <Button type="submit">{isEditing ? 'Atualizar Pagamento' : 'Registrar Pagamento'}</Button>
                </div>
            </form>
        </Card>
    );
};

// --- REPORTS ---
const Reports: FC = () => {
    const { sales, clients, getClientById } = useData();

    const topClients = useMemo(() => {
        // Correctly type the accumulator for the reduce function to resolve type errors.
        const clientTotals = sales.reduce((acc: Record<string, number>, sale) => {
            acc[sale.clientId] = (acc[sale.clientId] || 0) + sale.total;
            return acc;
        }, {} as Record<string, number>);

        // FIX: Explicitly cast the result of Object.entries to fix type inference issues in the toolchain.
        return (Object.entries(clientTotals) as [string, number][])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([clientId, total]) => ({
                client: getClientById(clientId),
                total
            }));
    }, [sales, getClientById]);
    
    const topProducts = useMemo(() => {
        // Correctly type the accumulator for the reduce function to resolve type errors.
        const productTotals = sales.reduce((acc: Record<string, { quantity: number; total: number }>, sale) => {
            if (!acc[sale.productName]) {
                 acc[sale.productName] = { quantity: 0, total: 0 };
            }
            acc[sale.productName].quantity += sale.quantity;
            acc[sale.productName].total += sale.total;
            return acc;
        }, {} as Record<string, { quantity: number; total: number }>);

        // FIX: Explicitly cast the result of Object.entries to fix type inference issues with 'unknown' values.
        return (Object.entries(productTotals) as [string, { quantity: number; total: number }][])
            .sort((a, b) => b[1].quantity - a[1].quantity)
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
                                <li key={client?.id || index} className="flex justify-between items-center p-3 bg-rose-50 rounded-xl border border-rose-100">
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
                                <li key={productName} className="flex justify-between items-center p-3 bg-rose-50 rounded-xl border border-rose-100">
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
                                <div key={`sale-${tx.id}`} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex justify-between items-start">
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
                                 <div key={`payment-${tx.id}`} className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-start">
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
                                <div key={`sale-${tx.id}`} className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800">{tx.productName} (x{tx.quantity})</p>
                                        <p className="text-xs text-gray-500">{new Date(tx.saleDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <p className="font-bold text-rose-600">-{tx.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                            ) : (
                                <div key={`payment-${tx.id}`} className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex justify-between items-center">
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