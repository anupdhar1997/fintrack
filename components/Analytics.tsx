
import React, { useMemo, useState } from 'react';
import { CreditCard, Transaction } from '../types';
import { Icons, CATEGORY_COLORS } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

interface AnalyticsProps {
  cards: CreditCard[];
  transactions: Transaction[];
}

const Analytics: React.FC<AnalyticsProps> = ({ cards, transactions }) => {
  const [selectedCardId, setSelectedCardId] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    if (selectedCardId === 'all') return transactions;
    return transactions.filter(t => t.cardId === selectedCardId);
  }, [transactions, selectedCardId]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(currentMonth / 3);
    const currentHalf = Math.floor(currentMonth / 6);

    let daily = 0;
    let monthly = 0;
    let quarterly = 0;
    let halfYearly = 0;
    let yearly = 0;

    filteredTransactions.forEach(t => {
      const tDate = new Date(t.date);
      const tYear = tDate.getFullYear();
      const tMonth = tDate.getMonth();
      const tQuarter = Math.floor(tMonth / 3);
      const tHalf = Math.floor(tMonth / 6);

      if (tYear === currentYear) {
        yearly += t.amount;
        if (tHalf === currentHalf) halfYearly += t.amount;
        if (tQuarter === currentQuarter) quarterly += t.amount;
        if (tMonth === currentMonth) monthly += t.amount;
        if (t.date.split('T')[0] === today) daily += t.amount;
      }
    });

    return { daily, monthly, quarterly, halfYearly, yearly };
  }, [filteredTransactions]);

  const cardBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach(t => {
      map.set(t.cardId, (map.get(t.cardId) || 0) + t.amount);
    });
    return cards.map(c => ({
      name: c.bankName,
      amount: map.get(c.id) || 0,
      color: c.color,
      variant: c.variantName
    })).sort((a, b) => b.amount - a.amount);
  }, [cards, transactions]);

  const categoryPieData = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions.forEach(t => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  return (
    <div className="space-y-8 pb-10 animate-fadeIn">
      {/* Header with Card Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800">Spending Analysis</h3>
          <p className="text-sm text-slate-400 font-medium">Local processing • No data leaks</p>
        </div>
        <select 
          value={selectedCardId}
          onChange={(e) => setSelectedCardId(e.target.value)}
          className="h-12 bg-white border border-slate-200 px-4 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[180px]"
        >
          <option value="all">All Cards Combined</option>
          {cards.map(c => (
            <option key={c.id} value={c.id}>{c.bankName} (••{c.lastFour})</option>
          ))}
        </select>
      </div>

      {/* Main Period Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <PeriodStat label="Today" value={stats.daily} color="blue" />
        <PeriodStat label="This Month" value={stats.monthly} color="emerald" />
        <PeriodStat label="Quarter" value={stats.quarterly} color="indigo" />
        <PeriodStat label="Half-Year" value={stats.halfYearly} color="orange" />
        <PeriodStat label="Full Year" value={stats.yearly} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Distribution */}
        <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-8">
             <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Spend by Category</h4>
             <span className="text-[10px] font-black text-blue-500 uppercase">Interactive</span>
           </div>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={categoryPieData} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} width={100} />
                 <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                 <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                   {categoryPieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Card-wise Share */}
        <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
           <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-8">Wallet Contribution</h4>
           <div className="flex-1 space-y-4">
             {cardBreakdown.map((card, idx) => (
               <div key={idx} className="flex items-center gap-4 group">
                 <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white font-black text-xs shadow-lg" style={{ background: card.color }}>
                   {card.name[0]}
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-end mb-1">
                     <p className="text-sm font-bold text-slate-700 truncate">{card.name}</p>
                     <p className="text-sm font-black text-slate-900">₹{card.amount.toLocaleString()}</p>
                   </div>
                   <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                     <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ 
                          background: card.color, 
                          width: `${(card.amount / (cardBreakdown.reduce((s,c) => s+c.amount, 0) || 1)) * 100}%` 
                        }}
                      ></div>
                   </div>
                 </div>
               </div>
             ))}
             {cardBreakdown.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full text-slate-300">
                 <Icons.Cards />
                 <p className="text-xs font-bold mt-2">No data yet</p>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none scale-[3]"><Icons.TrendUp /></div>
         <div className="relative z-10">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-8">12-Month Performance</h4>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={generateMonthlyTrend(filteredTransactions)}>
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 4, 4]} opacity={0.8} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} />
                 </BarChart>
              </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

const PeriodStat = ({ label, value, color }: any) => (
  <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:border-blue-200 transition-all">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-lg font-black text-${color}-600`}>₹{value.toLocaleString()}</p>
  </div>
);

const generateMonthlyTrend = (txs: Transaction[]) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const currentYear = now.getFullYear();
  
  const data = months.map((m, i) => {
    const total = txs
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === i && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: m, amount: total };
  });

  return data;
};

export default Analytics;
