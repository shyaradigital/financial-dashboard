# Financial Dashboard - Local-First Privacy-Focused Financial Management

A comprehensive, local-first financial dashboard built with Electron, React, and TypeScript. All your financial data stays on your device, encrypted with your master password.

## 🔐 Key Features

### Security & Privacy
- **Local-Only Storage**: All data stored locally using encrypted JSON storage
- **AES-256 Encryption**: Bank accounts, cards, and sensitive data encrypted at rest
- **Master Password Protection**: Application-level authentication with bcrypt hashing
- **Auto-Lock**: Automatic screen lock after 5 minutes of inactivity
- **Stealth Mode**: Hide all financial values with a single click
- **Data Wipe**: Complete data destruction option
- **Password-Protected Bank Vault**: View sensitive bank information only after password verification

### Financial Modules

#### 📊 Dashboard
- Real-time overview of income, expenses, savings, and goals
- Monthly financial summary
- Quick stats and alerts

#### 💸 Expense Tracker
- Categorized expense tracking
- Custom categories and payment modes
- Real-time pie chart visualization
- Daily/weekly/monthly aggregates
- CSV export

#### 💰 Income Tracker
- Multiple income source tracking
- Taxable vs non-taxable income segregation
- Monthly trend charts
- Frequency tracking

#### 🏦 Bank Info Vault
- Securely store bank account details
- Password-protected sensitive information reveal
- Encrypted account numbers, UPI IDs, net banking credentials
- Masked display with copy-to-clipboard
- IFSC code storage
- Eye icon to toggle visibility (requires password)

#### 💳 Card Tracker
- Credit and debit card management
- Billing cycle tracking
- Credit limit and due amount monitoring
- EMI tracking support

#### 📈 Investment Tracker
- Multi-asset class support (Stocks, Mutual Funds, Crypto, Real Estate, etc.)
- Portfolio allocation visualization
- ROI and current valuation tracking
- Tax flag marking (80C, LTCG, etc.)
- Gain/Loss calculations

#### 🎯 Goals & Savings Tracker
- Financial goal creation with target dates
- Progress tracking with visual indicators
- Monthly allocation planning
- Goal status monitoring (On-track/Delayed/Completed)
- Past goals archive

#### 📊 Budget Planner
- Monthly budget allocation by category
- Real-time budget vs actual comparison
- Visual budget allocation charts
- Over/under budget alerts with color coding

#### 🏥 Financial Health Metrics
- Savings Rate calculation
- Budget Adherence percentage
- Average Monthly Burn
- Expense Volatility analysis
- Income Stability Score
- Goal Fulfillment tracking
- Debt-to-Income Ratio
- Emergency Fund Coverage (in months)

#### 🔮 Predictive Insights
10 AI-powered forecasting features:
1. **Emergency Fund Warning** - Alerts when coverage drops below threshold
2. **Budget Alert** - Real-time overspending notifications
3. **Investment Forecast** - Projected growth calculations
4. **Expense Trend Forecast** - Next month expense predictions
5. **Income Stability Indicator** - Income volatility analysis
6. **Bill & Subscription Renewals** - Upcoming payment alerts
7. **Goal Completion Forecast** - Timeline predictions for goals
8. **Cash Flow Projection** - Future surplus/deficit analysis
9. **Debt Payoff Projection** - EMI completion timeline
10. **Budget Drift Detection** - Long-term spending pattern analysis

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v16 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for cloning the repository)

### Method 1: Install from Source (Development)

#### For Windows:

