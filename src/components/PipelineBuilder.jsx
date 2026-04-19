import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FaSave, FaPlay, FaStop } from 'react-icons/fa';
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../styles/flowNodes.css';
import { createPipeline, getPipelineById, executePipelineWithEnv, deletePipeline, fetchBricks, fetchBrickById, streamJobStatus, stopJob } from '../api/client';
import EnvConfigPanelUI from './EnvConfigPanelUI';

const defaultEnvConfig = {
  "job.mode": "BATCH",
  "parallelism": 1,
  "job.retry.times": 3,
  "job.retry.interval.seconds": 3,
  "checkpoint.interval": 30000,
  "checkpoint.timeout": 300000,
  "read_limit.rows_per_second": 400,
  "read_limit.bytes_per_second": 7000000
};
import { Handle, Position } from 'reactflow';
import ValueEditor from './ValueEditor';
import CreatePipelineDialog from './CreatePipelineDialog';
import RenamePipelineDialog from './RenamePipelineDialog';
import Toast from './Toast';

// Custom node components matching seatunnel-web style

const nodeBoxStyle = {
  minWidth: 90,
  maxWidth: 140,
  minHeight: 32,
  padding: '4px 8px',
  fontSize: 12,
  fontWeight: 'normal',
  borderRadius: 8,
  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  background: '#f8fafc',
  border: '1.5px solid #bcd',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1.2,
};


const SourceNode = ({ data, selected }) => (
  <div className={`source-node${selected ? ' selected' : ''}`} style={nodeBoxStyle}>
    <div style={{ fontSize: 10, fontWeight: 'normal', marginBottom: 2, lineHeight: 1.15 }}>
      {`${data.pluginType || ''} : ${data.configOverrides?.plugin_name || ''} : ${data.name || ''}`}
    </div>
    <Handle type="source" position={Position.Right} />
  </div>
);

const TransformNode = ({ data, selected }) => (
  <div className={`transform-node${selected ? ' selected' : ''}`} style={nodeBoxStyle}>
    <div style={{ fontSize: 10, fontWeight: 'normal', marginBottom: 2, lineHeight: 1.15 }}>
      {`${data.pluginType || ''} : ${data.configOverrides?.plugin_name || ''} : ${data.name || ''}`}
    </div>
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
  </div>
);

const SinkNode = ({ data, selected }) => (
  <div className={`sink-node${selected ? ' selected' : ''}`} style={nodeBoxStyle}>
    <div style={{ fontSize: 10, fontWeight: 'normal', marginBottom: 2, lineHeight: 1.15 }}>
      {`${data.pluginType || ''} : ${data.configOverrides?.plugin_name || ''} : ${data.name || ''}`}
    </div>
    <Handle type="target" position={Position.Left} />
  </div>
);

const nodeTypes = {
  source: SourceNode,
  transform: TransformNode,
  sink: SinkNode,
};

