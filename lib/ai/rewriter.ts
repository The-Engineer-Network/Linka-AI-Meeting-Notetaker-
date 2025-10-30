// lib/ai/rewriter.ts

import { settingsRepository } from '../database';

export interface RewriterOptions {
  tone?: 'as-is' | 'more-formal' | 'more-casual' | 'more-professional' | 'more-friendly';
  format?: 'as-is' | 'plain-text' | 'markdown';
  length?: 'as-is' | 'shorter' | 'longer';
  context?: string;
  sharedContext?: string;
}

export interface RewriterResult {
  text: string;
  originalTone: string;
  newTone: string;
  format: string;
  length: string;
  processingTime: number;
  wordCount: number;
  changes: string[];
}

export class AIRewriter {
  private rewriter: AIRewriter | null = null;
  private isInitializing = false;

  /**
   * Check if Rewriter API is supported
   */
  static isSupported(): boolean {
    return !!(globalThis as any).ai?.rewriter;
  }

  /**
   * Get available rewriting tones
   */
  static async getAvailableTones(): Promise<string[]> {
    if (!this.isSupported()) return [];

    try {
      const capabilities = await (globalThis as any).ai.rewriter.capabilities();
      return capabilities.availableTones || [];
    } catch (error) {
      console.warn('Failed to get rewriter capabilities:', error);
      return ['as-is', 'more-formal', 'more-casual', 'more-professional', 'more-friendly'];
    }
  }

