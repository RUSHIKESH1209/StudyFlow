import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface StudyInputProps {
  onGenerate: (input: string) => void;
  disabled: boolean;
}

const EXAMPLES = [
  "Learn linear regression",
  "Explain photosynthesis",
  "JavaScript closures",
  "World War II"
];

export function StudyInput({ onGenerate, disabled }: StudyInputProps) {
  const [input, setInput] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setValidationError("Please enter some notes or a topic first.");
      return;
    }
    setValidationError('');
    onGenerate(trimmed);
  };

  return (
    <div className="card">
      <div style={{ marginBottom: '1rem' }}>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (validationError) setValidationError('');
          }}
          placeholder="Paste your notes or enter a topic..."
          rows={6}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '8px',
            border: `1px solid ${validationError ? 'var(--error-color)' : 'var(--border-color)'}`,
            resize: 'vertical',
            fontSize: '1rem',
            fontFamily: 'inherit'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {validationError ? (
            <span style={{ color: 'var(--error-color)' }}>{validationError}</span>
          ) : (
            <span>{input.length} characters</span>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          style={{ width: '100%' }}
        >
          <BookOpen size={20} />
          Generate Study Set
        </button>
      </div>

      <div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Try an example:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => {
                setInput(ex);
                setValidationError('');
              }}
              disabled={disabled}
              style={{
                background: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                padding: '0.25rem 0.75rem',
                borderRadius: '16px',
                fontSize: '0.875rem',
                color: 'var(--text-muted)'
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
