
// FIX: Removed self-import which was causing declaration conflicts.
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

export interface UserData {
  salary: number;
  password: string;
  fixedExpenses: Expense[];
  oneTimeExpenses: OneTimeExpense[];
  oneTimeGains: OneTimeGain[];
  goals: Goal[];
  investments: Investment[];
  lastSavedMonth: number;
  previousMonthExpenses: number;
}