  /**
   * Initialize the rewriter with options
   */
  async initialize(options: RewriterOptions = {}): Promise<void> {
    if (this.isInitializing) {
      throw new Error('Rewriter is already initializing');
    }

    if (!AIRewriter.isSupported()) {
      throw new Error('Rewriter API is not supported in this browser');
    }

    this.isInitializing = true;

    try {
      const rewriterOptions = {
        tone: options.tone || 'as-is',
        format: options.format || 'as-is',
        length: options.length || 'as-is',
        sharedContext: options.sharedContext,
      };

      this.rewriter = await (globalThis as any).ai.rewriter.create(rewriterOptions);

      console.log('Rewriter initialized successfully');
    } catch (error) {
      console.error('Failed to initialize rewriter:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Rewrite text content
   */
  async rewrite(
    text: string,
    options: RewriterOptions = {}
  ): Promise<RewriterResult> {
    if (!this.rewriter) {
      throw new Error('Rewriter not initialized. Call initialize() first.');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text content is required for rewriting');
    }

    const startTime = Date.now();
    const originalWordCount = this.countWords(text);

    try {
      // Update options if provided
      if (Object.keys(options).length > 0) {
        await this.updateOptions(options);
      }

      // Perform rewriting
      const rewrittenTextString = await this.rewriter.rewrite(text);

      const processingTime = Date.now() - startTime;
      const newWordCount = this.countWords(rewrittenTextString);
      const changes = this.analyzeChanges(text, rewrittenTextString);

      const result: RewriterResult = {
        text: rewrittenTextString,
        originalTone: this.detectTone(text),
        newTone: (this.rewriter as any).tone || 'as-is',
        format: (this.rewriter as any).format || 'as-is',
        length: (this.rewriter as any).length || 'as-is',
        processingTime,
        wordCount: newWordCount,
        changes,
      };

      console.log(`Rewriting completed in ${processingTime}ms`);
      return result;
    } catch (error) {
      console.error('Rewriting failed:', error);
      throw new Error(`Rewriting failed: ${error}`);
    }
  }

  /**
   * Rewrite meeting transcript for clarity
   */
  async rewriteTranscript(
    transcript: string,
    meetingId: string,
    targetTone: 'more-professional' | 'more-formal' | 'as-is' = 'more-professional'
  ): Promise<RewriterResult> {
    const options: RewriterOptions = {
      tone: targetTone,
      format: 'plain-text',
      length: 'as-is',
      context: `This is a meeting transcript from meeting ${meetingId}. Please rewrite it to be clearer and more professional while preserving the original meaning and key information.`,
    };

    return await this.rewrite(transcript, options);
  }

  /**
   * Improve meeting summary
   */
  async improveSummary(
    summary: string,
    meetingId: string
  ): Promise<RewriterResult> {
    const options: RewriterOptions = {
      tone: 'more-professional',
      format: 'markdown',
      length: 'as-is',
      context: `This is a meeting summary from meeting ${meetingId}. Please improve the clarity, structure, and professionalism while keeping all important information.`,
    };

    return await this.rewrite(summary, options);
  }

  /**
   * Make text more concise
   */
  async makeConcise(
    text: string,
    meetingId?: string
  ): Promise<RewriterResult> {
    const context = meetingId
      ? `This is content from meeting ${meetingId}. Make it more concise while preserving all key information.`
      : 'Make this text more concise while preserving all key information.';

    const options: RewriterOptions = {
      tone: 'as-is',
      format: 'as-is',
      length: 'shorter',
      context,
    };

    return await this.rewrite(text, options);
  }

  /**
   * Expand text with more details
   */
  async expandText(
    text: string,
    meetingId?: string
  ): Promise<RewriterResult> {
    const context = meetingId
      ? `This is content from meeting ${meetingId}. Expand it with more details and explanations while staying relevant.`
      : 'Expand this text with more details and explanations while staying relevant.';

    const options: RewriterOptions = {
      tone: 'as-is',
      format: 'as-is',
      length: 'longer',
      context,
    };

    return await this.rewrite(text, options);
  }

  /**
   * Update rewriter options
   */
  async updateOptions(options: RewriterOptions): Promise<void> {
    if (!this.rewriter) {
      throw new Error('Rewriter not initialized');
    }

    try {
      // Some options might require recreating the rewriter
      const needsRecreation = options.tone || options.format || options.length;

      if (needsRecreation) {
        await this.destroy();
        await this.initialize(options);
      } else {
        // Update mutable options
        if (options.sharedContext) {
          (this.rewriter as any).sharedContext = options.sharedContext;
        }
      }
    } catch (error) {
      console.error('Failed to update rewriter options:', error);
      throw error;
    }
  }

  /**
   * Get current rewriter capabilities
   */
  async getCapabilities(): Promise<any> {
    if (!AIRewriter.isSupported()) {
      return { supported: false };
    }

    try {
      const capabilities = await (globalThis as any).ai.rewriter.capabilities();
      return {
        supported: true,
        ...capabilities,
      };
    } catch (error) {
      console.warn('Failed to get rewriter capabilities:', error);
      return { supported: false, error: error };
    }
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    if (typeof text !== 'string') {
      console.warn('countWords received non-string input:', text);
      return 0;
    }
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Detect the tone of text (simple heuristic)
   */
  private detectTone(text: string): string {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('dear') || lowerText.includes('sincerely') || lowerText.includes('regards')) {
      return 'formal';
    }
    if (lowerText.includes('hey') || lowerText.includes('thanks') || lowerText.includes('great')) {
      return 'casual';
    }
    if (lowerText.includes('meeting') || lowerText.includes('agenda') || lowerText.includes('minutes')) {
      return 'professional';
    }

    return 'neutral';
  }

  /**
   * Analyze changes made during rewriting
   */
  private analyzeChanges(original: string, rewritten: string): string[] {
    const changes: string[] = [];

    const originalWords = this.countWords(original);
    const rewrittenWords = this.countWords(rewritten);

    if (rewrittenWords < originalWords * 0.8) {
      changes.push('Made more concise');
    } else if (rewrittenWords > originalWords * 1.2) {
      changes.push('Added more details');
    }

    // Check for structural changes
    if (rewritten.includes('\n') && !original.includes('\n')) {
      changes.push('Added structure/formatting');
    }

    // Check for tone changes (simple heuristics)
    const originalTone = this.detectTone(original);
    const rewrittenTone = this.detectTone(rewritten);

    if (originalTone !== rewrittenTone) {
      changes.push(`Changed tone from ${originalTone} to ${rewrittenTone}`);
    }

    if (changes.length === 0) {
      changes.push('Minor improvements and refinements');
    }

    return changes;
  }

  /**
   * Check if rewriter is ready
   */
  isReady(): boolean {
    return !!this.rewriter && !this.isInitializing;
  }

  /**
   * Destroy the rewriter instance
   */
  async destroy(): Promise<void> {
    if (this.rewriter) {
      try {
        await this.rewriter.destroy?.();
      } catch (error) {
        console.warn('Error destroying rewriter:', error);
      }
      this.rewriter = null;
    }
    this.isInitializing = false;
  }
}

// Singleton instance
export const aiRewriter = new AIRewriter();