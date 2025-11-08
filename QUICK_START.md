# Quick Start Guide

Get up and running with Financial Dashboard in minutes!

## 🚀 Fastest Installation

### Windows Users

**Option 1: Automated Installation (Recommended)**
1. Right-click `install-windows.bat` → **Run as administrator**
2. Wait for installation to complete
3. Double-click the desktop shortcut

**Option 2: Manual Installation**
```powershell
npm install
npm run build
npm start
```

### Ubuntu/Linux Users

**Option 1: Automated Installation (Recommended)**
```bash
chmod +x install-ubuntu.sh
bash install-ubuntu.sh
```

**Option 2: Manual Installation**
```bash
npm install
npm run build
npm start
```

## 📋 Prerequisites Checklist

Before installing, make sure you have:

- [ ] **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- [ ] **npm** (comes with Node.js)
- [ ] **Git** (optional, for cloning)

### Verify Installation

**Windows (PowerShell):**
```powershell
node --version
npm --version
```

**Linux:**
```bash
node --version
npm --version
```

## 🎯 First Launch

1. **Run the application** (via shortcut or `npm start`)
2. **Create master password** - ⚠️ Remember this! It cannot be recovered
3. **Set up profile** (optional, can skip for now)
4. **Start tracking** your finances!

## 📦 Building Distribution Packages

Want to create installers for others?

### Windows
```powershell
npm run dist:win
```
Output: `release/Financial Dashboard Setup x.x.x.exe`

### Linux
```bash
npm run dist:linux
```
Output: `release/financial-dashboard-x.x.x.AppImage` and `.deb` package

## 🆘 Need Help?

- **Installation issues?** Check [README.md](README.md) Troubleshooting section
- **GitHub setup?** See [GITHUB_SETUP.md](GITHUB_SETUP.md)
- **Found a bug?** Create an issue on GitHub

## 🔗 Useful Links

- **Full Documentation**: [README.md](README.md)
- **GitHub Setup**: [GITHUB_SETUP.md](GITHUB_SETUP.md)
- **Repository**: `https://github.com/shyaradigital/financial-dashboard`

---

**That's it! You're ready to go!** 🎉
