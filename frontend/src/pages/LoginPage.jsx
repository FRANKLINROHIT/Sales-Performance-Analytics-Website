import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { apiFetch } from '../services/api';
import { TrendingUp, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const { loginUser } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Salesperson');
  const [regionId, setRegionId] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        loginUser(res.user, res.token);
        addToast(`Welcome back, ${res.user.name}!`, 'success');
      } else {
        const res = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, role, region_id: regionId })
        });
        loginUser(res.user, res.token);
        addToast(`Account created! Welcome, ${res.user.name}.`, 'success');
      }
    } catch (err) {
      addToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const setQuickFillDemo = (demoEmail, demoPass) => {
    setMode('login');
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      {/* Centered Container Card with Salesperson Banner Image */}
      <div className="glass-card login-card-grid">
        {/* Left Side: Salesperson Hero Image & Banner (Desktop/Tablet) */}
        <div className="login-hero-panel" style={{
          position: 'relative',
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '32px',
          color: '#fff',
          overflow: 'hidden'
        }}>
          <img
            src="/salesperson_hero.png"
            alt="Salesperson Representative"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.85
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 10%, rgba(15, 23, 42, 0.4) 60%, transparent 100%)'
          }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(99, 102, 241, 0.3)',
              border: '1px solid rgba(99, 102, 241, 0.5)',
              fontSize: '0.78rem',
              fontWeight: 600,
              marginBottom: '12px'
            }}>
              <TrendingUp size={16} color="#818cf8" /> SalesPulse Portal
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px 0', lineHeight: 1.3 }}>
              Drive High Performance Sales Operations
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
              Track revenue targets, deal pipelines, team rankings, and regional performance.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Compact Mobile Brand Header */}
          <div className="login-compact-brand" style={{ display: 'none', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>SalesPulse</h1>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sales Management</span>
            </div>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {mode === 'login' ? 'Sign In to SalesPulse' : 'Create an Account'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {mode === 'login' ? 'Enter your credentials to access portal' : 'Fill details below to register'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-input)',
            padding: '4px',
            borderRadius: '8px',
            marginBottom: '18px'
          }}>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '7px',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                background: mode === 'login' ? 'var(--bg-card)' : 'transparent',
                color: mode === 'login' ? 'var(--accent-primary)' : 'var(--text-muted)',
                boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none'
              }}
              onClick={() => setMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '7px',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                background: mode === 'register' ? 'var(--bg-card)' : 'transparent',
                color: mode === 'register' ? 'var(--accent-primary)' : 'var(--text-muted)',
                boxShadow: mode === 'register' ? 'var(--shadow-sm)' : 'none'
              }}
              onClick={() => setMode('register')}
            >
              Sign Up
            </button>
          </div>

          {/* Quick Demo Fill Buttons */}
          {mode === 'login' && (
            <div style={{
              padding: '8px 10px',
              borderRadius: '8px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              marginBottom: '14px'
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Demo Credentials:
              </span>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '4px', fontSize: '0.73rem' }}
                  onClick={() => setQuickFillDemo('admin@analytics.com', 'admin123')}
                >
                  Admin
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '4px', fontSize: '0.73rem' }}
                  onClick={() => setQuickFillDemo('manager@analytics.com', 'manager123')}
                >
                  Manager
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '4px', fontSize: '0.73rem' }}
                  onClick={() => setQuickFillDemo('salesperson1@analytics.com', 'sales123')}
                >
                  Sales Rep
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: '34px' }}
                    placeholder="e.g. Rohan Verma"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '34px' }}
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  style={{ paddingLeft: '34px', paddingRight: '38px' }}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                    Account Role
                  </label>
                  <select
                    className="input-field"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                  >
                    <option value="Admin">Admin (Full System Access)</option>
                    <option value="Manager">Manager (Team & Regional Access)</option>
                    <option value="Salesperson">Sales Representative</option>
                  </select>
                </div>

                {role === 'Salesperson' && (
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                      Assigned Region
                    </label>
                    <select
                      className="input-field"
                      value={regionId}
                      onChange={e => setRegionId(parseInt(e.target.value))}
                    >
                      <option value="1">North India (Delhi NCR)</option>
                      <option value="2">West India (Mumbai & Pune)</option>
                      <option value="3">South India (Bengaluru)</option>
                      <option value="4">Central India (Hyderabad)</option>
                      <option value="5">East India (Kolkata)</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '10px', marginTop: '4px', fontSize: '0.88rem' }}
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
