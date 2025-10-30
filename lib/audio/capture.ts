// lib/audio/capture.ts

import { transcriptsRepository } from '../database';

export interface AudioCaptureOptions {
  sampleRate?: number;
  channelCount?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

export interface AudioLevelData {
  timestamp: number;
  level: number; // 0-1 normalized audio level
  isActive: boolean; // Whether audio is above threshold
}

export interface AudioChunk {
  data: Float32Array;
  timestamp: number;
  duration: number;
}

export class AudioCaptureManager {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;

  private isRecording = false;
  private isPaused = false;
  private recordingStartTime = 0;
  private chunks: Blob[] = [];

  // Audio level monitoring
  private levelThreshold = 0.01; // Minimum audio level to be considered "active"
  private levelCallbacks: ((data: AudioLevelData) => void)[] = [];
  private levelMonitoringInterval: number | null = null;

  // Event callbacks
  private onDataAvailable?: (chunk: AudioChunk) => void;
  private onRecordingStart?: () => void;
  private onRecordingStop?: () => void;
  private onError?: (error: Error) => void;

  constructor(
    private meetingId: string,
    private options: AudioCaptureOptions = {}
  ) {
    this.options = {
      sampleRate: 44100,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      ...options,
    };
  }

  /**
   * Initialize audio capture with microphone permissions
   */
  async initialize(): Promise<void> {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.options.sampleRate,
          channelCount: this.options.channelCount,
          echoCancellation: this.options.echoCancellation,
          noiseSuppression: this.options.noiseSuppression,
          autoGainControl: this.options.autoGainControl,
        },
      });

      this.mediaStream = stream;

      // Initialize Web Audio API for analysis
      await this.initializeAudioContext();

      console.log('Audio capture initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio capture:', error);
      throw new Error(`Audio capture initialization failed: ${error}`);
    }
  }

  /**
   * Initialize Web Audio API context for analysis
   */
  private async initializeAudioContext(): Promise<void> {
    if (!this.mediaStream) {
      throw new Error('Media stream not available');
    }

    // Create audio context
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create analyser for audio level monitoring
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    // Connect microphone to analyser
    this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.microphone.connect(this.analyser);

    // Create processor for audio data chunks
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.microphone.connect(this.processor);
    this.processor.connect(this.audioContext.destination);

    // Set up audio processing
    this.processor.onaudioprocess = (event) => {
      if (this.isRecording && !this.isPaused) {
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);

        // Create audio chunk
        const chunk: AudioChunk = {
          data: new Float32Array(inputData),
          timestamp: this.audioContext!.currentTime * 1000,
          duration: (inputBuffer.length / this.audioContext!.sampleRate) * 1000,
        };

        // Call data available callback
        if (this.onDataAvailable) {
          this.onDataAvailable(chunk);
        }
      }
    };
  }

  /**
   * Start audio recording
   */
  async startRecording(): Promise<void> {
    if (!this.mediaStream) {
      throw new Error('Audio capture not initialized');
    }

    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    try {
      // Resume audio context if suspended (required by some browsers)
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isRecording = true;
      this.isPaused = false;
      this.recordingStartTime = Date.now();
      this.chunks = [];

      // Start level monitoring
      this.startLevelMonitoring();

      // Initialize MediaRecorder for fallback recording
      this.initializeMediaRecorder();

      if (this.onRecordingStart) {
        this.onRecordingStart();
      }

      console.log('Audio recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Pause audio recording
   */
  pauseRecording(): void {
    if (!this.isRecording) {
      throw new Error('No recording in progress');
    }

    this.isPaused = true;
    this.stopLevelMonitoring();

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }

    console.log('Audio recording paused');
  }

  /**
   * Resume audio recording
   */
  resumeRecording(): void {
    if (!this.isRecording) {
      throw new Error('No recording in progress');
    }

    if (!this.isPaused) {
      throw new Error('Recording not paused');
    }

    this.isPaused = false;
    this.startLevelMonitoring();

    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }

    console.log('Audio recording resumed');
  }

  /**
   * Stop audio recording
   */
  async stopRecording(): Promise<Blob> {
    if (!this.isRecording) {
      throw new Error('No recording in progress');
    }

    try {
      this.isRecording = false;
      this.isPaused = false;
      this.stopLevelMonitoring();

      // Stop MediaRecorder
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }

      // Wait for final chunk
      const audioBlob = await new Promise<Blob>((resolve) => {
        if (this.mediaRecorder) {
          this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              this.chunks.push(event.data);
            }
          };

          this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.chunks, { type: 'audio/webm' });
            resolve(blob);
          };
        } else {
          // Fallback: create empty blob if no MediaRecorder
          resolve(new Blob([], { type: 'audio/webm' }));
        }
      });

      if (this.onRecordingStop) {
        this.onRecordingStop();
      }

      console.log('Audio recording stopped');
      return audioBlob;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  /**
   * Initialize MediaRecorder for fallback recording
   */
  private initializeMediaRecorder(): void {
    if (!this.mediaStream) return;

    try {
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };
    } catch (error) {
      console.warn('MediaRecorder not supported or mimeType not available:', error);
      // Continue without MediaRecorder - we'll use Web Audio API only
    }
  }

  /**
   * Start audio level monitoring
   */
  private startLevelMonitoring(): void {
    if (this.levelMonitoringInterval) return;

    this.levelMonitoringInterval = window.setInterval(() => {
      if (this.analyser && this.isRecording && !this.isPaused) {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        // Calculate RMS (Root Mean Square) for audio level
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / bufferLength);
        const normalizedLevel = rms / 128; // Normalize to 0-1

        const levelData: AudioLevelData = {
          timestamp: Date.now(),
          level: normalizedLevel,
          isActive: normalizedLevel > this.levelThreshold,
        };

        // Notify callbacks
        this.levelCallbacks.forEach(callback => callback(levelData));
      }
    }, 100); // Monitor every 100ms
  }

  /**
   * Stop audio level monitoring
   */
  private stopLevelMonitoring(): void {
    if (this.levelMonitoringInterval) {
      clearInterval(this.levelMonitoringInterval);
      this.levelMonitoringInterval = null;
    }
  }

  /**
   * Add audio level monitoring callback
   */
  onAudioLevel(callback: (data: AudioLevelData) => void): void {
    this.levelCallbacks.push(callback);
  }

  /**
   * Remove audio level monitoring callback
   */
  offAudioLevel(callback: (data: AudioLevelData) => void): void {
    const index = this.levelCallbacks.indexOf(callback);
    if (index > -1) {
      this.levelCallbacks.splice(index, 1);
    }
  }

  /**
   * Set audio level threshold
   */
  setLevelThreshold(threshold: number): void {
    this.levelThreshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: {
    onDataAvailable?: (chunk: AudioChunk) => void;
    onRecordingStart?: () => void;
    onRecordingStop?: () => void;
    onError?: (error: Error) => void;
  }): void {
    this.onDataAvailable = callbacks.onDataAvailable;
    this.onRecordingStart = callbacks.onRecordingStart;
    this.onRecordingStop = callbacks.onRecordingStop;
    this.onError = callbacks.onError;
  }

  /**
   * Get current recording status
   */
  getStatus(): {
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    hasStream: boolean;
  } {
    return {
      isRecording: this.isRecording,
      isPaused: this.isPaused,
      duration: this.isRecording ? Date.now() - this.recordingStartTime : 0,
      hasStream: !!this.mediaStream,
    };
  }

  /**
   * Check if audio capture is supported
   */
  static isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      (window.AudioContext || (window as any).webkitAudioContext)
    );
  }

  /**
   * Check microphone permission status
   */
  static async checkPermission(): Promise<PermissionState> {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state;
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      return 'prompt';
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopLevelMonitoring();

    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.levelCallbacks = [];
    this.chunks = [];
    this.isRecording = false;
    this.isPaused = false;

    console.log('Audio capture disposed');
  }
}

// Singleton instance factory
export class AudioCaptureFactory {
  private static instances = new Map<string, AudioCaptureManager>();

  static getInstance(meetingId: string, options?: AudioCaptureOptions): AudioCaptureManager {
    if (!this.instances.has(meetingId)) {
      this.instances.set(meetingId, new AudioCaptureManager(meetingId, options));
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