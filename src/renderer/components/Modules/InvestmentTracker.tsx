import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import Card from '../Common/Card';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency, maskValue } from '../../utils/exportUtils';

const InvestmentTracker: React.FC = () => {
  const { stealthMode } = useAppStore();
  const [investments, setInvestments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<any>(null);
  const [formData, setFormData] = useState({
    investment_type: '', name: '', platform: '', amount_invested: '',
    date_of_entry: new Date().toISOString().split('T')[0],
    current_valuation: '', expected_roi: '', tax_flag: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await window.electronAPI.getInvestments();
      // Ensure all numeric fields are properly parsed
      const parsedData = data.map((inv: any) => ({
        ...inv,
        amount_invested: typeof inv.amount_invested === 'string' ? parseFloat(inv.amount_invested) : (inv.amount_invested || 0),
        current_valuation: inv.current_valuation ? (typeof inv.current_valuation === 'string' ? parseFloat(inv.current_valuation) : inv.current_valuation) : null,
        expected_roi: inv.expected_roi ? (typeof inv.expected_roi === 'string' ? parseFloat(inv.expected_roi) : inv.expected_roi) : null
      }));
      setInvestments(parsedData);
    } catch (error) {
      console.error('Error loading investments:', error);
      setInvestments([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        amount_invested: parseFloat(formData.amount_invested) || 0,
        current_valuation: formData.current_valuation ? parseFloat(formData.current_valuation) : null,
        expected_roi: formData.expected_roi ? parseFloat(formData.expected_roi) : null
      };
      
      if (editingInvestment) {
        const success = await window.electronAPI.updateInvestment(editingInvestment.id, data);
        if (!success) {
          alert('Failed to update investment. Please try again.');
          return;
        }
      } else {
        const result = await window.electronAPI.addInvestment(data);
        if (!result) {
          alert('Failed to add investment. Please try again.');
          return;
        }
      }
      
      // Force reload data to ensure calculations are updated
      await loadData();
      
      closeModal();
    } catch (error) {
      console.error('Error saving investment:', error);
      alert('An error occurred while saving the investment.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this investment?')) {
      await window.electronAPI.deleteInvestment(id);
      await loadData();
    }
  };

  const openModal = (investment?: any) => {
    if (investment) {
      setEditingInvestment(investment);
      setFormData({ ...investment, amount_invested: investment.amount_invested.toString(), current_valuation: investment.current_valuation?.toString() || '', expected_roi: investment.expected_roi?.toString() || '' });
    } else {
      setEditingInvestment(null);
      setFormData({ investment_type: 'Mutual Funds', name: '', platform: '', amount_invested: '', date_of_entry: new Date().toISOString().split('T')[0], current_valuation: '', expected_roi: '', tax_flag: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingInvestment(null); };

  // Calculate totals with proper number handling
  const totalInvested = investments.reduce((sum, inv) => {
    const invested = typeof inv.amount_invested === 'number' ? inv.amount_invested : parseFloat(inv.amount_invested) || 0;
    return sum + invested;
  }, 0);
  
  const totalCurrent = investments.reduce((sum, inv) => {
    const invested = typeof inv.amount_invested === 'number' ? inv.amount_invested : parseFloat(inv.amount_invested) || 0;
    const current = inv.current_valuation 
      ? (typeof inv.current_valuation === 'number' ? inv.current_valuation : parseFloat(inv.current_valuation) || invested)
      : invested;
    return sum + current;
  }, 0);
  
  const totalGain = totalCurrent - totalInvested;

  const typeData = investments.reduce((acc: any, inv) => {
    const invested = typeof inv.amount_invested === 'number' ? inv.amount_invested : parseFloat(inv.amount_invested) || 0;
    acc[inv.investment_type] = (acc[inv.investment_type] || 0) + invested;
    return acc;
  }, {});

  const chartData = Object.entries(typeData).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="expense-tracker">
      <div className="module-header">
        <div><h1>Investment Tracker</h1><p>Monitor your investment portfolio</p></div>
        <Button onClick={() => openModal()}><Plus size={16} /> Add Investment</Button>
      </div>

      <div className="module-grid">
        <Card title="Portfolio Allocation" className="chart-card">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No investment data</div>
          )}
        </Card>

        <Card title="Summary" className="summary-card">
          <div className="summary-stats">
            <div className="summary-item"><span className="summary-label">Total Invested</span><span className="summary-value">{stealthMode ? maskValue(totalInvested, true) : formatCurrency(totalInvested)}</span></div>
            <div className="summary-item"><span className="summary-label">Current Value</span><span className="summary-value">{stealthMode ? maskValue(totalCurrent, true) : formatCurrency(totalCurrent)}</span></div>
            <div className="summary-item"><span className="summary-label">Total Gain/Loss</span><span className={`summary-value ${totalGain >= 0 ? '' : 'expense'}`} style={{color: totalGain >= 0 ? '#10b981' : '#ef4444'}}>{stealthMode ? maskValue(totalGain, true) : formatCurrency(totalGain)}</span></div>
          </div>
        </Card>
      </div>

      <Card title="Investments">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Type</th><th>Name</th><th>Platform</th><th>Invested</th><th>Current Value</th><th>Gain/Loss</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {investments.length === 0 ? (
                <tr><td colSpan={7} className="no-data-cell">No investments</td></tr>
              ) : (
                investments.map((inv) => {
                  // Ensure values are numbers for calculation
                  const invested = typeof inv.amount_invested === 'number' ? inv.amount_invested : parseFloat(inv.amount_invested) || 0;
                  const current = inv.current_valuation 
                    ? (typeof inv.current_valuation === 'number' ? inv.current_valuation : parseFloat(inv.current_valuation) || invested)
                    : invested;
                  const gain = current - invested;
                  
                  return (
                    <tr key={inv.id}>
                      <td><span className="category-badge">{inv.investment_type}</span></td>
                      <td>{inv.name}</td>
                      <td>{inv.platform || '—'}</td>
                      <td className="amount-cell">{stealthMode ? maskValue(invested, true) : formatCurrency(invested)}</td>
                      <td className="amount-cell">{stealthMode ? maskValue(current, true) : formatCurrency(current)}</td>
                      <td className="amount-cell" style={{color: gain >= 0 ? '#10b981' : '#ef4444'}}>{stealthMode ? maskValue(gain, true) : formatCurrency(gain)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="icon-button" onClick={() => openModal(inv)} title="Edit"><Edit2 size={16} /></button>
                          <button className="icon-button danger" onClick={() => handleDelete(inv.id)} title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingInvestment ? 'Edit Investment' : 'Add Investment'} size="md">
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group"><label>Investment Type *</label><select value={formData.investment_type} onChange={(e) => setFormData({ ...formData, investment_type: e.target.value })} required><option value="">Select</option><option value="Mutual Funds">Mutual Funds</option><option value="Stocks">Stocks</option><option value="Crypto">Crypto</option><option value="Fixed Deposits">Fixed Deposits</option><option value="PPF">PPF</option><option value="NPS">NPS</option><option value="Digital Gold">Digital Gold</option><option value="Real Estate">Real Estate</option><option value="ULIPs">ULIPs</option><option value="Bonds">Bonds</option></select></div>
          <div className="form-group"><label>Name *</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
          <div className="form-group"><label>Platform</label><input value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} placeholder="e.g., Zerodha, Groww" /></div>
          <div className="form-row">
            <div className="form-group"><label>Amount Invested *</label><input type="number" step="0.01" value={formData.amount_invested} onChange={(e) => setFormData({ ...formData, amount_invested: e.target.value })} required /></div>
            <div className="form-group"><label>Date of Entry *</label><input type="date" value={formData.date_of_entry} onChange={(e) => setFormData({ ...formData, date_of_entry: e.target.value })} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Current Valuation</label><input type="number" step="0.01" value={formData.current_valuation} onChange={(e) => setFormData({ ...formData, current_valuation: e.target.value })} /></div>
            <div className="form-group"><label>Expected ROI (%)</label><input type="number" step="0.01" value={formData.expected_roi} onChange={(e) => setFormData({ ...formData, expected_roi: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Tax Flag</label><input value={formData.tax_flag} onChange={(e) => setFormData({ ...formData, tax_flag: e.target.value })} placeholder="e.g., 80C, LTCG" /></div>
          <div className="form-actions"><Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button><Button type="submit">{editingInvestment ? 'Update' : 'Add'}</Button></div>
        </form>
      </Modal>
    </div>
  );
};

export default InvestmentTracker;

