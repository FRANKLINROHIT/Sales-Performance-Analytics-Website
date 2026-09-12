import React, { useState, useContext } from 'react';
import { apiFetch } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { exportToCSV } from '../utils/exportUtils';
import { FileText, Download, Printer } from 'lucide-react';

export const ReportsPage = () => {
  const { addToast } = useContext(NotificationContext);
  const [reportType, setReportType] = useState('sales');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/reports?report_type=${reportType}`);
      setData(res);
      addToast(`Generated ${res.record_count} record report.`, 'success');
    } catch (e) {
      addToast(e.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (data && data.data) {
      exportToCSV(data.data, `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
      addToast('Report file downloaded.', 'success');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Executive Report Builder</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generate and export comprehensive financial, salesperson, product, and customer reports</span>
      </div>

      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <select className="input-field" style={{ width: '100%', maxWidth: '260px' }} value={reportType} onChange={e => setReportType(e.target.value)}>
          <option value="sales">Sales Transactions Report</option>
          <option value="employees">Salesperson Performance Report</option>
          <option value="products">Product Portfolio Report</option>
          <option value="customers">Customer Accounts LTV Report</option>
        </select>

        <button className="btn btn-primary" onClick={generateReport} disabled={loading}>
          <FileText size={16} /> {loading ? 'Generating...' : 'Generate Report'}
        </button>

        {data && (
          <button className="btn btn-secondary" onClick={handleDownload}>
            <Download size={16} /> Download CSV
          </button>
        )}
      </div>

      {data && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ textTransform: 'capitalize' }}>{reportType} Master Report Preview</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Records: {data.record_count}</span>
          </div>
          <div className="custom-table-container" style={{ maxHeight: '450px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  {data.data.length > 0 && Object.keys(data.data[0]).map(k => (
                    <th key={k} style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.data.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{val !== null ? '' + val : '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
