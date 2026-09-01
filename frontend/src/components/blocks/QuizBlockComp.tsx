import React, { useState } from 'react';
import type { QuizBlock } from '../../types/schema';
import { CheckCircle2, XCircle } from 'lucide-react';

export function QuizBlockComp({ block, onAnswer, resetKey = 0 }: { block: QuizBlock; onAnswer?: (isCorrect: boolean) => void; resetKey?: number }) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  React.useEffect(() => {
    setSelectedOption(null);
  }, [resetKey]);

  const { content } = block;
  const isAnswered = selectedOption !== null;

  return (
    <div 
      style={{
        backgroundColor: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        animation: 'fadeIn 0.5s ease-out'
      }}
      tabIndex={0}
    >
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
        {content.question}
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {content.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = index === content.correctAnswer;
          
          let borderColor = 'var(--border-color)';
          let bgColor = 'transparent';
          let textColor = 'var(--text-primary)';
          let Icon = null;

          if (isAnswered) {
            if (isCorrect) {
              borderColor = '#10b981';
              bgColor = '#ecfdf5';
              textColor = '#065f46';
              Icon = CheckCircle2;
            } else if (isSelected) {
              borderColor = '#ef4444';
              bgColor = '#fef2f2';
              textColor = '#991b1b';
              Icon = XCircle;
            }
          } else if (isSelected) {
             borderColor = 'var(--primary-color)';
          }

          return (
            <button
              key={index}
              onClick={() => {
                if (!isAnswered) {
                  setSelectedOption(index);
                  if (onAnswer) onAnswer(index === content.correctAnswer);
                }
              }}
              disabled={isAnswered}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                border: `1px solid ${borderColor}`,
                backgroundColor: bgColor,
                color: textColor,
                borderRadius: '8px',
                cursor: isAnswered ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                outline: 'none',
              }}
            >
              <span>{option}</span>
              {Icon && <Icon size={20} color={isCorrect ? '#10b981' : '#ef4444'} />}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: selectedOption === content.correctAnswer ? '#ecfdf5' : '#fef2f2',
          borderRadius: '8px',
          color: selectedOption === content.correctAnswer ? '#065f46' : '#991b1b',
        }}>
          <strong>{selectedOption === content.correctAnswer ? 'Correct!' : 'Incorrect.'}</strong>
          <p style={{ margin: '0.5rem 0 0 0' }}>{content.explanation}</p>
        </div>
      )}
    </div>
  );
}
