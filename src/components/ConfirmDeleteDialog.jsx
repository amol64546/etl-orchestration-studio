import React from 'react';
import './ConfirmDeleteDialog.css';

export default function ConfirmDeleteDialog({ open, onClose, onConfirm, pipelineName }) {
  if (!open) return null;
  return (
    <div className="dialog-backdrop">
      <div className="dialog-box">
        <div className="dialog-title">Delete Pipeline</div>
        <div style={{ marginBottom: 18, textAlign: 'center', color: '#444' }}>
          Are you sure you want to delete <b>{pipelineName}</b>?
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn create" onClick={onConfirm}>
            Delete
          </button>
          <button className="dialog-btn cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
