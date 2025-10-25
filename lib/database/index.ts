// lib/database/index.ts

// Main database exports
export { linkaDB, dbUtils } from './indexeddb';

// Import for use in functions
import { linkaDB } from './indexeddb';

// Schema exports
export {
  DB_NAME,
  DB_VERSION,
  STORES,
  DEFAULT_SETTINGS,
  VALIDATION_RULES,
} from './schemas';

export type {
  MeetingRecord,
  TranscriptChunk,
  SettingsRecord,
  ProcessingQueueItem,
} from './schemas';

// Repository exports
export { meetingsRepository } from './repositories/meetings';
export { transcriptsRepository } from './repositories/transcripts';
export { settingsRepository } from './repositories/settings';
export { processingQueueRepository } from './repositories/processing-queue';

// Validation exports
export {
  validateMeeting,
  validateTranscriptChunk,
  validateSettings,
  validateAndSanitizeMeeting,
  validateAndSanitizeTranscriptChunk,
  checkDataIntegrity,
} from './validation';

export type { ValidationResult } from './validation';

// Convenience function to initialize database
export async function initializeDatabase(): Promise<void> {
  try {
    await linkaDB.getDB();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  stats: any;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    const stats = await linkaDB.getStats();

    // Basic health checks
    if (stats.meetings < 0 || stats.transcripts < 0) {
      errors.push('Invalid statistics returned');
    }

    return {
      isHealthy: errors.length === 0,
      stats,
      errors,
    };
  } catch (error) {
    return {
      isHealthy: false,
      stats: null,
      errors: [`Database health check failed: ${error}`],
    };
  }
}