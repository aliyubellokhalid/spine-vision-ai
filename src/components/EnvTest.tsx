import React from 'react';

const EnvTest = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div><strong>Environment Test:</strong></div>
      <div>API Key: {apiKey ? '✅ Set' : '❌ Missing'}</div>
      <div>Key Length: {apiKey ? apiKey.length : 0}</div>
    </div>
  );
};

export default EnvTest;
