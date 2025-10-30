// lib/audio/processing.ts

import { AudioCaptureManager, AudioCaptureFactory } from './capture';
import { WebSpeechTranscriber, TranscriptionFactory } from './transcription/web-speech';
import { transcriptsRepository, meetingsRepository, processingQueueRepository } from '../database';

export interface AudioProcessingOptions {
  enableTranscription?: boolean;
  enableRealTimeProcessing?: boolean;
  transcriptionLanguage?: string;
  audioLevelThreshold?: number;
  chunkDuration?: number; // in milliseconds
}

export interface ProcessingStats {
  meetingId: string;
  totalAudioChunks: number;
  totalTranscriptChunks: number;
  processingStartTime: number;
  lastActivityTime: number;
  averageAudioLevel: number;
  transcriptionEnabled: boolean;
}

export class AudioProcessingPipeline {
  private captureManager: AudioCaptureManager;
  private transcriber: WebSpeechTranscriber | null = null;

  private isProcessing = false;
  private processingStats: ProcessingStats;

  // Processing options
  private options: Required<AudioProcessingOptions>;

  // Event callbacks
  private onStatsUpdate?: (stats: ProcessingStats) => void;
  private onTranscriptionResult?: (result: any) => void;
  private onError?: (error: Error) => void;

  constructor(
    private meetingId: string,
    options: AudioProcessingOptions = {}
  ) {
    this.options = {
      enableTranscription: true,
      enableRealTimeProcessing: true,
      transcriptionLanguage: 'en-US',
      audioLevelThreshold: 0.01,
      chunkDuration: 5000, // 5 seconds
      ...options,
    };

    this.captureManager = AudioCaptureFactory.getInstance(meetingId, {
      sampleRate: 44100,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    });

    this.processingStats = {
      meetingId,
      totalAudioChunks: 0,
      totalTranscriptChunks: 0,
      processingStartTime: 0,
      lastActivityTime: 0,
      averageAudioLevel: 0,
      transcriptionEnabled: this.options.enableTranscription,
    };

    this.setupEventHandlers();
  }

  /**
   * Set up event handlers for audio capture and transcription
   */
  private setupEventHandlers(): void {
    // Audio level monitoring
    this.captureManager.onAudioLevel((levelData) => {
      this.updateAudioLevelStats(levelData);
    });

    // Audio data processing
    this.captureManager.setCallbacks({
      onDataAvailable: (chunk) => {
        this.processAudioChunk(chunk);
      },
      onRecordingStart: () => {
        this.processingStats.processingStartTime = Date.now();
        this.processingStats.lastActivityTime = Date.now();
        console.log('Audio processing started for meeting:', this.meetingId);
      },
      onRecordingStop: () => {
        console.log('Audio processing stopped for meeting:', this.meetingId);
        this.finalizeProcessing();
      },
      onError: (error) => {
        console.error('Audio processing error:', error);
        if (this.onError) {
          this.onError(error);
        }
      },
    });
  }

  /**
   * Initialize the processing pipeline
   */
  async initialize(): Promise<void> {
    try {
      // Initialize audio capture
      await this.captureManager.initialize();

      // Set audio level threshold
      this.captureManager.setLevelThreshold(this.options.audioLevelThreshold);

      // Initialize transcription if enabled
      if (this.options.enableTranscription) {
        this.transcriber = TranscriptionFactory.getInstance(this.meetingId, {
          language: this.options.transcriptionLanguage,
          continuous: true,
          interimResults: true,
        });

        this.transcriber.setCallbacks({
          onResult: (result) => {
            this.handleTranscriptionResult(result);
          },
          onError: (error) => {
            console.error('Transcription error:', error);
            if (this.onError) {
              this.onError(error);
            }
          },
        });
      }

      console.log('Audio processing pipeline initialized');
    } catch (error) {
      console.error('Failed to initialize audio processing pipeline:', error);
      throw error;
    }
  }

  /**
   * Start audio processing
   */
  async startProcessing(): Promise<void> {
    if (this.isProcessing) {
      throw new Error('Audio processing already running');
    }

    try {
      this.isProcessing = true;

      // Start audio capture
      await this.captureManager.startRecording();

      // Start transcription if enabled
      if (this.transcriber) {
        await this.transcriber.start();
      }

      console.log('Audio processing started');
    } catch (error) {
      this.isProcessing = false;
      console.error('Failed to start audio processing:', error);
      throw error;
    }
  }

  /**
   * Pause audio processing
   */
  pauseProcessing(): void {
    if (!this.isProcessing) {
      throw new Error('Audio processing not running');
    }

    this.captureManager.pauseRecording();

    if (this.transcriber) {
      this.transcriber.stop();
    }

    console.log('Audio processing paused');
  }

  /**
   * Resume audio processing
   */
  resumeProcessing(): void {
    if (!this.isProcessing) {
      throw new Error('Audio processing not running');
    }

    this.captureManager.resumeRecording();

    if (this.transcriber) {
      // Note: Web Speech API doesn't have resume, so we restart
      this.transcriber.start().catch(error => {
        console.error('Failed to resume transcription:', error);
      });
    }

    console.log('Audio processing resumed');
  }

