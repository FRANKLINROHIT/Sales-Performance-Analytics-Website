import React, { useEffect, useState, useContext } from 'react';
import { apiFetch } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { AuthContext } from '../context/AuthContext';
import { SaleModal } from '../components/SaleModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCSV } from '../utils/exportUtils';
import { Plus, Download, Trash2, Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export const SalesAnalyticsPage = ({ onSaleCreated }) => {
  const { addToast } = useContext(NotificationContext);
  const { user } = useContext(AuthContext);

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [regionId, setRegionId] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchSales = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        search,
        ...(regionId ? { region_id: regionId } : {}),
        ...(category ? { category } : {}),
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {})
      });

      const res = await apiFetch(`/sales?${queryParams.toString()}`);
      setSales(res.data || []);
      setTotalPages(res.pagination ? res.pagination.totalPages : 1);
    } catch (e) {
      addToast(e.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, search, regionId, category, startDate, endDate]);

  const handleDelete = async (saleId) => {
    if (!window.confirm('Are you sure you want to delete this sale record?')) return;
    try {
      await apiFetch(`/sales/${saleId}`, { method: 'DELETE' });
      addToast('Sale record deleted.', 'success');
      fetchSales();
    } catch (e) {
      addToast(e.message, 'danger');
    }
  };

  const handleExport = () => {
    exportToCSV(sales, `Sales_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    addToast('Sales transactions exported to CSV', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Sales Transactions & Analytics</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filter, search, and manage corporate sales records</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Record New Sale
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '36px' }}
            placeholder="Search salesperson, customer, product..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select
          className="input-field"
          style={{ flex: '1 1 180px' }}
          value={regionId}
          onChange={e => { setRegionId(e.target.value); setPage(1); }}
        >
          <option value="">All Indian Regions</option>
          <option value="1">North India (Delhi NCR)</option>
          <option value="2">West India (Mumbai & Pune)</option>
          <option value="3">South India (Bengaluru)</option>
          <option value="4">Central India (Hyderabad)</option>
          <option value="5">East India (Kolkata)</option>
        </select>

        <select
          className="input-field"
          style={{ flex: '1 1 150px' }}
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          <option value="Software">Software</option>
          <option value="Cloud Services">Cloud Services</option>
          <option value="AI & ML">AI & ML</option>
          <option value="Hardware">Hardware</option>
          <option value="Security">Security</option>
          <option value="Services">Services</option>
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: '1 1 auto' }}>
          <input
            type="date"
            className="input-field"
            style={{ minWidth: '130px', flex: '1 1 130px' }}
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setPage(1); }}
          />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input
            type="date"
            className="input-field"
            style={{ minWidth: '130px', flex: '1 1 130px' }}
            value={endDate}
            onChange={e => { setEndDate(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Sales Data Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sale Date</th>
                <th>Salesperson</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Region</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Profit</th>
                <th>Status</th>
                {user?.role !== 'Salesperson' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '24px' }}>Loading sales records...</td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No sales transactions found matching query parameters.</td>
                </tr>
              ) : (
                sales.map(s => (
                  <tr key={s.sale_id}>
                    <td style={{ fontWeight: 700 }}>#{s.sale_id}</td>
                    <td>{formatDate(s.sale_date)}</td>
                    <td style={{ fontWeight: 600 }}>{s.salesperson_name}</td>
                    <td>{s.customer_name}</td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600 }}>{s.product_name}</span>
                        <br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.product_category}</span>
                      </div>
                    </td>
                    <td>{s.region_name}</td>
                    <td>{s.quantity}</td>
                    <td style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{formatCurrency(s.amount)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-success)' }}>{formatCurrency(s.profit)}</td>
                    <td>
                      <span className="badge badge-success">{s.status}</span>
                    </td>
                    {user?.role !== 'Salesperson' && (
                      <td>
                        <button
                          onClick={() => handleDelete(s.sale_id)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}
                          title="Delete Sale Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              style={{ padding: '6px 12px' }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              className="btn btn-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              style={{ padding: '6px 12px' }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <SaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={() => {
          fetchSales();
          if (onSaleCreated) onSaleCreated();
        }}
        addToast={addToast}
      />
    </div>
  );
};
