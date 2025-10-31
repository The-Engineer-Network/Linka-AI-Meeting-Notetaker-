// lib/settings/defaults.ts

import { SettingsRecord } from '../database/schemas';

export const DEFAULT_SETTINGS: SettingsRecord = {
  id: 'global',
  version: '1.0.0',
  lastUpdated: Date.now(),

  // Transcription settings
  transcription: {
    language: 'en-US',
    continuous: true,
    interimResults: true,
    maxAlternatives: 1,
    autoStart: false,
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: true,
    sampleRate: 16000,
  },

  // AI processing settings
  ai: {
    summarizer: {
      enabled: true,
      type: 'key-points',
      length: 'medium',
      format: 'markdown',
      includeTimestamps: true,
      customPrompt: '',
    },
    translator: {
      enabled: true,
      sourceLanguage: 'auto',
      targetLanguages: ['es', 'fr', 'de'],
      autoTranslate: false,
    },
    writer: {
      enabled: true,
      tone: 'professional',
      length: 'medium',
      enhanceActionItems: true,
    },
    rewriter: {
      enabled: true,
      tone: 'more-formal',
      preserveKeyPoints: true,
    },
  },

  // Privacy and data settings
  privacy: {
    dataRetentionDays: 90,
    autoDeleteOldMeetings: false,
    encryptStoredData: false,
    shareAnalytics: false,
    allowPersonalization: true,
    exportDataOnDelete: true,
  },

  // UI and appearance settings
  ui: {
    theme: 'system',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    timezone: 'auto',
    animations: true,
    compactView: false,
    showTimestamps: true,
    autoScroll: true,
    notificationSound: true,
  },

  // Export and sharing settings
  export: {
    defaultFormat: 'pdf',
    includeTranscripts: true,
    includeSummary: true,
    includeActionItems: true,
    branding: {
      enabled: true,
      logo: '',
      companyName: '',
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#10b981',
      },
    },
    templates: {
      professional: true,
      meetingMinutes: true,
      transcriptOnly: false,
    },
  },

  // Sync and backup settings
  sync: {
    chromeStorage: {
      syncEnabled: true,
      autoSync: true,
      syncInterval: 15,
      maxStorageSize: 5,
      excludedKeys: ['temp', 'cache', 'session'],
    },
    incrementalSync: {
      enabled: true,
      batchSize: 100,
      maxChanges: 1000,
      includeDeletes: true,
      checksumValidation: true,
    },
    backup: {
      autoBackup: false,
      backupInterval: 7, // days
      maxBackups: 10,
      compressBackups: true,
      encryptBackups: false,
    },
  },

  // Audio settings
  audio: {
    quality: 'high',
    format: 'webm',
    compression: true,
    noiseReduction: true,
    voiceIsolation: false,
    sampleRate: 44100,
    channels: 1,
  },

  // Notification settings
  notifications: {
    browser: true,
    sound: true,
    meetingStart: true,
    meetingEnd: true,
    processingComplete: true,
    errors: true,
    syncStatus: false,
  },

  // Advanced settings
  advanced: {
    debugMode: false,
    performanceMonitoring: false,
    experimentalFeatures: false,
    apiTimeouts: 30000,
    maxConcurrentProcessing: 3,
    cacheSize: 100, // MB
  },

  // Extension settings
  extension: {
    autoUpdate: true,
    backgroundProcessing: true,
    contextMenu: true,
    keyboardShortcuts: true,
    popupQuickActions: true,
  },
};

/**
 * Get default settings for a specific category
 */
export function getDefaultCategory<K extends keyof SettingsRecord>(
  category: K
): SettingsRecord[K] {
  return DEFAULT_SETTINGS[category];
}

/**
 * Merge user settings with defaults
 */
