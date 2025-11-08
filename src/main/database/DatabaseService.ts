import * as fs from 'fs';
import * as path from 'path';
import { EncryptionService } from '../services/EncryptionService';

interface DatabaseData {
  auth: Array<{ id: number; password_hash: string; created_at: string }>;
  profile: any;
  financial_goals: Array<{ id: number; goal_name: string; created_at: string }>;
  investment_preferences: Array<{ id: number; preference_name: string }>;
  expenses: any[];
  income: any[];
  banks: any[];
  cards: any[];
  investments: any[];
  goals: any[];
  budget: any;
  categories: Array<{ id: number; type: string; name: string; created_at: string }>;
  module_settings: Array<{ id: number; module_name: string; enabled: number }>;
  investment_types: Array<{ id: number; type_name: string }>;
}

export class DatabaseService {
  private dbPath: string;
  private dataPath: string;
  private encryption: EncryptionService;
  private data: DatabaseData;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.dataPath = dbPath.replace('.db', '.json');
    this.encryption = new EncryptionService();
    this.data = this.getDefaultData();
  }

  async initialize() {
    try {
      console.log('Initializing database at:', this.dataPath);
      console.log('Note: Each device has its own separate data file - fresh installs start with no data');
      
      // Load existing data or create new
      // On a fresh device, the file won't exist, so we create a new empty database
      if (fs.existsSync(this.dataPath)) {
        // Existing device - load data
        const fileContent = fs.readFileSync(this.dataPath, 'utf8');
        this.data = JSON.parse(fileContent);
        console.log('Loaded existing data from device');
      } else {
        // Fresh device - create new empty database
        this.data = this.getDefaultData();
        this.seedDefaultData();
        this.save();
        console.log('Created new database for this device (fresh install)');
      }
      
      console.log('Database initialized successfully');
    } catch (error: any) {
      console.error('Failed to initialize database:', error);
      console.error('Error details:', error?.message || error);
      // Start with empty data if file is corrupted (treat as fresh install)
      this.data = this.getDefaultData();
      this.seedDefaultData();
      this.save();
    }
  }

  private getDefaultData(): DatabaseData {
    return {
      auth: [],
      profile: null,
      financial_goals: [],
      investment_preferences: [],
      expenses: [],
      income: [],
      banks: [],
      cards: [],
      investments: [],
      goals: [],
      budget: null,
      categories: [],
      module_settings: [],
      investment_types: []
    };
  }

  private save() {
    try {
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  private getNextId(collection: any[]): number {
    if (collection.length === 0) return 1;
    return Math.max(...collection.map((item: any) => item.id || 0)) + 1;
  }

  private seedDefaultData() {
    // Seed default expense categories
    const defaultExpenseCategories = ['Food', 'Travel', 'Rent', 'Subscription', 'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 'Education', 'Misc'];
    defaultExpenseCategories.forEach(cat => {
      if (!this.data.categories.find(c => c.type === 'expense' && c.name === cat)) {
        this.data.categories.push({
          id: this.getNextId(this.data.categories),
          type: 'expense',
          name: cat,
          created_at: new Date().toISOString()
        });
      }
    });

    // Seed default payment modes
    const defaultPaymentModes = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Wallet'];
    defaultPaymentModes.forEach(mode => {
      if (!this.data.categories.find(c => c.type === 'payment_mode' && c.name === mode)) {
        this.data.categories.push({
          id: this.getNextId(this.data.categories),
          type: 'payment_mode',
          name: mode,
          created_at: new Date().toISOString()
        });
      }
    });

    // Seed default income sources
    const defaultIncomeSources = ['Salary', 'Freelance', 'Allowance', 'Investment Returns', 'Business', 'Rental Income', 'Other'];
    defaultIncomeSources.forEach(source => {
      if (!this.data.categories.find(c => c.type === 'income_source' && c.name === source)) {
        this.data.categories.push({
          id: this.getNextId(this.data.categories),
          type: 'income_source',
          name: source,
          created_at: new Date().toISOString()
        });
      }
    });

    // Seed default modules
    const modules = ['expenses', 'income', 'banks', 'cards', 'investments', 'goals', 'budget', 'metrics', 'insights'];
    modules.forEach(module => {
      if (!this.data.module_settings.find(m => m.module_name === module)) {
        this.data.module_settings.push({
          id: this.getNextId(this.data.module_settings),
          module_name: module,
          enabled: 1
        });
      }
    });

    // Seed default investment preferences
    const defaultPreferences = ['Mutual Funds', 'Stocks', 'Crypto', 'Gold', 'Real Estate', 'Bonds'];
    defaultPreferences.forEach(pref => {
      if (!this.data.investment_preferences.find(p => p.preference_name === pref)) {
        this.data.investment_preferences.push({
          id: this.getNextId(this.data.investment_preferences),
          preference_name: pref
        });
      }
    });
  }

  // Auth methods
  // Returns true if a password exists (existing user), false if no password (new device/setup needed)
  isAuthRequired(): boolean {
    // If auth array is empty, no password exists - show setup screen (fresh device)
    // If auth array has entries, password exists - show login screen (existing device)
    return this.data.auth.length > 0;
  }

  async setupMasterPassword(password: string): Promise<boolean> {
    try {
      const hash = await this.encryption.hashPassword(password);
      this.data.auth.push({
        id: this.getNextId(this.data.auth),
        password_hash: hash,
        created_at: new Date().toISOString()
      });
      this.save();
      console.log('Password setup successful');
      return true;
    } catch (error: any) {
      console.error('Error setting up password:', error);
      return false;
    }
  }

  async verifyMasterPassword(password: string): Promise<boolean> {
    try {
      if (this.data.auth.length === 0) return false;
      const latestAuth = this.data.auth[this.data.auth.length - 1];
      return await this.encryption.verifyPassword(password, latestAuth.password_hash);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  // Profile methods
  getProfile() {
    const goals = this.data.financial_goals.map(g => g.goal_name);
    const preferences = this.data.investment_preferences.map(p => p.preference_name);
    
    return {
      profile: this.data.profile || {},
      goals,
      preferences
    };
  }

  updateProfile(profileData: any): boolean {
    try {
      this.data.profile = {
        name: profileData.name || null,
        age: profileData.age || null,
        profession: profileData.profession || null,
        income_type: profileData.income_type || null,
        auto_lock_minutes: profileData.auto_lock_minutes || 5,
        emergency_fund_threshold: profileData.emergency_fund_threshold || 3,
        updated_at: new Date().toISOString()
      };

      // Update goals
      this.data.financial_goals = (profileData.goals || []).map((goal: string, index: number) => ({
        id: index + 1,
        goal_name: goal,
        created_at: new Date().toISOString()
      }));

      // Update preferences
      this.data.investment_preferences = (profileData.preferences || []).map((pref: string, index: number) => ({
        id: index + 1,
        preference_name: pref
      }));

      this.save();
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  // Expense methods
  addExpense(expenseData: any) {
    try {
      const expense = {
        id: this.getNextId(this.data.expenses),
        date: expenseData.date,
        amount: expenseData.amount,
        category: expenseData.category,
        comments: expenseData.comments || null,
        payment_mode: expenseData.payment_mode,
        created_at: new Date().toISOString()
      };
      this.data.expenses.push(expense);
      this.save();
      return expense;
    } catch (error) {
      console.error('Error adding expense:', error);
      return null;
    }
  }

  getExpenses(filters?: any) {
    try {
      let expenses = [...this.data.expenses];

      if (filters?.startDate) {
        expenses = expenses.filter(e => e.date >= filters.startDate);
      }
      if (filters?.endDate) {
        expenses = expenses.filter(e => e.date <= filters.endDate);
      }
      if (filters?.category) {
        expenses = expenses.filter(e => e.category === filters.category);
      }

      return expenses.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        return dateCompare !== 0 ? dateCompare : b.id - a.id;
      });
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  }

  updateExpense(id: number, expenseData: any): boolean {
    try {
      const index = this.data.expenses.findIndex(e => e.id === id);
      if (index === -1) return false;
      
      this.data.expenses[index] = {
        ...this.data.expenses[index],
        date: expenseData.date,
        amount: expenseData.amount,
        category: expenseData.category,
        comments: expenseData.comments || null,
        payment_mode: expenseData.payment_mode
      };
      this.save();
      return true;
    } catch (error) {
      console.error('Error updating expense:', error);
      return false;
    }
  }

  deleteExpense(id: number): boolean {
    try {
      const index = this.data.expenses.findIndex(e => e.id === id);
      if (index === -1) return false;
      this.data.expenses.splice(index, 1);
      this.save();
      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
  }

  // Income methods
  addIncome(incomeData: any) {
    try {
      const income = {
        id: this.getNextId(this.data.income),
        date: incomeData.date,
        source: incomeData.source,
        amount: incomeData.amount,
        frequency: incomeData.frequency || null,
        mode: incomeData.mode,
        taxable: incomeData.taxable ? 1 : 0,
        comments: incomeData.comments || null,
        created_at: new Date().toISOString()
      };
      this.data.income.push(income);
      this.save();
      return income;
    } catch (error) {
      console.error('Error adding income:', error);
      return null;
    }
  }

  getIncomes(filters?: any) {
    try {
      let incomes = [...this.data.income];

      if (filters?.startDate) {
        incomes = incomes.filter(i => i.date >= filters.startDate);
      }
      if (filters?.endDate) {
        incomes = incomes.filter(i => i.date <= filters.endDate);
      }
      if (filters?.source) {
        incomes = incomes.filter(i => i.source === filters.source);
      }

      return incomes.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        return dateCompare !== 0 ? dateCompare : b.id - a.id;
      });
    } catch (error) {
      console.error('Error getting incomes:', error);
      return [];
    }
  }

  updateIncome(id: number, incomeData: any): boolean {
    try {
      const index = this.data.income.findIndex(i => i.id === id);
      if (index === -1) return false;
      
      this.data.income[index] = {
        ...this.data.income[index],
        date: incomeData.date,
        source: incomeData.source,
        amount: incomeData.amount,
        frequency: incomeData.frequency || null,
        mode: incomeData.mode,
        taxable: incomeData.taxable ? 1 : 0,
        comments: incomeData.comments || null
      };
      this.save();
      return true;
    } catch (error) {
      console.error('Error updating income:', error);
      return false;
    }
  }

  deleteIncome(id: number): boolean {
    try {
      const index = this.data.income.findIndex(i => i.id === id);
      if (index === -1) return false;
      this.data.income.splice(index, 1);
      this.save();
      return true;
    } catch (error) {
      console.error('Error deleting income:', error);
      return false;
    }
  }

  // Bank methods
  addBank(bankData: any) {
    try {
      const bank = {
        id: this.getNextId(this.data.banks),
        bank_name: bankData.bank_name,
        account_holder: bankData.account_holder,
        account_number_encrypted: bankData.account_number, // Simplified for now
        ifsc_code: bankData.ifsc_code || null,
        upi_id: bankData.upi_id || null,
        registered_phone_encrypted: bankData.registered_phone || null,
        netbanking_id_encrypted: bankData.netbanking_id || null,
        comments: bankData.comments || null,
        created_at: new Date().toISOString()
      };
      this.data.banks.push(bank);
      this.save();
      return bank;
    } catch (error) {
      console.error('Error adding bank:', error);
      return null;
    }
  }

  getBanks() {
    try {
      return this.data.banks.map(bank => ({
        ...bank,
        account_number: this.encryption.maskData(bank.account_number_encrypted || ''),
        registered_phone: bank.registered_phone_encrypted ? this.encryption.maskData(bank.registered_phone_encrypted) : null,
        netbanking_id: bank.netbanking_id_encrypted ? this.encryption.maskData(bank.netbanking_id_encrypted) : null,
      }));
    } catch (error) {
      console.error('Error getting banks:', error);
      return [];
    }
  }

  async getBankFullDetails(id: number, password: string): Promise<any | null> {
    try {
      // Verify password first
      if (!await this.verifyMasterPassword(password)) {
        return null;
      }

      const bank = this.data.banks.find(b => b.id === id);
      if (!bank) return null;

      // Return full unmasked details
      return {
        ...bank,
        account_number: bank.account_number_encrypted || '',
        registered_phone: bank.registered_phone_encrypted || null,
        netbanking_id: bank.netbanking_id_encrypted || null,
      };
    } catch (error) {
      console.error('Error getting full bank details:', error);
      return null;
    }
  }

  updateBank(id: number, bankData: any): boolean {
    try {
      const index = this.data.banks.findIndex(b => b.id === id);
      if (index === -1) return false;
      
      this.data.banks[index] = {
        ...this.data.banks[index],
        bank_name: bankData.bank_name,
        account_holder: bankData.account_holder,
        account_number_encrypted: bankData.account_number,
        ifsc_code: bankData.ifsc_code || null,
        upi_id: bankData.upi_id || null,
        registered_phone_encrypted: bankData.registered_phone || null,
        netbanking_id_encrypted: bankData.netbanking_id || null,
        comments: bankData.comments || null
      };
      this.save();
      return true;
    } catch (error) {
      console.error('Error updating bank:', error);
      return false;
    }
  }

  deleteBank(id: number): boolean {
    try {
      const index = this.data.banks.findIndex(b => b.id === id);
      if (index === -1) return false;
      this.data.banks.splice(index, 1);
      this.save();
      return true;
    } catch (error) {
      console.error('Error deleting bank:', error);
      return false;
    }
  }

  // Card methods
  addCard(cardData: any) {
    try {
      const card = {
        id: this.getNextId(this.data.cards),
        bank_name: cardData.bank_name,
        card_type: cardData.card_type,
        card_number_encrypted: cardData.card_number,
        expiry_date: cardData.expiry_date || null,
        billing_cycle: cardData.card_type === 'Credit' ? cardData.billing_cycle : null,
        credit_limit: cardData.card_type === 'Credit' ? cardData.credit_limit : null,
        current_due: cardData.card_type === 'Credit' ? cardData.current_due : null,
        comments: cardData.comments || null,
        created_at: new Date().toISOString()
      };
      this.data.cards.push(card);
      this.save();
      return card;
    } catch (error) {
      console.error('Error adding card:', error);
      return null;
    }
  }

  getCards() {
    try {
      return this.data.cards.map(card => ({
        ...card,
        card_number: this.encryption.maskData(card.card_number_encrypted || '', 4),
      }));
    } catch (error) {
      console.error('Error getting cards:', error);
      return [];
    }
  }

  updateCard(id: number, cardData: any): boolean {
    try {
      const index = this.data.cards.findIndex(c => c.id === id);
      if (index === -1) return false;
      
      this.data.cards[index] = {
        ...this.data.cards[index],
        bank_name: cardData.bank_name,
        card_type: cardData.card_type,
        card_number_encrypted: cardData.card_number,
        expiry_date: cardData.expiry_date || null,
        billing_cycle: cardData.card_type === 'Credit' ? cardData.billing_cycle : null,
        credit_limit: cardData.card_type === 'Credit' ? cardData.credit_limit : null,
        current_due: cardData.card_type === 'Credit' ? cardData.current_due : null,
        comments: cardData.comments || null
      };
      this.save();
      return true;
    } catch (error) {
      console.error('Error updating card:', error);
      return false;
    }
  }

  deleteCard(id: number): boolean {
    try {
      const index = this.data.cards.findIndex(c => c.id === id);
      if (index === -1) return false;
      this.data.cards.splice(index, 1);
      this.save();
      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      return false;
    }
  }

  // Investment methods
  addInvestment(investmentData: any) {
    try {
      const investment = {
        id: this.getNextId(this.data.investments),
        investment_type: investmentData.investment_type,
        name: investmentData.name,
        platform: investmentData.platform || null,
        amount_invested: investmentData.amount_invested,
        date_of_entry: investmentData.date_of_entry,
        current_valuation: investmentData.current_valuation || investmentData.amount_invested,
        expected_roi: investmentData.expected_roi || null,
        interest_rate: investmentData.interest_rate || null,
        maturity_date: investmentData.maturity_date || null,
        tax_flag: investmentData.tax_flag || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.investments.push(investment);
      this.save();
      return investment;
    } catch (error) {
      console.error('Error adding investment:', error);
      return null;
    }
  }

  getInvestments() {
    try {
      return [...this.data.investments].sort((a, b) => b.date_of_entry.localeCompare(a.date_of_entry));
    } catch (error) {
      console.error('Error getting investments:', error);
      return [];
    }
  }

  updateInvestment(id: number, investmentData: any): boolean {
    try {
      const index = this.data.investments.findIndex(i => i.id === id);
      if (index === -1) return false;
      
      this.data.investments[index] = {
        ...this.data.investments[index],
        investment_type: investmentData.investment_type,
        name: investmentData.name,
        platform: investmentData.platform || null,
        amount_invested: investmentData.amount_invested,
        date_of_entry: investmentData.date_of_entry,
        current_valuation: investmentData.current_valuation,
        expected_roi: investmentData.expected_roi || null,
        interest_rate: investmentData.interest_rate || null,
        maturity_date: investmentData.maturity_date || null,
        tax_flag: investmentData.tax_flag || null,
        updated_at: new Date().toISOString()
      };
      this.save();
      return true;
    } catch (error) {
      console.error('Error updating investment:', error);
      return false;
    }
  }

  deleteInvestment(id: number): boolean {
    try {
      const index = this.data.investments.findIndex(i => i.id === id);
      if (index === -1) return false;
      this.data.investments.splice(index, 1);
      this.save();
      return true;
    } catch (error) {
      console.error('Error deleting investment:', error);
      return false;
    }
  }

  // Goal methods
  addGoal(goalData: any) {
    try {
      const goal = {
        id: this.getNextId(this.data.goals),
        goal_name: goalData.goal_name,
        target_amount: goalData.target_amount,
        start_date: goalData.start_date,
        target_date: goalData.target_date,
        monthly_allocation: goalData.monthly_allocation || null,
        current_saved: goalData.current_saved || 0,
        status: goalData.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.goals.push(goal);
      this.save();
      return goal;
    } catch (error) {
      console.error('Error adding goal:', error);
      return null;
    }
  }

  getGoals() {
    try {
      return [...this.data.goals].sort((a, b) => {
        if (a.status !== b.status) {
          const statusOrder = { 'active': 0, 'completed': 1, 'archived': 2 };
          return (statusOrder[a.status as keyof typeof statusOrder] || 3) - (statusOrder[b.status as keyof typeof statusOrder] || 3);
        }
        return a.target_date.localeCompare(b.target_date);
      });
    } catch (error) {
      console.error('Error getting goals:', error);
      return [];
    }
  }

  updateGoal(id: number, goalData: any): boolean {
    try {
      const index = this.data.goals.findIndex(g => g.id === id);
      if (index === -1) return false;
      
      this.data.goals[index] = {
        ...this.data.goals[index],
        goal_name: goalData.goal_name,
        target_amount: goalData.target_amount,
        start_date: goalData.start_date,
        target_date: goalData.target_date,
        monthly_allocation: goalData.monthly_allocation || null,
        current_saved: goalData.current_saved || 0,
        status: goalData.status || 'active',
        updated_at: new Date().toISOString()
      };
      this.save();
      return true;
    } catch (error) {
      console.error('Error updating goal:', error);
      return false;
    }
  }

  deleteGoal(id: number): boolean {
    try {
      const index = this.data.goals.findIndex(g => g.id === id);
      if (index === -1) return false;
      this.data.goals.splice(index, 1);
      this.save();
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  }

  // Budget methods
  getBudget() {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      if (!this.data.budget || (this.data.budget as any).month !== month || (this.data.budget as any).year !== year) {
        this.data.budget = {
          id: 1,
          essentials: 0,
          leisure: 0,
          emis_debts: 0,
          savings_investments: 0,
          month,
          year,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        this.save();
      }

      return this.data.budget;
    } catch (error) {
      console.error('Error getting budget:', error);
      return {
        id: 1,
        essentials: 0,
        leisure: 0,
        emis_debts: 0,
        savings_investments: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  updateBudget(budgetData: any): boolean {
    try {
      const now = new Date();
      const month = budgetData.month || now.getMonth() + 1;
      const year = budgetData.year || now.getFullYear();

      const existingBudget = this.data.budget as any;
      this.data.budget = {
        id: 1,
        essentials: budgetData.essentials || 0,
        leisure: budgetData.leisure || 0,
        emis_debts: budgetData.emis_debts || 0,
        savings_investments: budgetData.savings_investments || 0,
        month,
        year,
        created_at: existingBudget?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.save();
      return true;
    } catch (error) {
      console.error('Error updating budget:', error);
      return false;
    }
  }

  // Module settings
  getModuleSettings() {
    try {
      const settings: any = {};
      this.data.module_settings.forEach(mod => {
        settings[mod.module_name] = mod.enabled === 1;
      });
      return settings;
    } catch (error) {
      console.error('Error getting module settings:', error);
      return {};
    }
  }

  updateModuleSettings(settings: any): boolean {
    try {
      Object.keys(settings).forEach(moduleName => {
        const index = this.data.module_settings.findIndex(m => m.module_name === moduleName);
        if (index !== -1) {
          this.data.module_settings[index].enabled = settings[moduleName] ? 1 : 0;
        } else {
          this.data.module_settings.push({
            id: this.getNextId(this.data.module_settings),
            module_name: moduleName,
            enabled: settings[moduleName] ? 1 : 0
          });
        }
      });
      this.save();
      return true;
    } catch (error) {
      console.error('Error updating module settings:', error);
      return false;
    }
  }

  // Categories
  getCategories(type: string) {
    try {
      return this.data.categories
        .filter(c => c.type === type)
        .map(c => c.name)
        .sort();
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  addCategory(type: string, name: string): boolean {
    try {
      if (!this.data.categories.find(c => c.type === type && c.name === name)) {
        this.data.categories.push({
          id: this.getNextId(this.data.categories),
          type,
          name,
          created_at: new Date().toISOString()
        });
        this.save();
      }
      return true;
    } catch (error) {
      console.error('Error adding category:', error);
      return false;
    }
  }

  // Backup and restore
  exportAllData() {
    try {
      return {
        profile: this.getProfile(),
        expenses: this.getExpenses(),
        incomes: this.getIncomes(),
        banks: this.getBanks(),
        cards: this.getCards(),
        investments: this.getInvestments(),
        goals: this.getGoals(),
        budget: this.getBudget(),
        categories: {
          expense: this.getCategories('expense'),
          payment_mode: this.getCategories('payment_mode'),
          income_source: this.getCategories('income_source')
        },
        moduleSettings: this.getModuleSettings(),
        exportDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  importData(data: any): boolean {
    try {
      if (data.profile) {
        this.updateProfile(data.profile);
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  wipeAllData(): boolean {
    try {
      this.data = this.getDefaultData();
      this.save();
      return true;
    } catch (error) {
      console.error('Error wiping data:', error);
      return false;
    }
  }

  // Delete the data file completely (for complete reset)
  deleteDataFile(): boolean {
    try {
      if (fs.existsSync(this.dataPath)) {
        fs.unlinkSync(this.dataPath);
        console.log('Data file deleted:', this.dataPath);
        return true;
      }
      return true; // File doesn't exist, consider it successful
    } catch (error) {
      console.error('Error deleting data file:', error);
      return false;
    }
  }

  close() {
    // JSON storage doesn't need explicit closing
    this.save();
  }
}
