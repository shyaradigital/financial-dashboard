import React, { useEffect, useState } from 'react';
import Card from '../Common/Card';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const CardTracker: React.FC = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [formData, setFormData] = useState({
    bank_name: '', card_type: 'Credit', card_number: '', expiry_date: '',
    billing_cycle: '', credit_limit: '', current_due: '', comments: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const data = await window.electronAPI.getCards();
    setCards(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit) : null, current_due: formData.current_due ? parseFloat(formData.current_due) : null };
    if (editingCard) {
      await window.electronAPI.updateCard(editingCard.id, data);
    } else {
      await window.electronAPI.addCard(data);
    }
    await loadData();
    closeModal();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this card?')) {
      await window.electronAPI.deleteCard(id);
      await loadData();
    }
  };

  const openModal = (card?: any) => {
    if (card) {
      setEditingCard(card);
      setFormData({ ...card, credit_limit: card.credit_limit?.toString() || '', current_due: card.current_due?.toString() || '' });
    } else {
      setEditingCard(null);
      setFormData({ bank_name: '', card_type: 'Credit', card_number: '', expiry_date: '', billing_cycle: '', credit_limit: '', current_due: '', comments: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingCard(null); };

  return (
    <div className="expense-tracker">
      <div className="module-header">
        <div><h1>Card Tracker</h1><p>Manage your credit and debit cards</p></div>
        <Button onClick={() => openModal()}><Plus size={16} /> Add Card</Button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px'}}>
        {cards.map((card) => (
          <Card key={card.id} title={`${card.bank_name} - ${card.card_type}`}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div><strong>Card Number:</strong> {card.card_number}</div>
              <div><strong>Expiry:</strong> {card.expiry_date || '—'}</div>
              {card.card_type === 'Credit' && (
                <>
                  <div><strong>Billing Cycle:</strong> {card.billing_cycle || '—'}</div>
                  <div><strong>Credit Limit:</strong> ₹{card.credit_limit || '—'}</div>
                  <div><strong>Current Due:</strong> ₹{card.current_due || 0}</div>
                </>
              )}
              {card.comments && <div><strong>Notes:</strong> {card.comments}</div>}
              <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                <Button size="sm" variant="secondary" onClick={() => openModal(card)}><Edit2 size={14} /> Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(card.id)}><Trash2 size={14} /> Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCard ? 'Edit Card' : 'Add Card'} size="md">
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group"><label>Bank Name *</label><input value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} required /></div>
          <div className="form-group"><label>Card Type *</label><select value={formData.card_type} onChange={(e) => setFormData({ ...formData, card_type: e.target.value })} required><option value="Credit">Credit</option><option value="Debit">Debit</option></select></div>
          <div className="form-group"><label>Card Number *</label><input value={formData.card_number} onChange={(e) => setFormData({ ...formData, card_number: e.target.value })} required /></div>
          <div className="form-group"><label>Expiry Date</label><input type="month" value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} /></div>
          {formData.card_type === 'Credit' && (
            <>
              <div className="form-group"><label>Billing Cycle</label><input value={formData.billing_cycle} onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })} placeholder="e.g., 1-30" /></div>
              <div className="form-group"><label>Credit Limit</label><input type="number" value={formData.credit_limit} onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })} /></div>
              <div className="form-group"><label>Current Due</label><input type="number" value={formData.current_due} onChange={(e) => setFormData({ ...formData, current_due: e.target.value })} /></div>
            </>
          )}
          <div className="form-group"><label>Comments</label><textarea value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} rows={3} /></div>
          <div className="form-actions"><Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button><Button type="submit">{editingCard ? 'Update' : 'Add'}</Button></div>
        </form>
      </Modal>
    </div>
  );
};

export default CardTracker;