export function mergeWithDefaults(userSettings: Partial<SettingsRecord>): SettingsRecord {
  const merged = { ...DEFAULT_SETTINGS };

  // Deep merge each category
  Object.keys(userSettings).forEach(key => {
    const categoryKey = key as keyof SettingsRecord;
    const userValue = userSettings[categoryKey];
    const defaultValue = DEFAULT_SETTINGS[categoryKey];

    if (userValue && typeof userValue === 'object' && !Array.isArray(userValue)) {
      // Deep merge objects
      merged[categoryKey] = { ...defaultValue, ...userValue } as any;
    } else {
      // Direct replacement for primitives and arrays
      merged[categoryKey] = userValue as any;
    }
  });

  // Update metadata
  merged.lastUpdated = Date.now();
  merged.version = DEFAULT_SETTINGS.version;

  return merged;
}

/**
 * Validate settings structure
 */
export function validateSettings(settings: Partial<SettingsRecord>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate transcription settings
  if (settings.transcription) {
    const trans = settings.transcription;
    if (trans.sampleRate && (trans.sampleRate < 8000 || trans.sampleRate > 96000)) {
      errors.push('Sample rate must be between 8000 and 96000 Hz');
    }
    if (trans.maxAlternatives && (trans.maxAlternatives < 1 || trans.maxAlternatives > 10)) {
      errors.push('Max alternatives must be between 1 and 10');
    }
  }

  // Validate AI settings
  if (settings.ai) {
    const ai = settings.ai;
    if (ai.summarizer?.type && !['key-points', 'tl;dr', 'teaser', 'headline'].includes(ai.summarizer.type)) {
      errors.push('Invalid summarizer type');
    }
    if (ai.summarizer?.length && !['short', 'medium', 'long'].includes(ai.summarizer.length)) {
      errors.push('Invalid summarizer length');
    }
  }

  // Validate privacy settings
  if (settings.privacy) {
    const privacy = settings.privacy;
    if (privacy.dataRetentionDays && privacy.dataRetentionDays < 1) {
      errors.push('Data retention days must be at least 1');
    }
  }

  // Validate sync settings
  if (settings.sync?.chromeStorage) {
    const chromeSync = settings.sync.chromeStorage;
    if (chromeSync.syncInterval && chromeSync.syncInterval < 1) {
      errors.push('Sync interval must be at least 1 minute');
    }
    if (chromeSync.maxStorageSize && chromeSync.maxStorageSize > 100) {
      errors.push('Max storage size cannot exceed 100MB');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get settings schema for validation
 */
export function getSettingsSchema(): Record<string, any> {
  return {
    transcription: {
      type: 'object',
      properties: {
        language: { type: 'string', pattern: '^[a-z]{2}-[A-Z]{2}$' },
        continuous: { type: 'boolean' },
        interimResults: { type: 'boolean' },
        maxAlternatives: { type: 'number', minimum: 1, maximum: 10 },
        autoStart: { type: 'boolean' },
        noiseSuppression: { type: 'boolean' },
        echoCancellation: { type: 'boolean' },
        autoGainControl: { type: 'boolean' },
        sampleRate: { type: 'number', minimum: 8000, maximum: 96000 },
      },
    },
    ai: {
      type: 'object',
      properties: {
        summarizer: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            type: { enum: ['key-points', 'tl;dr', 'teaser', 'headline'] },
            length: { enum: ['short', 'medium', 'long'] },
            format: { enum: ['markdown', 'text', 'html'] },
            includeTimestamps: { type: 'boolean' },
            customPrompt: { type: 'string', maxLength: 1000 },
          },
        },
        translator: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            sourceLanguage: { type: 'string' },
            targetLanguages: { type: 'array', items: { type: 'string', pattern: '^[a-z]{2}$' } },
            autoTranslate: { type: 'boolean' },
          },
        },
      },
    },
    privacy: {
      type: 'object',
      properties: {
        dataRetentionDays: { type: 'number', minimum: 1 },
        autoDeleteOldMeetings: { type: 'boolean' },
        encryptStoredData: { type: 'boolean' },
        shareAnalytics: { type: 'boolean' },
        allowPersonalization: { type: 'boolean' },
        exportDataOnDelete: { type: 'boolean' },
      },
    },
  };
}