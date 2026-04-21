import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import api from './api/client';
// Helpers for token storage
const TOKEN_KEY = 'jwt_token';
const REFRESH_KEY = 'refresh_token';
function saveTokens(token, refreshToken) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}
function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}
// Theme toggler
function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 9999, pointerEvents: 'auto' }}>
      <button
        onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        style={{
          background: theme === 'dark' ? '#222' : '#fff',
          color: theme === 'dark' ? '#fff' : '#222',
          border: '1.5px solid #bbb',
          borderRadius: 8,
          padding: '8px 18px',
          fontWeight: 600,
          fontSize: 15,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </div>
  );
}
import BrickLibraryPanel from './components/BrickLibraryPanel';
import JobMonitor from './components/JobMonitor';
import JobDetails from './components/JobDetails';
import PipelineBuilder from './components/PipelineBuilder';
import PipelineLibrary from './components/PipelineLibrary';
import { fetchPipelines, fetchBricks, createPipeline, deletePipeline } from './api/client';
import CreatePipelineDialog from './components/CreatePipelineDialog';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const [loginError, setLoginError] = useState(null);
    // Attach token to all requests
    useEffect(() => {
      api.interceptors.request.use(
        config => {
          const token = getToken();
          if (token) config.headers['Authorization'] = `Bearer ${token}`;
          return config;
        },
        error => Promise.reject(error)
      );
      return () => {
        // No cleanup for interceptors for now
      };
    }, []);
    // Login handler
    const handleLogin = async (username, password) => {
      setLoginError(null);
      try {
        const res = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Invalid credentials');
        const data = await res.json();
        saveTokens(data.token, data.refreshToken);
        setIsAuthenticated(true);
      } catch (err) {
        setLoginError(err.message || 'Login failed');
      }
    };

    // Logout handler
    const handleLogout = () => {
      clearTokens();
      setIsAuthenticated(false);
    };
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
  const [brickPage, setBrickPage] = useState(1);
  const [brickTotalPages, setBrickTotalPages] = useState(1);
  const [pipelines, setPipelines] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPipelineId, setSelectedPipelineId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // PipelineBuilder state lifted up
  // Job details state
  const [jobDetailsId, setJobDetailsId] = useState(null);
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

  const loadBricks = async (pageNum = brickPage) => {
    try {
      const data = await fetchBricks(pageNum, 10);
      setBricks(data.content || []);
      setBrickTotalPages(data.totalPages || 1);
      setBrickPage((data.number || 0) + 1);
    } catch (err) {
      console.error('Failed to load bricks', err);
    }
  };

  const loadPipelines = async (pageNum = page) => {
    try {
      const data = await fetchPipelines(pageNum, 10);
      setPipelines(data.content || []);
      setTotalPages(data.totalPages || 1);
      setPage((data.number || 0) + 1);
    } catch (err) {
      console.error('Failed to load pipelines', err);
    }
  };

  useEffect(() => {
    loadBricks(brickPage);
    loadPipelines(page);
    // No polling for jobs overview or jobs by status here
  }, [refreshTrigger, page, brickPage]);

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

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="min-h-screen flex flex-row">
      {/* Sidebar */}
      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: '#fff', color: '#222', border: '1.5px solid #bbb', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.2s' }}
      >
        Logout
      </button>
      <div className={`sidebar-panel${sidebarOpen ? ' open' : ''}`} style={{ width: sidebarOpen ? 210 : 56, transition: 'width 0.2s', minHeight: '100vh', zIndex: 20, position: 'relative' }}>
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
          <nav className="sidebar-nav">
            <button
              className={`sidebar-btn${activeTab === 'builder' ? ' active' : ''}`}
              onClick={() => { setActiveTab('builder'); setSidebarOpen(false); }}
            >🧩 Pipeline Builder</button>
            <button
              className={`sidebar-btn${activeTab === 'pipelines' ? ' active' : ''}`}
              onClick={() => { setActiveTab('pipelines'); setSidebarOpen(false); }}
            >🗂️ Pipeline Library</button>
            <button
              className={`sidebar-btn${activeTab === 'bricks' ? ' active' : ''}`}
              onClick={() => { setActiveTab('bricks'); setSidebarOpen(false); }}
            >📦 Connector Library</button>
            <button
              className={`sidebar-btn${activeTab === 'jobs' ? ' active' : ''}`}
              onClick={() => { setActiveTab('jobs'); setSidebarOpen(false); }}
            >📊 Job Monitor</button>
          </nav>
        )}
      </div>
        <ThemeToggle />
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
            // New: handler to show job details
            onShowJobDetails={jobId => {
              setJobDetailsId(jobId);
              setActiveTab('jobs');
            }}
          />
        </div>
        {/* Pipeline Library tab */}
        <div style={{ display: activeTab === 'pipelines' ? 'block' : 'none', height: '100%' }}>
          <PipelineLibrary
            pipelines={pipelines}
            page={page}
            totalPages={totalPages}
            onPageChange={newPage => {
              if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
            }}
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
            page={brickPage}
            totalPages={brickTotalPages}
            onPageChange={newPage => {
              if (newPage >= 1 && newPage <= brickTotalPages) setBrickPage(newPage);
            }}
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
        {/* Job Monitor tab - only mount when active */}
        {activeTab === 'jobs' && !jobDetailsId && (
          <React.Suspense fallback={<div>Loading Job Monitor...</div>}>
            <JobMonitor onJobDetails={id => setJobDetailsId(id)} />
          </React.Suspense>
        )}
        {/* Job Details full screen */}
        {activeTab === 'jobs' && jobDetailsId && (
          <JobDetails jobId={jobDetailsId} onBack={() => setJobDetailsId(null)} />
        )}
      </div>
    </div>
  );
}

export default App;
