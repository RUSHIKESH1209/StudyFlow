import React from 'react';

export function LoadingState() {
  return (
    <div className="card loading-container">
      <div className="spinner"></div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
        Creating your study session...
      </h3>
      <p>This usually takes a few seconds.</p>
    </div>
  );
}
