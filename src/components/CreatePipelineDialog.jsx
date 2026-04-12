import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './CreatePipelineDialog.css';

export default function CreatePipelineDialog({ open, onClose, onCreate }) {
  const [name, setName] = useState('');

  if (!open) return null;

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim());
      setName('');
    }
  };

  const handleCancel = () => {
    setName('');
    onClose();
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog-box">
        <button className="dialog-close" onClick={onClose} title="Close">
          <FaTimes />
        </button>
        <div className="dialog-title">Create New Pipeline</div>
        <input
          className="dialog-input"
          type="text"
          placeholder="Enter pipeline name"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
        <div className="dialog-actions">
          <button className="dialog-btn create" onClick={handleCreate} disabled={!name.trim()}>
            Create
          </button>
          <button className="dialog-btn cancel" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
