// lib/settings/index.ts

// Core settings components
export { settingsStorage, SettingsStorage } from './storage';
export { settingsManager, SettingsManager } from './manager';
export { DEFAULT_SETTINGS, mergeWithDefaults, validateSettings, getSettingsSchema } from './defaults';

// Types
export type {
  SettingsRecord,
} from '../database/schemas';

export type {
  StorageOptions,
} from './storage';

export type {
  SettingsUpdate,
  SettingsValidationResult,
} from './manager';

// Main Settings System class for easy integration
export class SettingsSystem {
  constructor() {
    // Initialize settings system
    this.initialize();
  }

  /**
   * Initialize settings system
   */
  private async initialize(): Promise<void> {
    try {
      // Load settings to ensure they're available
      await settingsManager.getAll();
      console.log('Settings system initialized');
    } catch (error) {
      console.warn('Settings system initialization failed:', error);
    }
  }

  /**
   * Get all settings
   */
  async getAll(): Promise<any> {
    return await settingsManager.getAll();
  }

  /**
   * Get settings category
   */
  async getCategory(category: string): Promise<any> {
    return await settingsManager.getCategory(category as any);
  }

  /**
   * Update a setting
   */
  async update(category: string, key: string, value: any, validate = true): Promise<void> {
    return await settingsManager.update({
      category: category as any,
      key,
      value,
      validate,
    });
  }

  /**
   * Update multiple settings
   */
  async updateBatch(updates: Array<{ category: string; key: string; value: any }>): Promise<void> {
    const batchUpdates = updates.map(update => ({
      category: update.category as any,
      key: update.key,
      value: update.value,
      validate: true,
    }));

    return await settingsManager.updateBatch(batchUpdates);
  }

  /**
   * Reset category to defaults
   */
  async resetCategory(category: string): Promise<void> {
    return await settingsManager.resetCategory(category as any);
  }

  /**
   * Reset all settings
   */
  async resetAll(): Promise<void> {
    return await settingsManager.resetAll();
  }

  /**
   * Subscribe to settings changes
   */
  onChange(callback: (settings: any) => void): () => void {
    return settingsManager.onChange(callback);
  }

  /**
   * Subscribe to category changes
   */
  onCategoryChange(category: string, callback: (value: any) => void): () => void {
    return settingsManager.onCategoryChange(category as any, callback);
  }

  /**
   * Export settings
   */
  async export(): Promise<string> {
    return await settingsManager.export();
  }

  /**
   * Import settings
   */
  async import(settingsJson: string, merge = false): Promise<void> {
    return await settingsManager.import(settingsJson, merge);
  }

  /**
   * Get settings statistics
   */
  async getStats(): Promise<any> {
    return await settingsManager.getStats();
  }

  /**
   * Validate settings update
   */
  async validateUpdate(category: string, key: string, value: any): Promise<any> {
    const categorySettings = await this.getCategory(category);
    const updatedCategory = { ...categorySettings, [key]: value };

    return await settingsManager.validateCategoryUpdate(category as any, updatedCategory);
  }

  // Convenience methods for common settings

  /**
   * Get transcription settings
   */
  async getTranscriptionSettings(): Promise<any> {
    return await this.getCategory('transcription');
  }

  /**
   * Update transcription language
   */
  async setTranscriptionLanguage(language: string): Promise<void> {
    return await this.update('transcription', 'language', language);
  }

  /**
   * Get AI settings
   */
  async getAISettings(): Promise<any> {
    return await this.getCategory('ai');
  }

  /**
   * Update AI summarizer settings
   */
  async setSummarizerSettings(settings: any): Promise<void> {
    return await this.update('ai', 'summarizer', settings);
  }

  /**
   * Get privacy settings
   */
  async getPrivacySettings(): Promise<any> {
    return await this.getCategory('privacy');
  }

  /**
   * Update data retention
   */
  async setDataRetention(days: number): Promise<void> {
    return await this.update('privacy', 'dataRetentionDays', days);
  }

  /**
   * Get UI settings
   */
  async getUISettings(): Promise<any> {
    return await this.getCategory('ui');
  }

  /**
   * Update theme
   */
  async setTheme(theme: string): Promise<void> {
    return await this.update('ui', 'theme', theme);
  }

  /**
   * Get export settings
   */
  async getExportSettings(): Promise<any> {
    return await this.getCategory('export');
  }

  /**
   * Update default export format
   */
  async setDefaultExportFormat(format: string): Promise<void> {
    return await this.update('export', 'defaultFormat', format);
  }

  /**
   * Get sync settings
   */
  async getSyncSettings(): Promise<any> {
    return await this.getCategory('sync');
  }

  /**
   * Enable/disable Chrome storage sync
   */
  async setChromeStorageSync(enabled: boolean): Promise<void> {
    return await this.update('sync', 'chromeStorage', { syncEnabled: enabled });
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<any> {
    return await this.getCategory('notifications');
  }

  /**
   * Update notification preferences
   */
  async setNotificationSettings(settings: any): Promise<void> {
    return await this.update('notifications', 'browser', settings.browser);
    return await this.update('notifications', 'sound', settings.sound);
  }
}

// Singleton instance
export const settingsSystem = new SettingsSystem();