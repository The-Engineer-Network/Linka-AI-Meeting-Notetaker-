// lib/settings/storage.ts

import { SettingsRecord } from '../database/schemas';
import { settingsRepository } from '../database';
import { mergeWithDefaults, validateSettings } from './defaults';

export interface StorageOptions {
  syncAcrossDevices: boolean;
  compressData: boolean;
  validateOnSave: boolean;
  backupOnChange: boolean;
}

export class SettingsStorage {
  private static readonly STORAGE_KEY = 'linka_settings_v2';
  private static readonly SYNC_STORAGE_KEY = 'linka_settings_sync';
  private cache: SettingsRecord | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private options: StorageOptions = {
    syncAcrossDevices: true,
    compressData: false,
    validateOnSave: true,
    backupOnChange: false,
  };

  constructor(options: Partial<StorageOptions> = {}) {
    this.options = { ...this.options, ...options };
  }

  /**
   * Load settings from storage with caching
   */
  async load(): Promise<SettingsRecord> {
    // Check cache first
    if (this.cache && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      // Try to load from IndexedDB first (primary storage)
      let settings = await settingsRepository.getGlobalSettings();

      if (!settings) {
        // If no settings in IndexedDB, try Chrome storage
        settings = await this.loadFromChromeStorage();

        if (settings) {
          // Migrate to IndexedDB
          await settingsRepository.updateGlobalSettings(settings);
        }
      }

      // If still no settings, use defaults
      if (!settings) {
        settings = mergeWithDefaults({});
        await this.save(settings); // Save defaults
      }

      // Update cache
      this.cache = settings;
      this.cacheTimestamp = Date.now();

      return settings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Return defaults on error
      return mergeWithDefaults({});
    }
  }

  /**
   * Save settings to storage
   */
  async save(settings: SettingsRecord): Promise<void> {
    try {
      // Validate settings if enabled
      if (this.options.validateOnSave) {
        const validation = validateSettings(settings);
        if (!validation.valid) {
          throw new Error(`Settings validation failed: ${validation.errors.join(', ')}`);
        }
      }

      // Update metadata
      settings.lastUpdated = Date.now();

      // Save to IndexedDB (primary storage)
      await settingsRepository.updateGlobalSettings(settings);

      // Save to Chrome storage if sync is enabled
      if (this.options.syncAcrossDevices) {
        await this.saveToChromeStorage(settings);
      }

      // Update cache
      this.cache = settings;
      this.cacheTimestamp = Date.now();

      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  /**
   * Update specific settings category
   */
  async updateCategory<K extends keyof SettingsRecord>(
    category: K,
    updates: Partial<SettingsRecord[K]>
  ): Promise<void> {
    const currentSettings = await this.load();
    const updatedSettings = { ...currentSettings };

    // Deep merge the category
    if (typeof updates === 'object' && updates !== null) {
      updatedSettings[category] = { ...currentSettings[category], ...updates } as SettingsRecord[K];
    } else {
      updatedSettings[category] = updates as SettingsRecord[K];
    }

    await this.save(updatedSettings);
  }

  /**
   * Get specific settings category
   */
  async getCategory<K extends keyof SettingsRecord>(category: K): Promise<SettingsRecord[K]> {
    const settings = await this.load();
    return settings[category];
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(): Promise<void> {
    const defaultSettings = mergeWithDefaults({});
    await this.save(defaultSettings);
    console.log('Settings reset to defaults');
  }

  /**
   * Export settings for backup
   */
  async exportSettings(): Promise<string> {
    const settings = await this.load();
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings from backup
   */
  async importSettings(settingsJson: string, merge: boolean = false): Promise<void> {
    try {
      const importedSettings = JSON.parse(settingsJson) as SettingsRecord;

      // Validate imported settings
      const validation = validateSettings(importedSettings);
      if (!validation.valid) {
        throw new Error(`Imported settings validation failed: ${validation.errors.join(', ')}`);
      }

      let finalSettings: SettingsRecord;

      if (merge) {
        const currentSettings = await this.load();
        finalSettings = mergeWithDefaults({ ...currentSettings, ...importedSettings });
      } else {
        finalSettings = mergeWithDefaults(importedSettings);
      }

      await this.save(finalSettings);
      console.log('Settings imported successfully');
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error(`Settings import failed: ${error}`);
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    indexedDB: { size: number; lastUpdated: number };
    chromeStorage: { size: number; lastSync: number | null };
    cache: { hit: boolean; age: number };
  }> {
    const stats = {
      indexedDB: { size: 0, lastUpdated: 0 },
      chromeStorage: { size: 0, lastSync: null },
      cache: {
        hit: this.cache !== null,
        age: this.cache ? Date.now() - this.cacheTimestamp : 0,
      },
    };

    try {
      // Get IndexedDB stats
      const settings = await settingsRepository.getGlobalSettings();
      if (settings) {
        stats.indexedDB.size = JSON.stringify(settings).length;
        stats.indexedDB.lastUpdated = settings.lastUpdated || 0;
      }

      // Get Chrome storage stats
      if (this.options.syncAcrossDevices) {
        const chromeData = await this.loadFromChromeStorage();
        if (chromeData) {
          stats.chromeStorage.size = JSON.stringify(chromeData).length;
          stats.chromeStorage.lastSync = chromeData.lastUpdated || null;
        }
      }
    } catch (error) {
      console.warn('Failed to get storage stats:', error);
    }

    return stats;
  }

  // Private methods

  private async loadFromChromeStorage(): Promise<SettingsRecord | null> {
    if (!this.isChromeStorageAvailable()) {
      return null;
    }

    try {
      const result = await chrome.storage.sync.get(SettingsStorage.STORAGE_KEY);
      const data = result[SettingsStorage.STORAGE_KEY];

      if (data && typeof data === 'object') {
        // Decompress if needed
        let settingsData = data;
        if (this.options.compressData && typeof data === 'string') {
          settingsData = JSON.parse(data);
        }

        return settingsData as SettingsRecord;
      }
    } catch (error) {
      console.warn('Failed to load from Chrome storage:', error);
    }

    return null;
  }

  private async saveToChromeStorage(settings: SettingsRecord): Promise<void> {
    if (!this.isChromeStorageAvailable()) {
      return;
    }

    try {
      let dataToStore = settings;

      // Compress if enabled
      if (this.options.compressData) {
        dataToStore = JSON.stringify(settings) as any;
      }

      await chrome.storage.sync.set({
        [SettingsStorage.STORAGE_KEY]: dataToStore,
      });
    } catch (error) {
      console.warn('Failed to save to Chrome storage:', error);
      // Don't throw - Chrome storage failures shouldn't break the app
    }
  }

  private isChromeStorageAvailable(): boolean {
    return typeof chrome !== 'undefined' && !!chrome.storage?.sync;
  }

  /**
   * Listen for Chrome storage changes
   */
  setupChromeStorageListener(callback: (changes: SettingsRecord) => void): () => void {
    if (!this.isChromeStorageAvailable()) {
      return () => {}; // No-op
    }

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[SettingsStorage.STORAGE_KEY]) {
        const newData = changes[SettingsStorage.STORAGE_KEY].newValue;
        if (newData) {
          // Clear cache to force reload
          this.clearCache();
          callback(newData as SettingsRecord);
        }
      }
    };

    chrome.storage.onChanged.addListener(listener);

    // Return unsubscribe function
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }
}

// Singleton instance
export const settingsStorage = new SettingsStorage();