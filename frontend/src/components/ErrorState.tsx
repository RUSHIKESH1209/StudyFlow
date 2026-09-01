import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="card loading-container" style={{ color: 'var(--error-color)' }}>
      <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
        Couldn't generate your study set.
      </h3>
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>{message}</p>
      <button className="btn-primary" onClick={onRetry}>
        <RefreshCw size={20} />
        Try Again
      </button>
    </div>
  );
}
