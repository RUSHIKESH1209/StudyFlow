import React from 'react';
import type { TextBlock } from '../../types/schema';

export function TextBlockComp({ block }: { block: TextBlock }) {
  return (
    <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
      {block.content.title && (
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
          {block.content.title}
        </h3>
      )}
      <div 
        style={{ 
          fontSize: '1.1rem', 
          lineHeight: '1.6', 
          color: 'var(--text-main)',
          whiteSpace: 'pre-wrap'
        }}
      >
        {block.content.text}
      </div>
    </div>
  );
}