1. **Install Node.js**
   - Download and install Node.js from [nodejs.org](https://nodejs.org/)
   - Verify installation:
     ```powershell
     node --version
     npm --version
     ```

2. **Clone or Download the Repository**
   ```powershell
   git clone https://github.com/shyaradigital/financial-dashboard.git
   cd financial-dashboard
   ```
   Or download and extract the ZIP file, then navigate to the folder.

3. **Install Dependencies**
   ```powershell
   npm install
   ```

4. **Build the Application**
   ```powershell
   npm run build
   ```

5. **Run the Application**
   ```powershell
   npm start
   ```

6. **Create a Desktop Shortcut (Optional)**
   - Right-click on `node_modules\.bin\electron.cmd` (or create a batch file)
   - Create a new file `start-dashboard.bat` in the project root:
     ```batch
     @echo off
     cd /d "%~dp0"
     npm start
     ```
   - Right-click the `.bat` file → Send to → Desktop (create shortcut)
   - Right-click the shortcut → Properties → Change Icon (optional)

#### For Ubuntu/Linux:

1. **Install Node.js**
   ```bash
   # Using NodeSource repository (recommended)
     curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
     sudo apt-get install -y nodejs

   # Or using snap
     sudo snap install node --classic

   # Verify installation
     node --version
     npm --version
   ```

2. **Install Additional Dependencies (if needed)**
   ```bash
   sudo apt-get update
   sudo apt-get install -y build-essential libnss3-dev libatk-bridge2.0-dev libdrm2 libxkbcommon-dev libxcomposite-dev libxdamage-dev libxrandr-dev libgbm-dev libasound2-dev
   ```

3. **Clone or Download the Repository**
   ```bash
   git clone https://github.com/shyaradigital/financial-dashboard.git
   cd financial-dashboard
   ```
   Or download and extract the ZIP file, then navigate to the folder.

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Build the Application**
   ```bash
   npm run build
   ```

6. **Run the Application**
   ```bash
   npm start
   ```

7. **Create a Desktop Shortcut (Optional)**
   - Create a desktop entry file:
     ```bash
     nano ~/.local/share/applications/financial-dashboard.desktop
     ```
   - Add the following content (adjust paths as needed):
     ```ini
     [Desktop Entry]
     Version=1.0
     Type=Application
     Name=Financial Dashboard
     Comment=Local-First Financial Management
     Exec=/usr/bin/node /path/to/financial-dashboard/node_modules/.bin/electron /path/to/financial-dashboard
     Icon=/path/to/financial-dashboard/assets/icon.png
     Terminal=false
     Categories=Finance;Office;
     ```
   - Or create a simple launcher script:
     ```bash
     #!/bin/bash
     cd /path/to/financial-dashboard
     npm start
     ```
   - Make it executable:
     ```bash
     chmod +x launcher.sh
     ```
   - Create a desktop shortcut:
     ```bash
     ln -s /path/to/financial-dashboard/launcher.sh ~/Desktop/Financial-Dashboard
     ```

### Method 2: Install Pre-built Package (Recommended)

#### For Windows:

1. **Download the Installer**
   - Download `Financial-Dashboard-Setup-x.x.x.exe` from the [Releases](https://github.com/shyaradigital/financial-dashboard/releases) page

2. **Run the Installer**
   - Double-click the downloaded `.exe` file
   - Follow the installation wizard
   - Choose installation directory (default: `C:\Program Files\Financial Dashboard`)
   - The installer will create desktop and start menu shortcuts automatically

3. **Launch the Application**
   - Double-click the desktop shortcut, or
   - Search for "Financial Dashboard" in the Start menu

#### For Ubuntu/Linux:

1. **Download the Package**
   - Download `financial-dashboard-x.x.x.AppImage` or `financial-dashboard-x.x.x.deb` from the [Releases](https://github.com/shyaradigital/financial-dashboard/releases) page

2. **Install .deb Package (Recommended)**
   ```bash
   sudo dpkg -i financial-dashboard-x.x.x.deb
   sudo apt-get install -f  # Fix any missing dependencies
   ```
   - Launch from Applications menu or run:
     ```bash
     financial-dashboard
     ```

3. **Or Use AppImage (Portable)**
   ```bash
   chmod +x financial-dashboard-x.x.x.AppImage
   ./financial-dashboard-x.x.x.AppImage
   ```
   - To make it available system-wide:
     ```bash
     sudo mv financial-dashboard-x.x.x.AppImage /opt/
     sudo ln -s /opt/financial-dashboard-x.x.x.AppImage /usr/local/bin/financial-dashboard
     ```

---

## 📦 Building Distribution Packages

### For Developers:

#### Build for Windows:
```powershell
npm run dist:win
```
This creates:
- `release/Financial Dashboard Setup x.x.x.exe` (Installer)
- `release/Financial Dashboard x.x.x.exe` (Portable)

#### Build for Linux:
```bash
npm run dist:linux
```
This creates:
- `release/financial-dashboard-x.x.x.AppImage` (Portable)
- `release/financial-dashboard-x.x.x.deb` (Debian package)

#### Build for All Platforms:
```bash
npm run dist
```

---

## 🎯 First Run

1. **On first launch**, you'll be prompted to create a master password
2. **⚠️ Important**: Remember this password! It cannot be recovered
3. **Set up your profile** (optional, can be done later)
4. **Start tracking your finances!**

---

## 📁 Project Structure

```
financial-dashboard/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── main.ts             # Main entry point
│   │   ├── preload.ts          # Preload script
│   │   ├── database/           # Database layer
│   │   │   └── DatabaseService.ts
│   │   └── services/           # Services
│   │       └── EncryptionService.ts
│   └── renderer/               # React application
│       ├── components/         # React components
│       │   ├── Auth/           # Authentication
│       │   ├── Dashboard/      # Dashboard
│       │   ├── Layout/         # Layout components
│       │   ├── Modules/        # Financial modules
│       │   ├── Profile/        # Profile management
│       │   ├── Settings/       # Settings
│       │   └── Common/         # Reusable components
│       ├── store/              # State management
│       ├── utils/              # Utilities
│       └── styles/             # Global styles
├── dist/                       # Built files
├── release/                    # Distribution packages
└── package.json
```

---

## 🔧 Technical Stack

- **Frontend**: React 18 + TypeScript
- **Desktop**: Electron 33
- **State Management**: Zustand
- **Database**: JSON file storage (local, encrypted)
- **Security**: bcryptjs (password hashing), crypto (AES-256)
- **Charts**: Recharts
- **Export**: PapaParse (CSV)
- **Icons**: Lucide React
- **Build**: Webpack + ts-loader

---

## 📊 Data Storage

- **Location**: 
  - Windows: `C:\Users\<YourUsername>\AppData\Roaming\financial-dashboard\financial-data.json`
  - Linux: `~/.config/financial-dashboard/financial-data.json`
- **Format**: Encrypted JSON file
- **Backup**: Use the built-in export feature in Settings

---

## 🛡️ Security Architecture

1. **Master Password**: Required for application access
2. **Encrypted Storage**: JSON file with field-level encryption
3. **Session Management**: Auto-lock after inactivity
4. **Sensitive Data Masking**: Bank accounts, cards encrypted separately
5. **Password-Protected Reveal**: View sensitive bank info only after password verification
6. **No Cloud Dependencies**: Zero network requests, fully offline

---

## 📝 Data Privacy

- **No Analytics**: Zero tracking or telemetry
- **No Cloud Sync**: All data stays on your device
- **No External APIs**: Completely offline application
- **Open Architecture**: You own your data

---

## 🎯 Use Cases

- Personal finance tracking
- Budget management
- Investment portfolio monitoring
- Goal-based savings
- Debt tracking
- Financial health assessment
- Tax planning support

---

## ⚠️ Important Notes

1. **Backup Regularly**: Use the export feature to backup your data
2. **Remember Your Password**: It cannot be recovered
3. **Keep Application Updated**: Check for updates regularly
4. **Review Permissions**: Application should not request network access

---

## 🐛 Troubleshooting

### Windows Issues:

**"npm is not recognized"**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal/PowerShell after installation

**"electron failed to install"**
```powershell
npm cache clean --force
npm install electron --force
```

**Application won't start**
- Make sure you've run `npm install` first
- Check that Node.js version is 16 or higher

### Linux Issues:

**Missing dependencies**
```bash
sudo apt-get update
sudo apt-get install -y libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2
```

**Permission denied**
```bash
chmod +x financial-dashboard-x.x.x.AppImage
```

**AppImage won't run**
- Make sure it's executable: `chmod +x filename.AppImage`
- Try running from terminal to see error messages

---

## 📄 License

ISC License

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Please feel free to check existing issues before creating a new one.

---

## 📧 Support

For issues or questions:
- Check the [Issues](https://github.com/shyaradigital/financial-dashboard/issues) page
- Create a new issue with detailed information
- Include your OS version and Node.js version

---

## 🔗 Links

- **Repository**: [github.com/shyaradigital/financial-dashboard](https://github.com/shyaradigital/financial-dashboard)
- **Releases**: [Releases Page](https://github.com/shyaradigital/financial-dashboard/releases)

---

**Built with privacy and security in mind. Your finances, your device, your control.**

**© 2024 Shyara Digital**
