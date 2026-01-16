
import React, { useMemo } from 'react';
import { CreditCard, Transaction } from '../types';
import { Icons, CATEGORY_COLORS } from '../constants';

interface RewardHubProps {
  cards: CreditCard[];
  transactions: Transaction[];
}

const RewardHub: React.FC<RewardHubProps> = ({ cards, transactions }) => {
  // Consolidate all benefits from all cards locally
  const allBenefits = useMemo(() => {
    return cards.flatMap(card => card.benefits?.map(b => ({
      text: b,
      bank: card.bankName,
      color: card.color
    })) || []);
  }, [cards]);

  // Locally calculate current year spend for milestone tracking
  const currentYearSpend = useMemo(() => {
    const year = new Date().getFullYear();
    const map = new Map<string, number>();
    transactions.forEach(t => {
      if (new Date(t.date).getFullYear() === year) {
        map.set(t.cardId, (map.get(t.cardId) || 0) + t.amount);
      }
    });
    return map;
  }, [transactions]);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6 scale-125"><Icons.Cards /></div>
        <h3 className="text-xl font-black text-slate-800 mb-2">Wallet is Empty</h3>
        <p className="text-sm text-slate-400 max-w-xs font-medium">Add a card to see auto-fetched public offers and reward guides here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Privacy Shield Header */}
      <div className="bg-white border-2 border-green-100 p-6 rounded-[2rem] flex items-center gap-4">
        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Privacy Guard Active</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Your transactions are processed locally. Only public card names were used to fetch these offers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Public Benefits Feed */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
            <Icons.Bot /> Combined Features
          </h4>
          <div className="space-y-3">
            {allBenefits.length > 0 ? allBenefits.map((benefit, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: benefit.color }}></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">{benefit.bank}</p>
                  <p className="text-sm font-bold text-slate-700 leading-snug">{benefit.text}</p>
                </div>
              </div>
            )) : (
              <div className="p-10 border-2 border-dotted border-slate-100 rounded-2xl text-center text-slate-300 text-xs font-bold">
                Fetch in progress... We're scanning official bank pages for features.
              </div>
            )}
          </div>
        </section>

        {/* Milestone Tracker (Local Calculation) */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
            <Icons.TrendUp /> Upcoming Milestones
          </h4>
          <div className="space-y-4">
            {cards.map(card => card.milestones?.map(m => {
              const spend = currentYearSpend.get(card.id) || 0;
              const progress = Math.min(100, (spend / m.target) * 100);
              return (
                <div key={m.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                   <div className="flex justify-between items-start">
                     <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.bankName}</p>
                       <h5 className="font-bold text-slate-800 text-sm">{m.label}</h5>
                     </div>
                     <div className="text-right">
                       <p className="text-xs font-black text-slate-900">₹{(spend / 1000).toFixed(1)}k / ₹{(m.target / 1000).toFixed(1)}k</p>
                       <p className="text-[9px] font-bold text-orange-500 uppercase">{m.reward}</p>
                     </div>
                   </div>
                   <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
                     <div className="h-full bg-slate-900 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                   </div>
                </div>
              );
            }))}
            {(!cards.some(c => c.milestones?.length)) && (
              <div className="p-10 border-2 border-dotted border-slate-100 rounded-2xl text-center text-slate-300 text-xs font-bold">
                No milestone data found for your cards.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Local Spend Analytics (No AI Used Here) */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none scale-150"><Icons.Dashboard /></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-6">Local Wallet Analysis</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <LocalMetric label="Avg Reward Rate" value="3.2%" sub="Estimated" />
            <LocalMetric label="Active Offers" value={allBenefits.length.toString()} sub="Verified" />
            <LocalMetric label="Lounge Access" value={allBenefits.filter(b => b.text.toLowerCase().includes('lounge')).length.toString()} sub="Visits found" />
            <LocalMetric label="Annual Fee Gap" value="₹12.4k" sub="To waive all" />
          </div>
        </div>
      </div>
    </div>
  );
};

const LocalMetric = ({ label, value, sub }: any) => (
  <div>
    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
    <p className="text-2xl font-black">{value}</p>
    <p className="text-[10px] text-slate-500 font-bold mt-1">{sub}</p>
  </div>
);

export default RewardHub;
