// lib/ai/pipeline.ts

import { processingQueueRepository, meetingsRepository } from '../database';
import { aiSummarizer, SummarizerOptions } from './summarizer';
import { aiTranslator, TranslatorOptions } from './translator';
import { aiWriter, WriterOptions } from './writer';
import { aiRewriter, RewriterOptions } from './rewriter';

export interface ProcessingTask {
  id: string;
  type: 'summarize' | 'translate' | 'proofread' | 'rewrite' | 'generate_minutes' | 'extract_action_items';
  meetingId: string;
  priority: 'low' | 'medium' | 'high';
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
  result?: any;
  error?: string;
}

export interface AIPipelineOptions {
  enableCaching?: boolean;
  maxConcurrentTasks?: number;
  retryFailedTasks?: boolean;
  maxRetries?: number;
}

export class AIPipeline {
  private isProcessing = false;
  private activeTasks = new Set<string>();
  private cache = new Map<string, any>();

  constructor(private options: AIPipelineOptions = {}) {
    this.options = {
      enableCaching: true,
      maxConcurrentTasks: 2,
      retryFailedTasks: true,
      maxRetries: 3,
      ...options,
    };
  }

  /**
   * Start the AI processing pipeline
   */
  async start(): Promise<void> {
    if (this.isProcessing) {
      throw new Error('AI pipeline is already running');
    }

    this.isProcessing = true;
    console.log('AI processing pipeline started');

    // Start processing loop
    this.processQueue();
  }

  /**
   * Stop the AI processing pipeline
   */
  async stop(): Promise<void> {
    this.isProcessing = false;
    console.log('AI processing pipeline stopped');
  }

  /**
   * Add a task to the processing queue
   */
  async addTask(task: Omit<ProcessingTask, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const taskId = this.generateTaskId();

    const fullTask: ProcessingTask = {
      ...task,
      id: taskId,
      status: 'pending',
      createdAt: Date.now(),
    };

    // Add to processing queue
    await processingQueueRepository.enqueue({
      meetingId: task.meetingId,
      type: task.type,
      status: 'pending',
      priority: task.priority,
      data: task.data,
    });

    console.log(`Task ${taskId} added to queue: ${task.type} for meeting ${task.meetingId}`);
    return taskId;
  }

  /**
   * Process tasks from the queue
   */
  private async processQueue(): Promise<void> {
    while (this.isProcessing) {
      try {
        // Get pending tasks up to the concurrency limit
        const pendingTasks = await processingQueueRepository.getPending(this.options.maxConcurrentTasks!);

        if (pendingTasks.length === 0) {
          // No tasks to process, wait before checking again
          await this.delay(5000);
          continue;
        }

        // Process tasks concurrently
        const processingPromises = pendingTasks.map(task => this.processTask(task));

        await Promise.allSettled(processingPromises);

      } catch (error) {
        console.error('Error in processing queue:', error);
        await this.delay(10000); // Wait longer on error
      }
    }
  }

