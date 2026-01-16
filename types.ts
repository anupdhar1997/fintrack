
export enum CardType {
  VISA = 'Visa',
  MASTERCARD = 'Mastercard',
  AMEX = 'American Express',
  DISCOVER = 'Discover',
  RUPAY = 'RuPay',
  OTHER = 'Other'
}

export enum TransactionCategory {
  FOOD = 'Food & Dining',
  SHOPPING = 'Shopping',
  TRANSPORT = 'Transportation',
  BILLS = 'Bills & Utilities',
  ENTERTAINMENT = 'Entertainment',
  HEALTH = 'Health & Wellness',
  TRAVEL = 'Travel',
  OTHER = 'Other'
}

export interface RewardMilestone {
  id: string;
  target: number;
  reward: string;
  label: string;
}

export interface CreditCard {
  id: string;
  bankName: string;
  lastFour: string;
  type: CardType;
  limit: number;
  balance: number;
  statementDate: number; 
  dueDate: number;
  color: string;
  variantName?: string;
  benefits?: string[];
  milestones?: RewardMilestone[];
  // Sync metadata
  syncStatus?: 'idle' | 'syncing' | 'completed' | 'failed';
  lastSynced?: string;
}

export interface Transaction {
  id: string;
  cardId: string;
  amount: number;
  date: string; 
  description: string;
  category: TransactionCategory;
}

export interface SpendingInsight {
  title: string;
  content: string;
  type: 'tip' | 'warning' | 'info';
}

export interface ParsedTransaction {
  amount: number;
  description: string;
  date: string;
  category: TransactionCategory;
  cardLastFour: string;
}
