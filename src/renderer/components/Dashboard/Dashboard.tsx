import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import Card from '../Common/Card';
import { TrendingUp, TrendingDown, Target, PieChart, AlertTriangle } from 'lucide-react';
import { formatCurrency, maskValue } from '../../utils/exportUtils';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { stealthMode } = useAppStore();
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    savings: 0,
    savingsRate: 0,
    activeGoals: 0,
    totalInvestments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const [incomes, expenses, goals, investments] = await Promise.all([
        window.electronAPI.getIncomes({ startDate: firstDay, endDate: lastDay }),
        window.electronAPI.getExpenses({ startDate: firstDay, endDate: lastDay }),
        window.electronAPI.getGoals(),
        window.electronAPI.getInvestments()
      ]);

      const totalIncome = incomes.reduce((sum: number, inc: any) => sum + inc.amount, 0);
      const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
      const savings = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
      const activeGoals = goals.filter((g: any) => g.status === 'active').length;
      const totalInvestments = investments.reduce((sum: number, inv: any) => 
        sum + (inv.current_valuation || inv.amount_invested), 0
      );

      setStats({
        totalIncome,
        totalExpenses,
        savings,
        savingsRate,
        activeGoals,
        totalInvestments
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Financial Dashboard</h1>
        <p>Overview of your finances for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon income">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Income</p>
              <p className="stat-value">
                {stealthMode ? maskValue(stats.totalIncome, true) : formatCurrency(stats.totalIncome)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon expense">
              <TrendingDown size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Expenses</p>
              <p className="stat-value">
                {stealthMode ? maskValue(stats.totalExpenses, true) : formatCurrency(stats.totalExpenses)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-content">
            <div className={`stat-icon ${stats.savings >= 0 ? 'savings' : 'expense'}`}>
              <PieChart size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Savings</p>
              <p className="stat-value">
                {stealthMode ? maskValue(stats.savings, true) : formatCurrency(stats.savings)}
              </p>
              <p className="stat-sub">
                {stealthMode ? '••%' : `${stats.savingsRate.toFixed(1)}% savings rate`}
              </p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon goal">
              <Target size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Active Goals</p>
              <p className="stat-value">{stats.activeGoals}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-widgets">
        <Card title="Quick Stats" className="quick-stats-card">
          <div className="quick-stats">
            <div className="quick-stat-item">
              <span className="quick-stat-label">Total Investments</span>
              <span className="quick-stat-value">
                {stealthMode ? maskValue(stats.totalInvestments, true) : formatCurrency(stats.totalInvestments)}
              </span>
            </div>
            <div className="quick-stat-item">
              <span className="quick-stat-label">Monthly Surplus/Deficit</span>
              <span className={`quick-stat-value ${stats.savings >= 0 ? 'positive' : 'negative'}`}>
                {stealthMode ? maskValue(stats.savings, true) : formatCurrency(stats.savings)}
              </span>
            </div>
          </div>
        </Card>

        {stats.savings < 0 && (
          <Card className="alert-card">
            <div className="alert-content warning">
              <AlertTriangle size={24} />
              <div>
                <p className="alert-title">Budget Alert</p>
                <p className="alert-message">
                  Your expenses exceed your income this month by {stealthMode ? '••••••' : formatCurrency(Math.abs(stats.savings))}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;


