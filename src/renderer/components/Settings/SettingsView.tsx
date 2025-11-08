import React, { useEffect, useState } from 'react';
import Card from '../Common/Card';
import Button from '../Common/Button';
import { ToggleLeft, ToggleRight } from 'lucide-react';

const SettingsView: React.FC = () => {
  const [moduleSettings, setModuleSettings] = useState<any>({});

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const settings = await window.electronAPI.getModuleSettings();
    setModuleSettings(settings);
  };

  const toggleModule = async (moduleName: string) => {
    const newSettings = { ...moduleSettings, [moduleName]: !moduleSettings[moduleName] };
    setModuleSettings(newSettings);
    await window.electronAPI.updateModuleSettings(newSettings);
    alert('Module settings updated! Reload to see changes.');
  };

  const modules = [
    { id: 'expenses', label: 'Expense Tracker', description: 'Track and categorize your expenses' },
    { id: 'income', label: 'Income Tracker', description: 'Monitor your income sources' },
    { id: 'banks', label: 'Bank Vault', description: 'Securely store bank information' },
    { id: 'cards', label: 'Card Tracker', description: 'Manage credit and debit cards' },
    { id: 'investments', label: 'Investment Tracker', description: 'Track your investment portfolio' },
    { id: 'goals', label: 'Goals & Savings', description: 'Set and track financial goals' },
    { id: 'budget', label: 'Budget Planner', description: 'Plan monthly budgets' },
    { id: 'metrics', label: 'Financial Metrics', description: 'View comprehensive financial health metrics' },
    { id: 'insights', label: 'Predictive Insights', description: 'AI-powered forecasts and recommendations' }
  ];

  return (
    <div className="expense-tracker">
      <div className="module-header">
        <div><h1>Settings</h1><p>Manage your application modules and preferences</p></div>
      </div>

      <Card title="Module Management">
        <p style={{marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '14px'}}>
          Enable or disable individual modules. Disabled modules won't appear in the sidebar.
        </p>

        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {modules.map((module) => {
            const isEnabled = moduleSettings[module.id] !== false;
            
            return (
              <div key={module.id} style={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '16px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                border: `1px solid ${isEnabled ? 'var(--accent-primary)' : 'var(--border-color)'}`
              }}>
                <div>
                  <div style={{fontSize: '16px', fontWeight: 600, marginBottom: '4px'}}>{module.label}</div>
                  <div style={{fontSize: '13px', color: 'var(--text-secondary)'}}>{module.description}</div>
                </div>
                <button
                  onClick={() => toggleModule(module.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: isEnabled ? 'var(--accent-primary)' : 'var(--bg-hover)',
                    color: isEnabled ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                >
                  {isEnabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      <div style={{marginTop: '20px'}}>
      <Card title="About">
        <div style={{fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6'}}>
          <p><strong>Financial Dashboard</strong> - Local-First Privacy-Focused Financial Management</p>
          <p style={{marginTop: '8px'}}>Version: 1.0.0</p>
          <p style={{marginTop: '8px'}}>All your financial data is stored locally and encrypted with your master password. No cloud sync, no data collection.</p>
        </div>
      </Card>
      </div>
    </div>
  );
};

export default SettingsView;

