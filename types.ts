
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
