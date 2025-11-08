import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import Card from '../Common/Card';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import { formatCurrency, maskValue } from '../../utils/exportUtils';
import { calculateSavingsRate, calculateBudgetAdherence, calculateExpenseVolatility, coefficientOfVariation, getMonthlyAggregates } from '../../utils/analyticsUtils';

const FinancialMetrics: React.FC = () => {
  const { stealthMode } = useAppStore();
  const [metrics, setMetrics] = useState({
    savingsRate: 0, budgetAdherence: 0, avgMonthlyBurn: 0, expenseVolatility: 0,
    incomeStability: 0, goalFulfillment: 0, debtToIncome: 0, emergencyFundCoverage: 0
  });

  useEffect(() => { calculateMetrics(); }, []);

  const calculateMetrics = async () => {
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6)).toISOString().split('T')[0];

      const [incomes, expenses, budget, goals, cards] = await Promise.all([
        window.electronAPI.getIncomes({ startDate: sixMonthsAgo }),
        window.electronAPI.getExpenses({ startDate: sixMonthsAgo }),
        window.electronAPI.getBudget(),
        window.electronAPI.getGoals(),
        window.electronAPI.getCards()
      ]);

      const currentMonthIncomes = incomes.filter((i: any) => i.date >= firstDay && i.date <= lastDay);
      const currentMonthExpenses = expenses.filter((e: any) => e.date >= firstDay && e.date <= lastDay);
      
      const totalIncome = currentMonthIncomes.reduce((sum: number, i: any) => sum + i.amount, 0);
      const totalExpense = currentMonthExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

      const savingsRate = calculateSavingsRate(totalIncome, totalExpense);

      const totalBudget = (budget?.essentials || 0) + (budget?.leisure || 0) + (budget?.emis_debts || 0) + (budget?.savings_investments || 0);
      const budgetAdherence = calculateBudgetAdherence(totalBudget, totalExpense);

      const monthlyExpenses = Object.values(getMonthlyAggregates(expenses));
      const avgMonthlyBurn = monthlyExpenses.length > 0 ? monthlyExpenses.reduce((a: any, b: any) => a + b, 0) / monthlyExpenses.length : 0;
      const expenseVolatility = calculateExpenseVolatility(monthlyExpenses as number[]);

      const monthlyIncomes = Object.values(getMonthlyAggregates(incomes));
      const incomeStability = 100 - Math.min(coefficientOfVariation(monthlyIncomes as number[]), 100);

      const activeGoals = goals.filter((g: any) => g.status === 'active');
      const completedGoals = goals.filter((g: any) => g.status === 'completed').length;
      const goalFulfillment = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

      const totalDebt = cards.filter((c: any) => c.card_type === 'Credit').reduce((sum: number, c: any) => sum + (c.current_due || 0), 0);
      const debtToIncome = totalIncome > 0 ? (totalDebt / totalIncome) * 100 : 0;

      const emergencyGoal = goals.find((g: any) => g.goal_name.toLowerCase().includes('emergency'));
      const emergencyFund = emergencyGoal?.current_saved || 0;
      const emergencyFundCoverage = avgMonthlyBurn > 0 ? emergencyFund / avgMonthlyBurn : 0;

      setMetrics({
        savingsRate, budgetAdherence, avgMonthlyBurn, expenseVolatility,
        incomeStability, goalFulfillment, debtToIncome, emergencyFundCoverage
      });
    } catch (error) {
      console.error('Error calculating metrics:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="expense-tracker">
      <div className="module-header">
        <div><h1>Financial Health Metrics</h1><p>Comprehensive analysis of your financial health</p></div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
        <Card title="Savings Rate">
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <div style={{width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}><TrendingUp size={28} /></div>
            <div>
              <div style={{fontSize: '28px', fontWeight: 700, color: getScoreColor(metrics.savingsRate)}}>{stealthMode ? '••%' : `${metrics.savingsRate.toFixed(1)}%`}</div>
              <div style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Of income saved</div>
            </div>
          </div>
        </Card>

        <Card title="Budget Adherence">
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <div style={{width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'}}><Target size={28} /></div>
            <div>
              <div style={{fontSize: '28px', fontWeight: 700, color: getScoreColor(metrics.budgetAdherence)}}>{stealthMode ? '••%' : `${metrics.budgetAdherence.toFixed(1)}%`}</div>
              <div style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Following budget</div>
            </div>
          </div>
        </Card>

        <Card title="Avg Monthly Burn">
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <div style={{width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}}><TrendingDown size={28} /></div>
            <div>
              <div style={{fontSize: '28px', fontWeight: 700}}>{stealthMode ? maskValue(metrics.avgMonthlyBurn, true) : formatCurrency(metrics.avgMonthlyBurn)}</div>
              <div style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Average monthly expenses</div>
            </div>
          </div>
        </Card>

        <Card title="Expense Volatility">
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <div style={{width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b'}}><Activity size={28} /></div>
            <div>
              <div style={{fontSize: '28px', fontWeight: 700}}>{stealthMode ? maskValue(metrics.expenseVolatility, true) : formatCurrency(metrics.expenseVolatility)}</div>
              <div style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Std deviation</div>
            </div>
          </div>
        </Card>

        <Card title="Income Stability">
          <div>
            <div style={{fontSize: '24px', fontWeight: 600, marginBottom: '12px', color: getScoreColor(metrics.incomeStability)}}>{stealthMode ? '••%' : `${metrics.incomeStability.toFixed(1)}%`}</div>
            <div style={{width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden'}}>
              <div style={{width: `${metrics.incomeStability}%`, height: '100%', background: getScoreColor(metrics.incomeStability), transition: 'width 0.3s'}} />
            </div>
            <div style={{fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px'}}>Higher is more stable</div>
          </div>
        </Card>

        <Card title="Goal Fulfillment">
          <div>
            <div style={{fontSize: '24px', fontWeight: 600, marginBottom: '12px', color: getScoreColor(metrics.goalFulfillment)}}>{metrics.goalFulfillment.toFixed(1)}%</div>
            <div style={{width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden'}}>
              <div style={{width: `${metrics.goalFulfillment}%`, height: '100%', background: getScoreColor(metrics.goalFulfillment), transition: 'width 0.3s'}} />
            </div>
            <div style={{fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px'}}>Completed goals ratio</div>
          </div>
        </Card>

        <Card title="Debt-to-Income Ratio">
          <div>
            <div style={{fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: metrics.debtToIncome > 40 ? '#ef4444' : metrics.debtToIncome > 20 ? '#f59e0b' : '#10b981'}}>{stealthMode ? '••%' : `${metrics.debtToIncome.toFixed(1)}%`}</div>
            <div style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Lower is better (&lt;20% ideal)</div>
          </div>
        </Card>

        <Card title="Emergency Fund Coverage">
          <div>
            <div style={{fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: getScoreColor(metrics.emergencyFundCoverage >= 3 ? 100 : (metrics.emergencyFundCoverage / 3) * 100)}}>{stealthMode ? '•• months' : `${metrics.emergencyFundCoverage.toFixed(1)} months`}</div>
            <div style={{fontSize: '13px', color: 'var(--text-secondary)'}}>3-6 months recommended</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FinancialMetrics;