  /**
   * Stop audio processing
   */
  async stopProcessing(): Promise<void> {
    if (!this.isProcessing) {
      return;
    }

    try {
      this.isProcessing = false;

      // Stop transcription
      if (this.transcriber) {
        this.transcriber.stop();
      }

      // Stop audio capture (this will trigger finalization)
      await this.captureManager.stopRecording();

      console.log('Audio processing stopped');
    } catch (error) {
      console.error('Error stopping audio processing:', error);
      throw error;
    }
  }

  /**
   * Process audio chunk data
   */
  private async processAudioChunk(chunk: any): Promise<void> {
    this.processingStats.totalAudioChunks++;
    this.processingStats.lastActivityTime = Date.now();

    // Here you could implement additional audio processing:
    // - Noise reduction
    // - Audio compression
    // - Feature extraction for AI processing
    // - Audio fingerprinting

    // For now, we just update stats
    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.processingStats);
    }
  }

  /**
   * Handle transcription results
   */
  private async handleTranscriptionResult(result: any): Promise<void> {
    this.processingStats.totalTranscriptChunks++;
    this.processingStats.lastActivityTime = Date.now();

    // The transcription is already saved by the WebSpeechTranscriber
    // Here you could add additional processing like:
    // - Sentiment analysis
    // - Keyword extraction
    // - Action item detection
    // - Queue for AI processing

    if (this.options.enableRealTimeProcessing && result.isFinal) {
      // Queue for AI processing (summarization, translation, etc.)
      try {
        await processingQueueRepository.enqueue({
          meetingId: this.meetingId,
          type: 'summarize', // Could be determined based on content
          status: 'pending',
          priority: 'medium',
          data: {
            transcript: result.transcript,
            timestamp: result.timestamp,
            confidence: result.confidence,
          },
        });
      } catch (error) {
        console.error('Failed to queue for AI processing:', error);
      }
    }

    if (this.onTranscriptionResult) {
      this.onTranscriptionResult(result);
    }

    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.processingStats);
    }
  }

  /**
   * Update audio level statistics
   */
  private updateAudioLevelStats(levelData: any): void {
    // Simple moving average for audio level
    const alpha = 0.1; // Smoothing factor
    this.processingStats.averageAudioLevel =
      alpha * levelData.level + (1 - alpha) * this.processingStats.averageAudioLevel;

    // Update last activity time if audio is active
    if (levelData.isActive) {
      this.processingStats.lastActivityTime = Date.now();
    }
  }

  /**
   * Finalize processing when recording stops
   */
  private async finalizeProcessing(): Promise<void> {
    try {
      // Generate final summary or trigger final AI processing
      if (this.processingStats.totalTranscriptChunks > 0) {
        // Queue final summarization
        await processingQueueRepository.enqueue({
          meetingId: this.meetingId,
          type: 'summarize',
          status: 'pending',
          priority: 'high',
          data: {
            type: 'final_summary',
            meetingId: this.meetingId,
          },
        });
      }

      console.log('Audio processing finalized for meeting:', this.meetingId);
    } catch (error) {
      console.error('Error finalizing audio processing:', error);
    }
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: {
    onStatsUpdate?: (stats: ProcessingStats) => void;
    onTranscriptionResult?: (result: any) => void;
    onError?: (error: Error) => void;
  }): void {
    this.onStatsUpdate = callbacks.onStatsUpdate;
    this.onTranscriptionResult = callbacks.onTranscriptionResult;
    this.onError = callbacks.onError;
  }

  /**
   * Update processing options
   */
  updateOptions(newOptions: Partial<AudioProcessingOptions>): void {
    this.options = { ...this.options, ...newOptions };

    // Update capture manager settings
    if (newOptions.audioLevelThreshold !== undefined) {
      this.captureManager.setLevelThreshold(newOptions.audioLevelThreshold);
    }

    // Update transcription settings
    if (this.transcriber && newOptions.transcriptionLanguage) {
      this.transcriber.setLanguage(newOptions.transcriptionLanguage);
    }
  }

  /**
   * Get current processing statistics
   */
  getStats(): ProcessingStats {
    return { ...this.processingStats };
  }

  /**
   * Get processing status
   */
  getStatus(): {
    isProcessing: boolean;
    captureStatus: any;
    transcriptionStatus: any;
  } {
    return {
      isProcessing: this.isProcessing,
      captureStatus: this.captureManager.getStatus(),
      transcriptionStatus: this.transcriber ? this.transcriber.getStatus() : null,
    };
  }

  /**
   * Check if audio processing is supported
   */
  static isSupported(): boolean {
    return AudioCaptureManager.isSupported() && WebSpeechTranscriber.isSupported();
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.isProcessing = false;

    if (this.transcriber) {
      TranscriptionFactory.disposeInstance(this.meetingId);
      this.transcriber = null;
    }

    AudioCaptureFactory.disposeInstance(this.meetingId);

    console.log('Audio processing pipeline disposed');
  }
}

// Factory for managing processing pipeline instances
export class AudioProcessingFactory {
  private static instances = new Map<string, AudioProcessingPipeline>();

  static getInstance(
    meetingId: string,
    options?: AudioProcessingOptions
  ): AudioProcessingPipeline {
    if (!this.instances.has(meetingId)) {
      this.instances.set(meetingId, new AudioProcessingPipeline(meetingId, options));
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