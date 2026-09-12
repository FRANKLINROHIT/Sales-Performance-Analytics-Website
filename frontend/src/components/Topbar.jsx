import React, { useContext, useState, useEffect, useRef } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { Sun, Moon, Bell, Search, RefreshCw, X, CheckCircle2, AlertTriangle, XCircle, Info, Menu } from 'lucide-react';

export const Topbar = ({ onSearch, activeTitle, onToggleNav }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { toasts, addToast, removeToast, clearAllToasts } = useContext(NotificationContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const titleMap = {
    'dashboard': 'Company Overview',
    'sales': 'Sales Records',
    'employees': 'Team Performance',
    'products': 'Product Catalog',
    'customers': 'Client Accounts',
    'targets': 'Monthly Quotas',
    'analytics': 'Forecast & Scenario Planning',
    'reports': 'Reports',
    'admin': 'User Management',
    'audit': 'Activity History'
  };

  const getToastIcon = (type) => {
    if (type === 'success') return <CheckCircle2 size={14} color="var(--accent-success)" />;
    if (type === 'warning') return <AlertTriangle size={14} color="var(--accent-warning)" />;
    if (type === 'danger') return <XCircle size={14} color="var(--accent-danger)" />;
    return <Info size={14} color="var(--accent-info, #3b82f6)" />;
  };

  const hasNotifications = toasts.length > 0;

  return (
    <header style={{
      height: '66px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      gap: '12px'
    }}>
      {/* Title & Page Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <button
          className="nav-toggle-btn"
          onClick={onToggleNav}
          title="Toggle Navigation Menu"
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {titleMap[activeTitle] || activeTitle}
          </h2>
          <span className="topbar-subtitle" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Track sales performance, team targets, and client records
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Search */}
        <div className="topbar-search-container" style={{ position: 'relative', width: '220px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="input-field"
            style={{ paddingLeft: '34px', height: '36px', fontSize: '0.84rem' }}
          />
        </div>

        {/* Sync Button */}
        <button
          className="btn btn-secondary"
          style={{ padding: '8px 10px', height: '36px' }}
          onClick={() => addToast('Data refreshed successfully', 'success')}
          title="Refresh Data"
        >
          <RefreshCw size={15} />
        </button>

        {/* Theme Button */}
        <button
          className="btn btn-secondary"
          style={{ padding: '8px 10px', height: '36px' }}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="btn btn-secondary"
            style={{ padding: '8px 10px', height: '36px', position: 'relative' }}
            onClick={() => setShowNotifications(prev => !prev)}
            title="Notifications"
          >
            <Bell size={16} />
            {hasNotifications && (
              <span style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--accent-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.5rem',
                color: '#fff',
                fontWeight: 700
              }}>
                {toasts.length > 9 ? '9+' : toasts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="glass-card" style={{
              position: 'absolute',
              right: 0,
              top: '44px',
              width: '320px',
              maxWidth: 'calc(100vw - 32px)',
              padding: '14px',
              zIndex: 50,
              maxHeight: '400px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Panel Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ fontSize: '0.85rem' }}>
                  Notifications {hasNotifications && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({toasts.length})</span>}
                </strong>
                {hasNotifications && (
                  <span
                    style={{ fontSize: '0.72rem', color: 'var(--accent-danger)', cursor: 'pointer', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: 'rgba(239,68,68,0.1)' }}
                    onClick={clearAllToasts}
                  >
                    Clear All
                  </span>
                )}
              </div>

              {/* Notification List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '320px' }}>
                {!hasNotifications ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    <Bell size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                    <p style={{ margin: 0 }}>No notifications yet</p>
                  </div>
                ) : (
                  toasts.map(n => (
                    <div key={n.id} style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: 'var(--bg-input)',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}>
                      <span style={{ marginTop: '2px', flexShrink: 0 }}>{getToastIcon(n.type)}</span>
                      <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: 500 }}>{n.message}</span>
                      <button
                        onClick={() => removeToast(n.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
