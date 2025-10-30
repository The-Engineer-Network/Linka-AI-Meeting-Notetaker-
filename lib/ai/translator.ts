// lib/ai/translator.ts

import { settingsRepository } from '../database';

export interface TranslatorOptions {
  sourceLanguage?: string;
  targetLanguage?: string;
  format?: 'plain-text' | 'html';
  context?: string;
}

export interface TranslatorResult {
  translation: string;
  sourceLanguage: string;
  targetLanguage: string;
  format: string;
  processingTime: number;
  confidence?: number;
  detectedSourceLanguage?: string;
}

export class AITranslator {
  private translator: AITranslator | null = null;
  private isInitializing = false;

  /**
   * Check if Translator API is supported
   */
  static isSupported(): boolean {
    return !!(globalThis as any).ai?.translator;
  }

  /**
   * Get available language pairs
   */
  static async getAvailableLanguages(): Promise<{
    sourceLanguages: string[];
    targetLanguages: string[];
    languagePairs: Array<{ source: string; target: string }>;
  }> {
    if (!this.isSupported()) {
      return {
        sourceLanguages: [],
        targetLanguages: [],
        languagePairs: [],
      };
    }

    try {
      const capabilities = await (globalThis as any).ai.translator.capabilities();
      return {
        sourceLanguages: capabilities.sourceLanguages || [],
        targetLanguages: capabilities.targetLanguages || [],
        languagePairs: capabilities.languagePairs || [],
      };
    } catch (error) {
      console.warn('Failed to get translator capabilities:', error);
      // Return common language codes as fallback
      return {
        sourceLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
        targetLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
        languagePairs: [],
      };
    }
  }

