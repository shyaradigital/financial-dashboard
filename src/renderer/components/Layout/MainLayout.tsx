import React from 'react';
import { useAppStore } from '../../store/appStore';
import Sidebar from './Sidebar';
import Dashboard from '../Dashboard/Dashboard';
import ProfileView from '../Profile/ProfileView';
import ExpenseTracker from '../Modules/ExpenseTracker';
import IncomeTracker from '../Modules/IncomeTracker';
import BankVault from '../Modules/BankVault';
import CardTracker from '../Modules/CardTracker';
import InvestmentTracker from '../Modules/InvestmentTracker';
import GoalsTracker from '../Modules/GoalsTracker';
import BudgetPlanner from '../Modules/BudgetPlanner';
import FinancialMetrics from '../Modules/FinancialMetrics';
import PredictiveInsights from '../Modules/PredictiveInsights';
import SettingsView from '../Settings/SettingsView';
import BackupRestore from '../Settings/BackupRestore';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const { currentView } = useAppStore();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <ProfileView />;
      case 'expenses':
        return <ExpenseTracker />;
      case 'income':
        return <IncomeTracker />;
      case 'banks':
        return <BankVault />;
      case 'cards':
        return <CardTracker />;
      case 'investments':
        return <InvestmentTracker />;
      case 'goals':
        return <GoalsTracker />;
      case 'budget':
        return <BudgetPlanner />;
      case 'metrics':
        return <FinancialMetrics />;
      case 'insights':
        return <PredictiveInsights />;
      case 'settings':
        return <SettingsView />;
      case 'backup':
        return <BackupRestore />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="content-area">
        {renderView()}
      </div>
    </div>
  );
};

export default MainLayout;


