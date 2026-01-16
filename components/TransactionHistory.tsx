
import React, { useState, useMemo } from 'react';
import { Transaction, CreditCard, TransactionCategory } from '../types';
import { Icons, CATEGORY_COLORS } from '../constants';
import { parseTransactionSms } from '../services/gemini';

interface TransactionHistoryProps {
  cards: CreditCard[];
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  onUpdateTransaction: (tx: Transaction) => void;
  onRemoveTransaction: (id: string) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ cards, transactions, onAddTransaction, onUpdateTransaction, onRemoveTransaction }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  
  const [filters, setFilters] = useState({
    cardId: '', category: '', startDate: '', endDate: ''
  });

  const [formData, setFormData] = useState<Partial<Transaction>>({
    description: '', amount: 0, category: TransactionCategory.OTHER, cardId: cards[0]?.id || '', date: new Date().toISOString().split('T')[0]
  });

  const handleOpenAdd = () => {
    setEditingTx(null);
    setFormData({
      description: '', amount: 0, category: TransactionCategory.OTHER, cardId: cards[0]?.id || '', date: new Date().toISOString().split('T')[0]
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setFormData({ ...tx, date: new Date(tx.date).toISOString().split('T')[0] });
    setShowAddModal(true);
  };

  const handleAutoSync = async () => {
    try {
      setSyncStatus('syncing');
      const text = await navigator.clipboard.readText();
      if (!text || text.length < 10) {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 2000);
        return;
      }
      const parsed = await parseTransactionSms(text);
      const matchedCard = cards.find(c => c.lastFour === parsed.cardLastFour);
      setFormData({
        description: parsed.description,
        amount: parsed.amount,
        category: parsed.category as TransactionCategory,
        cardId: matchedCard?.id || cards[0]?.id || '',
        date: new Date(parsed.date).toISOString().split('T')[0]
      });
      setSyncStatus('success');
      setShowAddModal(true);
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (err) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cardId) return;
    const finalTx = { ...formData as Transaction, date: new Date(formData.date!).toISOString() };
    if (editingTx) onUpdateTransaction({ ...editingTx, ...finalTx });
    else onAddTransaction({ ...finalTx, id: Math.random().toString(36).substr(2, 9) });
    setShowAddModal(false);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesCard = !filters.cardId || tx.cardId === filters.cardId;
      const matchesCategory = !filters.category || tx.category === filters.category;
      const txTime = new Date(tx.date).getTime();
      const start = filters.startDate ? new Date(filters.startDate).setHours(0, 0, 0, 0) : -Infinity;
      const end = filters.endDate ? new Date(filters.endDate).setHours(23, 59, 59, 999) : Infinity;
      return matchesCard && matchesCategory && (txTime >= start && txTime <= end);
    });
  }, [transactions, filters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800">Transactions</h3>
          <p className="text-sm text-slate-400 font-medium">{filteredTransactions.length} logs found</p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <button 
            onClick={handleAutoSync} 
            className="flex-1 sm:flex-none h-12 px-6 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-slate-200"
          >
            {syncStatus === 'syncing' ? '...' : <Icons.Bot />} <span className="text-sm">Magic Sync</span>
          </button>
          <button onClick={handleOpenAdd} className="flex-1 sm:flex-none h-12 px-6 bg-white text-slate-700 rounded-2xl font-bold border border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all">
            <Icons.Plus /> <span className="text-sm">Add</span>
          </button>
        </div>
      </div>

      {/* Filters with Horizontal Scroll indicator */}
      <div className="relative">
        <div className="flex overflow-x-auto gap-3 pb-3 no-scrollbar scroll-smooth">
          <FilterDropdown value={filters.cardId} onChange={v => setFilters({...filters, cardId: v})} label="All Cards">
            {cards.map(c => <option key={c.id} value={c.id}>{c.bankName}</option>)}
          </FilterDropdown>
          <FilterDropdown value={filters.category} onChange={v => setFilters({...filters, category: v})} label="All Categories">
            {Object.values(TransactionCategory).map(c => <option key={c} value={c}>{c}</option>)}
          </FilterDropdown>
          <div className="shrink-0">
            <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} className="h-11 bg-white border border-slate-200 px-4 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none md:hidden"></div>
      </div>

      <div className="space-y-3">
        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {filteredTransactions.map(tx => {
            const card = cards.find(c => c.id === tx.cardId);
            return (
              <div 
                key={tx.id} 
                onClick={() => handleOpenEdit(tx)} 
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm active:scale-[0.98] transition-all flex items-center gap-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shrink-0 shadow-sm text-sm" style={{ backgroundColor: CATEGORY_COLORS[tx.category] }}>
                  {tx.description.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate text-sm">{tx.description}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{card?.bankName} • {new Date(tx.date).toLocaleDateString('en-IN', {day: '2-digit', month: 'short'})}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900 text-sm">₹{tx.amount.toLocaleString()}</p>
                  <p className="text-[10px] font-bold" style={{ color: CATEGORY_COLORS[tx.category] }}>{tx.category}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-[0.1em]">
              <tr>
                <th className="px-6 py-5">Merchant / Date</th>
                <th className="px-6 py-5">Card</th>
                <th className="px-6 py-5 text-right">Amount</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map(tx => {
                const card = cards.find(c => c.id === tx.cardId);
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-sm">{tx.description}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{new Date(tx.date).toLocaleDateString('en-IN')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 bg-slate-100/50 px-3 py-1 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: card?.color }}></div>
                        <span className="text-[10px] font-bold text-slate-600">{card?.bankName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">₹{tx.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(tx)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Icons.Edit /></button>
                        <button onClick={() => onRemoveTransaction(tx.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Icons.Trash /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Mobile Drawer Style */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-md p-0 sm:p-4">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full max-w-lg p-8 sm:p-10 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
               <h4 className="text-2xl font-black text-slate-800">{editingTx ? 'Edit Transaction' : 'New Transaction'}</h4>
               <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 active:scale-90"><Icons.Trash /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Merchant</label>
                <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full h-14 bg-slate-50 border-2 border-slate-100 px-5 rounded-2xl outline-none focus:border-blue-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                  <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full h-14 bg-slate-50 border-2 border-slate-100 px-5 rounded-2xl outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full h-14 bg-slate-50 border-2 border-slate-100 px-4 rounded-2xl outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source Card</label>
                <select required value={formData.cardId} onChange={e => setFormData({...formData, cardId: e.target.value})} className="w-full h-14 bg-slate-50 border-2 border-slate-100 px-4 rounded-2xl outline-none appearance-none">
                  {cards.map(c => <option key={c.id} value={c.id}>{c.bankName} (••{c.lastFour})</option>)}
                </select>
              </div>
              <button type="submit" className="w-full h-16 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl active:scale-95 transition-all uppercase tracking-widest text-sm">
                Confirm
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterDropdown: React.FC<{ value: string; onChange: (v: string) => void; label: string; children: React.ReactNode }> = ({ value, onChange, label, children }) => (
  <div className="shrink-0 relative">
    <select 
      value={value} 
      onChange={e => onChange(e.target.value)}
      className="h-11 bg-white border border-slate-200 pl-4 pr-8 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
    >
      <option value="">{label}</option>
      {children}
    </select>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor"><path d="M1 3l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  </div>
);

export default TransactionHistory;
