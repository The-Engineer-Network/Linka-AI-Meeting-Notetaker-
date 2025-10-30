// lib/ai/index.ts

// AI API wrappers
export { aiSummarizer, AISummarizer } from './summarizer';
export { aiTranslator, AITranslator } from './translator';
export { aiWriter, AIWriter } from './writer';
export { aiRewriter, AIRewriter } from './rewriter';

// Processing pipeline
export { aiPipeline, AIPipeline } from './pipeline';

// Caching
export { aiCacheManager, AICacheManager } from './cache';

// Import for use in AIManager
import { AISummarizer, aiSummarizer } from './summarizer';
import { AITranslator, aiTranslator } from './translator';
import { AIWriter, aiWriter } from './writer';
import { AIRewriter, aiRewriter } from './rewriter';
import { aiPipeline, AIPipeline, ProcessingTask } from './pipeline';
import { aiCacheManager } from './cache';

// Types
export type {
  SummarizerOptions,
  SummarizerResult,
} from './summarizer';

export type {
  TranslatorOptions,
  TranslatorResult,
} from './translator';

export type {
  WriterOptions,
  WriterResult,
} from './writer';

export type {
  RewriterOptions,
  RewriterResult,
} from './rewriter';

export type {
  ProcessingTask,
  AIPipelineOptions,
} from './pipeline';

export type {
  AICacheEntry,
} from './cache';

// Main AI Manager class for easy integration
export class AIManager {
  constructor() {
    // Initialize cache cleanup on startup
    this.setupPeriodicCleanup();
  }

  /**
   * Check if AI features are supported
   */
  static isSupported(): boolean {
    return AISummarizer.isSupported() ||
           AITranslator.isSupported() ||
           AIWriter.isSupported() ||
           AIRewriter.isSupported();
  }

  /**
   * Get AI capabilities
   */
  async getCapabilities(): Promise<{
    summarizer: any;
    translator: any;
    writer: any;
    rewriter: any;
  }> {
    const [summarizerCaps, translatorCaps, writerCaps, rewriterCaps] = await Promise.allSettled([
      aiSummarizer.getCapabilities(),
      aiTranslator.getCapabilities(),
      aiWriter.getCapabilities(),
      aiRewriter.getCapabilities(),
    ]);

    return {
      summarizer: summarizerCaps.status === 'fulfilled' ? summarizerCaps.value : { supported: false },
      translator: translatorCaps.status === 'fulfilled' ? translatorCaps.value : { supported: false },
      writer: writerCaps.status === 'fulfilled' ? writerCaps.value : { supported: false },
      rewriter: rewriterCaps.status === 'fulfilled' ? rewriterCaps.value : { supported: false },
    };
  }

  /**
   * Start AI processing pipeline
   */
  async startProcessing(): Promise<void> {
    await aiPipeline.start();
  }

  /**
   * Stop AI processing pipeline
   */
  async stopProcessing(): Promise<void> {
    await aiPipeline.stop();
  }

  /**
   * Add AI processing task
   */
  async addProcessingTask(task: Omit<ProcessingTask, 'id' | 'status' | 'createdAt'>): Promise<string> {
    return await aiPipeline.addTask(task);
  }

  /**
   * Get AI processing status
   */
  getProcessingStatus(): any {
    return aiPipeline.getStatus();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    return await aiCacheManager.getStats();
  }

  /**
   * Clear AI cache
   */
  async clearCache(): Promise<void> {
    aiPipeline.clearCache();
    await aiCacheManager.clearAll();
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<number> {
    return await aiCacheManager.clearExpired();
  }

  /**
   * Set cache TTL
   */
  setCacheTTL(ttl: number): void {
    aiCacheManager.setDefaultTTL(ttl);
  }

  /**
   * Setup periodic cache cleanup
   */
  private setupPeriodicCleanup(): void {
    // Clean up expired cache entries every hour
    setInterval(async () => {
      try {
        await aiCacheManager.clearExpired();
      } catch (error) {
        console.warn('Periodic cache cleanup failed:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}

// Singleton instance
export const aiManager = new AIManager();