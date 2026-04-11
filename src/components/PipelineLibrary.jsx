import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import './BrickLibraryPanel.css';

export default function PipelineLibrary({ pipelines = [], onCreate, onSelect, onDelete, selectedPipelineId }) {
  return (
    <div className="brick-panel-container">
      <div className="brick-panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="brick-panel-title">Pipelines Library</span>
        <button className="brick-panel-plus" title="Add Pipeline" onClick={onCreate}>
          <FaPlus />
        </button>
      </div>
      <div className="brick-panel-scroll">
        {pipelines && pipelines.length > 0 ? (
          pipelines.map(pipeline => (
            <div
              className="brick-thumbnail"
              key={pipeline.id}
              style={selectedPipelineId === pipeline.id ? { boxShadow: '0 4px 16px rgba(25,118,210,0.12)', border: '2px solid #1976d2' } : {}}
              onClick={e => {
                // Prevent click if delete icon is clicked
                if (e.target.closest('.brick-delete-icon')) return;
                onSelect?.(pipeline.id);
              }}
            >
              <button
                className="brick-delete-icon"
                title="Delete Pipeline"
                onClick={e => {
                  e.stopPropagation();
                  onDelete?.(pipeline.id);
                }}
              >
                <FaTrash />
              </button>
              <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1976d2', marginBottom: 6 }}>{pipeline.name}</div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>ID: {pipeline.id}</div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>
                <span>Created: {pipeline.createdOn ? pipeline.createdOn : '-'}</span>
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>
                <span>Updated: {pipeline.updatedOn ? pipeline.updatedOn : '-'}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-sm" style={{ margin: '0 auto' }}>No pipelines available.</div>
        )}
      </div>
    </div>
  );
}
