import { useState, useRef, useCallback, useEffect } from 'react';
import { studyBlockSchema } from '../types/schema';
import type { StudyBlock } from '../types/schema';

type GenerationState = 'idle' | 'loading' | 'error' | 'success';

interface GenerateOptions {
  input: string;
}

interface RefineOptions {
  feedback: string;
  currentBlocks: StudyBlock[];
}

export function useGenerateStudySet() {
  const [blocks, setBlocks] = useState<StudyBlock[]>(() => {
    try {
      const saved = localStorage.getItem('study_blocks');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load blocks from local storage');
    }
    return [];
  });

  const [state, setState] = useState<GenerationState>(() => {
    if (blocks.length > 0) return 'success';
    return 'idle';
  });
  
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync to local storage on change
  useEffect(() => {
    localStorage.setItem('study_blocks', JSON.stringify(blocks));
  }, [blocks]);

  const handleParsedObject = useCallback((parsed: any) => {
    if (parsed._delete && parsed.id) {
      setBlocks(prev => prev.filter(b => b.id !== parsed.id));
      return;
    }

    if (parsed.type === 'quiz' && parsed.content && Array.isArray(parsed.content.options) && typeof parsed.content.correctAnswer === 'number') {
      const originalOptions = [...parsed.content.options];
      const originalCorrect = parsed.content.correctAnswer;
      const indices = originalOptions.map((_, i) => i);
      
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      
      parsed.content.options = indices.map(i => originalOptions[i]);
      parsed.content.correctAnswer = indices.indexOf(originalCorrect);
    }

    const validated = studyBlockSchema.safeParse(parsed);
    if (validated.success) {
      setBlocks(prev => {
        const idx = prev.findIndex(b => b.id === validated.data.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = validated.data;
          return next;
        }
        return [...prev, validated.data];
      });
    } else {
      console.warn('Skipping invalid block structure:', validated.error);
    }
  }, []);

  const processStream = async (response: Response) => {
    if (!response.body) {
      throw new Error('ReadableStream not yet supported in this browser.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              let cleanLine = line.trim();
              if (cleanLine.startsWith('```json')) cleanLine = cleanLine.slice(7);
              if (cleanLine.startsWith('```')) cleanLine = cleanLine.slice(3);
              if (cleanLine.endsWith('```')) cleanLine = cleanLine.slice(0, -3);
              cleanLine = cleanLine.trim();

              if (!cleanLine) continue;

              const parsed = JSON.parse(cleanLine);
              handleParsedObject(parsed);
            } catch (e) {
              console.warn('Failed to parse line:', line);
            }
          }
        }
      }
      
      if (done) break;
    }

    if (buffer.trim()) {
      try {
        let cleanLine = buffer.trim();
        if (cleanLine.startsWith('```json')) cleanLine = cleanLine.slice(7);
        if (cleanLine.startsWith('```')) cleanLine = cleanLine.slice(3);
        if (cleanLine.endsWith('```')) cleanLine = cleanLine.slice(0, -3);
        cleanLine = cleanLine.trim();

        if (cleanLine) {
          const parsed = JSON.parse(cleanLine);
          handleParsedObject(parsed);
        }
      } catch (e) {
        // ignore
      }
    }
  };

  const generate = useCallback(async ({ input }: GenerateOptions) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setState('loading');
    setError(null);
    setBlocks([]);

    try {
      const fetchType = async (type: string) => {
        const response = await fetch('http://localhost:3001/api/generate-study-set', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input, blockType: type }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to generate ${type} set. Please try again.`);
        }

        await processStream(response);
      };

      await Promise.all([
        fetchType('card'),
        fetchType('quiz'),
        fetchType('text')
      ]);

      setState('success');
      
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Generation Error:', err);
      setState('error');
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      if (abortControllerRef.current === abortController) abortControllerRef.current = null;
    }
  }, []);

  const refine = useCallback(async ({ feedback, currentBlocks }: RefineOptions) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setState('loading');
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/refine-study-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback, blocks: currentBlocks }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to refine study set. Please try again.');
      }

      await processStream(response);
      setState('success');
      
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Refine Error:', err);
      setState('error');
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      if (abortControllerRef.current === abortController) abortControllerRef.current = null;
    }
  }, []);

  return { generate, refine, state, blocks, setBlocks, error, setState };
}
