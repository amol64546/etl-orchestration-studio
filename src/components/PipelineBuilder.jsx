import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MiniMap,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { createPipeline, updatePipeline, getPipelineById, executePipeline } from '../api/client';

const nodeTypes = {
  custom: ({ data }) => (
    <div className={`px-3 py-2 rounded-lg border-2 shadow-md ${data.type === 'SOURCE' ? 'border-green-400 bg-green-50' : data.type === 'SINK' ? 'border-red-400 bg-red-50' : 'border-amber-400 bg-amber-50'}`}>
      <div className="font-bold text-sm">{data.label}</div>
      <div className="text-xs text-gray-600">{data.pluginType}</div>
      {data.configOverrides && Object.keys(data.configOverrides).length > 0 && (
        <div className="text-[10px] mt-1 text-gray-500 truncate max-w-[150px]">
          ⚙️ overrides
        </div>
      )}
    </div>
  )
};

export default function PipelineBuilder({ bricks, refreshBricks, selectedPipelineId, onPipelineSaved }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [pipelineName, setPipelineName] = useState('my-pipeline');
  const [currentPipelineId, setCurrentPipelineId] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeConfigOverride, setNodeConfigOverride] = useState('');
  const [jobMode, setJobMode] = useState('BATCH');
  const [executing, setExecuting] = useState(false);
  const [lastJob, setLastJob] = useState(null);
  const [rightTab, setRightTab] = useState('create'); // 'create', 'bricks', 'execute'
  const reactFlowWrapper = useRef(null);

  useEffect(() => {
    if (selectedPipelineId) {
      loadPipeline(selectedPipelineId);
    } else {
      setNodes([]);
      setEdges([]);
      setCurrentPipelineId(null);
      setPipelineName('new-pipeline');
    }
  }, [selectedPipelineId]);

  const loadPipeline = async (id) => {
    try {
      const pipeline = await getPipelineById(id);
      setPipelineName(pipeline.name);
      setCurrentPipelineId(pipeline.id);
      const flowNodes = pipeline.nodes.map((node, idx) => ({
        id: node.id,
        type: 'custom',
        position: { x: 100 + idx * 250, y: 200 },
        data: {
          label: node.name || node.id.slice(-8),
          pluginType: node.pluginType,
          type: node.pluginType,
          configOverrides: node.config || {},
          brickId: node.id,
        }
      }));
      const flowEdges = pipeline.edges.map(edge => ({
        id: `e-${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        animated: true,
      }));
      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (err) {
      console.error('Failed to load pipeline', err);
    }
  };

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const rawData = event.dataTransfer.getData('application/json');
    if (!rawData) return;
    const brick = JSON.parse(rawData);
    const position = { x: event.clientX - 250, y: event.clientY - 100 };
    const newNodeId = `${brick.id}_${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: 'custom',
      position,
      data: {
        label: brick.name,
        pluginType: brick.pluginType,
        type: brick.pluginType,
        configOverrides: { ...brick.config },
        brickId: brick.id,
        originalConfig: brick.config,
      }
    };
    setNodes((nds) => nds.concat(newNode));
  }, []);

  const onNodeClick = (_, node) => {
    setSelectedNode(node);
    setNodeConfigOverride(JSON.stringify(node.data.configOverrides || {}, null, 2));
  };

  const updateNodeConfig = () => {
    if (!selectedNode) return;
    try {
      const newOverrides = JSON.parse(nodeConfigOverride);
      setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, configOverrides: newOverrides } } : n));
      setSelectedNode(null);
    } catch (e) {
      alert('Invalid JSON for node overrides');
    }
  };

  const savePipeline = async () => {
    const pipelineNodes = nodes.map(node => ({
      id: node.data.brickId,
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
    try {
      let saved;
      if (currentPipelineId) {
        saved = await updatePipeline(currentPipelineId, payload);
      } else {
        saved = await createPipeline(payload);
      }
      setCurrentPipelineId(saved.id);
      alert(`Pipeline ${currentPipelineId ? 'updated' : 'created'} with ID: ${saved.id}`);
      onPipelineSaved?.();
    } catch (err) {
      console.error(err);
      alert('Failed to save pipeline');
    }
  };

  const handleExecute = async () => {
    if (!currentPipelineId) {
      alert('Please save pipeline first');
      return;
    }
    setExecuting(true);
    try {
      const job = await executePipeline(currentPipelineId, jobMode);
      setLastJob(job);
      alert(`Job submitted: ${job.jobId} - status: ${job.jobStatus}`);
    } catch (err) {
      console.error(err);
      alert('Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1" >
        <div className="lg:col-span-3 bg-white rounded-xl shadow overflow-hidden" style={{ height: '85vh' }}>
          <div style={{ height: '85vh' }} ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
              {/* Drag bricks panel removed as requested */}
            </ReactFlow>
          </div>
        </div>

        {/* Right-side Tabbed Panel */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-4" style={{ height: '85vh' }}>
          {/* Tabs */}
          <div className="flex gap-2 mb-2">
            <button
              className={`px-3 py-1 rounded text-sm font-medium ${rightTab === 'create' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setRightTab('create')}
            >Pipelines</button>
            <button
              className={`px-3 py-1 rounded text-sm font-medium ${rightTab === 'bricks' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setRightTab('bricks')}
            >Connectors</button>
            <button
              className={`px-3 py-1 rounded text-sm font-medium ${rightTab === 'execute' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setRightTab('execute')}
            >Environment</button>
          </div>
      
          {/* Tab Content */}
          {rightTab === 'create' && (
            <></>
          )}

          {rightTab === 'bricks' && (
            <div className="flex-1 overflow-y-auto min-w-[200px]">
              <div className="font-semibold mb-2">All Connectors</div>
              <div className="grid grid-cols-2 gap-2">
                {bricks && bricks.length > 0 ? (
                  bricks.map(brick => (
                    <div key={brick.id} className="p-2 border rounded bg-gray-50 flex flex-col items-start">
                      <div className="font-medium text-sm truncate w-full">{brick.name}</div>
                      <div className="text-xs text-gray-500 w-full truncate">{brick.pluginType}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm col-span-2">No bricks available.</div>
                )}
              </div>
            </div>
          )}

          {rightTab === 'execute' && (
            <div className="flex flex-col gap-2">
              <div>
                <label className="block text-sm font-medium">Job Mode</label>
                <select value={jobMode} onChange={e => setJobMode(e.target.value)} className="border rounded px-3 py-1">
                  <option>BATCH</option>
                  <option>STREAMING</option>
                </select>
              </div>
              <button onClick={handleExecute} disabled={executing || !currentPipelineId} className="bg-indigo-600 text-white px-4 py-2 rounded-md disabled:opacity-50">▶️ Execute Pipeline</button>
              {lastJob && (
                <div className="text-sm bg-gray-100 px-3 py-1 rounded-full mt-2">Last Job: {lastJob.jobId}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Duplicate flow editor panel removed as requested */}
    </div>
  );
}
