// lib/database/repositories/settings.ts

import { SettingsRecord, DEFAULT_SETTINGS } from '../schemas';
import { dbUtils } from '../indexeddb';
import { STORES } from '../schemas';

export class SettingsRepository {
  private readonly GLOBAL_SETTINGS_ID = 'global';

  /**
   * Get global settings
   */
  async getGlobalSettings(): Promise<SettingsRecord> {
    let settings = await dbUtils.getByKey<SettingsRecord>(STORES.SETTINGS, this.GLOBAL_SETTINGS_ID);

    if (!settings) {
      // Initialize with defaults
      settings = {
        id: this.GLOBAL_SETTINGS_ID,
        ...DEFAULT_SETTINGS,
        updatedAt: new Date(),
      };
      await dbUtils.put(STORES.SETTINGS, settings);
    }

    return settings;
  }

  /**
   * Update global settings
   */
  async updateGlobalSettings(updates: Partial<Omit<SettingsRecord, 'id' | 'updatedAt'>>): Promise<SettingsRecord> {
    const currentSettings = await this.getGlobalSettings();

    const updatedSettings: SettingsRecord = {
      ...currentSettings,
      ...updates,
      updatedAt: new Date(),
    };

    await dbUtils.put(STORES.SETTINGS, updatedSettings);
    return updatedSettings;
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(): Promise<SettingsRecord> {
    const defaultSettings: SettingsRecord = {
      id: this.GLOBAL_SETTINGS_ID,
      ...DEFAULT_SETTINGS,
      updatedAt: new Date(),
    };

    await dbUtils.put(STORES.SETTINGS, defaultSettings);
    return defaultSettings;
  }

  /**
   * Update transcription settings
   */
  async updateTranscriptionSettings(settings: Partial<SettingsRecord['transcription']>): Promise<SettingsRecord> {
    const currentSettings = await this.getGlobalSettings();

    return await this.updateGlobalSettings({
      transcription: {
        ...currentSettings.transcription,
        ...settings,
      },
    });
  }

  /**
   * Update AI settings
   */
  async updateAISettings(settings: Partial<SettingsRecord['ai']>): Promise<SettingsRecord> {
    const currentSettings = await this.getGlobalSettings();

    return await this.updateGlobalSettings({
      ai: {
        ...currentSettings.ai,
        ...settings,
      },
    });
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(settings: Partial<SettingsRecord['privacy']>): Promise<SettingsRecord> {
    const currentSettings = await this.getGlobalSettings();

    return await this.updateGlobalSettings({
      privacy: {
        ...currentSettings.privacy,
        ...settings,
      },
    });
  }

  /**
   * Update UI settings
   */
  async updateUISettings(settings: Partial<SettingsRecord['ui']>): Promise<SettingsRecord> {
    const currentSettings = await this.getGlobalSettings();

    return await this.updateGlobalSettings({
      ui: {
        ...currentSettings.ui,
        ...settings,
      },
    });
  }

  /**
   * Get specific setting value
   */
  async getSetting<K extends keyof SettingsRecord>(key: K): Promise<SettingsRecord[K]> {
    const settings = await this.getGlobalSettings();
    return settings[key];
  }

  /**
   * Export settings as JSON
   */
  async exportSettings(): Promise<string> {
    const settings = await this.getGlobalSettings();
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  async importSettings(jsonData: string): Promise<SettingsRecord> {
    const importedSettings = JSON.parse(jsonData);

    // Validate imported settings structure
    if (!importedSettings || typeof importedSettings !== 'object') {
      throw new Error('Invalid settings format');
    }

    // Merge with defaults to ensure all required fields exist
    const mergedSettings: SettingsRecord = {
      id: this.GLOBAL_SETTINGS_ID,
      ...DEFAULT_SETTINGS,
      ...importedSettings,
      updatedAt: new Date(),
    };

    await dbUtils.put(STORES.SETTINGS, mergedSettings);
    return mergedSettings;
  }

  /**
   * Validate settings object
   */
  validateSettings(settings: Partial<SettingsRecord>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate transcription settings
    if (settings.transcription) {
      const { language } = settings.transcription;
      if (language && !/^[a-z]{2}(-[A-Z]{2})?$/.test(language)) {
        errors.push('Invalid language format. Use format like "en" or "en-US"');
      }
    }

    // Validate AI settings
    if (settings.ai) {
      const { summaryStyle, summaryLength } = settings.ai;
      const validSummaryStyles = ['tl;dr', 'key-points', 'teaser', 'headline'];
      const validSummaryLengths = ['short', 'medium', 'long'];

      if (summaryStyle && !validSummaryStyles.includes(summaryStyle)) {
        errors.push(`Invalid summary style. Must be one of: ${validSummaryStyles.join(', ')}`);
      }

      if (summaryLength && !validSummaryLengths.includes(summaryLength)) {
        errors.push(`Invalid summary length. Must be one of: ${validSummaryLengths.join(', ')}`);
      }
    }

    // Validate privacy settings
    if (settings.privacy) {
      const { dataRetentionDays } = settings.privacy;
      if (dataRetentionDays !== undefined && (dataRetentionDays < 1 || dataRetentionDays > 3650)) {
        errors.push('Data retention days must be between 1 and 3650');
      }
    }

    // Validate UI settings
    if (settings.ui) {
      const { theme } = settings.ui;
      const validThemes = ['light', 'dark', 'auto'];

      if (theme && !validThemes.includes(theme)) {
        errors.push(`Invalid theme. Must be one of: ${validThemes.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const settingsRepository = new SettingsRepository();