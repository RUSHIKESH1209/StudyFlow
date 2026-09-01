import React, { useState, useEffect } from 'react';
import { BrainCircuit, Moon, Sun } from 'lucide-react';

export function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="header" style={{ position: 'relative' }}>
      <button 
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: '0.5rem',
          borderRadius: '50%',
          backgroundColor: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <BrainCircuit size={40} color="var(--primary-color)" />
        <h1 style={{ margin: 0 }}>StudyFlow</h1>
      </div>
      <p style={{ fontWeight: 500 }}>AI Study Assistant</p>
      <p style={{ marginTop: '1rem', fontSize: '1.25rem', color: 'var(--text-main)' }}>
        Turn your notes into a study session.
      </p>
      <p style={{ color: 'var(--text-muted)' }}>
        Generate interactive flashcards and quizzes from any topic or study material.
      </p>
    </header>
  );
}
