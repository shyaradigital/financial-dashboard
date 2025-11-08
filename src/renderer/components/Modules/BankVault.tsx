import React, { useEffect, useState } from 'react';
import Card from '../Common/Card';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import { Plus, Edit2, Trash2, Copy, Eye, EyeOff } from 'lucide-react';

const BankVault: React.FC = () => {
  const [banks, setBanks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<any>(null);
  const [formData, setFormData] = useState({
    bank_name: '', account_holder: '', account_number: '', ifsc_code: '',
    upi_id: '', registered_phone: '', netbanking_id: '', comments: ''
  });
  const [revealedBanks, setRevealedBanks] = useState<Set<number>>(new Set());
  const [fullBankDetails, setFullBankDetails] = useState<Map<number, any>>(new Map());
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pendingBankId, setPendingBankId] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<'reveal' | 'edit'>('reveal');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const data = await window.electronAPI.getBanks();
    setBanks(data);
    // Reset revealed banks when data reloads
    setRevealedBanks(new Set());
    setFullBankDetails(new Map());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBank) {
      await window.electronAPI.updateBank(editingBank.id, formData);
    } else {
      await window.electronAPI.addBank(formData);
    }
    await loadData();
    closeModal();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this bank account?')) {
      await window.electronAPI.deleteBank(id);
      await loadData();
    }
  };

  const openModal = async (bank?: any) => {
    if (bank) {
      setEditingBank(bank);
      // If bank is revealed, use full details
      const fullDetails = fullBankDetails.get(bank.id);
      if (fullDetails) {
        setFormData({
          bank_name: fullDetails.bank_name || bank.bank_name,
          account_holder: fullDetails.account_holder || bank.account_holder,
          account_number: fullDetails.account_number || '',
          ifsc_code: fullDetails.ifsc_code || bank.ifsc_code || '',
          upi_id: fullDetails.upi_id || bank.upi_id || '',
          registered_phone: fullDetails.registered_phone || '',
          netbanking_id: fullDetails.netbanking_id || '',
          comments: fullDetails.comments || bank.comments || ''
        });
      } else {
        // If not revealed, prompt for password to edit
        setPendingBankId(bank.id);
        setPendingAction('edit');
        setPassword('');
        setPasswordError('');
        setIsPasswordModalOpen(true);
        // After password verification, we'll reopen the edit modal
        return;
      }
    } else {
      setEditingBank(null);
      setFormData({ bank_name: '', account_holder: '', account_number: '', ifsc_code: '', upi_id: '', registered_phone: '', netbanking_id: '', comments: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { 
    setIsModalOpen(false); 
    setEditingBank(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleRevealClick = (bankId: number) => {
    if (revealedBanks.has(bankId)) {
      // Hide the details
      const newRevealed = new Set(revealedBanks);
      newRevealed.delete(bankId);
      setRevealedBanks(newRevealed);
      const newDetails = new Map(fullBankDetails);
      newDetails.delete(bankId);
      setFullBankDetails(newDetails);
    } else {
      // Show password modal
      setPendingBankId(bankId);
      setPendingAction('reveal');
      setPassword('');
      setPasswordError('');
      setIsPasswordModalOpen(true);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!pendingBankId) return;

    try {
      const fullDetails = await window.electronAPI.getBankFullDetails(pendingBankId, password);
      
      if (fullDetails) {
        // Password verified
        const newRevealed = new Set(revealedBanks);
        newRevealed.add(pendingBankId);
        setRevealedBanks(newRevealed);
        
        const newDetails = new Map(fullBankDetails);
        newDetails.set(pendingBankId, fullDetails);
        setFullBankDetails(newDetails);
        
        setIsPasswordModalOpen(false);
        setPassword('');
        const bankId = pendingBankId;
        setPendingBankId(null);
        
        // If action was 'edit', open the edit modal with full details
        if (pendingAction === 'edit') {
          const bank = banks.find(b => b.id === bankId);
          if (bank && fullDetails) {
            setEditingBank(bank);
            setFormData({
              bank_name: fullDetails.bank_name || bank.bank_name,
              account_holder: fullDetails.account_holder || bank.account_holder,
              account_number: fullDetails.account_number || '',
              ifsc_code: fullDetails.ifsc_code || bank.ifsc_code || '',
              upi_id: fullDetails.upi_id || bank.upi_id || '',
              registered_phone: fullDetails.registered_phone || '',
              netbanking_id: fullDetails.netbanking_id || '',
              comments: fullDetails.comments || bank.comments || ''
            });
            setIsModalOpen(true);
          }
        }
        setPendingAction('reveal');
      } else {
        setPasswordError('Incorrect password. Please try again.');
      }
    } catch (error) {
      setPasswordError('Failed to verify password. Please try again.');
    }
  };

  const closePasswordModal = () => {
    const wasEditing = pendingAction === 'edit';
    setIsPasswordModalOpen(false);
    setPassword('');
    setPasswordError('');
    setPendingBankId(null);
    setPendingAction('reveal');
    // If we were trying to edit, clear the editing bank
    if (wasEditing) {
      setEditingBank(null);
    }
  };

  const getBankDisplayData = (bank: any) => {
    if (revealedBanks.has(bank.id)) {
      const fullDetails = fullBankDetails.get(bank.id);
      return fullDetails || bank;
    }
    return bank;
  };

  return (
    <div className="expense-tracker">
      <div className="module-header">
        <div><h1>Bank Info Vault</h1><p>Securely store bank account information</p></div>
        <Button onClick={() => openModal()}><Plus size={16} /> Add Bank</Button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px'}}>
        {banks.map((bank) => {
          const displayData = getBankDisplayData(bank);
          const isRevealed = revealedBanks.has(bank.id);

          return (
            <Card key={bank.id} title={bank.bank_name}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <div><strong>Account Holder:</strong> {bank.account_holder}</div>
                
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
                  <strong>Account No:</strong> 
                  <span style={{fontFamily: 'monospace'}}>{displayData.account_number}</span>
                  <div style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                    <button 
                      className="icon-button" 
                      onClick={() => copyToClipboard(displayData.account_number)} 
                      title="Copy Account Number"
                      style={{padding: '4px', display: 'flex', alignItems: 'center'}}
                    >
                      <Copy size={14} />
                    </button>
                    <button 
                      className="icon-button" 
                      onClick={() => handleRevealClick(bank.id)} 
                      title={isRevealed ? "Hide sensitive information" : "Show sensitive information"}
                      style={{padding: '4px', display: 'flex', alignItems: 'center', color: isRevealed ? '#4CAF50' : '#888'}}
                    >
                      {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div><strong>IFSC:</strong> {bank.ifsc_code || '—'}</div>
                <div><strong>UPI ID:</strong> {bank.upi_id || '—'}</div>

                {isRevealed && (
                  <>
                    {displayData.registered_phone && (
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
                        <strong>Registered Phone:</strong> 
                        <span style={{fontFamily: 'monospace'}}>{displayData.registered_phone}</span>
                        <button 
                          className="icon-button" 
                          onClick={() => copyToClipboard(displayData.registered_phone)} 
                          title="Copy Phone Number"
                          style={{padding: '4px', display: 'flex', alignItems: 'center'}}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    )}
                    {displayData.netbanking_id && (
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
                        <strong>Net Banking ID:</strong> 
                        <span style={{fontFamily: 'monospace'}}>{displayData.netbanking_id}</span>
                        <button 
                          className="icon-button" 
                          onClick={() => copyToClipboard(displayData.netbanking_id)} 
                          title="Copy Net Banking ID"
                          style={{padding: '4px', display: 'flex', alignItems: 'center'}}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    )}
                  </>
                )}

                {bank.comments && <div><strong>Notes:</strong> {bank.comments}</div>}
                
                <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                  <Button size="sm" variant="secondary" onClick={() => openModal(bank)}><Edit2 size={14} /> Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(bank.id)}><Trash2 size={14} /> Delete</Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingBank ? 'Edit Bank' : 'Add Bank'}>
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label>Bank Name *</label>
            <input 
              value={formData.bank_name} 
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Account Holder *</label>
            <input 
              value={formData.account_holder} 
              onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Account Number *</label>
            <input 
              type="text"
              value={formData.account_number} 
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })} 
              required 
              placeholder="Enter account number"
            />
          </div>
          <div className="form-group">
            <label>IFSC Code</label>
            <input 
              value={formData.ifsc_code} 
              onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })} 
              placeholder="e.g., SBIN0001234"
            />
          </div>
          <div className="form-group">
            <label>UPI ID</label>
            <input 
              value={formData.upi_id} 
              onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })} 
              placeholder="e.g., name@paytm"
            />
          </div>
          <div className="form-group">
            <label>Registered Phone</label>
            <input 
              type="tel"
              value={formData.registered_phone} 
              onChange={(e) => setFormData({ ...formData, registered_phone: e.target.value })} 
              placeholder="10-digit phone number"
            />
          </div>
          <div className="form-group">
            <label>Net Banking ID</label>
            <input 
              value={formData.netbanking_id} 
              onChange={(e) => setFormData({ ...formData, netbanking_id: e.target.value })} 
              placeholder="Net banking username/ID"
            />
          </div>
          <div className="form-group">
            <label>Comments</label>
            <textarea 
              value={formData.comments} 
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })} 
              rows={3} 
              placeholder="Additional notes..."
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit">{editingBank ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isPasswordModalOpen} onClose={closePasswordModal} title={pendingAction === 'edit' ? 'Verify Password to Edit' : 'Verify Password to View'}>
        <form onSubmit={handlePasswordSubmit} className="expense-form">
          <div className="form-group">
            <label>Enter Master Password</label>
            <input 
              type="password"
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }} 
              placeholder="Enter your master password"
              required
              autoFocus
            />
            {passwordError && (
              <div style={{color: '#ff4444', fontSize: '14px', marginTop: '4px'}}>{passwordError}</div>
            )}
          </div>
          <div style={{marginTop: '12px', fontSize: '13px', color: '#888'}}>
            {pendingAction === 'edit' 
              ? 'This password is required to edit sensitive information like account numbers, phone numbers, and net banking IDs.'
              : 'This password is required to view sensitive information like account numbers, phone numbers, and net banking IDs.'}
          </div>
          <div className="form-actions" style={{marginTop: '20px'}}>
            <Button type="button" variant="secondary" onClick={closePasswordModal}>Cancel</Button>
            <Button type="submit">{pendingAction === 'edit' ? 'Verify & Edit' : 'Verify & Reveal'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BankVault;
