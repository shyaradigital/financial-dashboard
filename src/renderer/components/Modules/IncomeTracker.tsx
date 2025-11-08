import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import Card from '../Common/Card';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import { Plus, Download, Edit2, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportToCSV, exportToPDF, formatCurrency, maskValue } from '../../utils/exportUtils';
import { getMonthlyAggregates } from '../../utils/analyticsUtils';

const IncomeTracker: React.FC = () => {
  const { stealthMode } = useAppStore();
  const [incomes, setIncomes] = useState<any[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [paymentModes, setPaymentModes] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: '',
    amount: '',
    frequency: '',
    mode: '',
    taxable: false,
    comments: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [incomeData, srcs, modes] = await Promise.all([
        window.electronAPI.getIncomes(),
        window.electronAPI.getCategories('income_source'),
        window.electronAPI.getCategories('payment_mode')
      ]);
      
      setIncomes(incomeData);
      setSources(srcs);
      setPaymentModes(modes);
    } catch (error) {
      console.error('Error loading incomes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingIncome) {
        await window.electronAPI.updateIncome(editingIncome.id, {
          ...formData,
          amount: parseFloat(formData.amount)
        });
      } else {
        await window.electronAPI.addIncome({
          ...formData,
          amount: parseFloat(formData.amount)
        });
      }
      
      await loadData();
      closeModal();
    } catch (error) {
      console.error('Error saving income:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this income entry?')) {
      try {
        await window.electronAPI.deleteIncome(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting income:', error);
      }
    }
  };

  const openModal = (income?: any) => {
    if (income) {
      setEditingIncome(income);
      setFormData({
        date: income.date,
        source: income.source,
        amount: income.amount.toString(),
        frequency: income.frequency || '',
        mode: income.mode,
        taxable: income.taxable === 1,
        comments: income.comments || ''
      });
    } else {
      setEditingIncome(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        source: sources[0] || '',
        amount: '',
        frequency: '',
        mode: paymentModes[0] || '',
        taxable: false,
        comments: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingIncome(null);
  };

  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const taxableIncome = incomes.filter(inc => inc.taxable === 1).reduce((sum, inc) => sum + inc.amount, 0);
  const nonTaxableIncome = totalIncome - taxableIncome;

  const monthlyData = Object.entries(getMonthlyAggregates(incomes)).map(([month, amount]) => ({
    month,
    amount
  })).slice(-6);

  return (
    <div className="expense-tracker">
      <div className="module-header">
        <div>
          <h1>Income Tracker</h1>
          <p>Track and manage your income sources</p>
        </div>
        <div className="module-actions">
          <Button size="sm" variant="secondary" onClick={() => exportToCSV(incomes, 'incomes')}>
            <Download size={16} /> CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={() => exportToPDF('Income Report', incomes, 'incomes')}>
            <Download size={16} /> PDF
          </Button>
          <Button onClick={() => openModal()}>
            <Plus size={16} /> Add Income
          </Button>
        </div>
      </div>

      <div className="module-grid">
        <Card title="Monthly Income Trend" className="chart-card">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#a0a0a0" />
                <YAxis stroke="#a0a0a0" />
                <Tooltip formatter={(value: any) => formatCurrency(value)} contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} name="Income" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No income data available</div>
          )}
        </Card>

        <Card title="Summary" className="summary-card">
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Total Income</span>
              <span className="summary-value" style={{color: '#10b981'}}>
                {stealthMode ? maskValue(totalIncome, true) : formatCurrency(totalIncome)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Taxable Income</span>
              <span className="summary-value">
                {stealthMode ? maskValue(taxableIncome, true) : formatCurrency(taxableIncome)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Non-Taxable Income</span>
              <span className="summary-value">
                {stealthMode ? maskValue(nonTaxableIncome, true) : formatCurrency(nonTaxableIncome)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Income Entries">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Amount</th>
                <th>Frequency</th>
                <th>Mode</th>
                <th>Taxable</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-data-cell">No income entries found</td>
                </tr>
              ) : (
                incomes.map((income) => (
                  <tr key={income.id}>
                    <td>{new Date(income.date).toLocaleDateString()}</td>
                    <td><span className="category-badge">{income.source}</span></td>
                    <td className="amount-cell" style={{color: '#10b981'}}>
                      {stealthMode ? maskValue(income.amount, true) : formatCurrency(income.amount)}
                    </td>
                    <td>{income.frequency || '—'}</td>
                    <td>{income.mode}</td>
                    <td>{income.taxable === 1 ? 'Yes' : 'No'}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-button" onClick={() => openModal(income)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-button danger" onClick={() => handleDelete(income.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingIncome ? 'Edit Income' : 'Add Income'}>
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Amount *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Source *</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              required
            >
              <option value="">Select source</option>
              {sources.map(src => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Frequency</label>
              <input
                type="text"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="e.g., Monthly, One-time"
              />
            </div>
            <div className="form-group">
              <label>Mode *</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                required
              >
                <option value="">Select mode</option>
                {paymentModes.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <input
                type="checkbox"
                checked={formData.taxable}
                onChange={(e) => setFormData({ ...formData, taxable: e.target.checked })}
              />
              Taxable Income
            </label>
          </div>

          <div className="form-group">
            <label>Comments</label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Additional notes"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit">{editingIncome ? 'Update' : 'Add'} Income</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IncomeTracker;


