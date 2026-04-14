import React, { useState, useEffect } from 'react';
import BrickLibraryPanel from './components/BrickLibraryPanel';
import PipelineBuilder from './components/PipelineBuilder';
import PipelineLibrary from './components/PipelineLibrary';
import { fetchPipelines, fetchBricks, createPipeline, deletePipeline } from './api/client';
import CreatePipelineDialog from './components/CreatePipelineDialog';


function App() {
  // Read initial tab from localStorage, default to 'builder'
  const getInitialTab = () => {
    try {
      return localStorage.getItem('activeTab') || 'builder';
    } catch {
      return 'builder';
    }
  };
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bricks, setBricks] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // PipelineBuilder state lifted up
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [pipelineName, setPipelineName] = useState('Untitled Pipeline');
  const [currentPipelineId, setCurrentPipelineId] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeConfigOverride, setNodeConfigOverride] = useState('');
  const [jobMode, setJobMode] = useState('BATCH');
  const [executing, setExecuting] = useState(false);
  const [lastJob, setLastJob] = useState(null);
  const [rightTab, setRightTab] = useState('create');
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [configPanelNode, setConfigPanelNode] = useState(null);
  const [configFields, setConfigFields] = useState([]);
  const [pipelineToDelete, setPipelineToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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

  // Persist activeTab to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('activeTab', activeTab);
    } catch {}
  }, [activeTab]);

  const refreshAll = () => setRefreshTrigger(prev => prev + 1);

  const handleCreatePipeline = async (name) => {
    try {
      await createPipeline({ name });
      setShowCreateDialog(false);
      refreshAll();
    } catch (err) {
      alert('Failed to create pipeline');
    }
  };

  return (
    <div className="min-h-screen flex flex-row">
      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 210 : 56, transition: 'width 0.2s', background: '#f8fafc', borderRight: '1px solid #e0e7ef', minHeight: '100vh', zIndex: 20, position: 'relative' }}>
        {/* Hamburger button */}
        <button
          onClick={() => setSidebarOpen(open => !open)}
          style={{ background: 'none', border: 'none', width: 48, height: 48, margin: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          title="Open Navigation"
        >
          <div style={{ width: 28, height: 28, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 }}>
            <span style={{ display: 'block', height: 4, width: 28, background: '#1976d2', borderRadius: 2 }}></span>
            <span style={{ display: 'block', height: 4, width: 28, background: '#1976d2', borderRadius: 2 }}></span>
            <span style={{ display: 'block', height: 4, width: 28, background: '#1976d2', borderRadius: 2 }}></span>
          </div>
        </button>
        {/* Sidebar labels */}
        {sidebarOpen && (
          <nav style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => { setActiveTab('builder'); setSidebarOpen(false); }}
              style={{ background: activeTab === 'builder' ? '#1976d2' : 'none', color: activeTab === 'builder' ? '#fff' : '#222', border: 'none', borderRadius: 6, padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 2 }}
            >🧩 Pipeline Builder</button>
            <button
              onClick={() => { setActiveTab('pipelines'); setSidebarOpen(false); }}
              style={{ background: activeTab === 'pipelines' ? '#1976d2' : 'none', color: activeTab === 'pipelines' ? '#fff' : '#222', border: 'none', borderRadius: 6, padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 2 }}
            >🗂️ Pipeline Library</button>
            <button
              onClick={() => { setActiveTab('bricks'); setSidebarOpen(false); }}
              style={{ background: activeTab === 'bricks' ? '#1976d2' : 'none', color: activeTab === 'bricks' ? '#fff' : '#222', border: 'none', borderRadius: 6, padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 2 }}
            >📦 Connector Library</button>
            <button
              onClick={() => { setActiveTab('jobs'); setSidebarOpen(false); }}
              style={{ background: activeTab === 'jobs' ? '#1976d2' : 'none', color: activeTab === 'jobs' ? '#fff' : '#222', border: 'none', borderRadius: 6, padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 2 }}
            >📊 Job Monitor</button>
          </nav>
        )}
      </div>
      {/* Main content */}
      <div className="flex-1 p-4" style={{ minHeight: '100vh' }}>
        {/* Always mount PipelineBuilder, hide with CSS if not active */}
        <div style={{ display: activeTab === 'builder' ? 'block' : 'none', height: '100%' }}>
          <PipelineBuilder
            bricks={bricks}
            pipelines={pipelines}
            refreshBricks={loadBricks}
            selectedPipelineId={selectedPipelineId}
            onPipelineSaved={refreshAll}
            onSelectPipeline={id => setSelectedPipelineId(id)}
            // Pass lifted state and setters
            nodes={nodes} setNodes={setNodes}
            edges={edges} setEdges={setEdges}
            pipelineName={pipelineName} setPipelineName={setPipelineName}
            currentPipelineId={currentPipelineId} setCurrentPipelineId={setCurrentPipelineId}
            selectedNode={selectedNode} setSelectedNode={setSelectedNode}
            nodeConfigOverride={nodeConfigOverride} setNodeConfigOverride={setNodeConfigOverride}
            jobMode={jobMode} setJobMode={setJobMode}
            executing={executing} setExecuting={setExecuting}
            lastJob={lastJob} setLastJob={setLastJob}
            rightTab={rightTab} setRightTab={setRightTab}
            showConfigPanel={showConfigPanel} setShowConfigPanel={setShowConfigPanel}
            configPanelNode={configPanelNode} setConfigPanelNode={setConfigPanelNode}
            configFields={configFields} setConfigFields={setConfigFields}
            pipelineToDelete={pipelineToDelete} setPipelineToDelete={setPipelineToDelete}
            showDeleteConfirm={showDeleteConfirm} setShowDeleteConfirm={setShowDeleteConfirm}
          />
        </div>
        {/* Pipeline Library tab */}
        <div style={{ display: activeTab === 'pipelines' ? 'block' : 'none', height: '100%' }}>
          <PipelineLibrary
            pipelines={pipelines}
            selectedPipelineId={selectedPipelineId}
            onCreate={() => setShowCreateDialog(true)}
            onSelect={id => setSelectedPipelineId(id)}
            onDelete={async id => {
              try {
                await deletePipeline(id);
                refreshAll();
              } catch (err) {
                alert('Failed to delete pipeline');
              }
            }}
            onDoubleSelect={id => {
              // Always reload pipeline by resetting selectedPipelineId first
              setSelectedPipelineId(null);
              setTimeout(() => {
                setSelectedPipelineId(id);
                setActiveTab('builder');
              }, 0);
            }}
          />
        </div>
        <CreatePipelineDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onCreate={handleCreatePipeline}
        />
        {/* Connector Library tab */}
        <div style={{ display: activeTab === 'bricks' ? 'block' : 'none', height: '100%' }}>
          <BrickLibraryPanel
            bricks={bricks}
            onRefresh={async (id, action) => {
              if (action === 'delete' && id) {
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
        </div>
        {/* Job Monitor tab */}
        <div style={{ display: activeTab === 'jobs' ? 'block' : 'none', height: '100%' }}>
          <iframe
            src="http://localhost:8080"
            title="Job Monitor"
            style={{ width: '100%', height: '80vh', border: 'none' }}
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default App;
