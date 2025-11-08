/**
 * Investment Calculation Utilities
 * Automatically calculates current value based on investment type and formulas
 */

export interface InvestmentCalculationParams {
  investment_type: string;
  amount_invested: number;
  date_of_entry: string;
  expected_roi?: number | null;
  interest_rate?: number | null;
  maturity_date?: string | null;
}

/**
 * Calculate number of years between two dates
 */
function getYearsBetweenDates(startDate: string, endDate: string = new Date().toISOString().split('T')[0]): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays / 365.25; // Account for leap years
}

/**
 * Calculate number of months between two dates
 */
function getMonthsBetweenDates(startDate: string, endDate: string = new Date().toISOString().split('T')[0]): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const years = getYearsBetweenDates(startDate, endDate);
  return years * 12;
}

/**
 * Compound Interest Formula: A = P(1 + r/n)^(nt)
 * Where:
 * A = Final amount
 * P = Principal (amount invested)
 * r = Annual interest rate (as decimal)
 * n = Number of times interest is compounded per year
 * t = Time in years
 */
function calculateCompoundInterest(
  principal: number,
  annualRate: number,
  years: number,
  compoundingFrequency: number = 4 // Quarterly compounding by default
): number {
  if (years <= 0 || annualRate <= 0) return principal;
  const rateDecimal = annualRate / 100;
  return principal * Math.pow(1 + rateDecimal / compoundingFrequency, compoundingFrequency * years);
}

/**
 * Simple Interest Formula: A = P(1 + rt)
 */
function calculateSimpleInterest(
  principal: number,
  annualRate: number,
  years: number
): number {
  if (years <= 0 || annualRate <= 0) return principal;
  const rateDecimal = annualRate / 100;
  return principal * (1 + rateDecimal * years);
}

/**
 * Calculate current value based on Expected ROI
 */
function calculateFromROI(
  amountInvested: number,
  expectedROI: number,
  years: number
): number {
  if (years <= 0 || expectedROI <= 0) return amountInvested;
  const roiDecimal = expectedROI / 100;
  // Assume compound growth
  return amountInvested * Math.pow(1 + roiDecimal, years);
}

/**
 * Get default interest rate for investment type (annual %)
 */
function getDefaultInterestRate(investmentType: string): number {
  const rates: { [key: string]: number } = {
    'Fixed Deposits': 6.5, // Average FD rate
    'PPF': 7.1, // Public Provident Fund
    'NPS': 9.0, // National Pension Scheme (varies)
    'Bonds': 7.5, // Government/Corporate Bonds
    'Digital Gold': 8.0, // Gold appreciation (historical average)
    'Mutual Funds': 12.0, // Equity mutual funds average
    'Stocks': 15.0, // Stock market average (can vary widely)
    'Crypto': 0, // Too volatile, require manual entry
    'Real Estate': 6.0, // Property appreciation
    'ULIPs': 8.5 // Unit Linked Insurance Plans
  };
  return rates[investmentType] || 0;
}

/**
 * Get compounding frequency for investment type
 */
function getCompoundingFrequency(investmentType: string): number {
  const frequencies: { [key: string]: number } = {
    'Fixed Deposits': 4, // Quarterly
    'PPF': 1, // Annual
    'NPS': 4, // Quarterly
    'Bonds': 2, // Semi-annual
    'Mutual Funds': 12, // Monthly (NAV updates)
    'Stocks': 252, // Daily (trading days)
    'Crypto': 365, // Daily
    'Real Estate': 1, // Annual
    'ULIPs': 12 // Monthly
  };
  return frequencies[investmentType] || 4; // Default to quarterly
}

/**
 * Main function to calculate current value of an investment
 */
export function calculateInvestmentCurrentValue(params: InvestmentCalculationParams): number {
  const {
    investment_type,
    amount_invested,
    date_of_entry,
    expected_roi,
    interest_rate,
    maturity_date
  } = params;

  if (!amount_invested || amount_invested <= 0) {
    return 0;
  }

  const currentDate = new Date().toISOString().split('T')[0];
  const years = getYearsBetweenDates(date_of_entry, currentDate);
  const months = getMonthsBetweenDates(date_of_entry, currentDate);

  // If maturity date is provided and hasn't reached, calculate up to maturity
  let calculationYears = years;
  if (maturity_date) {
    const maturity = new Date(maturity_date);
    const today = new Date();
    if (maturity > today) {
      calculationYears = getYearsBetweenDates(date_of_entry, maturity_date);
    }
  }

  // For Fixed Deposits, PPF, NPS, Bonds - use interest rate
  const fixedIncomeTypes = ['Fixed Deposits', 'PPF', 'NPS', 'Bonds'];
  if (fixedIncomeTypes.includes(investment_type)) {
    const rate = interest_rate || getDefaultInterestRate(investment_type);
    if (rate > 0) {
      const compoundingFreq = getCompoundingFrequency(investment_type);
      return calculateCompoundInterest(amount_invested, rate, calculationYears, compoundingFreq);
    }
  }

  // For ULIPs - use interest rate with monthly compounding
  if (investment_type === 'ULIPs') {
    const rate = interest_rate || getDefaultInterestRate(investment_type);
    if (rate > 0) {
      return calculateCompoundInterest(amount_invested, rate, calculationYears, 12);
    }
  }

  // For Mutual Funds, Stocks - use Expected ROI if provided
  const equityTypes = ['Mutual Funds', 'Stocks', 'Real Estate', 'Digital Gold'];
  if (equityTypes.includes(investment_type)) {
    if (expected_roi && expected_roi > 0) {
      return calculateFromROI(amount_invested, expected_roi, calculationYears);
    }
    // If no ROI provided, use default rate for the type
    const defaultRate = getDefaultInterestRate(investment_type);
    if (defaultRate > 0) {
      return calculateFromROI(amount_invested, defaultRate, calculationYears);
    }
  }

  // For Crypto - too volatile, return invested amount (requires manual update)
  if (investment_type === 'Crypto') {
    // Crypto is too volatile, return invested amount as fallback
    // User should manually update or provide expected ROI
    return amount_invested;
  }

  // Default: If expected ROI is provided, use it
  if (expected_roi && expected_roi > 0) {
    return calculateFromROI(amount_invested, expected_roi, calculationYears);
  }

  // If no calculation method available, return invested amount
  return amount_invested;
}

/**
 * Check if investment type supports auto-calculation
 */
export function supportsAutoCalculation(investmentType: string): boolean {
  const supportedTypes = [
    'Fixed Deposits',
    'PPF',
    'NPS',
    'Bonds',
    'Mutual Funds',
    'Stocks',
    'ULIPs',
    'Real Estate',
    'Digital Gold'
  ];
  return supportedTypes.includes(investmentType);
}

/**
 * Get calculation method description for UI
 */
export function getCalculationDescription(investmentType: string, hasExpectedROI: boolean, hasInterestRate: boolean): string {
  if (investmentType === 'Crypto') {
    return 'Crypto values are too volatile. Please update manually or provide Expected ROI.';
  }

  if (['Fixed Deposits', 'PPF', 'NPS', 'Bonds'].includes(investmentType)) {
    if (hasInterestRate) {
      return `Calculated using compound interest formula with your interest rate.`;
    }
    return `Will calculate using default interest rate (${getDefaultInterestRate(investmentType)}% p.a.). You can provide a custom interest rate.`;
  }

  if (hasExpectedROI) {
    return `Calculated using Expected ROI (compound growth).`;
  }

  return `Provide Expected ROI for auto-calculation, or update manually.`;
}

