// lib/ai/writer.ts

import { settingsRepository } from '../database';

export interface WriterOptions {
  tone?: 'formal' | 'casual' | 'professional' | 'friendly' | 'academic';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long' | 'auto';
  context?: string;
  sharedContext?: string;
}

export interface WriterResult {
  text: string;
  tone: string;
  format: string;
  length: string;
  processingTime: number;
  wordCount: number;
  suggestions?: string[];
}

export class AIWriter {
  private writer: AIWriter | null = null;
  private isInitializing = false;

  /**
   * Check if Writer API is supported
   */
  static isSupported(): boolean {
    return !!(globalThis as any).ai?.writer;
  }

  /**
   * Get available writing tones
   */
  static async getAvailableTones(): Promise<string[]> {
    if (!this.isSupported()) return [];

    try {
      const capabilities = await (globalThis as any).ai.writer.capabilities();
      return capabilities.availableTones || [];
    } catch (error) {
      console.warn('Failed to get writer capabilities:', error);
      return ['formal', 'casual', 'professional', 'friendly', 'academic'];
    }
  }

  /**
   * Initialize the writer with options
   */
  async initialize(options: WriterOptions = {}): Promise<void> {
    if (this.isInitializing) {
      throw new Error('Writer is already initializing');
    }

    if (!AIWriter.isSupported()) {
      throw new Error('Writer API is not supported in this browser');
    }

    this.isInitializing = true;

    try {
      const writerOptions = {
        tone: options.tone || 'professional',
        format: options.format || 'plain-text',
        length: options.length || 'medium',
        sharedContext: options.sharedContext,
      };

      this.writer = await (globalThis as any).ai.writer.create(writerOptions);

      console.log('Writer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize writer:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Write or rewrite text content
   */
  async write(
    input: string,
    task: 'write' | 'rewrite' | 'proofread' | 'continue' = 'write',
    options: WriterOptions = {}
  ): Promise<WriterResult> {
    if (!this.writer) {
      throw new Error('Writer not initialized. Call initialize() first.');
    }

    if (!input || input.trim().length === 0) {
      throw new Error('Input text is required');
    }

    const startTime = Date.now();

    try {
      // Update options if provided
      if (Object.keys(options).length > 0) {
        await this.updateOptions(options);
      }

      let result: string;

      // Perform the writing task
      switch (task) {
        case 'rewrite':
          result = await (this.writer as any).rewrite?.(input) || await (this.writer as any).write(input);
          break;
        case 'proofread':
          result = await (this.writer as any).rewrite?.(input) || await (this.writer as any).write(input);
          break;
        case 'continue':
          result = await (this.writer as any).write(input + ' [continue]'); // Continue from input
          break;
        case 'write':
        default:
          result = await (this.writer as any).write(input);
          break;
      }

      const processingTime = Date.now() - startTime;
      const wordCount = this.countWords(result);

      const writerResult: WriterResult = {
        text: result,
        tone: (this.writer as any).tone || 'professional',
        format: (this.writer as any).format || 'plain-text',
        length: (this.writer as any).length || 'medium',
        processingTime,
        wordCount,
        suggestions: this.generateSuggestions(result, task),
      };

      console.log(`${task} completed in ${processingTime}ms`);
      return writerResult;
    } catch (error) {
      console.error(`Writing task ${task} failed:`, error);
      throw new Error(`${task} failed: ${error}`);
    }
  }

  /**
   * Proofread meeting transcript
   */
  async proofreadTranscript(
    transcript: string,
    meetingId: string
  ): Promise<WriterResult> {
    const options: WriterOptions = {
      tone: 'professional',
      format: 'plain-text',
      length: 'auto',
      context: `This is a meeting transcript from meeting ${meetingId}. Please proofread and correct any grammatical errors, improve clarity, and ensure professional language while preserving the original meaning and conversational tone.`,
    };

    return await this.write(transcript, 'proofread', options);
  }

  /**
   * Rewrite meeting notes for clarity
   */
  async rewriteMeetingNotes(
    notes: string,
    meetingId: string,
    targetTone: 'formal' | 'casual' | 'professional' = 'professional'
  ): Promise<WriterResult> {
    const options: WriterOptions = {
      tone: targetTone,
      format: 'markdown',
      length: 'medium',
      context: `These are meeting notes from meeting ${meetingId}. Please rewrite them to be clearer, more organized, and in a ${targetTone} tone while preserving all important information.`,
    };

    return await this.write(notes, 'rewrite', options);
  }

  /**
   * Generate action items from meeting content
   */
  async generateActionItems(
    meetingContent: string,
    meetingId: string
  ): Promise<WriterResult> {
    const prompt = `Based on this meeting content, generate a clear list of action items, responsibilities, and next steps:\n\n${meetingContent}`;

    const options: WriterOptions = {
      tone: 'professional',
      format: 'markdown',
      length: 'medium',
      context: `Generate action items from meeting ${meetingId} content. Focus on concrete tasks, responsible parties, and deadlines.`,
    };

    return await this.write(prompt, 'write', options);
  }

  /**
   * Generate meeting minutes
   */
  async generateMeetingMinutes(
    transcript: string,
    summary: string,
    meetingId: string,
    participants: string[]
  ): Promise<WriterResult> {
    const prompt = `Generate professional meeting minutes with the following information:

Meeting ID: ${meetingId}
Participants: ${participants.join(', ')}

Summary: ${summary}

Transcript: ${transcript}

Please format as proper meeting minutes with attendees, key discussion points, decisions made, and action items.`;

    const options: WriterOptions = {
      tone: 'formal',
      format: 'markdown',
      length: 'long',
      context: 'Generate formal meeting minutes following standard business format.',
    };

    return await this.write(prompt, 'write', options);
  }

  /**
   * Update writer options
   */
  async updateOptions(options: WriterOptions): Promise<void> {
    if (!this.writer) {
      throw new Error('Writer not initialized');
    }

    try {
      // Some options might require recreating the writer
      const needsRecreation = options.tone || options.format;

      if (needsRecreation) {
        await this.destroy();
        await this.initialize(options);
      } else {
        // Update mutable options
        if (options.length) {
          (this.writer as any).length = options.length;
        }
        if (options.sharedContext) {
          (this.writer as any).sharedContext = options.sharedContext;
        }
      }
    } catch (error) {
      console.error('Failed to update writer options:', error);
      throw error;
    }
  }

  /**
   * Get current writer capabilities
   */
  async getCapabilities(): Promise<any> {
    if (!AIWriter.isSupported()) {
      return { supported: false };
    }

    try {
      const capabilities = await (globalThis as any).ai.writer.capabilities();
      return {
        supported: true,
        ...capabilities,
      };
    } catch (error) {
      console.warn('Failed to get writer capabilities:', error);
      return { supported: false, error: error };
    }
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Generate suggestions for improvement
   */
  private generateSuggestions(text: string, task: string): string[] {
    const suggestions: string[] = [];

    // Basic heuristics for suggestions
    if (task === 'proofread') {
      if (text.includes('  ')) {
        suggestions.push('Consider removing extra spaces');
      }
      if (text.split('.').length > 10) {
        suggestions.push('Text has many sentences - consider breaking into paragraphs');
      }
    }

    if (task === 'rewrite') {
      if (this.countWords(text) > 500) {
        suggestions.push('Long text - consider splitting into sections');
      }
    }

    return suggestions;
  }

  /**
   * Check if writer is ready
   */
  isReady(): boolean {
    return !!this.writer && !this.isInitializing;
  }

  /**
   * Destroy the writer instance
   */
  async destroy(): Promise<void> {
    if (this.writer) {
      try {
        await this.writer.destroy?.();
      } catch (error) {
        console.warn('Error destroying writer:', error);
      }
      this.writer = null;
    }
    this.isInitializing = false;
  }
}

// Singleton instance
export const aiWriter = new AIWriter();