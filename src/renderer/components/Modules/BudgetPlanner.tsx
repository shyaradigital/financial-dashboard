import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import Card from '../Common/Card';
import Button from '../Common/Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency, maskValue } from '../../utils/exportUtils';

const BudgetPlanner: React.FC = () => {
  const { stealthMode } = useAppStore();
  const [budget, setBudget] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [formData, setFormData] = useState({ essentials: '0', leisure: '0', emis_debts: '0', savings_investments: '0' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const [budgetData, expenseData] = await Promise.all([
      window.electronAPI.getBudget(),
      window.electronAPI.getExpenses({ startDate: firstDay, endDate: lastDay })
    ]);
    
    setBudget(budgetData);
    setExpenses(expenseData);
    setFormData({ 
      essentials: budgetData.essentials?.toString() || '0',
      leisure: budgetData.leisure?.toString() || '0',
      emis_debts: budgetData.emis_debts?.toString() || '0',
      savings_investments: budgetData.savings_investments?.toString() || '0'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await window.electronAPI.updateBudget({
      essentials: parseFloat(formData.essentials),
      leisure: parseFloat(formData.leisure),
      emis_debts: parseFloat(formData.emis_debts),
      savings_investments: parseFloat(formData.savings_investments)
    });
    await loadData();
  };

  const totalBudget = parseFloat(formData.essentials) + parseFloat(formData.leisure) + parseFloat(formData.emis_debts) + parseFloat(formData.savings_investments);
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const budgetData = [
    { name: 'Essentials', value: parseFloat(formData.essentials) },
    { name: 'Leisure', value: parseFloat(formData.leisure) },
    { name: 'EMIs/Debts', value: parseFloat(formData.emis_debts) },
    { name: 'Savings', value: parseFloat(formData.savings_investments) }
  ].filter(d => d.value > 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  const getStatusColor = (budgeted: number, actual: number) => {
    if (actual <= budgeted) return '#10b981';
    if (actual <= budgeted * 1.1) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="expense-tracker">
      <div className="module-header">
        <div><h1>Budget Planner</h1><p>Plan and track your monthly budget</p></div>
      </div>

      <div className="module-grid">
        <Card title="Budget Allocation" className="chart-card">
          {budgetData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={budgetData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {budgetData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">Set your budget to see allocation</div>
          )}
        </Card>

        <Card title="Monthly Summary">
          <div className="summary-stats">
            <div className="summary-item"><span className="summary-label">Total Budget</span><span className="summary-value">{stealthMode ? maskValue(totalBudget, true) : formatCurrency(totalBudget)}</span></div>
            <div className="summary-item"><span className="summary-label">Total Spent</span><span className="summary-value expense">{stealthMode ? maskValue(totalSpent, true) : formatCurrency(totalSpent)}</span></div>
            <div className="summary-item"><span className="summary-label">Remaining</span><span className="summary-value" style={{color: getStatusColor(totalBudget, totalSpent)}}>{stealthMode ? maskValue(totalBudget - totalSpent, true) : formatCurrency(totalBudget - totalSpent)}</span></div>
          </div>
        </Card>
      </div>

      <Card title="Set Monthly Budget">
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-row">
            <div className="form-group"><label>Essentials</label><input type="number" step="0.01" value={formData.essentials} onChange={(e) => setFormData({ ...formData, essentials: e.target.value })} /></div>
            <div className="form-group"><label>Leisure</label><input type="number" step="0.01" value={formData.leisure} onChange={(e) => setFormData({ ...formData, leisure: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>EMIs/Debts</label><input type="number" step="0.01" value={formData.emis_debts} onChange={(e) => setFormData({ ...formData, emis_debts: e.target.value })} /></div>
            <div className="form-group"><label>Savings/Investments</label><input type="number" step="0.01" value={formData.savings_investments} onChange={(e) => setFormData({ ...formData, savings_investments: e.target.value })} /></div>
          </div>
          <Button type="submit">Update Budget</Button>
        </form>
      </Card>
    </div>
  );
};

export default BudgetPlanner;

