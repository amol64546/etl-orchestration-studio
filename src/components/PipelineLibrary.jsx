import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import './BrickLibraryPanel.css';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';

export default function PipelineLibrary({
  pipelines = [],
  onCreate,
  onSelect,
  onDelete,
  selectedPipelineId,
  onDoubleSelect,
  page = 1,
  totalPages = 1,
  onPageChange
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [pipelineToDelete, setPipelineToDelete] = React.useState(null);

  return (
    <>
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
                  if (e.target.closest('.brick-delete-icon')) return;
                  onSelect?.(pipeline.id);
                }}
                onDoubleClick={e => {
                  if (e.target.closest('.brick-delete-icon')) return;
                  onSelect?.(pipeline.id);
                  onDoubleSelect?.(pipeline.id);
                }}
              >
                <button
                  className="brick-delete-icon"
                  title="Delete Pipeline"
                  onClick={e => {
                    e.stopPropagation();
                    setPipelineToDelete(pipeline);
                    setDeleteDialogOpen(true);
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
        </div>
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        pipelineName={pipelineToDelete?.name}
        onClose={() => { setDeleteDialogOpen(false); setPipelineToDelete(null); }}
        onConfirm={() => {
          onDelete?.(pipelineToDelete.id);
          setDeleteDialogOpen(false);
          setPipelineToDelete(null);
        }}
      />
    </>
  );
}
