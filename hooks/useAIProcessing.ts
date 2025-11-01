// hooks/useAIProcessing.ts
import { useState, useCallback } from 'react';
import { aiService } from '@/lib/backend-init';

export interface AIProcessingOptions {
  style?: string;
  length?: string;
  targetLanguage?: string;
  tone?: string;
  includeTimestamps?: boolean;
  quality?: string;
  preserveFormatting?: boolean;
  focusAreas?: string[];
}

export interface AIProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
}

export function useAIProcessing() {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<Record<string, AIProcessingResult>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const processWithAI = useCallback(async (
    operation: 'summarize' | 'translate' | 'enhance' | 'extract',
    input: string,
    options: AIProcessingOptions = {}
  ) => {
    const operationId = `${operation}_${Date.now()}`;

    try {
      setProcessing(true);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[operationId];
        return newErrors;
      });

      let result: AIProcessingResult;

      switch (operation) {
        case 'summarize':
          result = await aiService.summarize(input, options);
          break;
        case 'translate':
          result = await aiService.translate(input, options.targetLanguage!, options);
          break;
        case 'enhance':
          result = await aiService.enhanceText(input, options);
          break;
        case 'extract':
          result = await aiService.extractActionItems(input, options);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      setResults(prev => ({ ...prev, [operationId]: result }));
      return { operationId, result };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI processing failed';
      setErrors(prev => ({ ...prev, [operationId]: errorMessage }));
      throw err;
    } finally {
      setProcessing(false);
    }
  }, []);

  const getResult = useCallback((operationId: string) => {
    return results[operationId];
  }, [results]);

  const getError = useCallback((operationId: string) => {
    return errors[operationId];
  }, [errors]);

  const clearResult = useCallback((operationId: string) => {
    setResults(prev => {
      const newResults = { ...prev };
      delete newResults[operationId];
      return newResults;
    });
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[operationId];
      return newErrors;
    });
  }, []);

  return {
    processing,
    processWithAI,
    getResult,
    getError,
    clearResult,
    results,
    errors
  };
}