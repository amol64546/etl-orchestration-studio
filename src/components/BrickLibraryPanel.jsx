import React, { useState } from 'react';
import { fetchBrickById } from '../api/client';
import { FaPlus, FaTrash } from 'react-icons/fa';
import BrickManager from './BrickManager';
import './BrickLibraryPanel.css';

export default function BrickLibraryPanel({ bricks, onRefresh, page = 1, totalPages = 1, onPageChange }) {
  const [showConfig, setShowConfig] = useState(false);
  const [editBrick, setEditBrick] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBrickId, setSelectedBrickId] = useState(null);

  const handleAdd = () => {
    setShowConfig(false); // Close any open panel first
    setTimeout(() => {
      setEditBrick(null);
      setShowConfig(true);
    }, 0);
  };


  // Open connector details for editing pipeline (double click)
  const handleEdit = async (brick) => {
    try {
      setShowConfig(false);
      // Fetch full details from backend (port 8081)
      const details = await fetchBrickById(brick.id);
      setTimeout(() => {
        setEditBrick(details);
        setShowConfig(true);
      }, 0);
    } catch (err) {
      alert('Failed to fetch connector details');
    }
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
      <div className="brick-panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="brick-panel-title">Connectors Library</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            title="Source Connector Docs"
            style={{ background: 'none', border: '1px solid #1976d2', borderRadius: 4, cursor: 'pointer', fontSize: 14, color: '#1976d2', padding: '2px 10px' }}
            onClick={() => window.open('https://seatunnel.apache.org/docs/2.3.12/connector-v2/source', '_blank')}
          >
            Source Doc
          </button>
          <button
            type="button"
            title="Sink Connector Docs"
            style={{ background: 'none', border: '1px solid #1976d2', borderRadius: 4, cursor: 'pointer', fontSize: 14, color: '#1976d2', padding: '2px 10px' }}
            onClick={() => window.open('https://seatunnel.apache.org/docs/2.3.12/connector-v2/sink', '_blank')}
          >
            Sink Doc
          </button>
          <button
            type="button"
            title="Transform Connector Docs"
            style={{ background: 'none', border: '1px solid #1976d2', borderRadius: 4, cursor: 'pointer', fontSize: 14, color: '#1976d2', padding: '2px 10px' }}
            onClick={() => window.open('https://seatunnel.apache.org/docs/2.3.12/transform-v2', '_blank')}
          >
            Transform Doc
          </button>
          <button className="brick-panel-plus" title="Add Connector" onClick={handleAdd}>
            <FaPlus />
          </button>
        </div>
      </div>
      <div className="brick-panel-scroll">
        {bricks.map(brick => (
          <div
            className="brick-thumbnail"
            key={brick.id}
            style={selectedBrickId === brick.id ? { boxShadow: '0 4px 16px rgba(25,118,210,0.12)', border: '2px solid #1976d2' } : {}}
            onClick={e => {
              if (e.target.closest('.brick-delete-icon')) return;
              setSelectedBrickId(brick.id);
            }}
            onDoubleClick={async e => {
              if (e.target.closest('.brick-delete-icon')) return;
              await handleEdit(brick);
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
              {brick.config?.plugin_name ? `Connector: ${brick.config.plugin_name}` : ''}
            </div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>
              <span>Created: {brick.createdOn ? brick.createdOn : '-'}</span>
            </div>
            <div style={{ fontSize: 11, color: '#888' }}>
              <span>Updated: {brick.updatedOn ? brick.updatedOn : '-'}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 16 }}>
        <button
          onClick={() => onPageChange && onPageChange(page - 1)}
          disabled={page === 1}
          style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #1976d2', background: page === 1 ? '#eee' : '#fff', color: '#1976d2', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
        >Prev</button>
        <span style={{ fontSize: 14, color: '#1976d2' }}>Page {page} of {totalPages || 1}</span>
        <button
          onClick={() => onPageChange && onPageChange(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #1976d2', background: (page === totalPages || totalPages === 0) ? '#eee' : '#fff', color: '#1976d2', cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' }}
        >Next</button>
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
        <div className="brick-panel-modal">
          <div className="brick-panel-confirm-content brick-panel-confirm-modal">
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
