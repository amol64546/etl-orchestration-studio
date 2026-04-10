import React, { useState, useEffect, useCallback } from 'react';

const ValueEditor = ({ value, onChange, disabled = false }) => {
  const getValueType = useCallback((val) => {
    if (Array.isArray(val)) return 'array';
    if (typeof val === 'object' && val !== null) return 'object';
    return typeof val; // 'string', 'number', 'boolean'
  }, []);

  const [type, setType] = useState(getValueType(value));
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (type === 'array' || type === 'object') {
      try {
        setInputValue(JSON.stringify(value || (type === 'array' ? [] : {}), null, 2));
      } catch {
        setInputValue(type === 'array' ? '[]' : '{}');
      }
    } else if (type === 'boolean') {
      setInputValue(String(value ?? true));
    } else {
      setInputValue(value != null ? String(value) : '');
    }
    setIsValid(true);
  }, [value, type]);

  const handleTypeChange = (newType) => {
    setType(newType);
    const defaults = {
      string: '',
      number: null,
      boolean: true,
      array: [],
      object: {}
    };
    onChange(defaults[newType]);
  };

  const handleValueChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    let parsedValue = val;
    let valid = true;

    try {
      if (type === 'number') {
        parsedValue = val === '' ? null : Number(val);
        valid = val === '' || !isNaN(parsedValue);
      } else if (type === 'boolean') {
        parsedValue = val === 'true';
      } else if (type === 'array' || type === 'object') {
        parsedValue = JSON.parse(val);
        valid = type === 'array' ? Array.isArray(parsedValue) : typeof parsedValue === 'object' && !Array.isArray(parsedValue);
      }
    } catch {
      valid = false;
    }
    setIsValid(valid);
    if (valid) onChange(parsedValue);
  };

  return (
    <div style={{ marginBottom: 8 }}>
      {type === 'boolean' ? (
        <select value={inputValue} onChange={handleValueChange} disabled={disabled}>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : (
        <input
          type={type === 'number' ? 'number' : 'text'}
          value={inputValue}
          onChange={handleValueChange}
          disabled={disabled}
          style={{ width: 180, border: isValid ? '1px solid #ccc' : '1px solid red' }}
        />
      )}
      {!isValid && <span style={{ color: 'red', marginLeft: 8 }}>Invalid {type}</span>}
    </div>
  );
};

export default ValueEditor;
