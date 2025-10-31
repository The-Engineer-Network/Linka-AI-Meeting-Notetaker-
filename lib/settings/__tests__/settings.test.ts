// lib/settings/__tests__/settings.test.ts

import { SettingsManager, settingsManager } from '../manager';
import { SettingsStorage, settingsStorage } from '../storage';
import { DEFAULT_SETTINGS, mergeWithDefaults, validateSettings } from '../defaults';
import { SettingsSystem, settingsSystem } from '../index';

// Mock dependencies
jest.mock('../../database', () => ({
  settingsRepository: {
    getGlobalSettings: jest.fn(),
    updateGlobalSettings: jest.fn(),
  },
}));

// Mock Chrome APIs
const mockChrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      onChanged: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
  },
};

// @ts-ignore
global.chrome = mockChrome;

describe('Settings System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock settings repository
    const mockSettingsRepo = require('../../database').settingsRepository;
    mockSettingsRepo.getGlobalSettings.mockResolvedValue(DEFAULT_SETTINGS);
    mockSettingsRepo.updateGlobalSettings.mockResolvedValue(undefined);

    // Mock Chrome storage
    mockChrome.storage.sync.get.mockResolvedValue({});
    mockChrome.storage.sync.set.mockResolvedValue(undefined);
  });

  describe('SettingsStorage', () => {
    test('should load settings from storage', async () => {
      const settings = await settingsStorage.load();
      expect(settings).toBeDefined();
      expect(settings.id).toBe('global');
    });

    test('should save settings to storage', async () => {
      const testSettings = { ...DEFAULT_SETTINGS, version: '2.0.0' };
      await settingsStorage.save(testSettings);

      const mockRepo = require('../../database').settingsRepository;
      expect(mockRepo.updateGlobalSettings).toHaveBeenCalledWith(testSettings);
    });

    test('should update specific category', async () => {
      await settingsStorage.updateCategory('ui', { theme: 'dark' });

      const mockRepo = require('../../database').settingsRepository;
      expect(mockRepo.updateGlobalSettings).toHaveBeenCalled();
    });

    test('should export settings', async () => {
      const exported = await settingsStorage.export();
      expect(typeof exported).toBe('string');

      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty('id', 'global');
    });

    test('should import settings', async () => {
      const testSettings = { ...DEFAULT_SETTINGS, version: '3.0.0' };
      const settingsJson = JSON.stringify(testSettings);

      await settingsStorage.importSettings(settingsJson);

      const mockRepo = require('../../database').settingsRepository;
      expect(mockRepo.updateGlobalSettings).toHaveBeenCalled();
    });

    test('should get storage statistics', async () => {
      const stats = await settingsStorage.getStorageStats();
      expect(stats).toHaveProperty('indexedDB');
      expect(stats).toHaveProperty('chromeStorage');
      expect(stats).toHaveProperty('cache');
    });
  });

  describe('SettingsManager', () => {
    test('should get all settings', async () => {
      const settings = await settingsManager.getAll();
      expect(settings).toBeDefined();
      expect(settings.id).toBe('global');
    });

    test('should get specific category', async () => {
      const uiSettings = await settingsManager.getCategory('ui');
      expect(uiSettings).toHaveProperty('theme');
      expect(uiSettings).toHaveProperty('language');
    });

    test('should update setting', async () => {
      await settingsManager.update({
        category: 'ui',
        key: 'theme',
        value: 'dark',
      });

      const mockRepo = require('../../database').settingsRepository;
      expect(mockRepo.updateGlobalSettings).toHaveBeenCalled();
    });

    test('should update multiple settings', async () => {
      const updates = [
        { category: 'ui' as const, key: 'theme', value: 'dark' },
        { category: 'ui' as const, key: 'language', value: 'es' },
      ];

      await settingsManager.updateBatch(updates);

      const mockRepo = require('../../database').settingsRepository;
      expect(mockRepo.updateGlobalSettings).toHaveBeenCalled();
    });

    test('should reset category to defaults', async () => {
      await settingsManager.resetCategory('ui');

      const mockRepo = require('../../database').settingsRepository;
      expect(mockRepo.updateGlobalSettings).toHaveBeenCalled();
    });

    test('should reset all settings', async () => {
      await settingsManager.resetAll();

      const mockRepo = require('../../database').settingsRepository;
      expect(mockRepo.updateGlobalSettings).toHaveBeenCalled();
    });

    test('should validate settings update', async () => {
      const validation = await settingsManager.validateCategoryUpdate('ui', { theme: 'invalid' });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Theme must be auto, light, or dark');
    });

    test('should handle settings change callbacks', () => {
      const callback = jest.fn();
      const unsubscribe = settingsManager.onChange(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    test('should handle category change callbacks', () => {
      const callback = jest.fn();
      const unsubscribe = settingsManager.onCategoryChange('ui', callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });
  });

  describe('Default Settings', () => {
    test('should provide default settings', () => {
      expect(DEFAULT_SETTINGS).toBeDefined();
      expect(DEFAULT_SETTINGS.id).toBe('global');
      expect(DEFAULT_SETTINGS.version).toBe('1.0.0');
    });

    test('should merge with defaults', () => {
      const userSettings = {
        ui: { theme: 'dark' },
        transcription: { language: 'es-ES' },
      };

      const merged = mergeWithDefaults(userSettings);
      expect(merged.ui.theme).toBe('dark');
      expect(merged.transcription.language).toBe('es-ES');
      expect(merged.ai.summarizer.enabled).toBe(true); // Default value preserved
    });

    test('should validate settings', () => {
      const validSettings = DEFAULT_SETTINGS;
      const validation = validateSettings(validSettings);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect invalid settings', () => {
      const invalidSettings = {
        ...DEFAULT_SETTINGS,
        transcription: { language: 'invalid-lang' },
      };

      const validation = validateSettings(invalidSettings);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('SettingsSystem', () => {
    test('should initialize', () => {
      expect(settingsSystem).toBeDefined();
    });

    test('should get all settings', async () => {
      const settings = await settingsSystem.getAll();
      expect(settings).toBeDefined();
    });

    test('should get category settings', async () => {
      const uiSettings = await settingsSystem.getCategory('ui');
      expect(uiSettings).toHaveProperty('theme');
    });

    test('should update setting', async () => {
      await settingsSystem.update('ui', 'theme', 'dark');
      expect(settingsManager.update).toHaveBeenCalled();
    });

    test('should update multiple settings', async () => {
      const updates = [
        { category: 'ui', key: 'theme', value: 'dark' },
        { category: 'ui', key: 'language', value: 'es' },
      ];

      await settingsSystem.updateBatch(updates);
      expect(settingsManager.updateBatch).toHaveBeenCalled();
    });

    test('should reset category', async () => {
      await settingsSystem.resetCategory('ui');
      expect(settingsManager.resetCategory).toHaveBeenCalled();
    });

    test('should reset all settings', async () => {
      await settingsSystem.resetAll();
      expect(settingsManager.resetAll).toHaveBeenCalled();
    });

    test('should export settings', async () => {
      const exported = await settingsSystem.export();
      expect(typeof exported).toBe('string');
    });

    test('should import settings', async () => {
      const settingsJson = JSON.stringify(DEFAULT_SETTINGS);
      await settingsSystem.import(settingsJson);
      expect(settingsManager.import).toHaveBeenCalled();
    });

    test('should get statistics', async () => {
      const stats = await settingsSystem.getStats();
      expect(stats).toHaveProperty('indexedDB');
    });
  });

  describe('Chrome Storage Integration', () => {
    test('should sync settings to Chrome storage', async () => {
      const testSettings = { ...DEFAULT_SETTINGS };
      await settingsStorage.save(testSettings);

      expect(mockChrome.storage.sync.set).toHaveBeenCalled();
    });

    test('should load settings from Chrome storage', async () => {
      const chromeSettings = { ...DEFAULT_SETTINGS, version: '2.0.0' };
      mockChrome.storage.sync.get.mockResolvedValue({
        'linka_settings_v2': chromeSettings,
      });

      const settings = await settingsStorage.load();
      expect(settings.version).toBe('2.0.0');
    });

    test('should handle Chrome storage errors gracefully', async () => {
      mockChrome.storage.sync.set.mockRejectedValue(new Error('Storage quota exceeded'));

      // Should not throw, just log warning
      await expect(settingsStorage.save(DEFAULT_SETTINGS)).resolves.not.toThrow();
    });
  });

  describe('Settings Validation', () => {
    test('should validate transcription settings', async () => {
      const invalidTranscription = { language: 'invalid-lang' };
      const validation = await settingsManager.validateCategoryUpdate('transcription', invalidTranscription);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Language must be in format: xx-XX (e.g., en-US)');
    });

    test('should validate AI settings', async () => {
      const invalidAI = {
        summarizer: { type: 'invalid-type' }
      };
      const validation = await settingsManager.validateCategoryUpdate('ai', invalidAI);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid summarizer type');
    });

    test('should validate privacy settings', async () => {
      const invalidPrivacy = { dataRetentionDays: -1 };
      const validation = await settingsManager.validateCategoryUpdate('privacy', invalidPrivacy);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Data retention days must be at least 1');
    });

    test('should validate UI settings', async () => {
      const invalidUI = { theme: 'invalid-theme' };
      const validation = await settingsManager.validateCategoryUpdate('ui', invalidUI);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Theme must be auto, light, or dark');
    });
  });

  describe('Cross-Category Validation', () => {
    test('should prevent incompatible settings combinations', async () => {
      // Test: If AI summarizer is enabled, transcription should be continuous
      const currentSettings = {
        ...DEFAULT_SETTINGS,
        ai: { ...DEFAULT_SETTINGS.ai, summarizer: { ...DEFAULT_SETTINGS.ai.summarizer, enabled: true } },
      };

      // Mock current settings
      jest.spyOn(settingsManager, 'getAll').mockResolvedValue(currentSettings);

      const validation = await settingsManager.validateCategoryUpdate('transcription', {
        continuous: false
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Cannot disable continuous transcription when AI summarizer is enabled');
    });
  });

  describe('Performance Tests', () => {
    test('should handle rapid setting updates', async () => {
      const updates = Array.from({ length: 100 }, (_, i) => ({
        category: 'ui' as const,
        key: 'theme' as const,
        value: i % 2 === 0 ? 'light' : 'dark',
      }));

      const startTime = Date.now();
      await settingsManager.updateBatch(updates);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should cache settings efficiently', async () => {
      // First load
      await settingsStorage.load();

      // Second load should use cache
      const startTime = Date.now();
      await settingsStorage.load();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10); // Should be very fast with cache
    });
  });

  describe('Error Handling', () => {
    test('should handle storage failures gracefully', async () => {
      const mockRepo = require('../../database').settingsRepository;
      mockRepo.updateGlobalSettings.mockRejectedValue(new Error('Storage error'));

      await expect(settingsManager.update({
        category: 'ui',
        key: 'theme',
        value: 'dark',
      })).rejects.toThrow('Storage error');
    });

    test('should handle validation errors', async () => {
      await expect(settingsManager.update({
        category: 'ui',
        key: 'theme',
        value: 'invalid-theme',
      })).rejects.toThrow('Validation failed');
    });

    test('should handle import errors', async () => {
      const invalidJson = 'invalid json';

      await expect(settingsManager.import(invalidJson)).rejects.toThrow();
    });
  });
});