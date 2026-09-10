import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const KpiCard = ({ title, value, subtext, icon: Icon, trend, color = 'var(--accent-primary)' }) => {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justify: 'space-between', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</span>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: `rgba(99, 102, 241, 0.12)`,
          display: 'flex',
          alignItems: 'center',
          justify: 'center'
        }}>
          {Icon && <Icon size={20} color={color} />}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
          {value}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {trend !== undefined && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: trend >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)'
            }}>
              {trend >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(trend)}%
            </span>
          )}
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{subtext}</span>
        </div>
      </div>
    </div>
  );
};
