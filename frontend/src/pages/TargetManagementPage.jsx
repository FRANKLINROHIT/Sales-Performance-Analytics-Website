import React, { useEffect, useState, useContext } from 'react';
import { apiFetch } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { Target, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

export const TargetManagementPage = () => {
  const { addToast } = useContext(NotificationContext);
  const { user } = useContext(AuthContext);

  const [targets, setTargets] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetForm, setTargetForm] = useState({
    salesperson_id: '',
    target_amount: 75000,
    month: 9,
    year: 2026,
    period: 'Monthly'
  });

  const fetchTargets = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/targets?year=2026');
      setTargets(res.data || []);
      const spRes = await apiFetch('/employees');
      setSalespersons(spRes.data || []);
    } catch (e) {
      addToast(e.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleSaveTarget = async (e) => {
    e.preventDefault();
    try {
      const sp = salespersons.find(s => s.salesperson_id === parseInt(targetForm.salesperson_id));
      await apiFetch('/targets', {
        method: 'POST',
        body: JSON.stringify({
          ...targetForm,
          region_id: sp ? sp.region_id : 1
        })
      });
      addToast('Target updated successfully.', 'success');
      setIsModalOpen(false);
      fetchTargets();
    } catch (e) {
      addToast(e.message, 'danger');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Quota & Target Management</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configure regional and salesperson sales benchmarks</span>
        </div>
        {user?.role !== 'Salesperson' && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Set Sales Quota
          </button>
        )}
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Salesperson</th>
                <th>Region</th>
                <th>Period</th>
                <th>Month / Year</th>
                <th>Target Amount</th>
                <th>Real-time Achieved</th>
                <th>Achievement %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>Loading quotas...</td></tr>
              ) : targets.map(t => (
                <tr key={t.target_id}>
                  <td style={{ fontWeight: 700 }}>{t.salesperson_name || 'All Region'}</td>
                  <td>{t.region_name}</td>
                  <td>{t.period}</td>
                  <td>{t.month ? `Month ${t.month}, ${t.year}` : t.year}</td>
                  <td style={{ fontWeight: 800 }}>{formatCurrency(t.target_amount)}</td>
                  <td style={{ fontWeight: 800, color: 'var(--accent-success)' }}>{formatCurrency(t.achieved_amount)}</td>
                  <td style={{ width: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{t.achievement_pct}%</span>
                      <div style={{ flex: 1, height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(t.achievement_pct, 100)}%`,
                          background: t.achievement_pct >= 100 ? 'var(--accent-success)' : 'var(--accent-primary)'
                        }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${t.status === 'Achieved' ? 'badge-success' : t.status === 'On Track' ? 'badge-info' : 'badge-warning'}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90 }}>
          <div className="glass-card" style={{ width: '420px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Assign Sales Quota Target</h3>
            <form onSubmit={handleSaveTarget} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Salesperson</label>
                <select className="input-field" value={targetForm.salesperson_id} onChange={e => setTargetForm({ ...targetForm, salesperson_id: e.target.value })} required>
                  <option value="">Select Salesperson</option>
                  {salespersons.map(sp => (
                    <option key={sp.salesperson_id} value={sp.salesperson_id}>{sp.name} ({sp.region_name})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Target Revenue ($)</label>
                <input type="number" className="input-field" value={targetForm.target_amount} onChange={e => setTargetForm({ ...targetForm, target_amount: parseFloat(e.target.value) || 0 })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Month (1-12)</label>
                  <input type="number" min="1" max="12" className="input-field" value={targetForm.month} onChange={e => setTargetForm({ ...targetForm, month: parseInt(e.target.value) })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Year</label>
                  <input type="number" className="input-field" value={targetForm.year} onChange={e => setTargetForm({ ...targetForm, year: parseInt(e.target.value) })} required />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Target</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
