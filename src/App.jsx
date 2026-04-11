import React, { useState, useEffect } from 'react';
import BrickLibraryPanel from './components/BrickLibraryPanel';
import PipelineBuilder from './components/PipelineBuilder';
import { fetchPipelines, fetchBricks } from './api/client';

function App() {
  const [activeTab, setActiveTab] = useState('builder');
  const [bricks, setBricks] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadBricks = async () => {
    try {
      const data = await fetchBricks();
      setBricks(data);
    } catch (err) {
      console.error('Failed to load bricks', err);
    }
  };

  const loadPipelines = async () => {
    try {
      const data = await fetchPipelines();
      setPipelines(data);
    } catch (err) {
      console.error('Failed to load pipelines', err);
    }
  };

  useEffect(() => {
    loadBricks();
    loadPipelines();
  }, [refreshTrigger]);

  const refreshAll = () => setRefreshTrigger(prev => prev + 1);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-700">⚙️ ETL Orchestration Studio</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'builder' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              🧩 Pipeline Builder
            </button>
            <button
              onClick={() => setActiveTab('bricks')}
              className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'bricks' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              📦 Connector Library
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'jobs' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              📊 Job Monitor
            </button>
          </div>
        </div>
        {/* Load pipeline section removed as requested */}
      </header>

      <main className="flex-1 p-4">
        {activeTab === 'builder' && (
          <PipelineBuilder
            bricks={bricks}
            pipelines={pipelines}
            refreshBricks={loadBricks}
            selectedPipelineId={selectedPipelineId}
            onPipelineSaved={refreshAll}
            onSelectPipeline={id => setSelectedPipelineId(id)}
          />
        )}
        {activeTab === 'bricks' && (
          <BrickLibraryPanel
            bricks={bricks}
            onRefresh={async (id, action) => {
              if (action === 'delete' && id) {
                // Use BrickManager's delete logic
                try {
                  const { deleteBrick } = await import('./api/client');
                  await deleteBrick(id);
                  refreshAll();
                } catch (err) {
                  alert('Failed to delete brick');
                }
              } else {
                refreshAll();
              }
            }}
          />
        )}
        {activeTab === 'jobs' && (
          <iframe
            src="http://localhost:8080"
            title="Job Monitor"
            style={{ width: '100%', height: '80vh', border: 'none' }}
            allowFullScreen
          />
        )}
      </main>
    </div>
  );
}

export default App;
