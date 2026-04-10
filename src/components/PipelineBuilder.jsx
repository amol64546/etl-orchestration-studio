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
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium">Pipeline Name</label>
          <input value={pipelineName} onChange={e => setPipelineName(e.target.value)} className="border rounded px-3 py-1 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Job Mode</label>
          <select value={jobMode} onChange={e => setJobMode(e.target.value)} className="border rounded px-3 py-1">
            <option>BATCH</option>
            <option>STREAMING</option>
          </select>
        </div>
        <button onClick={savePipeline} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">💾 Save Pipeline</button>
        <button onClick={handleExecute} disabled={executing || !currentPipelineId} className="bg-indigo-600 text-white px-4 py-2 rounded-md disabled:opacity-50">▶️ Execute</button>
        {lastJob && (
          <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">Last Job: {lastJob.jobId}</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-[600px]">
        <div className="lg:col-span-3 bg-white rounded-xl shadow overflow-hidden">
          <div style={{ height: '65vh' }} ref={reactFlowWrapper}>
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
              <Panel position="top-right" className="bg-white/80 text-xs p-1 rounded shadow">
                🧱 Drag bricks from left panel
              </Panel>
            </ReactFlow>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          <h3 className="font-semibold text-lg">⚙️ Node Config Override</h3>
          {selectedNode ? (
            <>
              <p className="text-sm">Editing: <strong>{selectedNode.data.label}</strong> ({selectedNode.data.pluginType})</p>
              <textarea
                rows={12}
                value={nodeConfigOverride}
                onChange={e => setNodeConfigOverride(e.target.value)}
                className="w-full border rounded font-mono text-xs p-2"
              />
              <button onClick={updateNodeConfig} className="bg-blue-500 text-white px-3 py-1 rounded w-full">Apply Override</button>
              <button onClick={() => setSelectedNode(null)} className="text-gray-500 text-sm mt-2">Cancel</button>
            </>
          ) : (
            <p className="text-gray-400 text-sm">Click on any node to override its configuration (JSON).</p>
          )}
          <div className="border-t pt-3 mt-2">
            <h4 className="font-medium text-sm mb-2">📌 Available Bricks</h4>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {bricks.map(b => (
                <div key={b.id} draggable onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(b));
                }} className="p-2 bg-gray-50 rounded cursor-grab text-sm border hover:border-indigo-300">
                  {b.name} <span className="text-xs text-gray-400">({b.pluginType})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
