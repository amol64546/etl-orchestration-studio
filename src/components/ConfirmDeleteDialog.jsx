import React from 'react';
import './ConfirmDeleteDialog.css';

export default function ConfirmDeleteDialog({ open, onClose, onConfirm, pipelineName }) {
  if (!open) return null;
  // Detect dark mode
  const isDark = typeof window !== 'undefined' && document.body.classList.contains('dark');
  return (
    <div className="dialog-backdrop">
      <div
        className="dialog-box"
        style={isDark ? {
          background: '#23272f',
          color: '#ffe066',
          border: '1.5px solid #ffe066',
        } : {}}
      >
        <div className="dialog-title">Delete Pipeline</div>
        <div
          style={{
            marginBottom: 18,
            textAlign: 'center',
            color: isDark ? '#ffe066' : '#444',
          }}
        >
          Are you sure you want to delete <b>{pipelineName}</b>?
        </div>
        <div className="dialog-actions">
          <button
            className="dialog-btn create"
            onClick={onConfirm}
            style={isDark ? {
              background: '#d32f2f',
              color: '#ffe066',
              border: 'none',
            } : {}}
          >
            Delete
          </button>
          <button
            className="dialog-btn cancel"
            onClick={onClose}
            style={isDark ? {
              background: '#444',
              color: '#ffe066',
              border: 'none',
            } : {}}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
