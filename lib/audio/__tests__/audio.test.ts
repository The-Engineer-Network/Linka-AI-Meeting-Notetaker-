// lib/audio/__tests__/audio.test.ts

import { AudioCaptureManager, AudioCaptureFactory } from '../capture';
import { WebSpeechTranscriber, TranscriptionFactory } from '../transcription/web-speech';
import { AudioProcessingPipeline, AudioProcessingFactory } from '../processing';
import { AudioManager, AudioManagerFactory } from '../index';

// Mock the Web Speech API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  onstart: null,
  onend: null,
  onerror: null,
  onresult: null,
};

const mockGetUserMedia = jest.fn();

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

// Mock Web Speech API
Object.defineProperty(window, 'SpeechRecognition', {
  value: jest.fn().mockImplementation(() => mockSpeechRecognition),
  writable: true,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: jest.fn().mockImplementation(() => mockSpeechRecognition),
  writable: true,
});

// Mock AudioContext
const mockAudioContext = {
  createAnalyser: jest.fn(() => ({
    fftSize: 256,
    smoothingTimeConstant: 0.8,
    getByteFrequencyData: jest.fn(),
  })),
  createMediaStreamSource: jest.fn(() => ({
    connect: jest.fn(),
  })),
  createScriptProcessor: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    onaudioprocess: null,
  })),
  resume: jest.fn(),
  close: jest.fn(),
  sampleRate: 44100,
  currentTime: 0,
};

Object.defineProperty(window, 'AudioContext', {
  value: jest.fn().mockImplementation(() => mockAudioContext),
  writable: true,
});

Object.defineProperty(window, 'webkitAudioContext', {
  value: jest.fn().mockImplementation(() => mockAudioContext),
  writable: true,
});