export default function PipelineBuilder({ bricks, pipelines = [], refreshBricks, selectedPipelineId, onPipelineSaved, onSelectPipeline, onShowJobDetails }) {
  // Local state for bricks for connectors tab (size 1000)
  const [bigBricks, setBigBricks] = useState([]);
  const [bigBricksLoaded, setBigBricksLoaded] = useState(false);
    // Fetch bricks with size 1000 for connectors tab
    const fetchBigBricks = async () => {
      try {
        const data = await fetchBricks(1, 1000);
        setBigBricks(data.content || []);
        setBigBricksLoaded(true);
      } catch (err) {
        setBigBricks([]);
        setBigBricksLoaded(false);
        showErrorModal(err, 'Failed to fetch bricks');
      }
    };
  // Track selected elements for deletion
  const [selectedElements, setSelectedElements] = useState({ nodes: [], edges: [] });

  // Keyboard handler for Delete key
  useEffect(() => {
    const handleDeleteKey = (e) => {
      if (e.key === 'Delete') {
        if (selectedElements.nodes.length > 0) {
          setNodes(nds => nds.filter(n => !selectedElements.nodes.includes(n.id)));
        }
        if (selectedElements.edges.length > 0) {
          setEdges(eds => eds.filter(e => !selectedElements.edges.includes(e.id)));
        }
      }
    };
    window.addEventListener('keydown', handleDeleteKey);
    return () => window.removeEventListener('keydown', handleDeleteKey);
  }, [selectedElements]);
  // Selection handler for ReactFlow
  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedElements({
      nodes: nodes?.map(n => n.id) || [],
      edges: edges?.map(e => e.id) || [],
    });
  }, []);
  const [errorModal, setErrorModal] = useState(null);
  const [pipelineToDelete, setPipelineToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [pendingRename, setPendingRename] = useState('');
  // Delete pipeline handler
  const handleDeletePipeline = async (id) => {
    try {
      await deletePipeline(id);
      setShowDeleteConfirm(false);
      setPipelineToDelete(null);
      onPipelineSaved?.();
    } catch (err) {
      showErrorModal(err, 'Failed to delete pipeline');
    }
  };
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [pipelineName, setPipelineName] = useState('Untitled Pipeline');
  const [currentPipelineId, setCurrentPipelineId] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeConfigOverride, setNodeConfigOverride] = useState('');
  const [jobMode, setJobMode] = useState('BATCH');
  const [executing, setExecuting] = useState(false);
  const [lastJob, setLastJob] = useState(null);
  const [liveJobStatus, setLiveJobStatus] = useState(null);
  const jobStatusStreamRef = useRef(null);
  const [rightTab, setRightTab] = useState('create'); // 'create', 'bricks', 'execute'
  const [envConfig, setEnvConfig] = useState(defaultEnvConfig);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [configPanelNode, setConfigPanelNode] = useState(null);
  const [configFields, setConfigFields] = useState([]);
  // Update configFields when configPanelNode changes
  useEffect(() => {
    if (configPanelNode && configPanelNode.data && configPanelNode.data.configOverrides) {
      const fields = Object.entries(configPanelNode.data.configOverrides).map(([key, value]) => ({
        key,
        valueType: typeof value === 'boolean' ? 'boolean' :
          Array.isArray(value) ? 'array' :
            typeof value === 'object' ? 'object' :
              typeof value === 'number' ? 'number' : 'string',
        value
      }));
      setConfigFields(fields);
    } else {
      setConfigFields([]);
    }
  }, [configPanelNode]);
  const reactFlowWrapper = useRef(null);


  // When selectedPipelineId changes, load pipeline if set, else clear state
  useEffect(() => {
    if (selectedPipelineId) {
      loadPipeline(selectedPipelineId);
    } else {
      setNodes([]);
      setEdges([]);
      setCurrentPipelineId(null);
      setPipelineName('Untitled Pipeline');
    }
    // eslint-disable-next-line
  }, [selectedPipelineId]);

  // Update edge animation based on job status
  useEffect(() => {
    setEdges(eds => eds.map(edge => ({
      ...edge,
      animated: liveJobStatus === 'RUNNING',
    })));
  }, [liveJobStatus]);

  useEffect(() => {
    setRightTab('bricks');
  }, []);

  // On first load of connectors tab in Pipeline Builder, fetch bricks size 1000
  useEffect(() => {
    if (rightTab === 'bricks' && !bigBricksLoaded) {
      fetchBigBricks();
    }
  }, [rightTab, bigBricksLoaded]);

  const loadPipeline = async (id) => {
    try {
      const pipeline = await getPipelineById(id);
      setPipelineName(pipeline.name);
      setCurrentPipelineId(pipeline.id);
      const flowNodes = pipeline.nodes.map((node, idx) => {
        let type = 'transform';
        if (node.pluginType && node.pluginType.toLowerCase().includes('source')) type = 'source';
        else if (node.pluginType && node.pluginType.toLowerCase().includes('sink')) type = 'sink';
        const label = node.pluginType
          ? (node.name ? `${node.pluginType}: ${node.name}` : `${node.pluginType}: ${node.id.slice(-8)}`)
          : (node.name || node.id.slice(-8));
        return {
          id: node.id,
          type,
          position: { x: 100 + idx * 250, y: 200 },
          data: {
            name: node.name,
            pluginType: node.pluginType,
            connectorId: node.connectorId,
            configOverrides: node.config || {},
            brickId: node.id,
            label,
            id: node.id, // Fix: add id to data for config panel
          }
        };
      });
      const flowEdges = pipeline.edges.map(edge => ({
        id: `e-${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        animated: false, // default to false, will be toggled by useEffect
        style: { stroke: '#1976d2', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#1976d2',
          width: 18,
          height: 18,
        },
      }));
      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (err) {
      showErrorModal(err, 'Failed to load pipeline');
    }
  };

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((connection) => setEdges((eds) => addEdge({
    ...connection,
    animated: true,
    style: { stroke: '#1976d2', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#1976d2',
      width: 18,
      height: 18,
    },
  }, eds)), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(async (event) => {
    event.preventDefault();
    const rawData = event.dataTransfer.getData('application/json');
    if (!rawData) return;
    const brick = JSON.parse(rawData);
    const position = { x: event.clientX - 250, y: event.clientY - 100 };
    const randomId = Math.random().toString(36).substr(2, 9);
    let type = 'transform';
    if (brick.pluginType && brick.pluginType.toLowerCase().includes('source')) type = 'source';
    else if (brick.pluginType && brick.pluginType.toLowerCase().includes('sink')) type = 'sink';

    // Fetch full brick details
    let brickDetails = brick;
    try {
      brickDetails = await fetchBrickById(brick.id);
    } catch (e) {
      showErrorModal(e, 'Failed to fetch brick details');
      // fallback to minimal brick if fetch fails
    }

    const newNode = {
      id: randomId,
      type,
      position,
      data: {
        name: brickDetails.name,
        pluginType: brickDetails.pluginType,
        connectorId: brickDetails.id,
        configOverrides: { ...brickDetails.config },
        brickId: brickDetails.id,
        id: randomId, // This is the random id for edge/source/connector reference
        label: `${brickDetails.pluginType || ''} : ${brickDetails.config?.plugin_name || ''} : ${brickDetails.name || ''}`,
        // For modal display
        originalConfig: brickDetails.config,
      }
    };
    setNodes((nds) => nds.concat(newNode)); 
  }, []);

  // On connector node click, fetch bricks size 1000
  const onNodeClick = useCallback(() => {
    if (!bigBricksLoaded) {
      fetchBigBricks();
    }
  }, [bigBricksLoaded]);
  const onNodeDoubleClick = (_, node) => {
    setSelectedNode(node);
    setConfigPanelNode(node);
    setShowConfigPanel(true);
  };

  const updateNodeConfig = () => {
    if (!configPanelNode) return;
    // Build configOverrides from configFields
    const newOverrides = {};
    configFields.forEach(f => {
      if (f.key && f.key !== '__new__') newOverrides[f.key] = f.value;
    });
    setNodes(nds => nds.map(n => n.id === configPanelNode.id ? { ...n, data: { ...n.data, configOverrides: newOverrides } } : n));
    setShowConfigPanel(false);
    setConfigPanelNode(null);
    setSelectedNode(null);
  };

  const savePipeline = async () => {
    if (!currentPipelineId) {
      setShowCreateDialog(true);
      return;
    }
    const pipelineNodes = nodes.map(node => ({
      id: node.id,
      connectorId: node.data.connectorId, // Use the original connectorId
      pluginType: node.data.pluginType,
      config: node.data.configOverrides || {},
    }));
    const pipelineEdges = edges.map(edge => ({
      source: edge.source,
      target: edge.target,
    }));
    const payload = {
      name: pipelineName,
      nodes: pipelineNodes,
      edges: pipelineEdges,
    };
    if (currentPipelineId) payload.id = currentPipelineId;
    try {
      const saved = await createPipeline(payload);
      setCurrentPipelineId(saved.id);
      setErrorModal(null);
      setToastMessage(`Pipeline ${currentPipelineId ? 'updated' : 'created'} successfully!`);
      setToastOpen(true);
      onPipelineSaved?.();
    } catch (err) {
      showErrorModal(err, 'Failed to save pipeline');
    }
  };

  const handleCreatePipeline = async (name) => {
    setPipelineName(name);
    setShowCreateDialog(false);
    const nodeIdMap = {};
    const pipelineNodes = nodes.map(node => {
      const randomId = Math.random().toString(36).substr(2, 9);
      nodeIdMap[node.id] = randomId;
      return {
        id: randomId,
        connectorId: node.data.connectorId, // Use the original connectorId
        pluginType: node.data.pluginType,
        config: node.data.configOverrides || {},
      };
    });
    const pipelineEdges = edges.map(edge => ({
      source: nodeIdMap[edge.source] || edge.source,
      target: nodeIdMap[edge.target] || edge.target,
    }));
    const payload = {
      name,
      nodes: pipelineNodes,
      edges: pipelineEdges,
    };
    try {
      const saved = await createPipeline(payload);
      setCurrentPipelineId(saved.id);
      setErrorModal(null);
      setToastMessage(`Pipeline created with ID: ${saved.id}`);
      setToastOpen(true);
      onPipelineSaved?.();
    } catch (err) {
      showErrorModal(err, 'Failed to create pipeline');
    }
  };

  // Execute pipeline with environment config
  const stopJobStatusStream = () => {
    if (jobStatusStreamRef.current) {
      jobStatusStreamRef.current.abort();
      jobStatusStreamRef.current = null;
    }
    // Do NOT clear liveJobStatus here; let the UI show the last status (e.g., FINISHED)
  };

  const handleExecute = async () => {
    if (!currentPipelineId) {
      alert('Please save pipeline first');
      return;
    }
    setExecuting(true);
    // Clear any previous toast before showing a new one
    setToastOpen(false);
    setTimeout(() => {
      setToastMessage('Pipeline is being triggered...');
      setToastOpen(true);
    }, 50);
    try {
      stopJobStatusStream();
      // Use all env config from the Environment tab
      const envBody = envConfig && Object.keys(envConfig).length > 0 ? envConfig : { "job.mode": jobMode };
      const res = await executePipelineWithEnv(currentPipelineId, envBody);
      setLastJob(res);
      setToastMessage(`Job submitted: ${res.jobId || ''} - status: RUNNING`);
      setToastOpen(true);
      // Start streaming job status if jobId is present
      if (res.jobId) {
        const controller = new AbortController();
        jobStatusStreamRef.current = controller;
        setLiveJobStatus('RUNNING');
        fetch(`http://localhost:8080/jobs/status/${res.jobId}/stream`, { signal: controller.signal })
          .then(response => {
            if (!response.body) return;
            const reader = response.body.getReader();
            let buffer = '';
            let lastStatus = null;
            function readStream() {
              return reader.read().then(({ done, value }) => {
                if (value) {
                  buffer += new TextDecoder().decode(value);
                  // Split by newlines and get the last non-empty status
                  const statuses = buffer.split(/\r?\n/).filter(Boolean);
                  if (statuses.length > 0) {
                    let status = statuses[statuses.length - 1];
                    if (status.startsWith('data:')) status = status.replace(/^data:/, '').trim();
                    if (status !== lastStatus) {
                      setLiveJobStatus(status);
                      lastStatus = status;
                    }
                    // Stop streaming if terminal status, but ensure UI updates
                    if (["FINISHED", "FAILED", "CANCELED", "CANCELLED"].includes(status)) {
                      setLiveJobStatus(status); // Ensure final status is set
                      stopJobStatusStream();
                      return;
                    }
                  }
                }
                if (done) {
                  // On stream end, ensure the last status is set
                  const statuses = buffer.split(/\r?\n/).filter(Boolean);
                  if (statuses.length > 0) {
                    let status = statuses[statuses.length - 1];
                    if (status.startsWith('data:')) status = status.replace(/^data:/, '').trim();
                    setLiveJobStatus(status);
                  }
                  stopJobStatusStream();
                  return;
                }
                return readStream();
              });
            }
            return readStream();
          });
      }
    } catch (err) {
      console.error('Pipeline execution error:', err);
      let status = err?.response?.status || err?.status || 'Error';
      let message = '';
      let raw = '';
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          message = data;
        } else if (data.errorObject) {
          // Show both errorObject.status and errorObject.message if present
          message = (data.errorObject.status ? `[${data.errorObject.status}] ` : '') + (data.errorObject.message || JSON.stringify(data.errorObject));
        } else if (data.message) {
          message = data.message;
        } else {
          message = JSON.stringify(data, null, 2);
        }
        raw = JSON.stringify(data, null, 2);
      } else if (err?.message) {
        message = err.message;
        raw = JSON.stringify(err, null, 2);
      } else {
        message = JSON.stringify(err, null, 2);
        raw = message;
      }
      setErrorModal({ status, message, raw });
    } finally {
      setExecuting(false);
    }
  };

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');


  // Stop job handler (must be outside JSX)
  const handleStopJob = async () => {
    if (!lastJob?.jobId) return;
    stopJobStatusStream();
    try {
      await stopJob(lastJob.jobId);
      setToastMessage('Stop request sent');
      setToastOpen(true);
    } catch (err) {
      showErrorModal(err, 'Failed to stop job');
    }
  };

  // Helper to show error modal
  const showErrorModal = (err, fallback = 'An error occurred') => {
    let status = err?.response?.status || err?.status || 'Error';
    let message = '';
    let raw = '';
    if (err?.response?.data) {
      const data = err.response.data;
      if (typeof data === 'string') {
        message = data;
      } else if (data.errorObject) {
        message = (data.errorObject.status ? `[${data.errorObject.status}] ` : '') + (data.errorObject.message || JSON.stringify(data.errorObject));
      } else if (data.message) {
        message = data.message;
      } else {
        message = JSON.stringify(data, null, 2);
      }
      raw = JSON.stringify(data, null, 2);
    } else if (err?.message) {
      message = err.message;
      raw = JSON.stringify(err, null, 2);
    } else {
      message = fallback;
      raw = fallback;
    }
    setErrorModal({ status, message, raw });
  };

  return (
    <>
      {/* Error Modal */}
      {errorModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            minWidth: 320,
            maxWidth: 520,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            fontSize: 16,
          }}>
            <div style={{ color: '#e53935', fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Error</div>
            {typeof errorModal === 'object' && errorModal !== null ? (
              <>
                <div style={{ color: '#333', textAlign: 'center', marginBottom: 8 }}>
                  <div><b>Status:</b> {errorModal.status}</div>
                  <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}><b>Message:</b> {errorModal.message}</div>
                  {errorModal.raw && (
                    <details style={{ marginTop: 12, fontSize: 13, color: '#666', background: '#f7f7f7', borderRadius: 6, padding: 10 }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 500 }}>Show raw error data</summary>
                      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>{errorModal.raw}</pre>
                    </details>
                  )}
                </div>
              </>
            ) : (
              <div style={{ color: '#333', textAlign: 'center', marginBottom: 8, whiteSpace: 'pre-wrap' }}>{errorModal}</div>
            )}
            <button
              onClick={() => setErrorModal(null)}
              style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontSize: 15, cursor: 'pointer' }}
            >Close</button>
          </div>
        </div>
      )}

      {/* Config Panel/Modal for node config editing */}
      {showConfigPanel && configPanelNode && (
        <>
          {/* Overlay */}
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 49 }} onClick={() => { setShowConfigPanel(false); setConfigPanelNode(null); setSelectedNode(null); }} />
          {/* Centered Modal */}
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: '80vh', maxHeight: 800, background: '#fff', zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: 32, display: 'flex', flexDirection: 'column', overflowY: 'auto', borderRadius: 14 }}>
            <button
              onClick={() => { setShowConfigPanel(false); setConfigPanelNode(null); setSelectedNode(null); }}
              style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', zIndex: 2 }}
              title="Close"
            >×</button>
            <h2 className="text-xl font-semibold mb-4">Edit Connector Config</h2>
            <div style={{ fontSize: 14, marginBottom: 8 }}><b>Name:</b> {configPanelNode.data.name || ''}</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}><b>Connector Type:</b> {configPanelNode.data.pluginType || ''}</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}><b>Connector Name:</b> {configPanelNode.data.configOverrides?.plugin_name || ''}</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}><b>ConnectorId:</b> {configPanelNode.data.connectorId || ''}</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}><b>Id:</b> {configPanelNode.data.id || ''}</div>
            <div style={{ fontSize: 14, marginBottom: 8, fontWeight: 500 }}>Config Fields</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {configFields.map((field, idx) => (
                field.key !== '__new__' &&
                field.key !== 'plugin_name' &&
                field.key !== 'plugin_input' &&
                field.key !== 'plugin_output' && (
                  <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <span style={{ minWidth: 120, fontWeight: 500, color: '#333' }}>{field.key}</span>
                    <span style={{ minWidth: 70, color: '#888', fontSize: 13 }}>{field.valueType}</span>
                    <div style={{ flex: 1 }}>
                      <ValueEditor
                        value={field.value}
                        valueType={field.valueType}
                        onChange={val => {
                          setConfigFields(fields => fields.map((f, i) => i === idx ? { ...f, value: val } : f));
                        }}
                      />
                    </div>
                  </div>
                )
              ))}
            </div>
            {/* New field editor */}
            {configFields.some(f => f.key === '__new__') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid #f0f0f0', padding: '4px 0' }}>
                <input
                  type="text"
                  placeholder="Key"
                  value={configFields.find(f => f.key === '__new__')?.newKey || ''}
                  onChange={e => {
                    const newKey = e.target.value;
                    setConfigFields(fields => fields.map(f => f.key === '__new__' ? { ...f, newKey } : f));
                  }}
                  style={{ minWidth: 100, border: '1px solid #ccc', borderRadius: 4, padding: '2px 8px' }}
                />
                <select
                  value={configFields.find(f => f.key === '__new__')?.valueType || 'string'}
                  onChange={e => {
                    const newType = e.target.value;
                    setConfigFields(fields => fields.map(f => f.key === '__new__' ? { ...f, valueType: newType, value: newType === 'boolean' ? true : newType === 'number' ? 0 : '' } : f));
                  }}
                  style={{ minWidth: 70, border: '1px solid #ccc', borderRadius: 4, padding: '2px 8px' }}
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="array">array</option>
                  <option value="object">object</option>
                </select>
                <ValueEditor
                  value={configFields.find(f => f.key === '__new__')?.value}
                  valueType={configFields.find(f => f.key === '__new__')?.valueType || 'string'}
                  onChange={val => {
                    setConfigFields(fields => fields.map(f => f.key === '__new__' ? { ...f, value: val } : f));
                  }}
                />
                <button
                  type="button"
                  style={{ color: '#e53935', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}
                  title="Remove field"
                  onClick={() => {
                    setConfigFields(fields => fields.filter(f => f.key !== '__new__'));
                  }}
                >×</button>
                <button
                  type="button"
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                  style={{ marginLeft: 4 }}
                  disabled={!(configFields.find(f => f.key === '__new__')?.newKey)}
                  onClick={() => {
                    const newField = configFields.find(f => f.key === '__new__');
                    if (!newField || !newField.newKey) return;
                    setConfigFields(fields => [
                      ...fields.filter(f => f.key !== '__new__'),
                      { key: newField.newKey, valueType: newField.valueType, value: newField.value }
                    ]);
                  }}
                >✔</button>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={updateNodeConfig} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Save</button>
              <button onClick={() => { setShowConfigPanel(false); setConfigPanelNode(null); setSelectedNode(null); }} className="bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1" style={{ height: 'calc(100vh - 35px)' }}>
        <div className="lg:col-span-3 bg-white rounded-xl shadow overflow-hidden" style={{ height: '100%', position: 'relative', background: '#fff' }}>
          {/* Trigger and Save Pipeline Buttons - top right of left panel */}
          <div style={{ position: 'absolute', top: 12, right: 18, zIndex: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            {liveJobStatus && lastJob?.jobId && (
              <span
                style={{
                  marginRight: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  color: liveJobStatus === 'FAILED' ? '#e53935' : liveJobStatus === 'FINISHED' ? '#43a047' : '#1976d2',
                  background: '#f3f3f3',
                  borderRadius: 6,
                  padding: '4px 10px',
                  minWidth: 80,
                  textAlign: 'center',
                  letterSpacing: 1,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
                title={lastJob.jobId}
                onDoubleClick={() => onShowJobDetails && onShowJobDetails(lastJob.jobId)}
              >
                {liveJobStatus}
              </span>
            )}
            {liveJobStatus && !lastJob?.jobId && (
              <span
                style={{
                  marginRight: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  color: liveJobStatus === 'FAILED' ? '#e53935' : liveJobStatus === 'FINISHED' ? '#43a047' : '#1976d2',
                  background: '#f3f3f3',
                  borderRadius: 6,
                  padding: '4px 10px',
                  minWidth: 80,
                  textAlign: 'center',
                  letterSpacing: 1
                }}
              >
                {liveJobStatus}
              </span>
            )}
            <button
              onClick={liveJobStatus === 'RUNNING' ? handleStopJob : handleExecute}
              title={liveJobStatus === 'RUNNING' ? 'Stop Pipeline' : 'Trigger Pipeline'}
              style={{
                background: liveJobStatus === 'RUNNING' ? '#e53935' : '#43a047',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '7px 12px',
                fontSize: 18,
                boxShadow: '0 2px 8px rgba(54, 33, 33, 0.07)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {liveJobStatus === 'RUNNING' ? <FaStop style={{ fontSize: 18 }} /> : <FaPlay style={{ fontSize: 18 }} />}
            </button>
            <button
              onClick={savePipeline}
              title="Save Pipeline"
              style={{
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '7px 12px',
                fontSize: 18,
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <FaSave style={{ fontSize: 18 }} />
            </button>
          </div>
          {/* Pipeline Name Header (inside flow editor panel) */}
          <div
            style={{ position: 'absolute', top: 18, left: 18, zIndex: 40, background: 'rgba(255,255,255,0.92)', borderRadius: 8, boxShadow: '0 2px 8px rgba(25,118,210,0.07)', padding: '7px 18px', fontWeight: 700, fontSize: 18, color: '#1976d2', minWidth: 120, maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
            title={pipelineName}
            onDoubleClick={() => setShowRenameDialog(true)}
          >
            {pipelineName || 'Untitled Pipeline'}
          </div>
          <div style={{ height: '100%' }} ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onNodeDoubleClick={onNodeDoubleClick}
              nodeTypes={nodeTypes}
              onSelectionChange={onSelectionChange}
              fitView
              style={{ background: '#fff' }}
            >
              <Background style={{ background: '#fff' }} />
              <Controls />
              {/* <MiniMap /> removed as requested */}
              {/* Drag bricks panel removed as requested */}
            </ReactFlow>
          </div>
        </div>

        {/* Right-side Tabbed Panel */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-4" style={{ height: '100%' }}>
          {/* Tabs */}
          <div className="flex gap-2 mb-2">
            <button
              className={`px-3 py-1 rounded text-sm font-medium ${rightTab === 'bricks' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setRightTab('bricks')}
            >Connectors</button>
            <button
              style={{ padding: '4px 8px', width: 100 }}
              className={`px-3 py-1 rounded text-sm font-medium ${rightTab === 'execute' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setRightTab('execute')}
            >Environment</button>
          </div>

          {rightTab === 'bricks' && (
            <div
              className="flex-1 min-w-[200px]"
              style={{
                maxHeight: '80vh',
                overflowY: 'auto',
                minWidth: 200,
              }}
            >
              <div className="grid grid-cols-2 gap-2">
                {bigBricks && bigBricks.length > 0 ? (
                  bigBricks.map(brick => {
                    let bg = 'bg-amber-50';
                    let border = 'border-amber-400';
                    if (brick.pluginType && brick.pluginType.toLowerCase().includes('source')) {
                      bg = 'bg-[#ffcdd2]';
                      border = 'border-[#ffcdd2]';
                    } else if (brick.pluginType && brick.pluginType.toLowerCase().includes('sink')) {
                      bg = 'bg-[#c8e6c9]';
                      border = 'border-[#c8e6c9]';
                    } else if (brick.pluginType && brick.pluginType.toLowerCase().includes('transform')) {
                      bg = 'bg-[#bbdefb]';
                      border = 'border-[#bbdefb]';
                    }
                    return (
                      <div
                        key={brick.id}
                        className={`p-2 border rounded flex flex-col items-start cursor-grab ${bg} ${border}`}
                        style={{ borderWidth: 2, borderStyle: 'solid' }}
                        draggable
                        onDragStart={e => {
                          e.dataTransfer.setData('application/json', JSON.stringify(brick));
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                      >
                        <div className="font-medium text-sm truncate w-full">{brick.name}</div>
                        <div className="text-xs text-gray-500 w-full truncate">{brick.pluginType}</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-400 text-sm col-span-2">No bricks available.</div>
                )}
              </div>
            </div>
          )}

          {rightTab === 'execute' && (
            <div className="flex-1 overflow-y-auto min-w-[200px]" style={{ height: '100%', width: '100%' }}>
              <EnvConfigPanelUI
                panelStyle={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                singleColumn
                value={envConfig}
                onChange={setEnvConfig}
              />
            </div>
          )}
        </div>
      </div>

      <CreatePipelineDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreatePipeline}
      />
      <RenamePipelineDialog
        open={showRenameDialog}
        initialName={pipelineName}
        onClose={() => setShowRenameDialog(false)}
        onRename={async (newName) => {
          setShowRenameDialog(false);
          setPipelineName(newName);
          // Save pipeline with new name
          const nodeIdMap = {};
          const pipelineNodes = nodes.map(node => {
            const randomId = Math.random().toString(36).substr(2, 9);
            nodeIdMap[node.id] = randomId;
            return {
              id: randomId,
              connectorId: node.data.connectorId, // Use the original connectorId
              pluginType: node.data.pluginType,
              config: node.data.configOverrides || {},
            };
          });
          const pipelineEdges = edges.map(edge => ({
            source: nodeIdMap[edge.source] || edge.source,
            target: nodeIdMap[edge.target] || edge.target,
          }));
          const payload = {
            id: currentPipelineId,
            name: newName,
            nodes: pipelineNodes,
            edges: pipelineEdges,
          };
          try {
            const saved = await createPipeline(payload);
            setCurrentPipelineId(saved.id);
            setErrorModal(null);
            setToastMessage('Pipeline renamed and saved successfully!');
            setToastOpen(true);
            onPipelineSaved?.();
          } catch (err) {
            setErrorModal(err?.message || 'Failed to rename pipeline');
          }
        }}
      />
      <Toast open={toastOpen} message={toastMessage} onClose={() => setToastOpen(false)} />
    </>
  );
}
