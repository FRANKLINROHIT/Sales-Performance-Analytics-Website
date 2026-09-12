import React, { useEffect, useState, useContext } from 'react';
import { apiFetch } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { UserCheck, Search, Building, MapPin, Award } from 'lucide-react';

export const CustomerAnalyticsPage = () => {
  const { addToast } = useContext(NotificationContext);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/customers?search=${search}`);
      setCustomers(res.data || []);
    } catch (e) {
      addToast(e.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Customer Intelligence & LTV Analytics</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Corporate account lifetime value, purchase history, and RFM segment badges</span>
      </div>

      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '36px' }}
            placeholder="Search company name, email, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer / Company</th>
                <th>Contact Email</th>
                <th>Location</th>
                <th>Region</th>
                <th>Total Orders</th>
                <th>Lifetime Value (LTV)</th>
                <th>Last Order Date</th>
                <th>RFM Segment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>Loading accounts...</td></tr>
              ) : customers.map(c => (
                <tr key={c.customer_id}>
                  <td>
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>{c.company}</strong>
                      <br />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contact: {c.name}</span>
                    </div>
                  </td>
                  <td>{c.email}</td>
                  <td>{c.location}</td>
                  <td>{c.region_name}</td>
                  <td style={{ fontWeight: 700 }}>{c.total_orders}</td>
                  <td style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{formatCurrency(c.lifetime_value)}</td>
                  <td>{formatDate(c.last_purchase_date)}</td>
                  <td>
                    <span className={`badge ${
                      c.rfm_segment === 'VIP Champions' ? 'badge-success' :
                      c.rfm_segment === 'High Value Loyalist' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {c.rfm_segment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
