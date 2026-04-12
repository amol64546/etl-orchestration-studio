import React, { useState, useEffect } from 'react';
import './CreatePipelineDialog.css';

export default function RenamePipelineDialog({ open, onClose, onRename, initialName }) {
  const [name, setName] = useState(initialName || '');
  React.useEffect(() => {
    setName(initialName || '');
  }, [initialName, open]);

  if (!open) return null;

  const handleRename = () => {
    if (name.trim()) {
      onRename(name.trim());
      setName('');
    }
  };

  const handleCancel = () => {
    setName(initialName || '');
    onClose();
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog-box">
        <div className="dialog-title">Rename Pipeline</div>
        <input
          className="dialog-input"
          type="text"
          placeholder="Enter new pipeline name"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
        <div className="dialog-actions">
          <button className="dialog-btn create" onClick={handleRename} disabled={!name.trim()}>
            Rename
          </button>
          <button className="dialog-btn cancel" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
