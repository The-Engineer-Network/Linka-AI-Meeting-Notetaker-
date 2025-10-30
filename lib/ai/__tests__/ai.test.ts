// lib/ai/__tests__/ai.test.ts

import { AISummarizer, aiSummarizer } from '../summarizer';
import { AITranslator, aiTranslator } from '../translator';
import { AIWriter, aiWriter } from '../writer';
import { AIRewriter, aiRewriter } from '../rewriter';
import { AIPipeline, aiPipeline } from '../pipeline';
import { AICacheManager, aiCacheManager } from '../cache';
import { AIManager, aiManager } from '../index';

// Mock Chrome AI APIs
const mockSummarizer = {
  summarize: jest.fn(),
  destroy: jest.fn(),
};

const mockTranslator = {
  translate: jest.fn(),
  destroy: jest.fn(),
};

const mockWriter = {
  write: jest.fn(),
  rewrite: jest.fn(),
  destroy: jest.fn(),
};

const mockRewriter = {
  rewrite: jest.fn(),
  destroy: jest.fn(),
};

// Mock global AI object
Object.defineProperty(globalThis, 'ai', {
  value: {
    summarizer: {
      create: jest.fn().mockResolvedValue(mockSummarizer),
      capabilities: jest.fn().mockResolvedValue({
        availableTypes: ['key-points', 'tl;dr'],
      }),
      isSupported: jest.fn().mockReturnValue(true),
    },
    translator: {
      create: jest.fn().mockResolvedValue(mockTranslator),
      capabilities: jest.fn().mockResolvedValue({
        sourceLanguages: ['en', 'es'],
        targetLanguages: ['es', 'fr'],
        languagePairs: [{ source: 'en', target: 'es' }],
      }),
      isSupported: jest.fn().mockReturnValue(true),
    },
    writer: {
      create: jest.fn().mockResolvedValue(mockWriter),
      capabilities: jest.fn().mockResolvedValue({
        availableTones: ['formal', 'casual'],
      }),
      isSupported: jest.fn().mockReturnValue(true),
    },
    rewriter: {
      create: jest.fn().mockResolvedValue(mockRewriter),
      capabilities: jest.fn().mockResolvedValue({
        availableTones: ['as-is', 'more-formal'],
      }),
      isSupported: jest.fn().mockReturnValue(true),
    },
  },
  writable: true,
});

