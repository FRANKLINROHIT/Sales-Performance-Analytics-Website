import React, { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const NotificationToast = () => {
  const { toasts, removeToast } = useContext(NotificationContext);

  if (!toasts.length) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: 'calc(100vw - 32px)',
      pointerEvents: 'none'
    }}>
      {toasts.map(t => {
        let Icon = Info;
        let borderColor = 'var(--accent-info)';
        if (t.type === 'success') { Icon = CheckCircle2; borderColor = 'var(--accent-success)'; }
        if (t.type === 'warning') { Icon = AlertTriangle; borderColor = 'var(--accent-warning)'; }
        if (t.type === 'danger') { Icon = XCircle; borderColor = 'var(--accent-danger)'; }

        return (
          <div
            key={t.id}
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              width: '320px',
              maxWidth: 'calc(100vw - 32px)',
              borderLeft: `4px solid ${borderColor}`,
              boxShadow: 'var(--shadow-lg)',
              pointerEvents: 'auto'
            }}
          >
            <Icon size={20} color={borderColor} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1, wordBreak: 'break-word' }}>
              {t.message}
            </span>
            <button
              onClick={() => removeToast(t.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
