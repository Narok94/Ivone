



import React, { useState, useMemo, FC, useEffect, ReactNode, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
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
const ShieldIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>);
const BotIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>);
const MicrophoneIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>);
const SendIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>);


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
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [paymentSuggestion, setPaymentSuggestion] = useState<Sale | null>(null);
  const [isBackupModalOpen, setBackupModalOpen] = useState(false);
  
  // State for pre-filling forms
  const [prefilledClientId, setPrefilledClientId] = useState<string | null>(null);

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
            <h1 className="text-2xl font-bold text-rose-800 mb-6">Adicionar Nova Cliente 📝</h1>
            <ClientForm onDone={() => {
                setActiveView('dashboard');
                showToast('Cliente cadastrada com sucesso!');
            }} />
        </Card>
      );
      case 'add_sale': return <SaleForm editingSale={editingSale} onSaleSuccess={handleSaleSuccess} prefilledClientId={prefilledClientId} />;
      case 'stock': return <StockManager />;
      case 'add_payment': return <PaymentForm editingPayment={editingPayment} onPaymentSuccess={handlePaymentSuccess} prefilledClientId={prefilledClientId} />;
      case 'reports': return <Reports />;
      case 'history': return <History />;
      case 'pending_payments': return <PendingPayments onViewClient={handleViewClient} />;
      case 'all_sales': return <AllSales onEditSale={handleEditSale} showToast={showToast} />;
      case 'all_payments': return <AllPayments onEditPayment={handleEditPayment} showToast={showToast} />;
      default: return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 text-gray-800">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {paymentSuggestion && <PaymentSuggestionModal sale={paymentSuggestion} onClose={handleClosePaymentSuggestion} showToast={showToast}/>}
      <BackupRestoreModal isOpen={isBackupModalOpen} onClose={() => setBackupModalOpen(false)} showToast={showToast}/>

      <header className="bg-white/70 backdrop-blur-lg p-4 shadow-md flex items-center justify-center sticky top-0 z-10">
         <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-rose-500 text-transparent bg-clip-text whitespace-nowrap">Sistema de vendas Ivone 💖✨</h1>
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

      <button
        onClick={() => setBackupModalOpen(true)}
        title="Backup e Restauração"
        aria-label="Backup e Restauração"
        className="fixed bottom-4 right-4 z-20 w-12 h-12 bg-white/60 backdrop-blur-md rounded-xl shadow-md border border-pink-100 flex items-center justify-center text-pink-500 hover:bg-white/80 hover:shadow-lg transition-all duration-300"
      >
        <ShieldIcon className="w-6 h-6" />
      </button>

      <AIAssistant showToast={showToast} />
    </div>
  );
};