  /**
   * Process a single task
   */
  private async processTask(queueItem: any): Promise<void> {
    const taskId = queueItem.id;

    if (this.activeTasks.has(taskId)) {
      return; // Already processing
    }

    this.activeTasks.add(taskId);

    try {
      // Mark as processing
      await processingQueueRepository.markAsProcessing(taskId);

      // Process based on type
      const result = await this.executeTask(queueItem);

      // Mark as completed
      await processingQueueRepository.markAsCompleted(taskId, result);

      console.log(`Task ${taskId} completed: ${queueItem.type}`);

    } catch (error) {
      console.error(`Task ${taskId} failed:`, error);

      // Handle retries
      if (this.options.retryFailedTasks && queueItem.retryCount < this.options.maxRetries!) {
        await processingQueueRepository.markAsPending(taskId);
        console.log(`Task ${taskId} will be retried`);
      } else {
        await processingQueueRepository.markAsFailed(taskId, error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      this.activeTasks.delete(taskId);
    }
  }

  /**
   * Execute the actual AI task
   */
  private async executeTask(queueItem: any): Promise<any> {
    const { type, meetingId, data } = queueItem;

    // Check cache first
    if (this.options.enableCaching) {
      const cacheKey = this.generateCacheKey(type, meetingId, data);
      const cachedResult = this.cache.get(cacheKey);
      if (cachedResult) {
        console.log(`Using cached result for ${type}`);
        return cachedResult;
      }
    }

    let result: any;

    switch (type) {
      case 'summarize':
        result = await this.processSummarization(meetingId, data);
        break;

      case 'translate':
        result = await this.processTranslation(meetingId, data);
        break;

      case 'proofread':
        result = await this.processProofreading(meetingId, data);
        break;

      case 'rewrite':
        result = await this.processRewriting(meetingId, data);
        break;

      case 'generate_minutes':
        result = await this.processMinutesGeneration(meetingId, data);
        break;

      case 'extract_action_items':
        result = await this.processActionItemsExtraction(meetingId, data);
        break;

      default:
        throw new Error(`Unknown task type: ${type}`);
    }

    // Cache the result
    if (this.options.enableCaching) {
      const cacheKey = this.generateCacheKey(type, meetingId, data);
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Process summarization task
   */
  private async processSummarization(meetingId: string, data: any): Promise<any> {
    const options: SummarizerOptions = {
      type: data.type || 'key-points',
      format: data.format || 'markdown',
      length: data.length || 'medium',
      context: data.context,
    };

    const text = data.transcript || data.text;
    if (!text) {
      throw new Error('No text provided for summarization');
    }

    const result = await aiSummarizer.summarizeMeeting(meetingId, text);

    // Update meeting with summary
    await meetingsRepository.update(meetingId, {
      summary: result.summary,
    });

    return result;
  }

  /**
   * Process translation task
   */
  private async processTranslation(meetingId: string, data: any): Promise<any> {
    const options: TranslatorOptions = {
      sourceLanguage: data.sourceLanguage || 'en',
      targetLanguage: data.targetLanguage || 'es',
      format: data.format || 'plain-text',
    };

    const text = data.transcript || data.text;
    if (!text) {
      throw new Error('No text provided for translation');
    }

    const result = await aiTranslator.translateMeeting(meetingId, text, options.targetLanguage, options.sourceLanguage);

    // Store translation in meeting
    const meeting = await meetingsRepository.getById(meetingId);
    if (meeting) {
      const translations = meeting.translations || [];
      translations.push({
        language: options.targetLanguage,
        text: result.translation,
        createdAt: new Date(),
      });

      await meetingsRepository.update(meetingId, {
        translations,
      });
    }

    return result;
  }

  /**
   * Process proofreading task
   */
  private async processProofreading(meetingId: string, data: any): Promise<any> {
    const text = data.transcript || data.text;
    if (!text) {
      throw new Error('No text provided for proofreading');
    }

    const result = await aiWriter.proofreadTranscript(text, meetingId);

    return result;
  }

  /**
   * Process rewriting task
   */
  private async processRewriting(meetingId: string, data: any): Promise<any> {
    const text = data.text;
    if (!text) {
      throw new Error('No text provided for rewriting');
    }

    const options: RewriterOptions = {
      tone: data.tone || 'more-professional',
      format: data.format || 'plain-text',
      length: data.length || 'as-is',
    };

    const result = await aiRewriter.rewriteTranscript(text, meetingId, options.tone as any);

    return result;
  }

  /**
   * Process meeting minutes generation
   */
  private async processMinutesGeneration(meetingId: string, data: any): Promise<any> {
    const meeting = await meetingsRepository.getById(meetingId);
    if (!meeting) {
      throw new Error(`Meeting ${meetingId} not found`);
    }

    const transcript = meeting.transcript;
    const summary = meeting.summary || '';
    const participants = meeting.participants || [];

    const result = await aiWriter.generateMeetingMinutes(
      transcript,
      summary,
      meetingId,
      participants.map(p => p.toString())
    );

    // Update meeting with minutes
    await meetingsRepository.update(meetingId, {
      minutes: result.text,
    });

    return result;
  }

  /**
   * Process action items extraction
   */
  private async processActionItemsExtraction(meetingId: string, data: any): Promise<any> {
    const meeting = await meetingsRepository.getById(meetingId);
    if (!meeting) {
      throw new Error(`Meeting ${meetingId} not found`);
    }

    const content = data.content || meeting.transcript || meeting.summary;
    if (!content) {
      throw new Error('No content available for action items extraction');
    }

    const result = await aiWriter.generateActionItems(content, meetingId);

    // Update meeting with action items
    const actionItems = this.parseActionItems(result.text);
    await meetingsRepository.update(meetingId, {
      actionItems,
    });

    return {
      ...result,
      parsedActionItems: actionItems,
    };
  }

  /**
   * Parse action items from generated text
   */
  private parseActionItems(text: string): any[] {
    // Simple parsing of action items
    const lines = text.split('\n');
    const actionItems: any[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const item = trimmed.substring(2);
        actionItems.push({
          text: item,
          completed: false,
          createdAt: new Date(),
        });
      }
    }

    return actionItems;
  }

  /**
   * Generate cache key for results
   */
  private generateCacheKey(type: string, meetingId: string, data: any): string {
    const dataHash = JSON.stringify(data);
    return `${type}:${meetingId}:${btoa(dataHash).substring(0, 16)}`;
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get pipeline status
   */
  getStatus(): {
    isProcessing: boolean;
    activeTasks: number;
    cacheSize: number;
  } {
    return {
      isProcessing: this.isProcessing,
      activeTasks: this.activeTasks.size,
      cacheSize: this.cache.size,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('AI pipeline cache cleared');
  }

  /**
   * Check if AI pipeline is supported
   */
  static isSupported(): boolean {
    return aiSummarizer.isSupported() ||
           aiTranslator.isSupported() ||
           aiWriter.isSupported() ||
           aiRewriter.isSupported();
  }
}

// Singleton instance
export const aiPipeline = new AIPipeline();