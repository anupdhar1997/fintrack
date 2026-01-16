
import React from 'react';

export const COLORS = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
};

export const PREMIUM_GRADIENTS = [
  { name: 'Obsidian', value: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)' },
  { name: 'Midnight Gold', value: 'linear-gradient(135deg, #1e293b 0%, #475569 50%, #1e293b 100%)' },
  { name: 'Electric Blue', value: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' },
  { name: 'Rose Metal', value: 'linear-gradient(135deg, #4c0519 0%, #9f1239 100%)' },
  { name: 'Deep Emerald', value: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' },
  { name: 'Purple Royale', value: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)' }
];

export const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
  ),
  Cards: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
  ),
  Transactions: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Analytics: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  ),
  Bell: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
  ),
  TrendUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
  ),
  Bot: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
  ),
  Network: (type: string) => {
    switch (type) {
      case 'Visa': return <span className="italic font-black text-lg">VISA</span>;
      case 'Mastercard': return <div className="flex -space-x-2"><div className="w-5 h-5 rounded-full bg-red-500 opacity-80"></div><div className="w-5 h-5 rounded-full bg-yellow-500 opacity-80"></div></div>;
      case 'American Express': return <span className="font-bold border border-current px-1 text-[10px]">AMEX</span>;
      case 'RuPay': return <span className="font-black tracking-tighter italic">RuPay<span className="text-[8px] align-top">▶</span></span>;
      default: return <span className="text-[10px] font-bold opacity-50 uppercase">Network</span>;
    }
  },
  Chip: () => (
    <div className="w-10 h-8 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-lg relative overflow-hidden shadow-inner border border-yellow-300/50">
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
        <div className="border border-black/20"></div><div className="border border-black/20"></div><div className="border border-black/20"></div>
        <div className="border border-black/20"></div><div className="border border-black/20"></div><div className="border border-black/20"></div>
        <div className="border border-black/20"></div><div className="border border-black/20"></div><div className="border border-black/20"></div>
      </div>
    </div>
  )
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#f87171',
  'Shopping': '#60a5fa',
  'Transportation': '#34d399',
  'Bills & Utilities': '#fbbf24',
  'Entertainment': '#a78bfa',
  'Health & Wellness': '#f472b6',
  'Travel': '#2dd4bf',
  'Other': '#94a3b8'
};
