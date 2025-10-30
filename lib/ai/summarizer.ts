// lib/ai/summarizer.ts

import { settingsRepository } from '../database';

export interface SummarizerOptions {
  type?: 'tl;dr' | 'key-points' | 'teaser' | 'headline';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
  context?: string;
}

export interface SummarizerResult {
  summary: string;
  type: string;
  format: string;
  length: string;
  processingTime: number;
  confidence?: number;
  metadata?: {
    wordCount: number;
    sentenceCount: number;
    keyPoints?: string[];
  };
}

export class AISummarizer {
  private summarizer: AISummarizer | null = null;
  private isInitializing = false;

  /**
   * Check if Summarizer API is supported
   */
  static isSupported(): boolean {
    return !!(globalThis as any).ai?.summarizer;
  }

  /**
   * Get available summarizer types
   */
  static async getAvailableTypes(): Promise<string[]> {
    if (!this.isSupported()) return [];

    try {
      const capabilities = await (globalThis as any).ai.summarizer.capabilities();
      return capabilities.availableTypes || [];
    } catch (error) {
      console.warn('Failed to get summarizer capabilities:', error);
      return ['tl;dr', 'key-points', 'teaser', 'headline']; // Fallback
    }
  }

  /**
   * Initialize the summarizer with options
   */
  async initialize(options: SummarizerOptions = {}): Promise<void> {
    if (this.isInitializing) {
      throw new Error('Summarizer is already initializing');
    }

    if (!AISummarizer.isSupported()) {
      throw new Error('Summarizer API is not supported in this browser');
    }

    this.isInitializing = true;

    try {
      // Get user settings for summarizer preferences
      const settings = await settingsRepository.getGlobalSettings();
      const aiSettings = settings.ai;

      const summarizerOptions = {
        type: options.type || aiSettings.summaryStyle || 'key-points',
        format: options.format || 'markdown',
        length: options.length || aiSettings.summaryLength || 'medium',
        sharedContext: options.sharedContext,
      };

      this.summarizer = await (globalThis as any).ai.summarizer.create(summarizerOptions);

      console.log('Summarizer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize summarizer:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Summarize text content
   */
  async summarize(
    text: string,
    options: SummarizerOptions = {}
  ): Promise<SummarizerResult> {
    if (!this.summarizer) {
      throw new Error('Summarizer not initialized. Call initialize() first.');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text content is required for summarization');
    }

    const startTime = Date.now();

    try {
      // Update options if provided
      if (Object.keys(options).length > 0) {
        await this.updateOptions(options);
      }

      // Perform summarization
      const summaryText = await this.summarizer.summarize(text);

      const processingTime = Date.now() - startTime;

      // Extract metadata
      const metadata = this.extractMetadata(text, summaryText);

      const result: SummarizerResult = {
        summary: summaryText,
        type: (this.summarizer as any).type || 'key-points',
        format: (this.summarizer as any).format || 'markdown',
        length: (this.summarizer as any).length || 'medium',
        processingTime,
        confidence: this.estimateConfidence(text, summaryText),
        metadata,
      };

      console.log(`Summarization completed in ${processingTime}ms`);
      return result;
    } catch (error) {
      console.error('Summarization failed:', error);
      throw new Error(`Summarization failed: ${error}`);
    }
  }

  /**
   * Summarize meeting transcript
   */
  async summarizeMeeting(
    meetingId: string,
    transcript: string,
    context?: string
  ): Promise<SummarizerResult> {
    // Add meeting context for better summarization
    const meetingContext = context || `This is a transcript from a meeting with ID: ${meetingId}. Please provide a structured summary highlighting key discussion points, decisions made, and action items.`;

    const options: SummarizerOptions = {
      type: 'key-points',
      format: 'markdown',
      length: 'medium',
      sharedContext: meetingContext,
    };

    return await this.summarize(transcript, options);
  }

  /**
   * Update summarizer options
   */
  async updateOptions(options: SummarizerOptions): Promise<void> {
    if (!this.summarizer) {
      throw new Error('Summarizer not initialized');
    }

    try {
      // Some options might require recreating the summarizer
      const needsRecreation = options.type || options.format;

      if (needsRecreation) {
        await this.destroy();
        await this.initialize(options);
      } else {
        // Update mutable options
        if (options.length) {
          (this.summarizer as any).length = options.length;
        }
        if (options.sharedContext) {
          (this.summarizer as any).sharedContext = options.sharedContext;
        }
      }
    } catch (error) {
      console.error('Failed to update summarizer options:', error);
      throw error;
    }
  }

  /**
   * Get current summarizer capabilities
   */
  async getCapabilities(): Promise<any> {
    if (!AISummarizer.isSupported()) {
      return { supported: false };
    }

    try {
      const capabilities = await (globalThis as any).ai.summarizer.capabilities();
      return {
        supported: true,
        ...capabilities,
      };
    } catch (error) {
      console.warn('Failed to get summarizer capabilities:', error);
      return { supported: false, error: error };
    }
  }

  /**
   * Extract metadata from text and summary
   */
  private extractMetadata(text: string, summaryText: string): SummarizerResult['metadata'] {
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).length;

    // Extract key points if summary is in key-points format
    let keyPoints: string[] | undefined;
    if (summaryText.includes('- ') || summaryText.includes('* ')) {
      keyPoints = summaryText
        .split('\n')
        .filter((line: string) => line.trim().startsWith('- ') || line.trim().startsWith('* '))
        .map((line: string) => line.trim().substring(2))
        .filter((point: string) => point.length > 0);
    }

    return {
      wordCount,
      sentenceCount,
      keyPoints,
    };
  }

  /**
   * Estimate confidence based on text and summary characteristics
   */
  private estimateConfidence(text: string, summary: string): number {
    // Simple heuristic-based confidence estimation
    let confidence = 0.5; // Base confidence

    // Longer summaries might indicate better processing
    if (summary.length > 100) confidence += 0.2;
    if (summary.length > 500) confidence += 0.1;

    // Structured summaries get higher confidence
    if (summary.includes('\n') || summary.includes('- ')) confidence += 0.2;

    // Very short or long texts might be less reliable
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 50) confidence -= 0.2;
    if (wordCount > 10000) confidence -= 0.1;

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Check if summarizer is ready
   */
  isReady(): boolean {
    return !!this.summarizer && !this.isInitializing;
  }

  /**
   * Destroy the summarizer instance
   */
  async destroy(): Promise<void> {
    if (this.summarizer) {
      try {
        await this.summarizer.destroy?.();
      } catch (error) {
        console.warn('Error destroying summarizer:', error);
      }
      this.summarizer = null;
    }
    this.isInitializing = false;
  }
}

// Singleton instance
export const aiSummarizer = new AISummarizer();