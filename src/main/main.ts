import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { DatabaseService } from './database/DatabaseService';
import { EncryptionService } from './services/EncryptionService';

let mainWindow: BrowserWindow | null = null;
let databaseService: DatabaseService | null = null;
let inactivityTimer: NodeJS.Timeout | null = null;
let isLocked = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open DevTools only in development mode (can be toggled)
  // Uncomment the line below if you need DevTools:
  // mainWindow.webContents.openDevTools();

  // Log any errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer ${level}]:`, message);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (databaseService) {
      databaseService.close();
    }
    app.quit();
  }
});

// Inactivity tracking
function resetInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  
  // Auto-lock after 5 minutes of inactivity
  inactivityTimer = setTimeout(() => {
    if (!isLocked && mainWindow) {
      isLocked = true;
      mainWindow.webContents.send('auto-lock');
    }
  }, 5 * 60 * 1000); // 5 minutes
}

// Track user activity
ipcMain.on('user-activity', () => {
  if (!isLocked) {
    resetInactivityTimer();
  }
});

// Authentication handlers
// Note: Each device has its own separate data file in the user's app data directory
// Windows: %APPDATA%\Financial Dashboard\financial-data.json
// Linux: ~/.config/Financial Dashboard/financial-data.json
// macOS: ~/Library/Application Support/Financial Dashboard/financial-data.json
// This ensures each device starts fresh with no shared data
ipcMain.handle('check-auth-required', async () => {
  try {
    const userDataPath = app.getPath('userData'); // Device-specific directory
    const dbPath = path.join(userDataPath, 'financial-data.db');
    console.log('Database path (device-specific):', dbPath);
    const db = new DatabaseService(dbPath);
    await db.initialize();
    const required = db.isAuthRequired();
    db.close();
    return required;
  } catch (error: any) {
    console.error('Error checking auth - Database may not be initialized:', error);
    console.error('Error details:', error?.message || 'Unknown error');
    // Return false to allow app to load without database (fresh install scenario)
    return false;
  }
});

ipcMain.handle('setup-master-password', async (event, password: string) => {
  try {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'financial-data.db');
    
    if (!databaseService) {
      databaseService = new DatabaseService(dbPath);
      await databaseService.initialize();
    }
    
    const result = await databaseService.setupMasterPassword(password);
    if (result) {
      isLocked = false;
      resetInactivityTimer();
    }
    return result;
  } catch (error) {
    console.error('Error setting up password:', error);
    return false;
  }
});

ipcMain.handle('verify-master-password', async (event, password: string) => {
  try {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'financial-data.db');
    
    if (!databaseService) {
      databaseService = new DatabaseService(dbPath);
      await databaseService.initialize();
    }
    
    const result = await databaseService.verifyMasterPassword(password);
    if (result) {
      isLocked = false;
      resetInactivityTimer();
    }
    return result;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
});

ipcMain.handle('lock-app', async () => {
  isLocked = true;
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  return true;
});

// Profile handlers
ipcMain.handle('get-profile', async () => {
  if (!databaseService) return null;
  return databaseService.getProfile();
});

ipcMain.handle('update-profile', async (event, profileData: any) => {
  if (!databaseService) return false;
  return databaseService.updateProfile(profileData);
});

// Expense handlers
ipcMain.handle('add-expense', async (event, expenseData: any) => {
  if (!databaseService) return null;
  return databaseService.addExpense(expenseData);
});

ipcMain.handle('get-expenses', async (event, filters?: any) => {
  if (!databaseService) return [];
  return databaseService.getExpenses(filters);
});

ipcMain.handle('update-expense', async (event, id: number, expenseData: any) => {
  if (!databaseService) return false;
  return databaseService.updateExpense(id, expenseData);
});

ipcMain.handle('delete-expense', async (event, id: number) => {
  if (!databaseService) return false;
  return databaseService.deleteExpense(id);
});

// Income handlers
ipcMain.handle('add-income', async (event, incomeData: any) => {
  if (!databaseService) return null;
  return databaseService.addIncome(incomeData);
});

ipcMain.handle('get-incomes', async (event, filters?: any) => {
  if (!databaseService) return [];
  return databaseService.getIncomes(filters);
});

ipcMain.handle('update-income', async (event, id: number, incomeData: any) => {
  if (!databaseService) return false;
  return databaseService.updateIncome(id, incomeData);
});

ipcMain.handle('delete-income', async (event, id: number) => {
  if (!databaseService) return false;
  return databaseService.deleteIncome(id);
});

