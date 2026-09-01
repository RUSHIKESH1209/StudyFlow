import React, { useState } from 'react';
import type { StudyBlock, CardBlock, QuizBlock, TextBlock } from '../types/schema';
import { CardBlockComp } from './blocks/CardBlockComp';
import { QuizBlockComp } from './blocks/QuizBlockComp';
import { TextBlockComp } from './blocks/TextBlockComp';
import { Send } from 'lucide-react';

interface StudySetDashboardProps {
  blocks: StudyBlock[];
  onNewStudySet: () => void;
  onRefine: (feedback: string, currentBlocks: StudyBlock[]) => void;
  isLoading?: boolean;
}

export function StudySetDashboard({ blocks, onNewStudySet, onRefine, isLoading }: StudySetDashboardProps) {
  const [activeTab, setActiveTab] = useState<'card' | 'quiz' | 'text'>('card');
  const [question, setQuestion] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, boolean>>({});
  const [resetCounts, setResetCounts] = useState<Record<string, number>>({});

  const handleAddMore = () => {
    if (isLoading) return;
    if (activeTab === 'card') {
      onRefine('Add 3 more flashcards', blocks);
    } else if (activeTab === 'quiz') {
      onRefine('Add 3 more quiz questions', blocks);
    } else if (activeTab === 'text') {
      onRefine('Add 3 more follow-up questions', blocks);
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    onRefine(`The student asked: "${question}". Please answer this question by adding a new Follow-up Q&A block.`, blocks);
    setQuestion('');
  };

  const handleRetryIncorrect = () => {
    setResetCounts(prev => {
      const next = { ...prev };
      const nextAnswers = { ...quizAnswers };
      Object.entries(quizAnswers).forEach(([id, isCorrect]) => {
        if (!isCorrect) {
          next[id] = (next[id] || 0) + 1;
          delete nextAnswers[id];
        }
      });
      setQuizAnswers(nextAnswers);
      return next;
    });
  };

  const cards = blocks.filter((b): b is CardBlock => b.type === 'card');
  const quizzes = blocks.filter((b): b is QuizBlock => b.type === 'quiz');
  const texts = blocks.filter((b): b is TextBlock => b.type === 'text');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Your Study Session</h2>
        <button 
          onClick={onNewStudySet}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            color: 'var(--text-primary)'
          }}
        >
          New Session
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('card')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: activeTab === 'card' ? 'var(--primary-color)' : 'var(--text-muted)',
            borderBottom: activeTab === 'card' ? '3px solid var(--primary-color)' : '3px solid transparent',
            marginBottom: '-0.6rem'
          }}
        >
          Flashcards ({cards.length})
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: activeTab === 'quiz' ? 'var(--primary-color)' : 'var(--text-muted)',
            borderBottom: activeTab === 'quiz' ? '3px solid var(--primary-color)' : '3px solid transparent',
            marginBottom: '-0.6rem'
          }}
        >
          Quizzes ({quizzes.length})
        </button>
        <button
          onClick={() => setActiveTab('text')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: activeTab === 'text' ? 'var(--primary-color)' : 'var(--text-muted)',
            borderBottom: activeTab === 'text' ? '3px solid var(--primary-color)' : '3px solid transparent',
            marginBottom: '-0.6rem'
          }}
        >
          Follow-up Q&A ({texts.length})
        </button>
      </div>

      {blocks.length === 0 && isLoading && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0', animation: 'pulse 1.5s infinite' }}>
          Generating your personalized study blocks...
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {activeTab === 'card' && cards.map(block => (
          <CardBlockComp key={block.id} block={block} />
        ))}
        {activeTab === 'quiz' && quizzes.map(block => (
          <QuizBlockComp 
            key={block.id} 
            block={block} 
            resetKey={resetCounts[block.id] || 0}
            onAnswer={(isCorrect) => {
              setQuizAnswers(prev => ({ ...prev, [block.id]: isCorrect }));
            }}
          />
        ))}
        {activeTab === 'text' && texts.map(block => (
          <TextBlockComp key={block.id} block={block} />
        ))}
      </div>

      {isLoading && blocks.length > 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', animation: 'pulse 1.5s infinite' }}>
          AI is generating more blocks...
        </div>
      )}

      {activeTab === 'quiz' && quizzes.length > 0 && Object.keys(quizAnswers).length === quizzes.length && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: 'var(--surface-color)',
          border: '2px solid var(--primary-color)',
          borderRadius: '12px',
          textAlign: 'center',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
            Quiz Completed!
          </h3>
          <p style={{ fontSize: '1.2rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            You scored {Object.values(quizAnswers).filter(Boolean).length} out of {quizzes.length}
          </p>
          {Object.values(quizAnswers).filter(Boolean).length < quizzes.length && (
            <button
              onClick={handleRetryIncorrect}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--surface-color)',
                color: 'var(--primary-color)',
                border: '2px solid var(--primary-color)',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Retry Incorrect Questions
            </button>
          )}
        </div>
      )}

      {!isLoading && blocks.length > 0 && (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleAddMore}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Add 3 more {activeTab === 'card' ? 'Flashcards' : activeTab === 'quiz' ? 'Quizzes' : 'Questions'}
            <Send size={18} />
          </button>
        </div>
      )}

      {!isLoading && activeTab === 'text' && blocks.length > 0 && (
        <form 
          onSubmit={handleAskQuestion}
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your own question here..."
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!question.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem 1.5rem',
              backgroundColor: question.trim() ? 'var(--primary-color)' : 'var(--border-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: question.trim() ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s'
            }}
          >
            Ask AI
          </button>
        </form>
      )}
    </div>
  );
}
