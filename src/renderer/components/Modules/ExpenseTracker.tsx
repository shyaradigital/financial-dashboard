import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import Card from '../Common/Card';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import { Plus, Download, Edit2, Trash2, Search } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { exportToCSV, exportToPDF, formatCurrency, maskValue } from '../../utils/exportUtils';
import { groupByCategory } from '../../utils/analyticsUtils';
import './ExpenseTracker.css';

const ExpenseTracker: React.FC = () => {
  const { stealthMode } = useAppStore();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [paymentModes, setPaymentModes] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    comments: '',
    payment_mode: ''
  });

  const [newCategory, setNewCategory] = useState('');
  const [newPaymentMode, setNewPaymentMode] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expenseData, cats, modes] = await Promise.all([
        window.electronAPI.getExpenses(),
        window.electronAPI.getCategories('expense'),
        window.electronAPI.getCategories('payment_mode')
      ]);
      
      setExpenses(expenseData);
      setCategories(cats);
      setPaymentModes(modes);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingExpense) {
        await window.electronAPI.updateExpense(editingExpense.id, {
          ...formData,
          amount: parseFloat(formData.amount)
        });
      } else {
        await window.electronAPI.addExpense({
          ...formData,
          amount: parseFloat(formData.amount)
        });
      }
      
      await loadData();
      closeModal();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await window.electronAPI.deleteExpense(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const openModal = (expense?: any) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        date: expense.date,
        amount: expense.amount.toString(),
        category: expense.category,
        comments: expense.comments || '',
        payment_mode: expense.payment_mode
      });
    } else {
      setEditingExpense(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: categories[0] || '',
        comments: '',
        payment_mode: paymentModes[0] || ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    setNewCategory('');
    setNewPaymentMode('');
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      await window.electronAPI.addCategory('expense', newCategory.trim());
      await loadData();
      setFormData({ ...formData, category: newCategory.trim() });
      setNewCategory('');
    }
  };

  const handleAddPaymentMode = async () => {
    if (newPaymentMode.trim()) {
      await window.electronAPI.addCategory('payment_mode', newPaymentMode.trim());
      await loadData();
      setFormData({ ...formData, payment_mode: newPaymentMode.trim() });
      setNewPaymentMode('');
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.comments?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exp.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || exp.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryData = Object.entries(groupByCategory(filteredExpenses)).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="expense-tracker">
      <div className="module-header">
        <div>
          <h1>Expense Tracker</h1>
          <p>Track and manage your expenses</p>
        </div>
        <div className="module-actions">
          <Button size="sm" variant="secondary" onClick={() => exportToCSV(filteredExpenses, 'expenses')}>
            <Download size={16} /> CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={() => exportToPDF('Expenses Report', filteredExpenses, 'expenses')}>
            <Download size={16} /> PDF
          </Button>
          <Button onClick={() => openModal()}>
            <Plus size={16} /> Add Expense
          </Button>
        </div>
      </div>

      <div className="module-grid">
        <Card title="Expenses by Category" className="chart-card">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No expense data available</div>
          )}
        </Card>

        <Card title="Summary" className="summary-card">
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Total Expenses</span>
              <span className="summary-value expense">
                {stealthMode ? maskValue(totalExpenses, true) : formatCurrency(totalExpenses)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Transactions</span>
              <span className="summary-value">{filteredExpenses.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Average per Transaction</span>
              <span className="summary-value">
                {stealthMode ? maskValue(0, true) : formatCurrency(filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Recent Expenses">
        <div className="table-controls">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-data-cell">No expenses found</td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td><span className="category-badge">{expense.category}</span></td>
                    <td className="amount-cell">
                      {stealthMode ? maskValue(expense.amount, true) : formatCurrency(expense.amount)}
                    </td>
                    <td>{expense.payment_mode}</td>
                    <td>{expense.comments || '—'}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-button" onClick={() => openModal(expense)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-button danger" onClick={() => handleDelete(expense.id)} title="Delete">
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingExpense ? 'Edit Expense' : 'Add Expense'}>
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
            <label>Category *</label>
            <div className="input-with-add">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="add-new-section">
              <input
                type="text"
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button type="button" size="sm" onClick={handleAddCategory}>Add</Button>
            </div>
          </div>

          <div className="form-group">
            <label>Payment Mode *</label>
            <select
              value={formData.payment_mode}
              onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
              required
            >
              <option value="">Select payment mode</option>
              {paymentModes.map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
            <div className="add-new-section">
              <input
                type="text"
                placeholder="New payment mode"
                value={newPaymentMode}
                onChange={(e) => setNewPaymentMode(e.target.value)}
              />
              <Button type="button" size="sm" onClick={handleAddPaymentMode}>Add</Button>
            </div>
          </div>

          <div className="form-group">
            <label>Comments</label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="e.g., #groceries #monthly"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit">{editingExpense ? 'Update' : 'Add'} Expense</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpenseTracker;

