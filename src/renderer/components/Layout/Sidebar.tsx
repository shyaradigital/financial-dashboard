import React from 'react';
import { useAppStore } from '../../store/appStore';
import {
  LayoutDashboard,
  User,
  TrendingDown,
  TrendingUp,
  Building2,
  CreditCard,
  LineChart,
  Target,
  PieChart,
  Activity,
  Lightbulb,
  Settings,
  Database,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, stealthMode, toggleStealthMode, setLocked, moduleSettings } = useAppStore();

  const handleLock = async () => {
    await window.electronAPI.lockApp();
    setLocked(true);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, module: null },
    { id: 'profile', label: 'Profile', icon: User, module: null },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown, module: 'expenses' },
    { id: 'income', label: 'Income', icon: TrendingUp, module: 'income' },
    { id: 'banks', label: 'Bank Vault', icon: Building2, module: 'banks' },
    { id: 'cards', label: 'Cards', icon: CreditCard, module: 'cards' },
    { id: 'investments', label: 'Investments', icon: LineChart, module: 'investments' },
    { id: 'goals', label: 'Goals', icon: Target, module: 'goals' },
    { id: 'budget', label: 'Budget', icon: PieChart, module: 'budget' },
    { id: 'metrics', label: 'Metrics', icon: Activity, module: 'metrics' },
    { id: 'insights', label: 'Insights', icon: Lightbulb, module: 'insights' },
  ];

  const settingsItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'backup', label: 'Backup', icon: Database },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.module === null) return true;
    return moduleSettings[item.module] !== false;
  });

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Financial Dashboard</h2>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => setCurrentView(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="nav-divider" />

        <div className="nav-section">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => setCurrentView(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="footer-button" onClick={toggleStealthMode} title="Toggle stealth mode">
          {stealthMode ? <EyeOff size={20} /> : <Eye size={20} />}
          <span>{stealthMode ? 'Show Values' : 'Hide Values'}</span>
        </button>
        <button className="footer-button" onClick={handleLock} title="Lock application">
          <Lock size={20} />
          <span>Lock</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;


