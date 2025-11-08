import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import Card from '../Common/Card';
import Button from '../Common/Button';
import { User, Target, TrendingUp } from 'lucide-react';

const ProfileView: React.FC = () => {
  const { profile, setProfile } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', age: '', profession: '', income_type: '',
    auto_lock_minutes: '5', emergency_fund_threshold: '3',
    goals: [] as string[],
    preferences: [] as string[]
  });
  const [newGoal, setNewGoal] = useState('');
  const [newPref, setNewPref] = useState('');

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    const data = await window.electronAPI.getProfile();
    setProfile(data);
    setFormData({
      name: data.profile?.name || '',
      age: data.profile?.age?.toString() || '',
      profession: data.profile?.profession || '',
      income_type: data.profile?.income_type || '',
      auto_lock_minutes: data.profile?.auto_lock_minutes?.toString() || '5',
      emergency_fund_threshold: data.profile?.emergency_fund_threshold?.toString() || '3',
      goals: data.goals || [],
      preferences: data.preferences || []
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await window.electronAPI.updateProfile({
      ...formData,
      age: formData.age ? parseInt(formData.age) : null,
      auto_lock_minutes: parseInt(formData.auto_lock_minutes),
      emergency_fund_threshold: parseInt(formData.emergency_fund_threshold)
    });
    await loadProfile();
    setIsEditing(false);
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setFormData({ ...formData, goals: [...formData.goals, newGoal.trim()] });
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setFormData({ ...formData, goals: formData.goals.filter((_, i) => i !== index) });
  };

  const addPreference = () => {
    if (newPref.trim()) {
      setFormData({ ...formData, preferences: [...formData.preferences, newPref.trim()] });
      setNewPref('');
    }
  };

  const removePreference = (index: number) => {
    setFormData({ ...formData, preferences: formData.preferences.filter((_, i) => i !== index) });
  };

  const calculateCompletion = () => {
    const fields = [formData.name, formData.age, formData.profession, formData.income_type];
    const filled = fields.filter(f => f && f.toString().trim()).length;
    const hasGoals = formData.goals.length > 0;
    const hasPrefs = formData.preferences.length > 0;
    return ((filled / fields.length) * 70 + (hasGoals ? 15 : 0) + (hasPrefs ? 15 : 0)).toFixed(0);
  };

  const completion = calculateCompletion();

  if (!isEditing) {
    return (
      <div className="expense-tracker">
        <div className="module-header">
          <div><h1>Profile</h1><p>Your financial profile and preferences</p></div>
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px'}}>
          <Card title="Profile Completion">
            <div style={{marginBottom: '16px'}}>
              <div style={{fontSize: '36px', fontWeight: 700, marginBottom: '8px', color: parseInt(completion) >= 80 ? '#10b981' : parseInt(completion) >= 50 ? '#f59e0b' : '#ef4444'}}>{completion}%</div>
              <div style={{width: '100%', height: '12px', background: 'var(--bg-tertiary)', borderRadius: '6px', overflow: 'hidden'}}>
                <div style={{width: `${completion}%`, height: '100%', background: parseInt(completion) >= 80 ? '#10b981' : parseInt(completion) >= 50 ? '#f59e0b' : '#ef4444', transition: 'width 0.3s'}} />
              </div>
            </div>
            <p style={{fontSize: '14px', color: 'var(--text-secondary)'}}>Complete your profile for better insights and recommendations.</p>
          </Card>

          <Card title="Personal Information" actions={<User size={20} />}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px'}}>
              <div><strong>Name:</strong> {formData.name || <span style={{color: 'var(--text-muted)'}}>NULL</span>}</div>
              <div><strong>Age:</strong> {formData.age || <span style={{color: 'var(--text-muted)'}}>NULL</span>}</div>
              <div><strong>Profession:</strong> {formData.profession || <span style={{color: 'var(--text-muted)'}}>NULL</span>}</div>
              <div><strong>Income Type:</strong> {formData.income_type || <span style={{color: 'var(--text-muted)'}}>NULL</span>}</div>
            </div>
          </Card>

          <Card title="Security Settings">
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px'}}>
              <div><strong>Auto-lock Timer:</strong> {formData.auto_lock_minutes} minutes</div>
              <div><strong>Emergency Fund Threshold:</strong> {formData.emergency_fund_threshold} months</div>
            </div>
          </Card>

          <Card title="Financial Goals" actions={<Target size={20} />}>
            {formData.goals.length === 0 ? (
              <p style={{color: 'var(--text-muted)'}}>No goals defined</p>
            ) : (
              <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px'}}>
                {formData.goals.map((goal, i) => (
                  <li key={i} style={{padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '6px'}}>{goal}</li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Investment Preferences" actions={<TrendingUp size={20} />}>
            {formData.preferences.length === 0 ? (
              <p style={{color: 'var(--text-muted)'}}>No preferences defined</p>
            ) : (
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                {formData.preferences.map((pref, i) => (
                  <span key={i} style={{padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: '12px', fontSize: '13px'}}>{pref}</span>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-tracker">
      <div className="module-header">
        <div><h1>Edit Profile</h1><p>Update your information</p></div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="expense-form">
          <h3 style={{marginBottom: '16px'}}>Personal Information</h3>
          <div className="form-row">
            <div className="form-group"><label>Name</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" /></div>
            <div className="form-group"><label>Age</label><input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} placeholder="Age" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Profession</label><input value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} placeholder="Your profession" /></div>
            <div className="form-group"><label>Income Type</label><select value={formData.income_type} onChange={(e) => setFormData({ ...formData, income_type: e.target.value })}><option value="">Select</option><option value="Salary">Salary</option><option value="Freelance">Freelance</option><option value="Mixed">Mixed</option><option value="Student">Student</option></select></div>
          </div>

          <h3 style={{marginTop: '24px', marginBottom: '16px'}}>Security Settings</h3>
          <div className="form-row">
            <div className="form-group"><label>Auto-lock Timer (minutes)</label><input type="number" value={formData.auto_lock_minutes} onChange={(e) => setFormData({ ...formData, auto_lock_minutes: e.target.value })} /></div>
            <div className="form-group"><label>Emergency Fund Threshold (months)</label><input type="number" value={formData.emergency_fund_threshold} onChange={(e) => setFormData({ ...formData, emergency_fund_threshold: e.target.value })} /></div>
          </div>

          <h3 style={{marginTop: '24px', marginBottom: '16px'}}>Financial Goals</h3>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px'}}>
            {formData.goals.map((goal, i) => (
              <span key={i} style={{padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                {goal} <button type="button" onClick={() => removeGoal(i)} style={{background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px'}}>×</button>
              </span>
            ))}
          </div>
          <div style={{display: 'flex', gap: '8px'}}>
            <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Add a goal" style={{flex: 1}} />
            <Button type="button" size="sm" onClick={addGoal}>Add</Button>
          </div>

          <h3 style={{marginTop: '24px', marginBottom: '16px'}}>Investment Preferences</h3>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px'}}>
            {formData.preferences.map((pref, i) => (
              <span key={i} style={{padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                {pref} <button type="button" onClick={() => removePreference(i)} style={{background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px'}}>×</button>
              </span>
            ))}
          </div>
          <div style={{display: 'flex', gap: '8px'}}>
            <input value={newPref} onChange={(e) => setNewPref(e.target.value)} placeholder="Add an investment preference" style={{flex: 1}} />
            <Button type="button" size="sm" onClick={addPreference}>Add</Button>
          </div>

          <div className="form-actions" style={{marginTop: '32px'}}>
            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="submit">Save Profile</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfileView;


