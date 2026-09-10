import React, { useEffect, useState, useContext } from 'react';
import { apiFetch } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Award, Target, Percent, DollarSign, ChevronRight, User } from 'lucide-react';

export const EmployeePerformancePage = () => {
  const { addToast } = useContext(NotificationContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empDetail, setEmpDetail] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/employees');
      setEmployees(res.data || []);
    } catch (e) {
      addToast(e.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openDetail = async (empId) => {
    try {
      const res = await apiFetch(`/employees/${empId}`);
      setEmpDetail(res.data);
      setSelectedEmp(empId);
    } catch (e) {
      addToast(e.message, 'danger');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner with Salesperson Hero Image */}
      <div className="glass-card" style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.08))'
      }}>
        <div style={{ zIndex: 2, maxWidth: '60%' }}>
          <span className="badge badge-info" style={{ marginBottom: '8px' }}>Sales Force Performance</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0 6px 0' }}>Team Leaderboard & Achievements</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            Track individual target completion rates, deal conversions, and sales commissions across Indian regions.
          </p>
        </div>
        <img
          src="/salesperson_hero.png"
          alt="Sales Representative"
          style={{
            height: '110px',
            width: '180px',
            objectFit: 'cover',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)'
          }}
        />
      </div>

      {/* Leaderboard Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {employees.map((emp) => (
          <div key={emp.salesperson_id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: emp.rank === 1 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'var(--bg-input)',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: emp.rank === 1 ? '#fff' : 'var(--text-primary)'
                }}>
                  #{emp.rank}
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{emp.name}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{emp.region_name}</span>
                </div>
              </div>
              <span className={`badge ${emp.achievement_pct >= 100 ? 'badge-success' : 'badge-warning'}`}>
                {emp.achievement_pct}% Target
              </span>
            </div>

            {/* Achievement Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Quarterly Target</span>
                <span style={{ fontWeight: 700 }}>{formatCurrency(emp.total_sales)} / {formatCurrency(emp.current_target)}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(emp.achievement_pct, 100)}%`,
                  background: emp.achievement_pct >= 100 ? 'var(--accent-success)' : 'var(--accent-primary)',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>

            {/* Metrics Breakdown Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', padding: '10px', borderRadius: '10px', background: 'var(--bg-input)', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Orders</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>{emp.total_orders}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Conversion</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-info)', margin: 0 }}>{emp.conversion_rate}%</p>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Commission</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-success)', margin: 0 }}>{formatCurrency(emp.estimated_commission)}</p>
              </div>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => openDetail(emp.salesperson_id)}
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              View Performance Record <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Detail Modal Drawer */}
      {selectedEmp && empDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justify: 'flex-end',
          zIndex: 90
        }}>
          <div className="glass-card" style={{ width: '500px', height: '100vh', borderRadius: 0, padding: '24px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Salesperson Profile</h3>
              <button onClick={() => setSelectedEmp(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <img
                src={empDetail.employee.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt="Avatar"
                style={{ width: '60px', height: '60px', borderRadius: '50%' }}
              />
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{empDetail.employee.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{empDetail.employee.email}</p>
                <span className="badge badge-info" style={{ marginTop: '4px' }}>{empDetail.employee.region_name}</span>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px' }}>Recent Closed Deals</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {empDetail.salesHistory.map(s => (
                <div key={s.sale_id} style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-input)', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>{s.product_name}</strong>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Customer: {s.customer_name}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(s.sale_date)}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '0.9rem' }}>{formatCurrency(s.amount)}</span>
                    <br />
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-success)' }}>Profit: {formatCurrency(s.profit)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