describe('AI System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singletons
    (aiSummarizer as any).summarizer = null;
    (aiTranslator as any).translator = null;
    (aiWriter as any).writer = null;
    (aiRewriter as any).rewriter = null;
  });

  describe('AISummarizer', () => {
    test('should check if summarizer is supported', () => {
      expect(AISummarizer.isSupported()).toBe(true);
    });

    test('should initialize and summarize text', async () => {
      mockSummarizer.summarize.mockResolvedValue('Summary of the text');

      await aiSummarizer.initialize();
      const result = await aiSummarizer.summarize('This is a test text for summarization.');

      expect(result.summary).toBe('Summary of the text');
      expect(result.type).toBe('key-points');
      expect(result.processingTime).toBeGreaterThan(0);
    });

    test('should handle summarizer errors', async () => {
      mockSummarizer.summarize.mockRejectedValue(new Error('API Error'));

      await aiSummarizer.initialize();

      await expect(
        aiSummarizer.summarize('Test text')
      ).rejects.toThrow('Summarization failed');
    });
  });

  describe('AITranslator', () => {
    test('should check if translator is supported', () => {
      expect(AITranslator.isSupported()).toBe(true);
    });

    test('should initialize and translate text', async () => {
      mockTranslator.translate.mockResolvedValue('Texto traducido');

      await aiTranslator.initialize();
      const result = await aiTranslator.translate('Hello world', { targetLanguage: 'es' });

      expect(result.translation).toBe('Texto traducido');
      expect(result.targetLanguage).toBe('es');
      expect(result.processingTime).toBeGreaterThan(0);
    });

    test('should check language pair compatibility', async () => {
      const canTranslate = await AITranslator.canTranslate('en', 'es');
      expect(canTranslate).toBe(true);

      const cannotTranslate = await AITranslator.canTranslate('en', 'invalid');
      expect(cannotTranslate).toBe(false);
    });
  });

  describe('AIWriter', () => {
    test('should check if writer is supported', () => {
      expect(AIWriter.isSupported()).toBe(true);
    });

    test('should initialize and write text', async () => {
      mockWriter.write.mockResolvedValue('Generated text content');

      await aiWriter.initialize();
      const result = await aiWriter.write('Write an introduction', 'write');

      expect(result.text).toBe('Generated text content');
      expect(result.tone).toBe('professional');
      expect(result.wordCount).toBeGreaterThan(0);
    });

    test('should proofread text', async () => {
      mockWriter.rewrite.mockResolvedValue('Proofread text content');

      await aiWriter.initialize();
      const result = await aiWriter.proofreadTranscript('This is a test.', 'meeting-123');

      expect(result.text).toBe('Proofread text content');
    });
  });

  describe('AIRewriter', () => {
    test('should check if rewriter is supported', () => {
      expect(AIRewriter.isSupported()).toBe(true);
    });

    test('should initialize and rewrite text', async () => {
      mockRewriter.rewrite.mockResolvedValue('Rewritten text content');

      await aiRewriter.initialize();
      const result = await aiRewriter.rewrite('This text needs rewriting');

      expect(result.text).toBe('Rewritten text content');
      expect(result.changes).toBeDefined();
      expect(result.processingTime).toBeGreaterThan(0);
    });

    test('should make text more concise', async () => {
      mockRewriter.rewrite.mockResolvedValue('Concise version');

      await aiRewriter.initialize();
      const result = await aiRewriter.makeConcise('This is a very long text that needs to be made more concise.');

      expect(result.text).toBe('Concise version');
    });
  });

  describe('AICacheManager', () => {
    test('should cache and retrieve results', async () => {
      const input = { text: 'test input' };
      const result = { summary: 'test result' };

      await aiCacheManager.set('summarize', input, result, 'meeting-123');
      const cached = await aiCacheManager.get('summarize', input, 'meeting-123');

      expect(cached).toEqual(result);
    });

    test('should return null for non-existent cache entries', async () => {
      const cached = await aiCacheManager.get('summarize', { text: 'non-existent' });
      expect(cached).toBeNull();
    });

    test('should clear expired entries', async () => {
      // Set an entry with very short TTL
      await aiCacheManager.set('test', { data: 'test' }, 'result', undefined, 1);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));

      const cleared = await aiCacheManager.clearExpired();
      expect(cleared).toBeGreaterThanOrEqual(0);
    });
  });

  describe('AIPipeline', () => {
    test('should check if pipeline is supported', () => {
      expect(AIPipeline.isSupported()).toBe(true);
    });

    test('should start and stop processing', async () => {
      await aiPipeline.start();
      expect(aiPipeline.getStatus().isProcessing).toBe(true);

      await aiPipeline.stop();
      expect(aiPipeline.getStatus().isProcessing).toBe(false);
    });

    test('should add processing tasks', async () => {
      const taskId = await aiPipeline.addTask({
        type: 'summarize',
        meetingId: 'meeting-123',
        priority: 'medium',
        data: { transcript: 'Test transcript' },
      });

      expect(typeof taskId).toBe('string');
      expect(taskId).toMatch(/^task_/);
    });
  });

  describe('AIManager', () => {
    test('should check if AI is supported', () => {
      expect(AIManager.isSupported()).toBe(true);
    });

    test('should get AI capabilities', async () => {
      const capabilities = await aiManager.getCapabilities();

      expect(capabilities).toHaveProperty('summarizer');
      expect(capabilities).toHaveProperty('translator');
      expect(capabilities).toHaveProperty('writer');
      expect(capabilities).toHaveProperty('rewriter');
    });

    test('should manage processing lifecycle', async () => {
      await aiManager.startProcessing();
      expect(aiPipeline.getStatus().isProcessing).toBe(true);

      await aiManager.stopProcessing();
      expect(aiPipeline.getStatus().isProcessing).toBe(false);
    });

    test('should get cache statistics', async () => {
      const stats = await aiManager.getCacheStats();
      expect(stats).toHaveProperty('totalEntries');
      expect(stats).toHaveProperty('activeEntries');
    });

    test('should clear cache', async () => {
      await aiManager.clearCache();
      const stats = await aiManager.getCacheStats();
      expect(stats.totalEntries).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle API initialization failures', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('API not available'));
      (globalThis as any).ai.summarizer.create = mockCreate;

      await expect(aiSummarizer.initialize()).rejects.toThrow('API not available');
    });

    test('should handle unsupported AI features gracefully', () => {
      // Temporarily remove AI support
      const originalAi = (globalThis as any).ai;
      delete (globalThis as any).ai;

      expect(AIManager.isSupported()).toBe(false);

      // Restore
      (globalThis as any).ai = originalAi;
    });

    test('should handle processing timeouts', async () => {
      mockSummarizer.summarize.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('Delayed result'), 100))
      );

      await aiSummarizer.initialize();

      const startTime = Date.now();
      const result = await aiSummarizer.summarize('Test');
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(100);
      expect(result.summary).toBe('Delayed result');
    });
  });

  describe('Integration Tests', () => {
    test('should perform end-to-end summarization workflow', async () => {
      mockSummarizer.summarize.mockResolvedValue('Meeting summary: Key points discussed.');

      // Initialize
      await aiSummarizer.initialize();

      // Add to pipeline
      const taskId = await aiPipeline.addTask({
        type: 'summarize',
        meetingId: 'meeting-123',
        priority: 'high',
        data: { transcript: 'Long meeting transcript...' },
      });

      // Start processing
      await aiPipeline.start();

      // Wait a bit for processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Stop processing
      await aiPipeline.stop();

      expect(taskId).toBeDefined();
    });

    test('should handle multiple concurrent tasks', async () => {
      const tasks = [
        aiPipeline.addTask({
          type: 'summarize',
          meetingId: 'meeting-1',
          priority: 'high',
          data: { transcript: 'Transcript 1' },
        }),
        aiPipeline.addTask({
          type: 'translate',
          meetingId: 'meeting-2',
          priority: 'medium',
          data: { transcript: 'Transcript 2', targetLanguage: 'es' },
        }),
      ];

      const taskIds = await Promise.all(tasks);

      expect(taskIds).toHaveLength(2);
      taskIds.forEach(id => {
        expect(typeof id).toBe('string');
      });
    });
  });
});