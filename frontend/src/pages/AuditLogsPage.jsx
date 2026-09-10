import React, { useEffect, useState, useContext } from 'react';
import { apiFetch } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { History, Search, ShieldAlert, Terminal } from 'lucide-react';

export const AuditLogsPage = () => {
  const { addToast } = useContext(NotificationContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/audit?search=${search}`);
      setLogs(res.data || []);
    } catch (e) {
      addToast(e.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Security Audit & Activity Logs</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Compliance tracking for authentication, data modifications, and admin actions</span>
      </div>

      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '36px' }}
            placeholder="Search action, user, or entity..."
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
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>User Identity</th>
                <th>Action Code</th>
                <th>Target Entity</th>
                <th>IP Address</th>
                <th>Payload Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading audit logs...</td></tr>
              ) : logs.map(l => (
                <tr key={l.log_id}>
                  <td style={{ fontWeight: 700 }}>#{l.log_id}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {l.timestamp ? new Date(l.timestamp).toLocaleString() : 'Just now'}
                  </td>
                  <td style={{ fontWeight: 600 }}>{l.user_name || 'System / Guest'}</td>
                  <td>
                    <span className="badge badge-info" style={{ fontFamily: 'monospace' }}>
                      {l.action}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{l.entity}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{l.ip_address}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.details}
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
