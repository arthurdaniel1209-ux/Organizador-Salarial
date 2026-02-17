export enum AllocationType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export interface Expense {
  id: string;
  name: string;
  icon: string;
  value: number;
  type: AllocationType;
  color: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  deadline: string;
}

export interface OneTimeExpense {
  id: string;
  name: string;
  value: number;
}

export interface OneTimeGain {
  id: string;
  name: string;
  value: number;
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  cdiPercentage: number;
}

// FIX: Add UserData interface to be used in App.tsx.
export interface UserData {
  name: string;
  salary: number;
  fixed_expenses: Expense[];
  onetime_expenses: OneTimeExpense[];
  onetime_gains: OneTimeGain[];
  goals: Goal[];
  investments: Investment[];
  last_saved_month: number;
  previous_month_expenses: number;
  password?: string;
}
