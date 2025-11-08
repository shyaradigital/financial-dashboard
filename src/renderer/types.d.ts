// Type definitions for Electron API
export interface ElectronAPI {
  // Authentication
  checkAuthRequired: () => Promise<boolean>;
  setupMasterPassword: (password: string) => Promise<boolean>;
  verifyMasterPassword: (password: string) => Promise<boolean>;
  lockApp: () => Promise<boolean>;
  onAutoLock: (callback: () => void) => void;
  userActivity: () => void;

  // Profile
  getProfile: () => Promise<any>;
  updateProfile: (profileData: any) => Promise<boolean>;

  // Expenses
  addExpense: (expenseData: any) => Promise<any>;
  getExpenses: (filters?: any) => Promise<any[]>;
  updateExpense: (id: number, expenseData: any) => Promise<boolean>;
  deleteExpense: (id: number) => Promise<boolean>;

  // Income
  addIncome: (incomeData: any) => Promise<any>;
  getIncomes: (filters?: any) => Promise<any[]>;
  updateIncome: (id: number, incomeData: any) => Promise<boolean>;
  deleteIncome: (id: number) => Promise<boolean>;

  // Banks
  addBank: (bankData: any) => Promise<any>;
  getBanks: () => Promise<any[]>;
  getBankFullDetails: (id: number, password: string) => Promise<any | null>;
  updateBank: (id: number, bankData: any) => Promise<boolean>;
  deleteBank: (id: number) => Promise<boolean>;

  // Cards
  addCard: (cardData: any) => Promise<any>;
  getCards: () => Promise<any[]>;
  updateCard: (id: number, cardData: any) => Promise<boolean>;
  deleteCard: (id: number) => Promise<boolean>;

  // Investments
  addInvestment: (investmentData: any) => Promise<any>;
  getInvestments: () => Promise<any[]>;
  updateInvestment: (id: number, investmentData: any) => Promise<boolean>;
  deleteInvestment: (id: number) => Promise<boolean>;

  // Goals
  addGoal: (goalData: any) => Promise<any>;
  getGoals: () => Promise<any[]>;
  updateGoal: (id: number, goalData: any) => Promise<boolean>;
  deleteGoal: (id: number) => Promise<boolean>;

  // Budget
  getBudget: () => Promise<any>;
  updateBudget: (budgetData: any) => Promise<boolean>;

  // Module settings
  getModuleSettings: () => Promise<any>;
  updateModuleSettings: (settings: any) => Promise<boolean>;

  // Categories
  getCategories: (type: string) => Promise<string[]>;
  addCategory: (type: string, name: string) => Promise<boolean>;

  // Backup & Restore
  exportData: () => Promise<any>;
  importData: (data: any) => Promise<boolean>;
  wipeAllData: () => Promise<boolean>;
  resetAllData: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}


