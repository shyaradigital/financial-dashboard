// Analytics and predictive utilities

export interface ExpenseData {
  date: string;
  amount: number;
  category: string;
}

export interface IncomeData {
  date: string;
  amount: number;
  source: string;
  taxable: number;
}

export interface GoalData {
  goal_name: string;
  target_amount: number;
  target_date: string;
  current_saved: number;
  monthly_allocation: number | null;
}

// Calculate moving average
export const calculateMovingAverage = (data: number[], window: number): number[] => {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const subset = data.slice(start, i + 1);
    const avg = subset.reduce((sum, val) => sum + val, 0) / subset.length;
    result.push(avg);
  }
  return result;
};

// Simple linear regression
export const linearRegression = (xData: number[], yData: number[]): { slope: number; intercept: number } => {
  const n = xData.length;
  const sumX = xData.reduce((a, b) => a + b, 0);
  const sumY = yData.reduce((a, b) => a + b, 0);
  const sumXY = xData.reduce((sum, x, i) => sum + x * yData[i], 0);
  const sumXX = xData.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
};

// Predict next value using linear regression
export const predictNextValue = (values: number[]): number => {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];
  
  const xData = values.map((_, i) => i);
  const { slope, intercept } = linearRegression(xData, values);
  
  return slope * values.length + intercept;
};

// Calculate coefficient of variation (for income stability)
export const coefficientOfVariation = (data: number[]): number => {
  if (data.length === 0) return 0;
  
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  
  return mean === 0 ? 0 : (stdDev / mean) * 100;
};

// Group expenses by category
export const groupByCategory = (expenses: ExpenseData[]): Record<string, number> => {
  return expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);
};

// Get monthly aggregates
export const getMonthlyAggregates = (data: { date: string; amount: number }[]): Record<string, number> => {
  return data.reduce((acc, item) => {
    const month = item.date.substring(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);
};

// Calculate emergency fund coverage in months
export const calculateEmergencyFundCoverage = (
  emergencySavings: number,
  monthlyExpenses: number
): number => {
  if (monthlyExpenses === 0) return 0;
  return emergencySavings / monthlyExpenses;
};

// Calculate savings rate
export const calculateSavingsRate = (income: number, expenses: number): number => {
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
};

// Calculate budget adherence
export const calculateBudgetAdherence = (budgeted: number, actual: number): number => {
  if (budgeted === 0) return 100;
  const diff = Math.abs(budgeted - actual);
  return Math.max(0, 100 - (diff / budgeted) * 100);
};

// Goal completion forecast
export const forecastGoalCompletion = (goal: GoalData): {
  status: 'on-track' | 'delayed' | 'completed';
  monthsNeeded: number;
  monthsRemaining: number;
} => {
  const remaining = goal.target_amount - goal.current_saved;
  const targetDate = new Date(goal.target_date);
  const now = new Date();
  const monthsRemaining = Math.max(0, 
    (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  
  if (goal.current_saved >= goal.target_amount) {
    return { status: 'completed', monthsNeeded: 0, monthsRemaining };
  }
  
  if (!goal.monthly_allocation || goal.monthly_allocation === 0) {
    return { status: 'delayed', monthsNeeded: Infinity, monthsRemaining };
  }
  
  const monthsNeeded = remaining / goal.monthly_allocation;
  
  const status = monthsNeeded <= monthsRemaining ? 'on-track' : 'delayed';
  
  return { status, monthsNeeded, monthsRemaining };
};

// Calculate debt payoff timeline
export const calculateDebtPayoff = (totalDebt: number, monthlyEMI: number): number => {
  if (monthlyEMI === 0) return Infinity;
  return totalDebt / monthlyEMI;
};

// Expense volatility (standard deviation)
export const calculateExpenseVolatility = (monthlyExpenses: number[]): number => {
  if (monthlyExpenses.length === 0) return 0;
  
  const mean = monthlyExpenses.reduce((sum, val) => sum + val, 0) / monthlyExpenses.length;
  const variance = monthlyExpenses.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / monthlyExpenses.length;
  
  return Math.sqrt(variance);
};

// Cash flow projection
export const projectCashFlow = (avgIncome: number, avgExpenses: number, months: number): number[] => {
  const monthlySurplus = avgIncome - avgExpenses;
  const projection: number[] = [];
  let cumulative = 0;
  
  for (let i = 0; i < months; i++) {
    cumulative += monthlySurplus;
    projection.push(cumulative);
  }
  
  return projection;
};

// Budget drift detection
export const detectBudgetDrift = (historicalSpending: number[]): {
  isDrifting: boolean;
  trendDirection: 'up' | 'down' | 'stable';
  percentageChange: number;
} => {
  if (historicalSpending.length < 6) {
    return { isDrifting: false, trendDirection: 'stable', percentageChange: 0 };
  }
  
  const recent3Months = historicalSpending.slice(-3);
  const previous3Months = historicalSpending.slice(-6, -3);
  
  const recentAvg = recent3Months.reduce((sum, val) => sum + val, 0) / recent3Months.length;
  const previousAvg = previous3Months.reduce((sum, val) => sum + val, 0) / previous3Months.length;
  
  const percentageChange = previousAvg === 0 ? 0 : ((recentAvg - previousAvg) / previousAvg) * 100;
  
  const isDrifting = Math.abs(percentageChange) > 10; // 10% threshold
  const trendDirection = percentageChange > 5 ? 'up' : percentageChange < -5 ? 'down' : 'stable';
  
  return { isDrifting, trendDirection, percentageChange };
};


