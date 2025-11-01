// lib/backend-init.ts

// Import all backend services
import { initializeDatabase } from './database';
import { AudioManager, AudioManagerFactory } from './audio';
import { aiManager } from './ai';
import { exportSystem } from './export';
import { syncSystem } from './sync';
import { settingsSystem } from './settings';
import { chromeIdentity } from './auth/chrome-identity';

// Create a unified database interface
class DatabaseService {
  async initialize() {
    await initializeDatabase();
  }

  get meetings() {
    const { meetingsRepository } = require('./database');
    return meetingsRepository;
  }

  get transcripts() {
    const { transcriptsRepository } = require('./database');
    return transcriptsRepository;
  }

  get settings() {
    const { settingsRepository } = require('./database');
    return settingsRepository;
  }

  get processingQueue() {
    const { processingQueueRepository } = require('./database');
    return processingQueueRepository;
  }
}

// Create a unified audio service
class AudioService {
  private managers = new Map<string, AudioManager>();

  async initialize() {
    // Audio service doesn't need explicit initialization
  }

  async startRecording(meetingId: string) {
    const manager = AudioManagerFactory.getInstance(meetingId);
    await manager.initialize();
    await manager.startRecording();
    this.managers.set(meetingId, manager);
    return manager;
  }

  async stopRecording(meetingId: string) {
    const manager = this.managers.get(meetingId);
    if (manager) {
      await manager.stopRecording();
      return manager;
    }
    throw new Error('No recording manager found for meeting');
  }

  async transcribeAudio(audioBlob: Blob, options?: any) {
    const { WebSpeechTranscriber } = require('./audio/transcription/web-speech');
    const transcriber = new WebSpeechTranscriber();
    return await transcriber.transcribe(audioBlob, options);
  }

  async processAudio(audioBlob: Blob, options?: any) {
    const { AudioProcessingPipeline } = require('./audio/processing');
    const pipeline = AudioProcessingPipeline.AudioProcessingFactory.create();
    return await pipeline.processAudio(audioBlob, options);
  }
}

// Create a unified AI service
class AIService {
  async initialize() {
    // AI service initializes itself
  }

  async summarize(text: string, options?: any) {
    const { aiSummarizer } = require('./ai');
    return await aiSummarizer.summarize(text, options);
  }

  async translate(text: string, targetLanguage: string, options?: any) {
    const { aiTranslator } = require('./ai');
    return await aiTranslator.translate(text, targetLanguage, options);
  }

  async enhanceText(text: string, options?: any) {
    const { aiRewriter } = require('./ai');
    return await aiRewriter.enhance(text, options);
  }

  async extractActionItems(text: string, options?: any) {
    // This would need to be implemented in the AI module
    // For now, return a placeholder
    return {
      success: true,
      data: {
        actionItems: [],
        context: text
      }
    };
  }
}

// Create singleton instances
export const database = new DatabaseService();
export const audioService = new AudioService();
export const aiService = new AIService();
export const exportService = exportSystem;
export const syncService = syncSystem;
export const settingsManager = settingsSystem;
// Note: Chrome Identity not needed for web app
// export const chromeIdentityService = chromeIdentity;

/**
 * Initialize all backend services
 */
export async function initializeBackend() {
  try {
    console.log('Initializing backend services...');

    // Initialize database
    await database.initialize();
    console.log('✓ Database initialized');

    // Initialize sync service
    await syncService.initialize();
    console.log('✓ Sync service initialized');

    // Initialize settings
    // Settings initialize themselves when first accessed

    // Initialize audio service
    await audioService.initialize();
    console.log('✓ Audio service initialized');

    // Initialize AI service
    await aiService.initialize();
    console.log('✓ AI service initialized');

    console.log('Backend services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize backend services:', error);
    throw error;
  }
}

// Export all services for convenience
export {
  database as db,
  audioService as audio,
  aiService as ai,
  exportService as export,
  syncService as sync,
  settingsManager as settings,
  // Note: Chrome Identity not needed for web app
  // chromeIdentityService as auth
};