describe('Audio Processing System', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock successful getUserMedia
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{
        stop: jest.fn(),
      }],
    });
  });

  afterEach(() => {
    // Clean up instances
    AudioCaptureFactory.disposeAll();
    TranscriptionFactory.disposeAll();
    AudioProcessingFactory.disposeAll();
    AudioManagerFactory.disposeAll();
  });

  describe('AudioCaptureManager', () => {
    test('should check if audio capture is supported', () => {
      expect(AudioCaptureManager.isSupported()).toBe(true);
    });

    test('should initialize audio capture', async () => {
      const manager = new AudioCaptureManager('test-meeting');

      await manager.initialize();

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    });

    test('should start and stop recording', async () => {
      const manager = new AudioCaptureManager('test-meeting');
      await manager.initialize();

      await manager.startRecording();
      expect(manager.getStatus().isRecording).toBe(true);

      const blob = await manager.stopRecording();
      expect(manager.getStatus().isRecording).toBe(false);
      expect(blob).toBeInstanceOf(Blob);
    });

    test('should handle audio level monitoring', async () => {
      const manager = new AudioCaptureManager('test-meeting');
      await manager.initialize();

      const levelCallback = jest.fn();
      manager.onAudioLevel(levelCallback);

      await manager.startRecording();

      // Simulate some audio level data
      // (In real scenario, this would come from the audio processing)

      manager.offAudioLevel(levelCallback);
    });
  });

  describe('WebSpeechTranscriber', () => {
    test('should check if speech recognition is supported', () => {
      expect(WebSpeechTranscriber.isSupported()).toBe(true);
    });

    test('should initialize speech recognition', () => {
      const transcriber = new WebSpeechTranscriber('test-meeting');

      expect(transcriber.getStatus().language).toBe('en-US');
      expect(transcriber.getStatus().continuous).toBe(true);
    });

    test('should start and stop transcription', async () => {
      const transcriber = new WebSpeechTranscriber('test-meeting');

      await transcriber.start();
      expect(mockSpeechRecognition.start).toHaveBeenCalled();

      transcriber.stop();
      expect(mockSpeechRecognition.stop).toHaveBeenCalled();
    });

    test('should handle transcription results', () => {
      const transcriber = new WebSpeechTranscriber('test-meeting');
      const resultCallback = jest.fn();

      transcriber.setCallbacks({
        onResult: resultCallback,
      });

      // Simulate speech recognition result
      const mockResult = {
        results: [{
          [0]: {
            transcript: 'Hello world',
            confidence: 0.9,
          },
          isFinal: true,
        }],
      };

      // Trigger the onresult callback
      if (mockSpeechRecognition.onresult) {
        mockSpeechRecognition.onresult(mockResult as any);
      }

      // Note: In a real test, we'd need to wait for async database operations
      // For now, we just verify the callback setup
    });
  });

  describe('AudioProcessingPipeline', () => {
    test('should check if processing is supported', () => {
      expect(AudioProcessingPipeline.isSupported()).toBe(true);
    });

    test('should initialize processing pipeline', async () => {
      const pipeline = new AudioProcessingPipeline('test-meeting');

      await pipeline.initialize();

      expect(pipeline.getStatus().captureStatus.hasStream).toBeDefined();
    });

    test('should start and stop processing', async () => {
      const pipeline = new AudioProcessingPipeline('test-meeting');
      await pipeline.initialize();

      await pipeline.startProcessing();
      expect(pipeline.getStatus().isProcessing).toBe(true);

      await pipeline.stopProcessing();
      expect(pipeline.getStatus().isProcessing).toBe(false);
    });

    test('should handle processing statistics', async () => {
      const pipeline = new AudioProcessingPipeline('test-meeting');
      const statsCallback = jest.fn();

      pipeline.setCallbacks({
        onStatsUpdate: statsCallback,
      });

      await pipeline.initialize();
      await pipeline.startProcessing();

      // Statistics should be updated
      const stats = pipeline.getStats();
      expect(stats).toHaveProperty('meetingId');
      expect(stats).toHaveProperty('totalAudioChunks');

      await pipeline.stopProcessing();
    });
  });

  describe('AudioManager', () => {
    test('should check if audio processing is supported', () => {
      expect(AudioManager.isSupported()).toBe(true);
    });

    test('should manage audio processing lifecycle', async () => {
      const manager = new AudioManager('test-meeting');

      await manager.initialize();

      await manager.startRecording();
      expect(manager.getStatus().isProcessing).toBe(true);

      await manager.stopRecording();
      expect(manager.getStatus().isProcessing).toBe(false);

      manager.dispose();
    });

    test('should handle processing options', async () => {
      const manager = new AudioManager('test-meeting');

      await manager.initialize({
        enableTranscription: false,
        transcriptionLanguage: 'es-ES',
      });

      manager.updateOptions({
        audioLevelThreshold: 0.05,
      });

      manager.dispose();
    });
  });

  describe('Factory Classes', () => {
    test('AudioCaptureFactory should manage instances', () => {
      const instance1 = AudioCaptureFactory.getInstance('meeting1');
      const instance2 = AudioCaptureFactory.getInstance('meeting1');
      const instance3 = AudioCaptureFactory.getInstance('meeting2');

      expect(instance1).toBe(instance2);
      expect(instance1).not.toBe(instance3);

      AudioCaptureFactory.disposeAll();
    });

    test('AudioManagerFactory should manage instances', () => {
      const instance1 = AudioManagerFactory.getInstance('meeting1');
      const instance2 = AudioManagerFactory.getInstance('meeting1');
      const instance3 = AudioManagerFactory.getInstance('meeting2');

      expect(instance1).toBe(instance2);
      expect(instance1).not.toBe(instance3);

      AudioManagerFactory.disposeAll();
    });
  });

  describe('Error Handling', () => {
    test('should handle microphone permission denied', async () => {
      mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

      const manager = new AudioCaptureManager('test-meeting');

      await expect(manager.initialize()).rejects.toThrow('Audio capture initialization failed');
    });

    test('should handle speech recognition errors', async () => {
      const transcriber = new WebSpeechTranscriber('test-meeting');
      const errorCallback = jest.fn();

      transcriber.setCallbacks({
        onError: errorCallback,
      });

      // Simulate error
      if (mockSpeechRecognition.onerror) {
        mockSpeechRecognition.onerror({
          error: 'network',
          message: 'Network error',
        } as any);
      }

      // Error callback should be called
      expect(errorCallback).toHaveBeenCalled();
    });
  });
});