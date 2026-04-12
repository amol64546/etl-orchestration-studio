import React, { useEffect } from 'react';

export default function Toast({ open, message, onClose, duration = 3000 }) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 32,
      right: 32,
      zIndex: 9999,
      background: '#1976d2',
      color: '#fff',
      padding: '14px 28px',
      borderRadius: 10,
      boxShadow: '0 4px 24px rgba(25,118,210,0.18)',
      fontWeight: 600,
      fontSize: 16,
      minWidth: 220,
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }}>
      <span style={{ fontSize: 20 }}>✔️</span>
      <span>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, marginLeft: 12, cursor: 'pointer' }}>×</button>
    </div>
  );
}
