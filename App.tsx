
import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  Transaction, 
  CardType, 
  TransactionCategory 
} from './types';
import { Icons } from './constants';
import Dashboard from './components/Dashboard';
import CardManager from './components/CardManager';
import TransactionHistory from './components/TransactionHistory';
import RewardHub from './components/AiInsights';
import Analytics from './components/Analytics';
import { fetchCardIntelligence } from './services/gemini';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cards' | 'transactions' | 'analytics' | 'rewards'>('dashboard');
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const isSyncingRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const savedCards = localStorage.getItem('fintrack_cards');
    const savedTransactions = localStorage.getItem('fintrack_transactions');
    if (savedCards) setCards(JSON.parse(savedCards));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fintrack_cards', JSON.stringify(cards));
      localStorage.setItem('fintrack_transactions', JSON.stringify(transactions));
    }
  }, [cards, transactions, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const cardsToSync = cards.filter(c => 
      c.bankName && 
      c.variantName && 
      (!c.syncStatus || c.syncStatus === 'idle') && 
      !isSyncingRef.current[c.id]
    );

    if (cardsToSync.length > 0) {
      const card = cardsToSync[0];
      isSyncingRef.current[card.id] = true;

      (async () => {
        try {
          setCards(prev => prev.map(c => c.id === card.id ? { ...c, syncStatus: 'syncing' } : c));
          const intel = await fetchCardIntelligence(card.bankName, card.variantName!);
          setCards(prev => prev.map(c => c.id === card.id ? { 
            ...c, 
            benefits: intel.benefits,
            milestones: intel.milestones.map(m => ({ ...m, id: Math.random().toString(36).substr(2, 9) })),
            syncStatus: 'completed',
            lastSynced: new Date().toISOString()
          } : c));
        } catch (error) {
          setCards(prev => prev.map(c => c.id === card.id ? { ...c, syncStatus: 'failed' } : c));
        } finally {
          isSyncingRef.current[card.id] = false;
        }
      })();
    }
  }, [cards, isLoaded]);

  const handleAddCard = (card: CreditCard) => setCards([...cards, { ...card, syncStatus: 'idle' }]);
  const handleUpdateCard = (updated: CreditCard) => {
    const old = cards.find(c => c.id === updated.id);
    const needsResync = old?.bankName !== updated.bankName || old?.variantName !== updated.variantName;
    setCards(prev => prev.map(c => c.id === updated.id ? { ...updated, syncStatus: needsResync ? 'idle' : updated.syncStatus } : c));
  };

  const handleRemoveCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
    setTransactions(transactions.filter(t => t.cardId !== id));
  };

  const handleAddTransaction = (tx: Transaction) => {
    setTransactions([tx, ...transactions]);
    setCards(prev => prev.map(c => c.id === tx.cardId ? { ...c, balance: c.balance + tx.amount } : c));
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    const old = transactions.find(t => t.id === updated.id);
    if (!old) return;
    setCards(prev => prev.map(c => {
      let bal = c.balance;
      if (old.cardId === updated.cardId) {
        if (c.id === old.cardId) bal = (c.balance - old.amount) + updated.amount;
      } else {
        if (c.id === old.cardId) bal = c.balance - old.amount;
        if (c.id === updated.cardId) bal = c.balance + updated.amount;
      }
      return { ...c, balance: Math.max(0, bal) };
    }));
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleRemoveTransaction = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (tx) {
      setCards(prev => prev.map(c => c.id === tx.cardId ? { ...c, balance: Math.max(0, c.balance - tx.amount) } : c));
      setTransactions(transactions.filter(t => t.id !== txId));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard cards={cards} transactions={transactions} />;
      case 'cards': return <CardManager cards={cards} transactions={transactions} onAddCard={handleAddCard} onUpdateCard={handleUpdateCard} onRemoveCard={handleRemoveCard} />;
      case 'transactions': return <TransactionHistory cards={cards} transactions={transactions} onAddTransaction={handleAddTransaction} onUpdateTransaction={handleUpdateTransaction} onRemoveTransaction={handleRemoveTransaction} />;
      case 'analytics': return <Analytics cards={cards} transactions={transactions} />;
      case 'rewards': return <RewardHub cards={cards} transactions={transactions} />;
      default: return <Dashboard cards={cards} transactions={transactions} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 overflow-hidden touch-none">
      {/* Sidebar - Desktop */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <Icons.Dashboard />
            </div>
            FinTrack
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 pt-4">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Icons.Dashboard />} label="Dashboard" />
          <NavItem active={activeTab === 'cards'} onClick={() => setActiveTab('cards')} icon={<Icons.Cards />} label="My Wallet" />
          <NavItem active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={<Icons.Transactions />} label="Expenses" />
          <NavItem active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<Icons.Analytics />} label="Insights" />
          <NavItem active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')} icon={<Icons.Bot />} label="Reward Hub" />
        </nav>
        <div className="p-6 border-t border-slate-100 mt-auto">
          <div className="bg-slate-100 rounded-2xl p-4 flex items-center gap-3 text-slate-500">
             <div className="w-2 h-2 bg-green-500 rounded-full"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">Local-Only Mode</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        <header className="flex-shrink-0 bg-slate-50/80 backdrop-blur-xl px-6 sm:px-10 py-6 flex justify-between items-center z-30">
          <div>
            <h2 className="text-2xl font-black text-slate-800 capitalize leading-none mb-1">
              {activeTab === 'rewards' ? 'Reward Advisor' : activeTab}
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden sm:block">100% Privacy Guaranteed</p>
              {Object.values(isSyncingRef.current).some(v => v) && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 rounded-full animate-pulse">
                   <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                   <span className="text-[8px] font-black text-blue-600 uppercase">Updating Card Offers...</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-11 h-11 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 active:scale-95 transition-all">
              <Icons.Bell />
            </button>
            <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-sm">JD</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-32 lg:pb-10 overscroll-contain touch-auto px-4 sm:px-10">
          <div className="max-w-7xl mx-auto w-full py-2">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-[50]">
        <nav className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-2 rounded-[2.5rem] flex justify-around items-center shadow-2xl">
          <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Icons.Dashboard />} />
          <MobileNavItem active={activeTab === 'cards'} onClick={() => setActiveTab('cards')} icon={<Icons.Cards />} />
          <MobileNavItem active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={<Icons.Transactions />} />
          <MobileNavItem active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<Icons.Analytics />} />
          <MobileNavItem active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')} icon={<Icons.Bot />} />
        </nav>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all active:scale-[0.98] ${active ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:bg-white hover:text-slate-900'}`}>
    <div className={`${active ? 'text-blue-400' : 'text-slate-300'} shrink-0`}>{icon}</div>
    <span className="font-bold tracking-tight">{label}</span>
  </button>
);

const MobileNavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode }> = ({ active, onClick, icon }) => (
  <button onClick={onClick} className={`p-4 rounded-2xl transition-all relative active:scale-125 ${active ? 'text-white bg-white/10' : 'text-slate-500'}`}>{icon}</button>
);

export default App;
