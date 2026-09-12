import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { X, PlusCircle } from 'lucide-react';

export const SaleModal = ({ isOpen, onClose, onRefresh, addToast }) => {
  const [salespersons, setSalespersons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    salesperson_id: '',
    customer_id: '',
    product_id: '',
    quantity: 1,
    sale_date: new Date().toISOString().split('T')[0],
    payment_method: 'Credit Card'
  });

  useEffect(() => {
    if (isOpen) {
      apiFetch('/employees').then(res => setSalespersons(res.data || []));
      apiFetch('/customers').then(res => setCustomers(res.data || []));
      apiFetch('/products').then(res => setProducts(res.data || []));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/sales', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      addToast('New sale transaction logged successfully!', 'success');
      onRefresh();
      onClose();
    } catch (err) {
      addToast(err.message, 'danger');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content" style={{ maxWidth: '480px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Record Sales Transaction</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Salesperson</label>
            <select
              className="input-field"
              value={formData.salesperson_id}
              onChange={e => setFormData({ ...formData, salesperson_id: e.target.value })}
              required
            >
              <option value="">Select Salesperson</option>
              {salespersons.map(sp => (
                <option key={sp.salesperson_id} value={sp.salesperson_id}>{sp.name} ({sp.region_name})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Customer Account</label>
            <select
              className="input-field"
              value={formData.customer_id}
              onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
              required
            >
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.customer_id} value={c.customer_id}>{c.company} ({c.name})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Product Package</label>
            <select
              className="input-field"
              value={formData.product_id}
              onChange={e => setFormData({ ...formData, product_id: e.target.value })}
              required
            >
              <option value="">Select Product</option>
              {products.map(p => (
                <option key={p.product_id} value={p.product_id}>{p.product_name} - ${p.price}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Quantity</label>
              <input
                type="number"
                min="1"
                className="input-field"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Sale Date</label>
              <input
                type="date"
                className="input-field"
                value={formData.sale_date}
                onChange={e => setFormData({ ...formData, sale_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Payment Method</label>
            <select
              className="input-field"
              value={formData.payment_method}
              onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
            >
              <option value="Wire Transfer">Wire Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="ACH">ACH Transfer</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <PlusCircle size={16} /> Record Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
