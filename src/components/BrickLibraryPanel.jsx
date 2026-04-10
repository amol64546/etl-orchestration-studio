import React, { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import BrickManager from './BrickManager';
import './BrickLibraryPanel.css';

export default function BrickLibraryPanel({ bricks, onRefresh }) {
  const [showConfig, setShowConfig] = useState(false);
  const [editBrick, setEditBrick] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleAdd = () => {
    setShowConfig(false); // Close any open panel first
    setTimeout(() => {
      setEditBrick(null);
      setShowConfig(true);
    }, 0);
  };

  const handleEdit = (brick) => {
    setShowConfig(false); // Close any open panel first
    setTimeout(() => {
      setEditBrick(brick);
      setShowConfig(true);
    }, 0);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId && window.confirm) {
      // Use BrickManager's delete logic or lift it up if needed
      // For now, just call onRefresh after deletion
      setConfirmOpen(false);
      setDeleteId(null);
      await onRefresh(deleteId, 'delete');
    }
  };

  return (
    <div className="brick-panel-container">
      <div className="brick-panel-header">
        <span className="brick-panel-title">Bricks Library</span>
        <button className="brick-panel-plus" title="Add Brick" onClick={handleAdd}>
          <FaPlus />
        </button>
      </div>
      <div className="brick-panel-scroll">
        {bricks.map(brick => (
          <div
            className="brick-thumbnail"
            key={brick.id}
            onClick={e => {
              // Prevent click if delete icon is clicked
              if (e.target.closest('.brick-delete-icon')) return;
              handleEdit(brick);
            }}
          >
            <button
              className="brick-delete-icon"
              title="Delete Brick"
              onClick={e => {
                e.stopPropagation();
                handleDelete(brick.id);
              }}
            >   
              <FaTrash />
            </button>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1976d2', marginBottom: 6 }}>{brick.name}</div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{brick.pluginType}</div>
            <div style={{ fontSize: 13, color: '#444', marginBottom: 4 }}>
              {brick.config?.plugin_name ? `Plugin: ${brick.config.plugin_name}` : ''}
            </div>
          </div>
        ))}
      </div>
      {showConfig && (
        <div className="brick-panel-modal">
          <div className="brick-panel-modal-content">
            <button className="brick-panel-close" onClick={() => setShowConfig(false)}>&times;</button>
            <BrickManager
              bricks={bricks}
              onRefresh={onRefresh}
              editBrick={editBrick}
              onClose={() => setShowConfig(false)}
            />
          </div>
        </div>
      )}
      {confirmOpen && (
        <div className="brick-panel-confirm">
          <div className="brick-panel-confirm-content">
            <div style={{ fontSize: 18, marginBottom: 12 }}>Are you sure you want to delete this brick?</div>
            <div className="brick-panel-confirm-buttons">
              <button className="brick-panel-confirm-btn" onClick={confirmDelete}>Delete</button>
              <button className="brick-panel-confirm-btn cancel" onClick={() => setConfirmOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
