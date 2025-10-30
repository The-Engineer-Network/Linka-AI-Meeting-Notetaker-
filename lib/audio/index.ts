// lib/audio/index.ts

// Audio capture and processing exports
export { AudioCaptureManager, AudioCaptureFactory } from './capture';
export { WebSpeechTranscriber, TranscriptionFactory } from './transcription/web-speech';
export { AudioProcessingPipeline, AudioProcessingFactory } from './processing';
export { audioStorageManager } from './storage';

// Import types for use in AudioManager
import { AudioProcessingPipeline, AudioProcessingFactory, AudioProcessingOptions } from './processing';

// Types
export type {
  AudioCaptureOptions,
  AudioLevelData,
  AudioChunk,
} from './capture';

export type {
  TranscriptionOptions,
  TranscriptionResult,
  SpeakerIdentification,
} from './transcription/web-speech';

export type {
  AudioProcessingOptions,
  ProcessingStats,
} from './processing';

export type {
  AudioBlobData,
} from './storage';

// Service Worker types
export type {
  BackgroundProcessingMessage,
  BackgroundProcessingResponse,
} from './service-worker';

// Main audio manager class for easy integration
export class AudioManager {
  private processingPipeline: AudioProcessingPipeline | null = null;

  constructor(private meetingId: string) {}

  /**
   * Initialize audio processing for a meeting
   */
  async initialize(options?: AudioProcessingOptions): Promise<void> {
    this.processingPipeline = AudioProcessingFactory.getInstance(this.meetingId, options);
    await this.processingPipeline.initialize();
  }

  /**
   * Start audio recording and processing
   */
  async startRecording(): Promise<void> {
    if (!this.processingPipeline) {
      throw new Error('Audio manager not initialized');
    }
    await this.processingPipeline.startProcessing();
  }

  /**
   * Stop audio recording and processing
   */
  async stopRecording(): Promise<void> {
    if (!this.processingPipeline) {
      throw new Error('Audio manager not initialized');
    }
    await this.processingPipeline.stopProcessing();
  }

  /**
   * Pause audio processing
   */
  pauseRecording(): void {
    if (!this.processingPipeline) {
      throw new Error('Audio manager not initialized');
    }
    this.processingPipeline.pauseProcessing();
  }

  /**
   * Resume audio processing
   */
  resumeRecording(): void {
    if (!this.processingPipeline) {
      throw new Error('Audio manager not initialized');
    }
    this.processingPipeline.resumeProcessing();
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: {
    onStatsUpdate?: (stats: any) => void;
    onTranscriptionResult?: (result: any) => void;
    onError?: (error: Error) => void;
  }): void {
    if (this.processingPipeline) {
      this.processingPipeline.setCallbacks(callbacks);
    }
  }

  /**
   * Get current processing statistics
   */
  getStats(): any {
    return this.processingPipeline ? this.processingPipeline.getStats() : null;
  }

  /**
   * Get processing status
   */
  getStatus(): any {
    return this.processingPipeline ? this.processingPipeline.getStatus() : null;
  }

  /**
   * Update processing options
   */
  updateOptions(options: Partial<AudioProcessingOptions>): void {
    if (this.processingPipeline) {
      this.processingPipeline.updateOptions(options);
    }
  }

  /**
   * Check if audio processing is supported
   */
  static isSupported(): boolean {
    return AudioProcessingPipeline.isSupported();
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.processingPipeline) {
      AudioProcessingFactory.disposeInstance(this.meetingId);
      this.processingPipeline = null;
    }
  }
}

// Factory for managing audio manager instances
export class AudioManagerFactory {
  private static instances = new Map<string, AudioManager>();

  static getInstance(meetingId: string): AudioManager {
    if (!this.instances.has(meetingId)) {
      this.instances.set(meetingId, new AudioManager(meetingId));
    }
    return this.instances.get(meetingId)!;
  }

  static disposeInstance(meetingId: string): void {
    const instance = this.instances.get(meetingId);
    if (instance) {
      instance.dispose();
      this.instances.delete(meetingId);
    }
  }

  static disposeAll(): void {
    for (const [meetingId, instance] of this.instances) {
      instance.dispose();
    }
    this.instances.clear();
  }
}