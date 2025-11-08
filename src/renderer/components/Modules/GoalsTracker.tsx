import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import Card from '../Common/Card';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency, maskValue } from '../../utils/exportUtils';
import { forecastGoalCompletion } from '../../utils/analyticsUtils';

const GoalsTracker: React.FC = () => {
  const { stealthMode } = useAppStore();
  const [goals, setGoals] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [formData, setFormData] = useState({
    goal_name: '', target_amount: '', start_date: new Date().toISOString().split('T')[0],
    target_date: '', monthly_allocation: '', current_saved: '0', status: 'active'
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const data = await window.electronAPI.getGoals();
    setGoals(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, target_amount: parseFloat(formData.target_amount), monthly_allocation: formData.monthly_allocation ? parseFloat(formData.monthly_allocation) : null, current_saved: parseFloat(formData.current_saved) };
    if (editingGoal) {
      await window.electronAPI.updateGoal(editingGoal.id, data);
    } else {
      await window.electronAPI.addGoal(data);
    }
    await loadData();
    closeModal();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this goal?')) {
      await window.electronAPI.deleteGoal(id);
      await loadData();
    }
  };

  const openModal = (goal?: any) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({ ...goal, target_amount: goal.target_amount.toString(), monthly_allocation: goal.monthly_allocation?.toString() || '', current_saved: goal.current_saved.toString() });
    } else {
      setEditingGoal(null);
      setFormData({ goal_name: '', target_amount: '', start_date: new Date().toISOString().split('T')[0], target_date: '', monthly_allocation: '', current_saved: '0', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingGoal(null); };

  const getProgressColor = (percent: number) => {
    if (percent >= 75) return '#10b981';
    if (percent >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="expense-tracker">
      <div className="module-header">
        <div><h1>Goals & Savings Tracker</h1><p>Track progress towards your financial goals</p></div>
        <Button onClick={() => openModal()}><Plus size={16} /> Add Goal</Button>
      </div>

      <div style={{display: 'grid', gap: '20px'}}>
        {goals.map((goal) => {
          const progress = goal.target_amount > 0 ? (goal.current_saved / goal.target_amount) * 100 : 0;
          const forecast = forecastGoalCompletion(goal);
          
          return (
            <Card key={goal.id}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
                <div>
                  <h3 style={{fontSize: '18px', marginBottom: '4px'}}>{goal.goal_name}</h3>
                  <p style={{color: 'var(--text-secondary)', fontSize: '14px'}}>
                    Target: {stealthMode ? maskValue(goal.target_amount, true) : formatCurrency(goal.target_amount)} by {new Date(goal.target_date).toLocaleDateString()}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 500,
                  background: forecast.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : forecast.status === 'on-track' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: forecast.status === 'completed' ? '#10b981' : forecast.status === 'on-track' ? '#3b82f6' : '#ef4444'
                }}>
                  {forecast.status === 'completed' ? 'Completed' : forecast.status === 'on-track' ? 'On Track' : 'Delayed'}
                </span>
              </div>

              <div style={{marginBottom: '16px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px'}}>
                  <span>Progress</span>
                  <span style={{fontWeight: 600}}>{progress.toFixed(1)}%</span>
                </div>
                <div style={{width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden'}}>
                  <div style={{width: `${Math.min(progress, 100)}%`, height: '100%', background: getProgressColor(progress), transition: 'width 0.3s ease'}} />
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px', fontSize: '14px'}}>
                <div>
                  <div style={{color: 'var(--text-secondary)', marginBottom: '4px'}}>Saved</div>
                  <div style={{fontWeight: 600}}>{stealthMode ? maskValue(goal.current_saved, true) : formatCurrency(goal.current_saved)}</div>
                </div>
                <div>
                  <div style={{color: 'var(--text-secondary)', marginBottom: '4px'}}>Remaining</div>
                  <div style={{fontWeight: 600}}>{stealthMode ? maskValue(goal.target_amount - goal.current_saved, true) : formatCurrency(goal.target_amount - goal.current_saved)}</div>
                </div>
                <div>
                  <div style={{color: 'var(--text-secondary)', marginBottom: '4px'}}>Monthly Allocation</div>
                  <div style={{fontWeight: 600}}>{goal.monthly_allocation ? (stealthMode ? maskValue(goal.monthly_allocation, true) : formatCurrency(goal.monthly_allocation)) : '—'}</div>
                </div>
              </div>

              <div style={{display: 'flex', gap: '8px'}}>
                <Button size="sm" variant="secondary" onClick={() => openModal(goal)}><Edit2 size={14} /> Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(goal.id)}><Trash2 size={14} /> Delete</Button>
              </div>
            </Card>
          );
        })}
        {goals.length === 0 && <div className="no-data" style={{padding: '60px', textAlign: 'center'}}>No goals yet. Add your first financial goal!</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingGoal ? 'Edit Goal' : 'Add Goal'} size="md">
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group"><label>Goal Name *</label><input value={formData.goal_name} onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })} required placeholder="e.g., Emergency Fund" /></div>
          <div className="form-row">
            <div className="form-group"><label>Target Amount *</label><input type="number" step="0.01" value={formData.target_amount} onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })} required /></div>
            <div className="form-group"><label>Current Saved *</label><input type="number" step="0.01" value={formData.current_saved} onChange={(e) => setFormData({ ...formData, current_saved: e.target.value })} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Start Date *</label><input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required /></div>
            <div className="form-group"><label>Target Date *</label><input type="date" value={formData.target_date} onChange={(e) => setFormData({ ...formData, target_date: e.target.value })} required /></div>
          </div>
          <div className="form-group"><label>Monthly Allocation</label><input type="number" step="0.01" value={formData.monthly_allocation} onChange={(e) => setFormData({ ...formData, monthly_allocation: e.target.value })} placeholder="Optional" /></div>
          <div className="form-group"><label>Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}><option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option></select></div>
          <div className="form-actions"><Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button><Button type="submit">{editingGoal ? 'Update' : 'Add'}</Button></div>
        </form>
      </Modal>
    </div>
  );
};

export default GoalsTracker;


