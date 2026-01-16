
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { CreditCard, Transaction } from '../types';
import { CATEGORY_COLORS, Icons } from '../constants';

interface DashboardProps {
  cards: CreditCard[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ cards, transactions }) => {
  const totalBalance = useMemo(() => cards.reduce((sum, c) => sum + c.balance, 0), [cards]);
  const totalLimit = useMemo(() => cards.reduce((sum, c) => sum + c.limit, 0), [cards]);
  const utilization = useMemo(() => totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0, [totalBalance, totalLimit]);

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions.slice(0, 50).forEach(tx => {
      data[tx.category] = (data[tx.category] || 0) + tx.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const weeklyActivity = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const total = transactions
        .filter(t => t.date.split('T')[0] === date)
        .reduce((sum, t) => sum + t.amount, 0);
      return { 
        date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }), 
        amount: total 
      };
    });
  }, [transactions]);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard icon={<Icons.Cards />} label="Total Debt" value={formatCurrency(totalBalance)} color="blue" />
        <SummaryCard icon={<Icons.TrendUp />} label="Credit Left" value={formatCurrency(totalLimit - totalBalance)} color="emerald" />
        <SummaryCard 
          icon={<Icons.Dashboard />} 
          label="Utilization" 
          value={`${utilization.toFixed(1)}%`} 
          color={utilization > 30 ? "orange" : "indigo"} 
          status={utilization > 30 ? "High" : "Good"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-lg font-black text-slate-800">Activity</h3>
            <span className="text-[10px] font-black uppercase text-slate-400">Weekly</span>
          </div>
          <div className="h-[250px] w-full overflow-x-auto no-scrollbar touch-auto">
            <div className="h-full min-w-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Categories Pie */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6 px-2">Categories</h3>
          <div className="h-[220px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value">
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} stroke="none" />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Spent</span>
              <span className="text-sm font-black text-slate-800">₹{(transactions.reduce((s,t) => s+t.amount, 0)/1000).toFixed(1)}k</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-1 px-2">
            {categoryData.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name] }}></div>
                <span className="text-[10px] font-bold text-slate-500 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, color, status }: any) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col group active:scale-[0.98] transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-50 text-${color}-600`}>{icon}</div>
      {status && <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-slate-50 text-slate-400 rounded-lg">{status}</span>}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
    <p className="text-xl font-black text-slate-800">{value}</p>
  </div>
);

export default Dashboard;
