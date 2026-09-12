import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Package,
  UserCheck,
  Target,
  BarChart3,
  FileText,
  ShieldCheck,
  History,
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { user, logoutUser } = useContext(AuthContext);
  const role = user ? user.role : 'Salesperson';

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Salesperson'] },
    { id: 'sales', label: 'Sales Records', icon: TrendingUp, roles: ['Admin', 'Manager', 'Salesperson'] },
    { id: 'employees', label: 'Team Performance', icon: Users, roles: ['Admin', 'Manager'] },
    { id: 'products', label: 'Products & Catalog', icon: Package, roles: ['Admin', 'Manager', 'Salesperson'] },
    { id: 'customers', label: 'Client Accounts', icon: UserCheck, roles: ['Admin', 'Manager', 'Salesperson'] },
    { id: 'targets', label: 'Sales Quotas', icon: Target, roles: ['Admin', 'Manager', 'Salesperson'] },
    { id: 'analytics', label: 'Forecast & Scenarios', icon: BarChart3, roles: ['Admin', 'Manager'] },
    { id: 'reports', label: 'Reports', icon: FileText, roles: ['Admin', 'Manager', 'Salesperson'] },
    { id: 'admin', label: 'User Management', icon: ShieldCheck, roles: ['Admin'] },
    { id: 'audit', label: 'Activity Log', icon: History, roles: ['Admin', 'Manager'] }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div>
          {/* Clean Portal Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={22} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  SalesPulse
                </h1>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sales Management</span>
              </div>
            </div>

            {/* Close button for mobile/tablet drawer */}
            <button
              className="sidebar-close-btn"
              onClick={onClose}
              title="Close navigation"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filteredItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'var(--bg-input)' : 'transparent',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={18} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={16} color="var(--accent-primary)" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card */}
        <div style={{
          padding: '12px 14px',
          borderRadius: '10px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt="User Avatar"
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{user?.name || 'Guest User'}</p>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{role}</span>
            </div>
          </div>
          <button
            onClick={logoutUser}
            title="Log Out"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};
