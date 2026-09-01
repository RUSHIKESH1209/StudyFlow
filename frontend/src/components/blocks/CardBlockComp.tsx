import React, { useState } from 'react';
import type { CardBlock } from '../../types/schema';
import { RotateCcw } from 'lucide-react';

export function CardBlockComp({ block }: { block: CardBlock }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div 
      className={`flashcard-container ${flipped ? 'flipped' : ''}`}
      onClick={() => setFlipped(!flipped)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setFlipped(!flipped);
        }
      }}
    >
      <div className="flashcard-inner">
        {/* Front */}
        <div className="flashcard-face flashcard-front">
          <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Question
          </div>
          <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)', fontWeight: 600, padding: '0 1rem', lineHeight: '1.4' }}>
            {block.content.front}
          </h3>
        </div>

        {/* Back */}
        <div className="flashcard-face flashcard-back">
          <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Answer
          </div>
          <p style={{ margin: 0, fontSize: '1.25rem', lineHeight: '1.6', fontWeight: 500, padding: '0 1rem' }}>
            {block.content.back}
          </p>
        </div>
      </div>
    </div>
  );
}
