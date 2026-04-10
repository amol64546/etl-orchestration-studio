
import React, { useState, useEffect } from 'react';
import { createBrick, updateBrick, deleteBrick } from '../api/client';
import { SOURCE_PLUGINS, TRANSFORM_PLUGINS, SINK_PLUGINS } from '../constants/plugins';
import { PLUGIN_TEMPLATES } from '../constants/pluginTemplates';
import ValueEditor from './ValueEditor';

const PLUGIN_TYPES = ['SOURCE', 'TRANSFORM', 'SINK'];
const PLUGIN_LISTS = {
  SOURCE: SOURCE_PLUGINS,
  TRANSFORM: TRANSFORM_PLUGINS,
  SINK: SINK_PLUGINS
};


export default function BrickManager({ bricks, onRefresh, editBrick, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    pluginType: 'SOURCE',
    pluginName: '',
    config: {}
  });
    // Initialize form for editing
    React.useEffect(() => {
      if (editBrick) {
        setFormData({
          name: editBrick.name,
          pluginType: editBrick.pluginType,
          pluginName: editBrick.config?.plugin_name || '',
          config: editBrick.config || {}
        });
        // Removed broken template logic
        // If you need to restore config field logic, implement it here
        setEditingId(editBrick.id);
      } else {
        resetForm();
      }
      // eslint-disable-next-line
    }, [editBrick]);
  const [editingId, setEditingId] = useState(null);
  const [configFields, setConfigFields] = useState([]);
  const [message, setMessage] = useState('');

  // Update config fields when plugin type or name changes
  useEffect(() => {
    if (!formData.pluginType || !formData.pluginName) {
      setConfigFields([]);
      return;
    }
    const typeKey = formData.pluginType.toLowerCase();
    const template = PLUGIN_TEMPLATES[typeKey]?.[formData.pluginName] || {};
    const fields = Object.entries(template).map(([key, value]) => ({
      key,
      valueType: typeof value === 'boolean' ? 'boolean' :
        Array.isArray(value) ? 'array' :
        typeof value === 'object' ? 'object' :
        typeof value === 'number' ? 'number' : 'string',
      value: formData.config[key] !== undefined ? formData.config[key] : value
    }));
    setConfigFields(fields);
  }, [formData.pluginType, formData.pluginName, formData.config]);


  const resetForm = (close = false) => {
    setFormData({
      name: '',
      pluginType: 'SOURCE',
      pluginName: '',
      config: {}
    });
    setConfigFields([]);
    setEditingId(null);
    setMessage('');
    if (close && onClose) onClose();
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build config map from configFields and formData.config
      const config = {};
      configFields.forEach(field => {
        config[field.key] = formData.config[field.key];
      });
      // Always include plugin_name
      config.plugin_name = formData.pluginName;
      const payload = {
        name: formData.name,
        pluginType: formData.pluginType,
        config
      };
      if (editingId) {
        await updateBrick(editingId, { config: payload.config });
        setMessage('Brick updated');
        resetForm(true); // close after edit
        onRefresh();
      } else {
        await createBrick(payload);
        setMessage('Brick created');
        resetForm(true); // close after create
        onRefresh();
      }
    } catch (err) {
      console.error('Save brick failed', err);
      setMessage('Invalid config or API error');
    }
  };


  const handleEdit = (brick) => {
    setEditingId(brick.id);
    setFormData({
      name: brick.name,
      pluginType: brick.pluginType,
      pluginName: brick.config?.plugin_name || '',
      config: brick.config
    });
    // Set config fields from config
    if (brick.pluginType && brick.config) {
      const typeKey = brick.pluginType.toLowerCase();
      const template = PLUGIN_TEMPLATES[typeKey]?.[brick.config.plugin_name] || brick.config;
      const fields = Object.entries(template).map(([key, value]) => ({
        key,
        value,
        valueType: typeof value === 'boolean' ? 'boolean' :
          Array.isArray(value) ? 'array' :
          typeof value === 'object' ? 'object' :
          typeof value === 'number' ? 'number' : 'string'
      }));
      setConfigFields(fields);
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm('Delete brick permanently?')) {
      await deleteBrick(id);
      onRefresh();
    }
  };

  return (
    <div style={{
      width: '60vw',
      minWidth: 600,
      maxWidth: 1400,
      margin: '40px auto',
      padding: 10,
      position: 'relative',
    }}>
      <h2 className="text-xl font-semibold mb-4">{editingId ? '✏️ Edit Brick' : '➕ Create Brick'}</h2>
      {message && <div className="text-red-500 mb-2">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Plugin Type</label>
          <select
            value={formData.pluginType}
            onChange={e => setFormData({ ...formData, pluginType: e.target.value, pluginName: '', config: {} })}
            className="mt-1 w-full border rounded-md px-3 py-2"
          >
            {PLUGIN_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Plugin Name</label>
          <select
            value={formData.pluginName}
            onChange={e => setFormData({ ...formData, pluginName: e.target.value })}
            className="mt-1 w-full border rounded-md px-3 py-2"
            required
            disabled={!formData.pluginType}
          >
            <option value="">Select a plugin</option>
            {formData.pluginType && (PLUGIN_LISTS[formData.pluginType] || []).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        {configFields.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Config Fields</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {configFields.map((field, idx) => (
                <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ minWidth: 160, fontWeight: 500, color: '#333' }}>{field.key}</span>
                  <span style={{ minWidth: 90, color: '#888', fontSize: 13 }}>{field.valueType}</span>
                  <div style={{ flex: 1 }}>
                    <ValueEditor
                      value={field.value}
                      valueType={field.valueType}
                      onChange={val => {
                        setFormData(f => ({
                          ...f,
                          config: { ...f.config, [field.key]: val }
                        }));
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            {editingId ? 'Update Brick' : 'Create Brick'}
          </button>
          <button type="button" onClick={() => resetForm(true)} className="bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
        </div>
      </form>
    </div>
  );
}
