import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication
  checkAuthRequired: () => ipcRenderer.invoke('check-auth-required'),
  setupMasterPassword: (password: string) => ipcRenderer.invoke('setup-master-password', password),
  verifyMasterPassword: (password: string) => ipcRenderer.invoke('verify-master-password', password),
  lockApp: () => ipcRenderer.invoke('lock-app'),
  onAutoLock: (callback: () => void) => ipcRenderer.on('auto-lock', callback),
  userActivity: () => ipcRenderer.send('user-activity'),

  // Profile
  getProfile: () => ipcRenderer.invoke('get-profile'),
  updateProfile: (profileData: any) => ipcRenderer.invoke('update-profile', profileData),

  // Expenses
  addExpense: (expenseData: any) => ipcRenderer.invoke('add-expense', expenseData),
  getExpenses: (filters?: any) => ipcRenderer.invoke('get-expenses', filters),
  updateExpense: (id: number, expenseData: any) => ipcRenderer.invoke('update-expense', id, expenseData),
  deleteExpense: (id: number) => ipcRenderer.invoke('delete-expense', id),

  // Income
  addIncome: (incomeData: any) => ipcRenderer.invoke('add-income', incomeData),
  getIncomes: (filters?: any) => ipcRenderer.invoke('get-incomes', filters),
  updateIncome: (id: number, incomeData: any) => ipcRenderer.invoke('update-income', id, incomeData),
  deleteIncome: (id: number) => ipcRenderer.invoke('delete-income', id),

  // Banks
  addBank: (bankData: any) => ipcRenderer.invoke('add-bank', bankData),
  getBanks: () => ipcRenderer.invoke('get-banks'),
  getBankFullDetails: (id: number, password: string) => ipcRenderer.invoke('get-bank-full-details', id, password),
  updateBank: (id: number, bankData: any) => ipcRenderer.invoke('update-bank', id, bankData),
  deleteBank: (id: number) => ipcRenderer.invoke('delete-bank', id),

  // Cards
  addCard: (cardData: any) => ipcRenderer.invoke('add-card', cardData),
  getCards: () => ipcRenderer.invoke('get-cards'),
  updateCard: (id: number, cardData: any) => ipcRenderer.invoke('update-card', id, cardData),
  deleteCard: (id: number) => ipcRenderer.invoke('delete-card', id),

  // Investments
  addInvestment: (investmentData: any) => ipcRenderer.invoke('add-investment', investmentData),
  getInvestments: () => ipcRenderer.invoke('get-investments'),
  updateInvestment: (id: number, investmentData: any) => ipcRenderer.invoke('update-investment', id, investmentData),
  deleteInvestment: (id: number) => ipcRenderer.invoke('delete-investment', id),

  // Goals
  addGoal: (goalData: any) => ipcRenderer.invoke('add-goal', goalData),
  getGoals: () => ipcRenderer.invoke('get-goals'),
  updateGoal: (id: number, goalData: any) => ipcRenderer.invoke('update-goal', id, goalData),
  deleteGoal: (id: number) => ipcRenderer.invoke('delete-goal', id),

  // Budget
  getBudget: () => ipcRenderer.invoke('get-budget'),
  updateBudget: (budgetData: any) => ipcRenderer.invoke('update-budget', budgetData),

  // Module settings
  getModuleSettings: () => ipcRenderer.invoke('get-module-settings'),
  updateModuleSettings: (settings: any) => ipcRenderer.invoke('update-module-settings', settings),

  // Categories
  getCategories: (type: string) => ipcRenderer.invoke('get-categories', type),
  addCategory: (type: string, name: string) => ipcRenderer.invoke('add-category', type, name),

  // Backup & Restore
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: (data: any) => ipcRenderer.invoke('import-data', data),
  wipeAllData: () => ipcRenderer.invoke('wipe-all-data'),
  resetAllData: () => ipcRenderer.invoke('reset-all-data'),
});