// --- AI ASSISTANT ---
const AIAssistant: FC<{ showToast: (message: string) => void }> = ({ showToast }) => {
    const { addClient, addSale, addPayment, clients } = useData();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string | ReactNode }[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
    const [isDragging, setIsDragging] = useState(false);
    const wasDraggedRef = useRef(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const chatRef = useRef<Chat | null>(null);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!process.env.API_KEY) {
            console.error("API_KEY not found.");
            return;
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const clientNames = clients.map(c => c.fullName).join(', ') || 'Nenhum';
        const systemInstruction = `Você é 'IV.IA', uma assistente virtual para o app 'Sistema de Vendas Ivone'. Seu objetivo é ajudar a usuária a cadastrar clientes, vendas e pagamentos através de uma conversa. Clientes existentes: ${clientNames}. Ações disponíveis: 1. 'add_client': Campos obrigatórios: fullName, address, phone, cpf. Campos opcionais: email, observation. 2. 'add_sale': Campos obrigatórios: clientName (deve ser um dos clientes existentes da lista), productName, quantity, unitPrice. Campos opcionais: observation. 3. 'add_payment': Campos obrigatórios: clientName (deve ser um dos clientes existentes da lista), amount. Campos opcionais: observation. COMO PROCEDER: Seja amigável e use emojis 💖✨. Peça UMA informação de cada vez. Quando tiver TODOS os campos obrigatórios para uma ação, responda APENAS com um JSON no seguinte formato: {"action": "action_name", "data": { ...dados... }}. NÃO adicione nenhum texto antes ou depois do JSON. Se a usuária pedir para cancelar, responda "Ok, cancelando a operação. ✨" e esqueça os dados coletados. Se a usuária conversar, responda de forma natural. Se ela te cumprimentar, apresente-se e diga o que pode fazer.`;
        
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
        });

        setMessages([{ sender: 'ai', text: 'Olá! Eu sou a IV.IA, sua assistente virtual. 💖 Como posso te ajudar hoje? (Ex: "cadastrar cliente")' }]);
    }, [clients]);

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
        wasDraggedRef.current = false;
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        e.preventDefault();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        wasDraggedRef.current = true;
        const newX = e.clientX - dragStartPos.current.x;
        const newY = e.clientY - dragStartPos.current.y;
        setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            const moveHandler = (e: MouseEvent) => handleMouseMove(e as any);
            const upHandler = () => handleMouseUp();
            window.addEventListener('mousemove', moveHandler);
            window.addEventListener('mouseup', upHandler);
            return () => {
                window.removeEventListener('mousemove', moveHandler);
                window.removeEventListener('mouseup', upHandler);
            };
        }
    }, [isDragging]);
    
    return (
        <>
            {/* Orb */}
            <div
                style={{ left: `${position.x}px`, top: `${position.y}px` }}
                className={`fixed z-30 w-16 h-16 rounded-full cursor-pointer transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-2xl ${isDragging ? 'scale-110' : 'hover:scale-110'}`}
                onMouseDown={handleMouseDown}
                onClick={() => !wasDraggedRef.current && setIsOpen(true)}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-1 bg-white/30 backdrop-blur-sm rounded-full"></div>
                <BotIcon className="w-8 h-8 text-white relative" />
            </div>

            {/* Window */}
            {isOpen && (
                 <div className="fixed inset-0 bg-black/30 z-40 flex justify-center items-center p-4">
                     <div className="w-full max-w-lg h-[80vh] max-h-[700px] bg-white/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-pink-200/50 flex flex-col animate-slide-in">
                         {/* Header */}
                         <div className="p-4 border-b border-pink-200/50 flex justify-between items-center">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                                     <BotIcon className="w-5 h-5 text-white"/>
                                 </div>
                                 <h2 className="text-xl font-bold text-rose-800">IV.IA Assistant</h2>
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
    const { getRawData, loadRawData } = useData();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBackup = () => {
        try {
            const data = getRawData();
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().split('T')[0];
            a.download = `backup-vendas-ivone-${date}.json`;
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
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (window.confirm('Tem certeza que deseja restaurar os dados? TODOS os dados atuais serão substituídos por este backup. Esta ação não pode ser desfeita.')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text !== 'string') {
                       throw new Error("Não foi possível ler o arquivo.");
                    }
                    const data = JSON.parse(text);
                    loadRawData(data);
                    showToast('Dados restaurados com sucesso!');
                    onClose();
                } catch (error) {
                    console.error("Erro ao restaurar backup:", error);
                    showToast('Erro ao restaurar. O arquivo pode estar corrompido.');
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
                    <p className="text-sm text-gray-600 mb-4">Salve todos os seus dados (clientes, vendas, estoque e pagamentos) em um arquivo seguro no seu computador. Faça isso regularmente!</p>
                    <Button onClick={handleBackup}>Baixar Arquivo de Backup</Button>
                </div>
                <div className="border-t pt-6">
                    <h3 className="font-bold text-lg text-gray-700 mb-2">Restaurar de um Arquivo</h3>
                    <p className="text-sm text-gray-600 mb-4">Recupere seus dados a partir de um arquivo de backup que você salvou anteriormente. </p>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                       <span className="font-bold">Atenção:</span> Isso substituirá TODOS os dados atuais no aplicativo.
                    </div>
                    <Button onClick={handleRestoreClick} variant="secondary">Restaurar de um Arquivo</Button>
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
                    <button onClick={() => onNavigate('add_sale')} className="p-6 bg-gradient-to-br from-pink-50 to-rose-100 border-2 border-rose-200 rounded-xl flex items-center space-x-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <ShoppingCartIcon className="w-10 h-10 text-rose-500" />
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 text-left">Nova Venda</h3>
                            <p className="text-gray-600 text-left">Registrar uma nova venda para uma cliente.</p>
                        </div>
                    </button>
                    <button onClick={() => onNavigate('add_payment')} className="p-6 bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-green-200 rounded-xl flex items-center space-x-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <CreditCardIcon className="w-10 h-10 text-emerald-500" />
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 text-left">Receber Pagamento</h3>
                            <p className="text-gray-600 text-left">Registrar um pagamento recebido.</p>
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
const AllPayments: FC<{ onEditPayment: (payment: Payment) => void; showToast: (msg: string) => void; }> = ({ onEditPayment, showToast }) => {
    const { payments, getClientById, deletePayment } = useData();
    const sortedPayments = useMemo(() =>
        [...payments].sort((a,b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()),
    [payments]);
    
    const handleDelete = (paymentId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este recebimento?')) {
            deletePayment(paymentId);
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
                        <div key={payment.id} className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex justify-between items-center">
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
                                <th className="p-3 rounded-l-lg">Cliente</th>
                                <th className="p-3">Telefone</th>
                                <th className="p-3 text-right rounded-r-lg">Valor Pendente</th>
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
            <Input label="Endereço Completo" id="address" name="address" value={formData.address} onChange={handleChange} required />
            <Input label="Telefone" id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
            <Input label="E-mail" id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            <Input label="CPF" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} required />
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
                                <th className="p-3">Status</th>
                                <th className="p-3 hidden lg:table-cell">E-mail</th>
                                <th className="p-3 rounded-r-lg text-right">Ações</th>
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
                    <Input label="Código" name="code" type="number" value={newItem.code} onChange={handleNewItemChange} required />
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
                    <Input label="Código do Produto (opcional)" name="productCode" type="number" placeholder="Puxa do estoque" value={saleData.productCode} onChange={handleChange} />
                    <Input label="Nome do Produto" name="productName" value={saleData.productName} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Quantidade" name="quantity" type="number" min="1" value={saleData.quantity} onChange={handleChange} required />
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
                        required
                    />
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!paymentData.clientId || Number(paymentData.amount) <= 0){
            alert('Selecione um cliente e informe um valor maior que zero.');
            return;
        }
        const paymentPayload = {
            ...paymentData,
            amount: Number(paymentData.amount)
        };
        
        if (isEditing && editingPayment) {
            updatePayment({ ...paymentPayload, id: editingPayment.id });
        } else {
            addPayment(paymentPayload);
        }
        
        onPaymentSuccess(isEditing);
    };
    
    return (
         <Card>
            <h1 className="text-2xl font-bold text-rose-800 mb-6">{isEditing ? 'Editar Recebimento' : 'Receber Pagamento'} 💸</h1>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
                <Select label="Cliente" name="clientId" value={paymentData.clientId} onChange={handleChange} required disabled={isEditing}>
                    <option value="">Selecione uma cliente</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </Select>
                {selectedClientBalance !== null && (
                    <div className={`p-3 rounded-lg text-center ${selectedClientBalance > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        Saldo devedor atual: <span className="font-bold">{selectedClientBalance.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                    </div>
                )}
                 <Input label="Data do Pagamento" name="paymentDate" type="date" value={paymentData.paymentDate} onChange={handleChange} required />
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
                        required
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