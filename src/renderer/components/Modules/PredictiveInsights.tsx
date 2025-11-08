import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import Card from '../Common/Card';
import { AlertTriangle, TrendingUp, Target, DollarSign } from 'lucide-react';
import { formatCurrency, maskValue } from '../../utils/exportUtils';
import { predictNextValue, getMonthlyAggregates, forecastGoalCompletion, calculateEmergencyFundCoverage, detectBudgetDrift } from '../../utils/analyticsUtils';

const PredictiveInsights: React.FC = () => {
  const { stealthMode } = useAppStore();
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => { generateInsights(); }, []);

  const generateInsights = async () => {
    try {
      const now = new Date();
      const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6)).toISOString().split('T')[0];

      const [expenses, incomes, goals, budget, profile] = await Promise.all([
        window.electronAPI.getExpenses({ startDate: sixMonthsAgo }),
        window.electronAPI.getIncomes({ startDate: sixMonthsAgo }),
        window.electronAPI.getGoals(),
        window.electronAPI.getBudget(),
        window.electronAPI.getProfile()
      ]);

      const generatedInsights: any[] = [];

      // 1. Emergency Fund Warning
      const emergencyGoal = goals.find((g: any) => g.goal_name.toLowerCase().includes('emergency'));
      if (emergencyGoal) {
        const monthlyExpenses = Object.values(getMonthlyAggregates(expenses));
        const avgExpense = monthlyExpenses.length > 0 ? (monthlyExpenses as number[]).reduce((a, b) => a + b, 0) / monthlyExpenses.length : 0;
        const coverage = calculateEmergencyFundCoverage(emergencyGoal.current_saved, avgExpense);
        const threshold = profile?.profile?.emergency_fund_threshold || 3;
        
        if (coverage < threshold) {
          generatedInsights.push({
            type: 'warning',
            icon: AlertTriangle,
            title: 'Emergency Fund Alert',
            message: `Your emergency fund covers only ${coverage.toFixed(1)} months of expenses. Recommended: ${threshold} months.`,
            value: formatCurrency(emergencyGoal.current_saved),
            recommendation: `Add ${formatCurrency((threshold - coverage) * avgExpense)} to reach your goal.`
          });
        }
      }

      // 2. Budget Alert
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const currentMonthExpenses = expenses.filter((e: any) => e.date >= firstDay);
      const totalExpense = currentMonthExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
      const totalBudget = (budget?.essentials || 0) + (budget?.leisure || 0) + (budget?.emis_debts || 0) + (budget?.savings_investments || 0);

      if (totalExpense > totalBudget) {
        generatedInsights.push({
          type: 'danger',
          icon: AlertTriangle,
          title: 'Budget Exceeded',
          message: `You've exceeded your monthly budget by ${formatCurrency(totalExpense - totalBudget)}.`,
          value: formatCurrency(totalExpense),
          recommendation: 'Review and cut non-essential expenses.'
        });
      }

      // 3. Expense Trend Forecast
      const monthlyExpenseValues = Object.values(getMonthlyAggregates(expenses));
      if (monthlyExpenseValues.length >= 3) {
        const predictedNext = predictNextValue(monthlyExpenseValues as number[]);
        generatedInsights.push({
          type: 'info',
          icon: TrendingUp,
          title: 'Expense Forecast',
          message: `Based on trends, next month's expenses are predicted to be around ${formatCurrency(predictedNext)}.`,
          value: formatCurrency(predictedNext),
          recommendation: 'Plan your budget accordingly.'
        });
      }

      // 4. Income Stability
      const monthlyIncomeValues = Object.values(getMonthlyAggregates(incomes));
      if (monthlyIncomeValues.length >= 3) {
        const avgIncome = (monthlyIncomeValues as number[]).reduce((a, b) => a + b, 0) / monthlyIncomeValues.length;
        const stdDev = Math.sqrt((monthlyIncomeValues as number[]).reduce((sum, val) => sum + Math.pow(val - avgIncome, 2), 0) / monthlyIncomeValues.length);
        const cv = avgIncome > 0 ? (stdDev / avgIncome) * 100 : 0;

        if (cv > 20) {
          generatedInsights.push({
            type: 'warning',
            icon: TrendingUp,
            title: 'Income Volatility',
            message: `Your income has high variability (${cv.toFixed(1)}% coefficient of variation).`,
            value: formatCurrency(avgIncome),
            recommendation: 'Consider building a larger emergency fund to handle fluctuations.'
          });
        }
      }

      // 5. Goal Completion Forecasts
      goals.filter((g: any) => g.status === 'active').forEach((goal: any) => {
        const forecast = forecastGoalCompletion(goal);
        if (forecast.status === 'delayed') {
          generatedInsights.push({
            type: 'warning',
            icon: Target,
            title: `Goal: ${goal.goal_name}`,
            message: `At current pace, you'll need ${forecast.monthsNeeded.toFixed(1)} months, but only ${forecast.monthsRemaining.toFixed(1)} months remain.`,
            value: formatCurrency(goal.current_saved),
            recommendation: goal.monthly_allocation ? `Increase monthly allocation to ${formatCurrency((goal.target_amount - goal.current_saved) / forecast.monthsRemaining)}.` : 'Set a monthly allocation.'
          });
        } else if (forecast.status === 'on-track') {
          generatedInsights.push({
            type: 'success',
            icon: Target,
            title: `Goal: ${goal.goal_name}`,
            message: `You're on track to complete this goal by ${new Date(goal.target_date).toLocaleDateString()}!`,
            value: formatCurrency(goal.current_saved),
            recommendation: 'Keep up the good work!'
          });
        }
      });

      // 6. Budget Drift Detection
      if (monthlyExpenseValues.length >= 6) {
        const drift = detectBudgetDrift(monthlyExpenseValues as number[]);
        if (drift.isDrifting) {
          generatedInsights.push({
            type: 'warning',
            icon: TrendingUp,
            title: 'Budget Drift Detected',
            message: `Your spending has been trending ${drift.trendDirection} by ${Math.abs(drift.percentageChange).toFixed(1)}% over the past 3 months.`,
            recommendation: drift.trendDirection === 'up' ? 'Review and control increasing expenses.' : 'Great job reducing expenses!'
          });
        }
      }

      // 7. Cash Flow Projection
      const avgIncome = monthlyIncomeValues.length > 0 ? (monthlyIncomeValues as number[]).reduce((a, b) => a + b, 0) / monthlyIncomeValues.length : 0;
      const avgExpense = monthlyExpenseValues.length > 0 ? (monthlyExpenseValues as number[]).reduce((a, b) => a + b, 0) / monthlyExpenseValues.length : 0;
      const monthlySurplus = avgIncome - avgExpense;

      if (monthlySurplus < 0) {
        generatedInsights.push({
          type: 'danger',
          icon: AlertTriangle,
          title: 'Negative Cash Flow',
          message: `On average, you're spending ${formatCurrency(Math.abs(monthlySurplus))} more than you earn each month.`,
          recommendation: 'Urgent: Reduce expenses or increase income sources.'
        });
      } else if (monthlySurplus > 0) {
        const sixMonthProjection = monthlySurplus * 6;
        generatedInsights.push({
          type: 'success',
          icon: DollarSign,
          title: 'Positive Cash Flow',
          message: `You save approximately ${formatCurrency(monthlySurplus)} per month. In 6 months, you could save ${formatCurrency(sixMonthProjection)}.`,
          recommendation: 'Consider investing surplus for better returns.'
        });
      }

      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  return (
    <div className="expense-tracker">
      <div className="module-header">
        <div><h1>Predictive Insights</h1><p>AI-powered financial forecasts and recommendations</p></div>
      </div>

      {insights.length === 0 ? (
        <Card><div className="no-data">No insights available yet. Add more financial data to get predictions.</div></Card>
      ) : (
        <div style={{display: 'grid', gap: '16px'}}>
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            const bgColors = {
              success: 'rgba(16, 185, 129, 0.1)',
              warning: 'rgba(245, 158, 11, 0.1)',
              danger: 'rgba(239, 68, 68, 0.1)',
              info: 'rgba(59, 130, 246, 0.1)'
            };
            const textColors = {
              success: '#10b981',
              warning: '#f59e0b',
              danger: '#ef4444',
              info: '#3b82f6'
            };

            return (
              <Card key={index}>
                <div style={{display: 'flex', gap: '16px'}}>
                  <div style={{width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgColors[insight.type as keyof typeof bgColors], color: textColors[insight.type as keyof typeof textColors], flexShrink: 0}}>
                    <Icon size={24} />
                  </div>
                  <div style={{flex: 1}}>
                    <h3 style={{fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: textColors[insight.type as keyof typeof textColors]}}>{insight.title}</h3>
                    <p style={{fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px'}}>{stealthMode && insight.message.includes('₹') ? insight.message.replace(/₹[\d,]+/g, '₹••••••') : insight.message}</p>
                    {insight.value && <p style={{fontSize: '20px', fontWeight: 600, marginBottom: '8px'}}>{stealthMode ? maskValue(insight.value, true) : insight.value}</p>}
                    {insight.recommendation && (
                      <div style={{padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '13px', color: 'var(--text-secondary)'}}>
                        <strong>Recommendation:</strong> {stealthMode && insight.recommendation.includes('₹') ? insight.recommendation.replace(/₹[\d,]+/g, '₹••••••') : insight.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PredictiveInsights;


