import React from 'react';
import { Header } from './components/Header';
import { StudyInput } from './components/StudyInput';
import { ErrorState } from './components/ErrorState';
import { StudySetDashboard } from './components/StudySetDashboard';
import { useGenerateStudySet } from './hooks/useGenerateStudySet';

function App() {
  const { generate, refine, state, blocks, setBlocks, error, setState } = useGenerateStudySet();

  const handleGenerate = (input: string) => {
    generate({ input });
  };

  const handleRefine = (feedback: string, currentBlocks: any) => {
    refine({ feedback, currentBlocks });
  };

  const handleNewStudySet = () => {
    localStorage.removeItem('study_blocks');
    setBlocks([]);
    setState('idle');
  };

  return (
    <div className="app-container">
      <Header />
      
      <main>
        {state === 'idle' && (
          <StudyInput onGenerate={handleGenerate} disabled={false} />
        )}
        
        {state === 'error' && (
          <>
            <StudyInput onGenerate={handleGenerate} disabled={false} />
            <div style={{ marginTop: '2rem' }}>
              <ErrorState 
                message={error || 'An unknown error occurred.'} 
                onRetry={() => setState('idle')} 
              />
            </div>
          </>
        )}

        {(state === 'loading' || state === 'success') && (
          <StudySetDashboard 
            blocks={blocks} 
            onNewStudySet={handleNewStudySet} 
            onRefine={handleRefine}
            isLoading={state === 'loading'}
          />
        )}
      </main>
    </div>
  );
}

export default App;
