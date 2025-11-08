# Financial Dashboard - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Setup & Authentication](#setup--authentication)
3. [Dashboard Overview](#dashboard-overview)
4. [Modules](#modules)
5. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### First Launch

When you first open the Financial Dashboard, you'll be greeted with a setup screen:

1. **Create Master Password**
   - Choose a strong, memorable password
   - Must be at least 6 characters
   - This password encrypts all your financial data
   - ⚠️ **Cannot be recovered if forgotten!**

2. **Confirm Password**
   - Re-enter your password to confirm
   - Click "Setup & Continue"

### Subsequent Launches

- Enter your master password
- Click "Unlock" to access the dashboard
- If inactive for 5 minutes, the app will auto-lock

---

## Setup & Authentication

### Security Features

1. **Master Password**
   - Required on every app launch
   - Encrypts all sensitive data
   - Uses bcrypt hashing + AES-256 encryption

2. **Auto-Lock**
   - Default: 5 minutes of inactivity
   - Customizable in Profile settings
   - Tracks mouse, keyboard, and click activity

3. **Manual Lock**
   - Click the "Lock" button in the sidebar footer
   - Locks immediately without closing the app

4. **Stealth Mode**
   - Click the "Eye" icon in sidebar footer
   - Hides all financial values
   - Shows "••••••" instead of numbers
   - Toggle on/off as needed

---

## Dashboard Overview

The dashboard provides a quick snapshot of your financial health:

### Main Stats
- **Total Income**: Current month's total income
- **Total Expenses**: Current month's spending
- **Savings**: Income minus expenses
- **Active Goals**: Number of ongoing financial goals

### Quick Stats Section
- Total investments value
- Monthly surplus/deficit
- Budget alerts (if any)

---

## Modules

### 1. Profile

**Purpose**: Store personal and financial information

**Features**:
- Profile Completion Meter (shows % complete)
- Personal Info: Name, Age, Profession, Income Type
- Financial Goals: Add/remove goals
- Investment Preferences: Select preferred investment types
- Security Settings: Auto-lock timer, Emergency fund threshold

**How to Use**:
1. Navigate to "Profile" in sidebar
2. Click "Edit Profile"
3. Fill in your information
4. Add financial goals using the input box
5. Add investment preferences
6. Click "Save Profile"

**Tips**:
- NULL is displayed for empty fields
- Aim for 80%+ completion for better insights
- Emergency fund threshold affects predictive insights

---

### 2. Expense Tracker

**Purpose**: Track daily expenses with categorization

**Features**:
- Add/Edit/Delete expenses
- Custom categories and payment modes
- Real-time pie chart visualization
- Search and filter functionality
- CSV/PDF export

**How to Use**:
1. Click "Add Expense"
2. Enter:
   - Date
   - Amount
   - Category (or create new)
   - Payment Mode (or create new)
   - Comments (optional hashtags)
3. View expenses in table
4. Use search to find specific transactions
5. Filter by category

**Tips**:
- Use comments for hashtags (#groceries, #monthly)
- Create categories specific to your needs
- Regular tracking provides better insights
- Export monthly for record-keeping

---

### 3. Income Tracker

**Purpose**: Monitor income from all sources

**Features**:
- Multiple income sources
- Taxable/Non-taxable flagging
- Monthly trend chart
- Frequency tracking
- CSV/PDF export

**How to Use**:
1. Click "Add Income"
2. Enter:
   - Date
   - Source (Salary, Freelance, etc.)
   - Amount
   - Frequency (Monthly, One-time)
   - Mode (Bank Transfer, UPI, etc.)
   - Check "Taxable" if applicable
3. View monthly trends in chart
4. Track taxable vs non-taxable summary

**Tips**:
- Mark taxable income for tax planning
- Track frequency for recurring income
- Compare with expenses for savings analysis

---

### 4. Bank Info Vault

**Purpose**: Securely store bank account information

**Features**:
- Encrypted storage of account details
- Masked display (shows last 4 digits)
- Copy-to-clipboard functionality
- Add/Edit/Delete accounts

**How to Use**:
1. Click "Add Bank"
2. Enter:
   - Bank Name
   - Account Holder Name
   - Account Number (will be encrypted)
   - IFSC Code
   - UPI ID
   - Registered Phone (will be encrypted)
   - Net Banking ID (will be encrypted)
   - Comments
3. Data is encrypted and stored locally
4. Click copy icon to copy full numbers

**Security**:
- Account numbers encrypted with AES-256
- Only you can see full details
- Data never leaves your device

---

### 5. Card Tracker

**Purpose**: Manage credit and debit cards

**Features**:
- Credit/Debit card storage
- Billing cycle tracking (credit cards)
- Credit limit and due amount
- EMI tracking support
- Expiry date alerts

**How to Use**:
1. Click "Add Card"
2. Select Card Type (Credit/Debit)
3. Enter:
   - Bank Name
   - Card Number (will be encrypted)
   - Expiry Date
   - For Credit Cards:
     - Billing Cycle
     - Credit Limit
     - Current Due
4. View cards in grid layout
5. Update due amounts regularly

**Tips**:
- Update current due before payment deadlines
- Track credit utilization
- Note billing cycles for better planning

---

### 6. Investment Tracker

**Purpose**: Monitor investment portfolio

**Features**:
- Multiple asset classes support
- Portfolio allocation pie chart
- Gain/Loss calculation
- ROI tracking
- Tax flag marking
- Current valuation updates

**How to Use**:
1. Click "Add Investment"
2. Select Investment Type:
   - Mutual Funds
   - Stocks
   - Crypto
   - Fixed Deposits
   - PPF, NPS
   - Digital Gold
   - Real Estate
   - ULIPs, Bonds
3. Enter:
   - Name of investment
   - Platform (Zerodha, Groww, etc.)
   - Amount Invested
   - Date of Entry
   - Current Valuation (update periodically)
   - Expected ROI (%)
   - Tax Flag (80C, LTCG, etc.)
4. View portfolio allocation chart
5. Track total gain/loss

**Tips**:
- Update current valuation monthly
- Use tax flags for tax planning
- Diversify across asset classes
- Track expected ROI for comparison

---

### 7. Goals & Savings Tracker

**Purpose**: Set and track financial goals

**Features**:
- Goal progress visualization
- Target date tracking
- Monthly allocation planning
- Status indicators (On-track/Delayed/Completed)
- Past goals archive

**How to Use**:
1. Click "Add Goal"
2. Enter:
   - Goal Name (e.g., "Emergency Fund", "Vacation")
   - Target Amount
   - Start Date
   - Target Date
   - Current Saved amount
   - Monthly Allocation (optional)
3. Track progress with visual bar
4. Update current saved regularly
5. Mark as "Completed" when achieved

**Goal Status**:
- **On-track**: You'll reach target by deadline
- **Delayed**: Need to increase savings rate
- **Completed**: Goal achieved!

**Tips**:
- Set realistic target dates
- Regular contributions work best
- Archive old goals for motivation
- Emergency fund = 3-6 months expenses

---

### 8. Budget Planner

**Purpose**: Plan and track monthly budget

**Features**:
- Category-wise budget allocation
- Real-time budget vs actual
- Visual pie chart
- Over/under budget indicators
- Color-coded alerts

**How to Use**:
1. Navigate to Budget Planner
2. Enter monthly budget for:
   - Essentials (rent, utilities, food)
   - Leisure (entertainment, dining out)
   - EMIs/Debts (loan payments)
   - Savings/Investments
3. Click "Update Budget"
4. Monitor spending against budget
5. Adjust next month based on actuals

**Budget Categories**:
- **Essentials**: Necessary expenses
- **Leisure**: Discretionary spending
- **EMIs/Debts**: Fixed obligations
- **Savings/Investments**: Future planning

**Alerts**:
- Green: Within budget
- Yellow: Approaching limit
- Red: Over budget

---

### 9. Financial Health Metrics

**Purpose**: Comprehensive financial health analysis

**Metrics Tracked**:

1. **Savings Rate** (%)
   - Formula: (Income - Expenses) / Income × 100
   - Target: 20%+

2. **Budget Adherence** (%)
   - How well you stick to budget
   - Target: 90%+

3. **Average Monthly Burn**
   - Average monthly expenses
   - Use for emergency fund calculation

4. **Expense Volatility**
   - Standard deviation of monthly expenses
   - Lower is better (more predictable)

5. **Income Stability Score** (%)
   - Consistency of income
   - Higher is better

6. **Goal Fulfillment** (%)
   - Completed goals / Total goals
   - Track progress over time

7. **Debt-to-Income Ratio** (%)
   - Total debt / Monthly income
   - Target: <20%

8. **Emergency Fund Coverage** (months)
   - Emergency fund / Monthly expenses
   - Target: 3-6 months

**Tips**:
- Check metrics monthly
- Compare trends over time
- Focus on one area at a time
- Green = Good, Yellow = Caution, Red = Action needed

---

### 10. Predictive Insights

**Purpose**: AI-powered financial forecasts

**10 Insights Provided**:

1. **Emergency Fund Warning**
   - Alerts if coverage < threshold
   - Recommends top-up amount

2. **Budget Alert**
   - Real-time overspending detection
   - Category-wise breakdown

3. **Expense Trend Forecast**
   - Predicts next month's expenses
   - Based on historical trends

4. **Income Stability Indicator**
   - Volatility analysis
   - Recommends buffer if unstable

5. **Goal Completion Forecast**
   - Estimates achievement timeline
   - Suggests allocation adjustments

6. **Cash Flow Projection**
   - 6-month surplus/deficit forecast
   - Investment recommendations

7. **Budget Drift Detection**
   - Identifies gradual spending increases
   - Trend direction (up/down)

8. **Investment Forecast**
   - Projected growth calculations
   - Based on expected ROI

9. **Debt Payoff Timeline**
   - EMI completion prediction
   - Based on current payment rate

10. **Bill Renewal Alerts**
    - Upcoming subscription renewals
    - Payment reminders

**How Insights Work**:
- Automatically generated
- Minimum 3-6 months data needed
- Updates as you add more data
- Color-coded by severity:
  - Blue (Info)
  - Green (Success)
  - Yellow (Warning)
  - Red (Danger)

---

## Settings

### Module Management

**Purpose**: Enable/disable individual modules

**How to Use**:
1. Navigate to "Settings"
2. View all available modules
3. Toggle individual modules on/off
4. Disabled modules hidden from sidebar
5. Reload app to see changes

**Use Cases**:
- Simplify interface
- Focus on relevant modules
- Customize workflow

---

## Backup & Restore

### Export Data

**Purpose**: Create encrypted backup

**How to Use**:
1. Navigate to "Backup"
2. Click "Export All Data"
3. Save JSON file securely
4. Store backup externally (USB, cloud if preferred)

**What's Exported**:
- All profile data
- All module entries
- Categories and preferences
- Module settings

### Import Data

**Purpose**: Restore from backup

**How to Use**:
1. Navigate to "Backup"
2. Click "Import Data"
3. Select backup JSON file
4. Confirm import
5. Reload application

⚠️ **Warning**: Import may overwrite existing data

### Wipe All Data

**Purpose**: Complete data destruction

**How to Use**:
1. Navigate to "Backup"
2. Click "Wipe All Data" (Danger Zone)
3. Confirm multiple times
4. Type "YES" to confirm
5. App reloads to fresh state

⚠️ **Warning**: This is irreversible! Export first!

---

## Tips & Best Practices

### Data Entry
- ✅ Daily expense tracking works best
- ✅ Update investment values monthly
- ✅ Review goals weekly
- ✅ Set realistic budgets
- ✅ Use comments and tags

### Security
- ✅ Use strong master password
- ✅ Enable auto-lock
- ✅ Lock when stepping away
- ✅ Use stealth mode in public
- ✅ Backup regularly

### Analysis
- ✅ Review metrics monthly
- ✅ Check predictive insights weekly
- ✅ Compare month-to-month
- ✅ Adjust budgets based on actuals
- ✅ Track progress toward goals

### Organization
- ✅ Create custom categories
- ✅ Use consistent naming
- ✅ Add comments to transactions
- ✅ Archive completed goals
- ✅ Export monthly reports

### Privacy
- ✅ Data never leaves your device
- ✅ No internet connection needed
- ✅ Full encryption at rest
- ✅ You control your data
- ✅ No tracking or analytics

---

## Keyboard Shortcuts

*Future feature - not yet implemented*

---

## Troubleshooting

### App Won't Start
- Check if port 5000 is available
- Verify npm dependencies installed
- Rebuild: `npm run build`

### Forgot Master Password
- ⚠️ Cannot be recovered
- Must wipe data and start fresh
- This is by design for security

### Data Not Saving
- Check file permissions
- Ensure disk space available
- Check console for errors

### Charts Not Displaying
- Ensure data exists for time period
- Check browser compatibility
- Refresh the view

---

## Getting Help

For issues or questions:
1. Check this guide
2. Review README.md
3. Check console logs (DevTools)
4. Create an issue in repository

---

**Remember**: This app is completely local and private. Your financial data never leaves your device!


