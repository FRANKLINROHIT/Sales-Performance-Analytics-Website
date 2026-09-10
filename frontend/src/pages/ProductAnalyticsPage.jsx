import React, { useEffect, useState, useContext } from 'react';
import { apiFetch } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { Package, Plus, Search, Tag, DollarSign, Layers } from 'lucide-react';

export const ProductAnalyticsPage = () => {
  const { addToast } = useContext(NotificationContext);
  const { user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    product_name: '',
    sku: '',
    category: 'Software',
    price: '',
    cost: '',
    stock_quantity: 100
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...(categoryFilter ? { category: categoryFilter } : {}),
        ...(search ? { search } : {})
      });
      const res = await apiFetch(`/products?${query.toString()}`);
      setProducts(res.data || []);
    } catch (e) {
      addToast(e.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify(newProduct)
      });
      addToast('New product added to catalog.', 'success');
      setIsAddOpen(false);
      fetchProducts();
    } catch (e) {
      addToast(e.message, 'danger');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Product Portfolio Analytics</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Revenue breakdown, profit margins, and catalog inventory</span>
        </div>
        {user?.role !== 'Salesperson' && (
          <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} /> Add New Product
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '36px' }}
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input-field"
          style={{ width: '200px' }}
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Software">Software</option>
          <option value="Cloud Services">Cloud Services</option>
          <option value="AI & ML">AI & ML</option>
          <option value="Hardware">Hardware</option>
          <option value="Security">Security</option>
          <option value="Services">Services</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Cost</th>
                <th>Margin %</th>
                <th>Units Sold</th>
                <th>Total Revenue</th>
                <th>Gross Profit</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px' }}>Loading catalog...</td></tr>
              ) : products.map(p => (
                <tr key={p.product_id}>
                  <td style={{ fontWeight: 700 }}>{p.product_name}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.sku}</td>
                  <td><span className="badge badge-info">{p.category}</span></td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(p.price)}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatCurrency(p.cost)}</td>
                  <td>
                    <span className={`badge ${p.profit_margin_pct > 60 ? 'badge-success' : 'badge-warning'}`}>
                      {p.profit_margin_pct}%
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{p.units_sold}</td>
                  <td style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{formatCurrency(p.total_revenue)}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-success)' }}>{formatCurrency(p.total_profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90 }}>
          <div className="glass-card" style={{ width: '450px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Add Product to Catalog</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Product Name</label>
                <input type="text" className="input-field" value={newProduct.product_name} onChange={e => setNewProduct({ ...newProduct, product_name: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>SKU Code</label>
                <input type="text" className="input-field" value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Category</label>
                <select className="input-field" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                  <option value="Software">Software</option>
                  <option value="Cloud Services">Cloud Services</option>
                  <option value="AI & ML">AI & ML</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Security">Security</option>
                  <option value="Services">Services</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Selling Price ($)</label>
                  <input type="number" className="input-field" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cost Price ($)</label>
                  <input type="number" className="input-field" value={newProduct.cost} onChange={e => setNewProduct({ ...newProduct, cost: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
