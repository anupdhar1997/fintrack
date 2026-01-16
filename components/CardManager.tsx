
import React, { useState, useMemo } from 'react';
import { CreditCard, CardType, Transaction } from '../types';
import { Icons, PREMIUM_GRADIENTS } from '../constants';

interface CardManagerProps {
  cards: CreditCard[];
  transactions: Transaction[];
  onAddCard: (card: CreditCard) => void;
  onUpdateCard: (card: CreditCard) => void;
  onRemoveCard: (id: string) => void;
}

const CardManager: React.FC<CardManagerProps> = ({ cards, transactions, onAddCard, onUpdateCard, onRemoveCard }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(cards[0]?.id || null);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  
  const [formData, setFormData] = useState<Partial<CreditCard>>({
    bankName: '', lastFour: '', type: CardType.VISA, limit: 0, balance: 0,
    statementDate: 1, dueDate: 1, color: PREMIUM_GRADIENTS[0].value, variantName: '', benefits: [], milestones: []
  });

  const selectedCard = useMemo(() => cards.find(c => c.id === selectedCardId), [cards, selectedCardId]);

  const stats = useMemo(() => {
    if (!selectedCardId) return null;
    const cardTx = transactions.filter(t => t.cardId === selectedCardId);
    const now = new Date();
    const yearly = cardTx.filter(t => new Date(t.date).getFullYear() === now.getFullYear()).reduce((sum, t) => sum + t.amount, 0);
    return { yearly };
  }, [selectedCardId, transactions]);

  const handleOpenAdd = () => {
    setEditingCard(null);
    setFormData({
      bankName: '', lastFour: '', type: CardType.VISA, limit: 0, balance: 0,
      statementDate: 1, dueDate: 1, color: PREMIUM_GRADIENTS[0].value, variantName: '', benefits: [], milestones: []
    });
    setShowModal(true);
  };

  const handleOpenEdit = (card: CreditCard) => {
    setEditingCard(card);
    setFormData(card);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCard) onUpdateCard({ ...editingCard, ...formData } as CreditCard);
    else onAddCard({ ...formData as CreditCard, id: Math.random().toString(36).substr(2, 9), syncStatus: 'idle' });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Your Wallet</h3>
          <p className="text-sm text-slate-400 font-medium">{cards.length} cards tracked</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-slate-900 text-white h-12 px-6 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200">
          <Icons.Plus /> <span className="text-sm hidden sm:inline">Add Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Card List - CRED Style Mobile Friendly Stack */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex flex-col space-y-[-100px] sm:space-y-4 pb-20 sm:pb-0 overflow-visible">
            {cards.map((card, idx) => (
              <div 
                key={card.id} 
                onClick={() => setSelectedCardId(card.id)}
                className={`relative cursor-pointer w-full aspect-[1.6/1] p-6 rounded-[1.5rem] text-white shadow-2xl transition-all duration-500 ease-out group overflow-hidden ${selectedCardId === card.id ? 'z-20 -translate-y-2' : 'hover:z-10 hover:-translate-y-1'}`}
                style={{ 
                  background: card.color,
                  boxShadow: selectedCardId === card.id ? `0 25px 50px -12px rgba(0,0,0,0.5)` : '0 10px 15px -3px rgba(0,0,0,0.1)'
                }}
              >
                {/* Holographic Overlays */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-30 pointer-events-none"></div>
                <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none scale-[2] transform rotate-12">
                   {Icons.Network(card.type)}
                </div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{card.bankName}</p>
                      <h4 className="text-sm font-bold truncate max-w-[150px]">{card.variantName}</h4>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(card); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"><Icons.Edit /></button>
                       {card.syncStatus === 'syncing' && <div className="animate-spin"><Icons.Bot /></div>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Icons.Chip />
                    <div className="text-right">
                       {Icons.Network(card.type)}
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-lg font-mono tracking-[0.25em]">•••• {card.lastFour}</p>
                      <p className="text-[10px] opacity-70 mt-1 font-bold uppercase tracking-wider">Balance: ₹{card.balance.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {cards.length === 0 && (
              <div className="aspect-[1.6/1] border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 gap-2">
                <Icons.Cards />
                <p className="font-bold text-sm">No cards yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Card Analytics Panel */}
        <div className="lg:col-span-7 space-y-6">
          {selectedCard ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 sm:p-10 animate-fadeIn">
              <div className="flex justify-between items-center mb-8 pb-8 border-b border-slate-50">
                <div>
                  <h4 className="text-2xl font-black text-slate-800">{selectedCard.bankName}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedCard.variantName} • {selectedCard.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Limit Remaining</p>
                  <p className="text-xl font-black text-blue-600">₹{(selectedCard.limit - selectedCard.balance).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Active Benefits
                  </h5>
                  <div className="space-y-2">
                    {selectedCard.benefits?.map((b, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 hover:bg-blue-50 transition-colors">
                        <div className="w-5 h-5 flex items-center justify-center bg-white rounded-md text-blue-500 shadow-sm"><Icons.Bot /></div>
                        {b}
                      </div>
                    ))}
                    {(!selectedCard.benefits || selectedCard.benefits.length === 0) && (
                      <p className="text-xs text-slate-300 italic p-4 text-center">Auto-syncing public offers soon...</p>
                    )}
                  </div>
                </section>

                <section className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Rewards & Vouchers
                  </h5>
                  <div className="space-y-5">
                    {selectedCard.milestones?.map((m) => {
                      const spend = stats?.yearly || 0;
                      const progress = Math.min(100, (spend / m.target) * 100);
                      return (
                        <div key={m.id} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black">
                            <span className="text-slate-500 truncate pr-2">{m.label}</span>
                            <span className="text-slate-900 shrink-0">₹{spend.toLocaleString()} / ₹{m.target.toLocaleString()}</span>
                          </div>
                          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-[2px]">
                            <div className="h-full bg-slate-900 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                          </div>
                          <p className="text-[9px] text-orange-600 font-black uppercase tracking-tighter">{m.reward}</p>
                        </div>
                      );
                    })}
                    {(!selectedCard.milestones?.length) && (
                      <p className="text-xs text-slate-300 italic p-4 text-center">No milestones detected</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 text-center">
              <Icons.Cards />
              <p className="text-slate-400 font-bold mt-4">Select a card to see details</p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/95 backdrop-blur-xl p-0 sm:p-4">
          <div className="bg-white rounded-t-[3rem] sm:rounded-[3rem] w-full max-w-2xl p-8 sm:p-12 shadow-2xl relative animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h4 className="text-2xl font-black text-slate-800">{editingCard ? 'Update Card' : 'New Card'}</h4>
                <p className="text-xs text-slate-400 font-bold">100% Offline Storage • Secure & Private</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 active:scale-90"><Icons.Trash /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Visual Selection Section */}
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Premium Card Finish</label>
                 <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                   {PREMIUM_GRADIENTS.map((g, i) => (
                     <button 
                        key={i} 
                        type="button" 
                        onClick={() => setFormData({...formData, color: g.value})}
                        className={`aspect-square rounded-xl transition-all ${formData.color === g.value ? 'ring-4 ring-blue-500 ring-offset-2' : 'hover:scale-105'}`}
                        style={{ background: g.value }}
                     />
                   ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                  <input required type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full h-14 bg-slate-50 border-2 border-slate-100 px-5 rounded-2xl outline-none focus:border-blue-500 font-bold" placeholder="e.g. HDFC" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Variant</label>
                  <input required type="text" value={formData.variantName} onChange={e => setFormData({...formData, variantName: e.target.value})} className="w-full h-14 bg-slate-50 border-2 border-slate-100 px-5 rounded-2xl outline-none focus:border-blue-500 font-bold" placeholder="e.g. Infinia Metal" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                 <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Network</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as CardType})} className="w-full h-14 bg-slate-50 border-2 border-slate-100 px-4 rounded-2xl outline-none font-bold appearance-none">
                    {Object.values(CardType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last 4</label>
                  <input required maxLength={4} type="text" value={formData.lastFour} onChange={e => setFormData({...formData, lastFour: e.target.value})} className="w-full h-14 bg-slate-50 border-2 border-slate-100 px-5 rounded-2xl outline-none font-bold" placeholder="1234" />
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Limit (₹)</label>
                  <input required type="number" value={formData.limit} onChange={e => setFormData({...formData, limit: Number(e.target.value)})} className="w-full h-14 bg-slate-50 border-2 border-slate-100 px-5 rounded-2xl outline-none font-bold" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-50">
                 <button type="submit" className="flex-1 h-16 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-sm">
                   Save Card
                 </button>
                 {editingCard && (
                   <button type="button" onClick={() => { onRemoveCard(editingCard.id); setShowModal(false); }} className="h-16 px-6 bg-red-50 text-red-600 rounded-[1.5rem] font-black active:scale-[0.98] transition-all">
                     <Icons.Trash />
                   </button>
                 )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardManager;