// Bank Info handlers
ipcMain.handle('add-bank', async (event, bankData: any) => {
  if (!databaseService) return null;
  return databaseService.addBank(bankData);
});

ipcMain.handle('get-banks', async () => {
  if (!databaseService) return [];
  return databaseService.getBanks();
});

ipcMain.handle('get-bank-full-details', async (event, id: number, password: string) => {
  if (!databaseService) return null;
  return databaseService.getBankFullDetails(id, password);
});

ipcMain.handle('update-bank', async (event, id: number, bankData: any) => {
  if (!databaseService) return false;
  return databaseService.updateBank(id, bankData);
});

ipcMain.handle('delete-bank', async (event, id: number) => {
  if (!databaseService) return false;
  return databaseService.deleteBank(id);
});

// Card handlers
ipcMain.handle('add-card', async (event, cardData: any) => {
  if (!databaseService) return null;
  return databaseService.addCard(cardData);
});

ipcMain.handle('get-cards', async () => {
  if (!databaseService) return [];
  return databaseService.getCards();
});

ipcMain.handle('update-card', async (event, id: number, cardData: any) => {
  if (!databaseService) return false;
  return databaseService.updateCard(id, cardData);
});

ipcMain.handle('delete-card', async (event, id: number) => {
  if (!databaseService) return false;
  return databaseService.deleteCard(id);
});

// Investment handlers
ipcMain.handle('add-investment', async (event, investmentData: any) => {
  if (!databaseService) return null;
  return databaseService.addInvestment(investmentData);
});

ipcMain.handle('get-investments', async () => {
  if (!databaseService) return [];
  return databaseService.getInvestments();
});

ipcMain.handle('update-investment', async (event, id: number, investmentData: any) => {
  if (!databaseService) return false;
  return databaseService.updateInvestment(id, investmentData);
});

ipcMain.handle('delete-investment', async (event, id: number) => {
  if (!databaseService) return false;
  return databaseService.deleteInvestment(id);
});

// Goal handlers
ipcMain.handle('add-goal', async (event, goalData: any) => {
  if (!databaseService) return null;
  return databaseService.addGoal(goalData);
});

ipcMain.handle('get-goals', async () => {
  if (!databaseService) return [];
  return databaseService.getGoals();
});

ipcMain.handle('update-goal', async (event, id: number, goalData: any) => {
  if (!databaseService) return false;
  return databaseService.updateGoal(id, goalData);
});

ipcMain.handle('delete-goal', async (event, id: number) => {
  if (!databaseService) return false;
  return databaseService.deleteGoal(id);
});

// Budget handlers
ipcMain.handle('get-budget', async () => {
  if (!databaseService) return null;
  return databaseService.getBudget();
});

ipcMain.handle('update-budget', async (event, budgetData: any) => {
  if (!databaseService) return false;
  return databaseService.updateBudget(budgetData);
});

// Module settings
ipcMain.handle('get-module-settings', async () => {
  if (!databaseService) return {};
  return databaseService.getModuleSettings();
});

ipcMain.handle('update-module-settings', async (event, settings: any) => {
  if (!databaseService) return false;
  return databaseService.updateModuleSettings(settings);
});

// Categories and custom fields
ipcMain.handle('get-categories', async (event, type: string) => {
  if (!databaseService) return [];
  return databaseService.getCategories(type);
});

ipcMain.handle('add-category', async (event, type: string, name: string) => {
  if (!databaseService) return false;
  return databaseService.addCategory(type, name);
});

// Backup and restore
ipcMain.handle('export-data', async () => {
  if (!databaseService) return null;
  return databaseService.exportAllData();
});

ipcMain.handle('import-data', async (event, data: any) => {
  if (!databaseService) return false;
  return databaseService.importData(data);
});

ipcMain.handle('wipe-all-data', async () => {
  if (!databaseService) {
    return false;
  }
  const result = databaseService.wipeAllData();
  if (result) {
    databaseService.close();
    databaseService = null;
    isLocked = true;
  }
  return result;
});

// Reset all data - deletes the data file completely (works without authentication)
ipcMain.handle('reset-all-data', async () => {
  try {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'financial-data.db');
    const dataPath = dbPath.replace('.db', '.json');
    
    // Close existing database service if open
    if (databaseService) {
      databaseService.close();
      databaseService = null;
    }
    
    // Delete the data file
    if (fs.existsSync(dataPath)) {
      fs.unlinkSync(dataPath);
      console.log('Data file deleted:', dataPath);
    }
    
    isLocked = true;
    return true;
  } catch (error: any) {
    console.error('Error resetting data:', error);
    return false;
  }
});