  /**
   * Check if a specific language pair is supported
   */
  static async canTranslate(
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const capabilities = await (globalThis as any).ai.translator.capabilities();
      const languagePairs = capabilities.languagePairs || [];

      return languagePairs.some((pair: any) =>
        pair.source === sourceLanguage && pair.target === targetLanguage
      );
    } catch (error) {
      console.warn('Failed to check translation capability:', error);
      return false;
    }
  }

  /**
   * Initialize the translator with options
   */
  async initialize(options: TranslatorOptions = {}): Promise<void> {
    if (this.isInitializing) {
      throw new Error('Translator is already initializing');
    }

    if (!AITranslator.isSupported()) {
      throw new Error('Translator API is not supported in this browser');
    }

    this.isInitializing = true;

    try {
      const translatorOptions = {
        sourceLanguage: options.sourceLanguage || 'en',
        targetLanguage: options.targetLanguage || 'es',
        format: options.format || 'plain-text',
      };

      // Check if the language pair is supported
      const canTranslate = await AITranslator.canTranslate(
        translatorOptions.sourceLanguage,
        translatorOptions.targetLanguage
      );

      if (!canTranslate) {
        throw new Error(
          `Translation from ${translatorOptions.sourceLanguage} to ${translatorOptions.targetLanguage} is not supported`
        );
      }

      this.translator = await (globalThis as any).ai.translator.create(translatorOptions);

      console.log('Translator initialized successfully');
    } catch (error) {
      console.error('Failed to initialize translator:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Translate text content
   */
  async translate(
    text: string,
    options: TranslatorOptions = {}
  ): Promise<TranslatorResult> {
    if (!this.translator) {
      throw new Error('Translator not initialized. Call initialize() first.');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text content is required for translation');
    }

    const startTime = Date.now();

    try {
      // Update options if provided
      if (Object.keys(options).length > 0) {
        await this.updateOptions(options);
      }

      // Perform translation
      const translationText = await this.translator.translate(text);

      const processingTime = Date.now() - startTime;

      const result: TranslatorResult = {
        translation: translationText,
        sourceLanguage: (this.translator as any).sourceLanguage || 'en',
        targetLanguage: (this.translator as any).targetLanguage || 'es',
        format: (this.translator as any).format || 'plain-text',
        processingTime,
        confidence: this.estimateConfidence(text, translationText),
        detectedSourceLanguage: await this.detectLanguage(text) || undefined,
      };

      console.log(`Translation completed in ${processingTime}ms`);
      return result;
    } catch (error) {
      console.error('Translation failed:', error);
      throw new Error(`Translation failed: ${error}`);
    }
  }

  /**
   * Translate meeting transcript
   */
  async translateMeeting(
    meetingId: string,
    transcript: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslatorResult> {
    const options: TranslatorOptions = {
      sourceLanguage: sourceLanguage || 'en',
      targetLanguage,
      format: 'plain-text',
      context: `This is a meeting transcript from meeting ${meetingId}. Translate it naturally while preserving the conversational tone and technical terms.`,
    };

    return await this.translate(transcript, options);
  }

  /**
   * Translate summary or key points
   */
  async translateSummary(
    summary: string,
    targetLanguage: string,
    sourceLanguage: string = 'en'
  ): Promise<TranslatorResult> {
    const options: TranslatorOptions = {
      sourceLanguage,
      targetLanguage,
      format: 'plain-text',
      context: 'This is a meeting summary. Translate it clearly and professionally.',
    };

    return await this.translate(summary, options);
  }

  /**
   * Detect the language of text
   */
  async detectLanguage(text: string): Promise<string | null> {
    // Note: Chrome Translator API doesn't currently expose language detection
    // This is a placeholder for when it becomes available
    // For now, we'll use a simple heuristic or return null

    if (!text || text.trim().length < 10) {
      return null;
    }

    // Very basic language detection heuristics
    const lowerText = text.toLowerCase();

    if (lowerText.includes('the ') && lowerText.includes(' and ') && lowerText.includes(' is ')) {
      return 'en';
    }
    if (lowerText.includes(' el ') || lowerText.includes(' la ') || lowerText.includes(' es ')) {
      return 'es';
    }
    if (lowerText.includes(' le ') || lowerText.includes(' la ') || lowerText.includes(' est ')) {
      return 'fr';
    }
    if (lowerText.includes(' der ') || lowerText.includes(' die ') || lowerText.includes(' ist ')) {
      return 'de';
    }

    return null; // Unknown or unsupported language
  }

  /**
   * Update translator options
   */
  async updateOptions(options: TranslatorOptions): Promise<void> {
    if (!this.translator) {
      throw new Error('Translator not initialized');
    }

    try {
      // Check if language pair needs to be changed
      const needsRecreation = options.sourceLanguage || options.targetLanguage;

      if (needsRecreation) {
        const newOptions = {
          sourceLanguage: options.sourceLanguage || (this.translator as any).sourceLanguage,
          targetLanguage: options.targetLanguage || (this.translator as any).targetLanguage,
          format: options.format || (this.translator as any).format,
        };

        await this.destroy();
        await this.initialize(newOptions);
      } else {
        // Update mutable options
        if (options.format) {
          (this.translator as any).format = options.format;
        }
      }
    } catch (error) {
      console.error('Failed to update translator options:', error);
      throw error;
    }
  }

  /**
   * Get current translator capabilities
   */
  async getCapabilities(): Promise<any> {
    if (!AITranslator.isSupported()) {
      return { supported: false };
    }

    try {
      const capabilities = await (globalThis as any).ai.translator.capabilities();
      return {
        supported: true,
        ...capabilities,
      };
    } catch (error) {
      console.warn('Failed to get translator capabilities:', error);
      return { supported: false, error: error };
    }
  }

  /**
   * Estimate confidence based on text characteristics
   */
  private estimateConfidence(text: string, translationText: string): number {
    // Simple heuristic-based confidence estimation
    let confidence = 0.7; // Base confidence for translations

    // Longer texts tend to have better translation quality
    if (text.length > 100) confidence += 0.1;
    if (text.length > 1000) confidence += 0.1;

    // Very short texts might be less reliable
    if (text.length < 20) confidence -= 0.2;

    // Well-formed translations get higher confidence
    if (translationText.length > 0 && translationText.length <= text.length * 2) {
      confidence += 0.1;
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Check if translator is ready
   */
  isReady(): boolean {
    return !!this.translator && !this.isInitializing;
  }

  /**
   * Destroy the translator instance
   */
  async destroy(): Promise<void> {
    if (this.translator) {
      try {
        await this.translator.destroy?.();
      } catch (error) {
        console.warn('Error destroying translator:', error);
      }
      this.translator = null;
    }
    this.isInitializing = false;
  }
}

// Singleton instance
export const aiTranslator = new AITranslator();