// lib/settings/manager.ts

import { SettingsRecord } from '../database/schemas';
import { settingsStorage } from './storage';
import { DEFAULT_SETTINGS, mergeWithDefaults, validateSettings } from './defaults';

export interface SettingsUpdate {
  category: keyof SettingsRecord;
  key: string;
  value: any;
  validate?: boolean;
}

export interface SettingsValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class SettingsManager {
  private listeners: Set<(settings: SettingsRecord) => void> = new Set();
  private categoryListeners: Map<keyof SettingsRecord, Set<(value: any) => void>> = new Map();

  constructor() {
    // Setup Chrome storage listener for cross-device sync
    settingsStorage.setupChromeStorageListener((changes) => {
      this.notifyListeners(changes);
    });
  }

  /**
   * Get all settings
   */
  async getAll(): Promise<SettingsRecord> {
    return await settingsStorage.load();
  }

  /**
   * Get settings for a specific category
   */
  async getCategory<K extends keyof SettingsRecord>(category: K): Promise<SettingsRecord[K]> {
    return await settingsStorage.getCategory(category);
  }

  /**
   * Update a specific setting
   */
  async update(update: SettingsUpdate): Promise<void> {
    const { category, key, value, validate = true } = update;

    // Get current settings
    const currentSettings = await this.getAll();
    const categorySettings = currentSettings[category];

    if (!categorySettings || typeof categorySettings !== 'object') {
      throw new Error(`Invalid category: ${category}`);
    }

    // Create updated category
    const updatedCategory = { ...categorySettings, [key]: value };

    // Validate if requested
    if (validate) {
      const validation = await this.validateCategoryUpdate(category, updatedCategory);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Update the category
    await settingsStorage.updateCategory(category, updatedCategory);

    // Notify listeners
    const updatedSettings = await this.getAll();
    this.notifyListeners(updatedSettings);
    this.notifyCategoryListeners(category, updatedCategory);
  }

  /**
   * Update multiple settings at once
   */
  async updateBatch(updates: SettingsUpdate[]): Promise<void> {
    const currentSettings = await this.getAll();
    let updatedSettings = { ...currentSettings };

    // Apply all updates
    for (const update of updates) {
      const { category, key, value, validate = true } = update;
      const categorySettings = updatedSettings[category];

      if (!categorySettings || typeof categorySettings !== 'object') {
        throw new Error(`Invalid category: ${category}`);
      }

      const updatedCategory = { ...categorySettings, [key]: value };

      // Validate if requested
      if (validate) {
        const validation = await this.validateCategoryUpdate(category, updatedCategory);
        if (!validation.valid) {
          throw new Error(`Validation failed for ${category}.${key}: ${validation.errors.join(', ')}`);
        }
      }

      updatedSettings[category] = updatedCategory as any;
    }

    // Save all updates
    await settingsStorage.save(updatedSettings);

    // Notify listeners
    this.notifyListeners(updatedSettings);

    // Notify category listeners
    const notifiedCategories = new Set<keyof SettingsRecord>();
    for (const update of updates) {
      if (!notifiedCategories.has(update.category)) {
        this.notifyCategoryListeners(update.category, updatedSettings[update.category]);
        notifiedCategories.add(update.category);
      }
    }
  }

  /**
   * Reset category to defaults
   */
  async resetCategory(category: keyof SettingsRecord): Promise<void> {
    const defaultCategory = DEFAULT_SETTINGS[category];
    await settingsStorage.updateCategory(category, defaultCategory);

    const updatedSettings = await this.getAll();
    this.notifyListeners(updatedSettings);
    this.notifyCategoryListeners(category, defaultCategory);
  }

  /**
   * Reset all settings to defaults
   */
  async resetAll(): Promise<void> {
    await settingsStorage.resetToDefaults();
    const defaultSettings = await this.getAll();
    this.notifyListeners(defaultSettings);
  }

  /**
   * Validate a category update
   */
  async validateCategoryUpdate(
    category: keyof SettingsRecord,
    value: any
  ): Promise<SettingsValidationResult> {
    const result: SettingsValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // Get current settings for context
    const currentSettings = await this.getAll();

    // Category-specific validation
    switch (category) {
      case 'transcription':
        result.errors.push(...this.validateTranscriptionSettings(value));
        break;
      case 'ai':
        result.errors.push(...this.validateAISettings(value));
        break;
      case 'privacy':
        result.errors.push(...this.validatePrivacySettings(value));
        break;
      case 'ui':
        result.errors.push(...this.validateUISettings(value));
        break;
      case 'sync':
        result.errors.push(...this.validateSyncSettings(value));
        break;
      case 'audio':
        result.errors.push(...this.validateAudioSettings(value));
        break;
    }

    // Cross-category validation
    result.errors.push(...await this.validateCrossCategory(currentSettings, category, value));

    result.valid = result.errors.length === 0;
    return result;
  }

  /**
   * Subscribe to all settings changes
   */
  onChange(callback: (settings: SettingsRecord) => void): () => void {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Subscribe to category-specific changes
   */
  onCategoryChange<K extends keyof SettingsRecord>(
    category: K,
    callback: (value: SettingsRecord[K]) => void
  ): () => void {
    if (!this.categoryListeners.has(category)) {
      this.categoryListeners.set(category, new Set());
    }

    this.categoryListeners.get(category)!.add(callback as any);

    // Return unsubscribe function
    return () => {
      const listeners = this.categoryListeners.get(category);
      if (listeners) {
        listeners.delete(callback as any);
        if (listeners.size === 0) {
          this.categoryListeners.delete(category);
        }
      }
    };
  }

  /**
   * Export settings for backup
   */
  async export(): Promise<string> {
    return await settingsStorage.exportSettings();
  }

  /**
   * Import settings from backup
   */
  async import(settingsJson: string, merge: boolean = false): Promise<void> {
    await settingsStorage.importSettings(settingsJson, merge);
    const updatedSettings = await this.getAll();
    this.notifyListeners(updatedSettings);
  }

  /**
   * Get settings statistics
   */
  async getStats(): Promise<any> {
    return await settingsStorage.getStorageStats();
  }

  // Private validation methods

  private validateTranscriptionSettings(settings: any): string[] {
    const errors: string[] = [];

    if (settings.language && !/^[a-z]{2}-[A-Z]{2}$/.test(settings.language)) {
      errors.push('Language must be in format: xx-XX (e.g., en-US)');
    }

    if (settings.sampleRate && (settings.sampleRate < 8000 || settings.sampleRate > 96000)) {
      errors.push('Sample rate must be between 8000 and 96000 Hz');
    }

    if (settings.maxAlternatives && (settings.maxAlternatives < 1 || settings.maxAlternatives > 10)) {
      errors.push('Max alternatives must be between 1 and 10');
    }

    return errors;
  }

  private validateAISettings(settings: any): string[] {
    const errors: string[] = [];

    if (settings.summarizer?.type && !['key-points', 'tl;dr', 'teaser', 'headline'].includes(settings.summarizer.type)) {
      errors.push('Invalid summarizer type');
    }

    if (settings.summarizer?.length && !['short', 'medium', 'long'].includes(settings.summarizer.length)) {
      errors.push('Invalid summarizer length');
    }

    if (settings.translator?.targetLanguages) {
      const invalidLanguages = settings.translator.targetLanguages.filter(
        (lang: string) => !/^[a-z]{2}$/.test(lang)
      );
      if (invalidLanguages.length > 0) {
        errors.push(`Invalid language codes: ${invalidLanguages.join(', ')}`);
      }
    }

    return errors;
  }

  private validatePrivacySettings(settings: any): string[] {
    const errors: string[] = [];

    if (settings.dataRetentionDays && settings.dataRetentionDays < 1) {
      errors.push('Data retention days must be at least 1');
    }

    return errors;
  }

  private validateUISettings(settings: any): string[] {
    const errors: string[] = [];

    if (settings.theme && !['auto', 'light', 'dark'].includes(settings.theme)) {
      errors.push('Theme must be auto, light, or dark');
    }

    if (settings.dateFormat && !['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].includes(settings.dateFormat)) {
      errors.push('Invalid date format');
    }

    return errors;
  }

  private validateSyncSettings(settings: any): string[] {
    const errors: string[] = [];

    if (settings.chromeStorage?.syncInterval && settings.chromeStorage.syncInterval < 1) {
      errors.push('Sync interval must be at least 1 minute');
    }

    if (settings.chromeStorage?.maxStorageSize && settings.chromeStorage.maxStorageSize > 100) {
      errors.push('Max storage size cannot exceed 100MB');
    }

    return errors;
  }

  private validateAudioSettings(settings: any): string[] {
    const errors: string[] = [];

    if (settings.sampleRate && (settings.sampleRate < 8000 || settings.sampleRate > 96000)) {
      errors.push('Audio sample rate must be between 8000 and 96000 Hz');
    }

    if (settings.channels && ![1, 2].includes(settings.channels)) {
      errors.push('Audio channels must be 1 (mono) or 2 (stereo)');
    }

    return errors;
  }

  private async validateCrossCategory(
    currentSettings: SettingsRecord,
    category: keyof SettingsRecord,
    value: any
  ): Promise<string[]> {
    const errors: string[] = [];

    // Example: Check if AI features are enabled when transcription is disabled
    if (category === 'transcription' && !value.continuous && currentSettings.ai.summarizer.enabled) {
      errors.push('Cannot disable continuous transcription when AI summarizer is enabled');
    }

    // Example: Check storage limits
    if (category === 'sync' && value.chromeStorage?.maxStorageSize) {
      const currentUsage = await settingsStorage.getStorageStats();
      if (currentUsage.chromeStorage.size > value.chromeStorage.maxStorageSize * 1024 * 1024) {
        errors.push('Current Chrome storage usage exceeds new limit');
      }
    }

    return errors;
  }

  private notifyListeners(settings: SettingsRecord): void {
    this.listeners.forEach(callback => {
      try {
        callback(settings);
      } catch (error) {
        console.warn('Settings change callback error:', error);
      }
    });
  }

  private notifyCategoryListeners(category: keyof SettingsRecord, value: any): void {
    const listeners = this.categoryListeners.get(category);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.warn('Category settings change callback error:', error);
        }
      });
    }
  }
}

// Singleton instance
export const settingsManager = new SettingsManager();