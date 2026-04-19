import React, { useState } from 'react';

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

const EnvConfigPanelUI = ({ value, onChange, panelStyle = {}, singleColumn = false }) => {
  const [config, setConfig] = useState(value || defaultEnvConfig);
  const [newFields, setNewFields] = useState([]);

  React.useEffect(() => {
    if (value) setConfig(value);
  }, [value]);

  const handleChange = (key, val) => {
    setConfig(prev => ({ ...prev, [key]: val }));
    if (onChange) onChange({ ...config, [key]: val });
  };

  const handleAddField = () => {
    setNewFields([...newFields, { key: '', value: '', valueType: 'string' }]);
  };

  const handleFieldChange = (idx, field, val) => {
    const updated = [...newFields];
    updated[idx][field] = val;
    if (field === 'valueType') {
      updated[idx].value = val === 'number' ? 0 : val === 'boolean' ? false : val === 'array' ? '[]' : val === 'object' ? '{}' : '';
    }
    setNewFields(updated);
  };

  const handleRemoveField = (idx) => {
    setNewFields(fields => fields.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    let merged = { ...config };
    newFields.forEach(f => {
      if (f.key) {
        let v = f.value;
        if (f.valueType === 'number') v = Number(f.value);
        else if (f.valueType === 'boolean') v = f.value === 'true' || f.value === true;
        else if (f.valueType === 'array' || f.valueType === 'object') {
          try { v = JSON.parse(f.value); } catch { v = f.valueType === 'array' ? [] : {}; }
        }
        merged[f.key] = v;
      }
    });
    setConfig(merged);
    setNewFields([]);
    if (onChange) onChange(merged);
  };

  return (
    <div
      className="env-config-panel"
      style={{
        ...panelStyle,
        display: 'flex',
        flexDirection: singleColumn ? 'column' : (panelStyle.flexDirection || 'row'),
        gap: singleColumn ? '1rem' : (panelStyle.gap || '1rem'),
        alignItems: singleColumn ? 'stretch' : (panelStyle.alignItems || 'flex-start'),
      }}
    >
      {/* Render environment config fields in a single column if singleColumn is true */}
      <div style={{ width: '100%' }}>
        <div className="env-config-grid" style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
          <div className="env-config-item" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', fontSize: '13px' }}>
            <label style={{ width: 150, flexShrink: 0, fontSize: '13px', textAlign: 'left', marginRight: 12 }}>Job Mode:</label>
            <select style={{ flex: 1, minWidth: 0, fontSize: '13px' }} value={config["job.mode"]} onChange={e => handleChange("job.mode", e.target.value)}>
              <option value="BATCH">BATCH</option>
              <option value="STREAMING">STREAMING</option>
            </select>
          </div>
          <div className="env-config-item" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', fontSize: '13px' }}>
            <label style={{ width: 150, flexShrink: 0, fontSize: '13px', textAlign: 'left', marginRight: 12 }}>Parallelism:</label>
            <input style={{ flex: 1, minWidth: 0, fontSize: '13px' }} type="number" min="1" value={config.parallelism} onChange={e => handleChange("parallelism", Number(e.target.value))} />
          </div>
          <div className="env-config-item" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', fontSize: '13px' }}>
            <label style={{ width: 150, flexShrink: 0, fontSize: '13px', textAlign: 'left', marginRight: 12 }}>Retry Times:</label>
            <input style={{ flex: 1, minWidth: 0, fontSize: '13px' }} type="number" min="0" value={config["job.retry.times"]} onChange={e => handleChange("job.retry.times", Number(e.target.value))} />
          </div>
          <div className="env-config-item" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', fontSize: '13px' }}>
            <label style={{ width: 150, flexShrink: 0, fontSize: '13px', textAlign: 'left', marginRight: 12 }}>Retry Interval (s):</label>
            <input style={{ flex: 1, minWidth: 0, fontSize: '13px' }} type="number" min="1" value={config["job.retry.interval.seconds"]} onChange={e => handleChange("job.retry.interval.seconds", Number(e.target.value))} />
          </div>
          <div className="env-config-item" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', fontSize: '13px' }}>
            <label style={{ width: 150, flexShrink: 0, fontSize: '13px', textAlign: 'left', marginRight: 12 }}>Checkpoint Interval (ms):</label>
            <input style={{ flex: 1, minWidth: 0, fontSize: '13px' }} type="number" min="0" value={config["checkpoint.interval"]} onChange={e => handleChange("checkpoint.interval", Number(e.target.value))} />
          </div>
          <div className="env-config-item" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', fontSize: '13px' }}>
            <label style={{ width: 150, flexShrink: 0, fontSize: '13px', textAlign: 'left', marginRight: 12 }}>Checkpoint Timeout (ms):</label>
            <input style={{ flex: 1, minWidth: 0, fontSize: '13px' }} type="number" min="0" value={config["checkpoint.timeout"]} onChange={e => handleChange("checkpoint.timeout", Number(e.target.value))} />
          </div>
          <div className="env-config-item" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', fontSize: '13px' }}>
            <label style={{ width: 150, flexShrink: 0, fontSize: '13px', textAlign: 'left', marginRight: 12 }}>Rows/Second Limit:</label>
            <input style={{ flex: 1, minWidth: 0, fontSize: '13px' }} type="number" min="0" value={config["read_limit.rows_per_second"]} onChange={e => handleChange("read_limit.rows_per_second", Number(e.target.value))} />
          </div>
          <div className="env-config-item" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', fontSize: '13px' }}>
            <label style={{ width: 150, flexShrink: 0, fontSize: '13px', textAlign: 'left', marginRight: 12 }}>Bytes/Second Limit:</label>
            <input style={{ flex: 1, minWidth: 0, fontSize: '13px' }} type="number" min="0" value={config["read_limit.bytes_per_second"]} onChange={e => handleChange("read_limit.bytes_per_second", Number(e.target.value))} />
          </div>
        </div>
        {/* Remove Additional Configuration UI */}
        {/* <div className="dynamic-fields" style={{ marginTop: 16 }}>
          <h4 style={{ fontWeight: 500, marginBottom: 8 }}>Additional Configuration:</h4>
          {newFields.map((field, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                placeholder="Field name"
                value={field.key}
                onChange={e => handleFieldChange(idx, 'key', e.target.value)}
                required
                style={{ minWidth: 100 }}
              />
              <select
                value={field.valueType}
                onChange={e => handleFieldChange(idx, 'valueType', e.target.value)}
                required
                style={{ width: 90 }}
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="array">Array</option>
                <option value="object">Object</option>
              </select>
              {field.valueType === 'boolean' ? (
                <select
                  value={field.value}
                  onChange={e => handleFieldChange(idx, 'value', e.target.value === 'true')}
                  required
                  style={{ width: 90 }}
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Value"
                  value={field.value}
                  onChange={e => handleFieldChange(idx, 'value', e.target.value)}
                  required
                  style={{ minWidth: 100 }}
                />
              )}
              <button type="button" onClick={() => handleRemoveField(idx)} style={{ color: '#e53935', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>
            </div>
          ))}
          <button type="button" onClick={handleAddField} style={{ background: '#eee', border: 'none', borderRadius: 4, padding: '4px 12px', marginTop: 4, cursor: 'pointer' }}>Add Configuration Field</button>
        </div> */}
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setConfig(defaultEnvConfig)}
            className="env-reset-btn"
            style={{
              background: 'var(--env-reset-bg, #f3f3f3)',
              border: '2px solid var(--env-reset-border, #ffe066)',
              borderRadius: 8,
              color: 'var(--env-reset-color, #23272f)',
              padding: '4px 16px',
              fontWeight: 600,
              fontSize: '13px',
              marginTop: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Reset Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnvConfigPanelUI;
