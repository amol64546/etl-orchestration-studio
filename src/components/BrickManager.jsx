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

  // Update config fields when plugin type or name changes, and include extra fields from config
  useEffect(() => {
    if (!formData.pluginType || !formData.pluginName) {
      setConfigFields([]);
      return;
    }
    const typeKey = formData.pluginType.toLowerCase();
    const template = PLUGIN_TEMPLATES[typeKey]?.[formData.pluginName] || {};
    // Start with template fields
    let fields = Object.entries(template).map(([key, value]) => ({
      key,
      valueType: typeof value === 'boolean' ? 'boolean' :
        Array.isArray(value) ? 'array' :
        typeof value === 'object' ? 'object' :
        typeof value === 'number' ? 'number' : 'string',
      value: formData.config[key] !== undefined ? formData.config[key] : value
    }));
    // Add extra fields from config that are not in the template and not plugin_name
    Object.entries(formData.config).forEach(([key, value]) => {
      if (!(key in template) && key !== 'plugin_name') {
        fields.push({
          key,
          valueType: typeof value === 'boolean' ? 'boolean' :
            Array.isArray(value) ? 'array' :
            typeof value === 'object' ? 'object' :
            typeof value === 'number' ? 'number' : 'string',
          value
        });
      }
    });
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
        await updateBrick(editingId, payload);
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
      <h2 className="text-xl font-semibold mb-4">{editingId ? '✏️ Edit Connector' : '➕ Create Connector'}</h2>
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
          <label className="block text-sm font-medium">Connector Type</label>
          <select
            value={formData.pluginType}
            onChange={e => setFormData({ ...formData, pluginType: e.target.value, pluginName: '', config: {} })}
            className="mt-1 w-full border rounded-md px-3 py-2"
          >
            {PLUGIN_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Connector Name</label>
          <select
            value={formData.pluginName}
            onChange={e => setFormData({ ...formData, pluginName: e.target.value })}
            className="mt-1 w-full border rounded-md px-3 py-2"
            required
            disabled={!formData.pluginType}
          >
            <option value="">Select a connector</option>
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
                field.key !== '__new__' && (
                  <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <span
                      style={{
                        minWidth: 160,
                        fontWeight: 500,
                        color: typeof window !== 'undefined' && document.body.classList.contains('dark') ? '#ffe066' : '#333'
                      }}
                    >
                      {field.key}
                    </span>
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
                    {/* Only show cross button for extra (non-template) fields */}
                    {!(PLUGIN_TEMPLATES[formData.pluginType?.toLowerCase?.()]?.[formData.pluginName] && Object.keys(PLUGIN_TEMPLATES[formData.pluginType?.toLowerCase?.()]?.[formData.pluginName]).includes(field.key)) && (
                      <button
                        type="button"
                        style={{ marginLeft: 8, color: '#e53935', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}
                        title="Remove field"
                        onClick={() => {
                          setConfigFields(fields => fields.filter((_, i) => i !== idx));
                          setFormData(f => {
                            const newConfig = { ...f.config };
                            delete newConfig[field.key];
                            return { ...f, config: newConfig };
                          });
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                )
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                className="brick-action-btn cancel"
                style={{ fontWeight: 500, color: '#23272f' }}
                onClick={() => {
                  if (!configFields.some(f => f.key === '__new__')) {
                    setConfigFields(fields => [
                      ...fields,
                      { key: '__new__', valueType: 'string', value: '' }
                    ]);
                  }
                }}
              >+ Add Config Field</button>
            </div>
            {/* Show new field editor only when Add is clicked */}
            {configFields.some(f => f.key === '__new__') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, borderBottom: '1px solid #f0f0f0', padding: '4px 0' }}>
                <input
                  type="text"
                  placeholder="Key"
                  value={configFields.find(f => f.key === '__new__')?.newKey || ''}
                  onChange={e => {
                    const newKey = e.target.value;
                    setConfigFields(fields => fields.map(f => f.key === '__new__' ? { ...f, newKey } : f));
                  }}
                  style={{ minWidth: 120, border: '1px solid #ccc', borderRadius: 4, padding: '2px 8px' }}
                />
                <select
                  value={configFields.find(f => f.key === '__new__')?.valueType || 'string'}
                  onChange={e => {
                    const newType = e.target.value;
                    setConfigFields(fields => fields.map(f => f.key === '__new__' ? { ...f, valueType: newType, value: newType === 'boolean' ? true : newType === 'number' ? 0 : '' } : f));
                  }}
                  style={{ minWidth: 90, border: '1px solid #ccc', borderRadius: 4, padding: '2px 8px' }}
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
                    setFormData(f => ({
                      ...f,
                      config: { ...f.config, [newField.newKey]: newField.value }
                    }));
                    setConfigFields(fields => [
                      ...fields.filter(f => f.key !== '__new__'),
                      { key: newField.newKey, valueType: newField.valueType, value: newField.value }
                    ]);
                  }}
                >✔</button>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <button type="submit" className="brick-action-btn">
            {editingId ? 'Update Brick' : 'Create Brick'}
          </button>
          <button
            type="button"
            onClick={() => resetForm(true)}
            className="brick-action-btn cancel"
            style={{ fontWeight: 500, color: '#23272f' }}
          >Cancel</button>
        </div>
      </form>
    </div>
  );
}
