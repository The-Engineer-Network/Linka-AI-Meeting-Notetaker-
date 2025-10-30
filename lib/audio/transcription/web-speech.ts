// lib/audio/transcription/web-speech.ts

import { transcriptsRepository } from '../../database';

export interface TranscriptionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
}

export interface SpeakerIdentification {
  speaker: string;
  confidence: number;
}

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

export class WebSpeechTranscriber {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private currentLanguage = 'en-US';
  private continuousMode = true;
  private interimResults = true;

  // Event callbacks
  private onResult?: (result: TranscriptionResult) => void;
  private onError?: (error: Error) => void;
  private onStart?: () => void;
  private onEnd?: () => void;

  // Speaker identification
  private speakerIdentificationEnabled = false;
  private speakerHistory: Map<string, number> = new Map();
  private lastSpeaker = '';
  private speakerChangeThreshold = 2000; // 2 seconds

  constructor(
    private meetingId: string,
    options: TranscriptionOptions = {}
  ) {
    this.currentLanguage = options.language || 'en-US';
    this.continuousMode = options.continuous !== false;
    this.interimResults = options.interimResults !== false;

    this.initializeRecognition();
  }

  /**
   * Initialize speech recognition
   */
  private initializeRecognition(): void {
    // Check for Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error('Web Speech API not supported in this browser');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.currentLanguage;
    this.recognition.continuous = this.continuousMode;
    this.recognition.interimResults = this.interimResults;
    this.recognition.maxAlternatives = 1;

    // Set up event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Speech recognition started');
      if (this.onStart) {
        this.onStart();
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('Speech recognition ended');
      if (this.onEnd) {
        this.onEnd();
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      const error = new Error(`Speech recognition error: ${event.error}`);
      if (this.onError) {
        this.onError(error);
      }
    };

    this.recognition.onresult = (event) => {
      this.handleRecognitionResult(event);
    };
  }

  /**
   * Handle speech recognition results
   */
  private async handleRecognitionResult(event: SpeechRecognitionEvent): Promise<void> {
    const results = event.results;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const transcript = result[0].transcript.trim();
      const confidence = result[0].confidence || 0.5; // Fallback confidence

      if (transcript) {
        // Identify speaker if enabled
        const speaker = this.speakerIdentificationEnabled
          ? this.identifySpeaker(transcript)
          : undefined;

        const transcriptionResult: TranscriptionResult = {
          transcript,
          confidence,
          isFinal: result.isFinal,
          timestamp: Date.now(),
        };

        // Call result callback
        if (this.onResult) {
          this.onResult(transcriptionResult);
        }

        // Save to database if final result
        if (result.isFinal) {
          try {
            await transcriptsRepository.save({
              meetingId: this.meetingId,
              timestamp: transcriptionResult.timestamp,
              speaker: speaker,
              content: transcript,
              confidence: confidence,
            });
          } catch (error) {
            console.error('Failed to save transcript:', error);
          }
        }
      }
    }
  }

  /**
   * Basic speaker identification based on text patterns and timing
   */
  private identifySpeaker(transcript: string): string {
    const now = Date.now();
    const timeSinceLastSpeaker = now - (this.speakerHistory.get(this.lastSpeaker) || 0);

    // Simple heuristics for speaker identification
    if (timeSinceLastSpeaker > this.speakerChangeThreshold) {
      // Likely a different speaker
      const speakers = ['Speaker 1', 'Speaker 2', 'Speaker 3'];
      const currentIndex = speakers.indexOf(this.lastSpeaker);

      if (currentIndex === -1 || currentIndex === speakers.length - 1) {
        this.lastSpeaker = speakers[0];
      } else {
        this.lastSpeaker = speakers[currentIndex + 1];
      }
    }

    // Update speaker history
    this.speakerHistory.set(this.lastSpeaker, now);

    return this.lastSpeaker;
  }

  /**
   * Start speech recognition
   */
  async start(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not initialized');
    }

    if (this.isListening) {
      throw new Error('Speech recognition already listening');
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      throw error;
    }
  }

  /**
   * Stop speech recognition
   */
  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Abort speech recognition
   */
  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
    }
  }

  /**
   * Set language for recognition
   */
  setLanguage(language: string): void {
    this.currentLanguage = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  /**
   * Enable or disable continuous mode
   */
  setContinuous(continuous: boolean): void {
    this.continuousMode = continuous;
    if (this.recognition) {
      this.recognition.continuous = continuous;
    }
  }

  /**
   * Enable or disable interim results
   */
  setInterimResults(interimResults: boolean): void {
    this.interimResults = interimResults;
    if (this.recognition) {
      this.recognition.interimResults = interimResults;
    }
  }

  /**
   * Enable or disable speaker identification
   */
  setSpeakerIdentification(enabled: boolean): void {
    this.speakerIdentificationEnabled = enabled;
  }

  /**
   * Set speaker change threshold (in milliseconds)
   */
  setSpeakerChangeThreshold(threshold: number): void {
    this.speakerChangeThreshold = Math.max(500, threshold); // Minimum 500ms
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: {
    onResult?: (result: TranscriptionResult) => void;
    onError?: (error: Error) => void;
    onStart?: () => void;
    onEnd?: () => void;
  }): void {
    this.onResult = callbacks.onResult;
    this.onError = callbacks.onError;
    this.onStart = callbacks.onStart;
    this.onEnd = callbacks.onEnd;
  }

  /**
   * Get current status
   */
  getStatus(): {
    isListening: boolean;
    language: string;
    continuous: boolean;
    interimResults: boolean;
    speakerIdentification: boolean;
  } {
    return {
      isListening: this.isListening,
      language: this.currentLanguage,
      continuous: this.continuousMode,
      interimResults: this.interimResults,
      speakerIdentification: this.speakerIdentificationEnabled,
    };
  }

  /**
   * Check if Web Speech API is supported
   */
  static isSupported(): boolean {
    return !!(
      window.SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  /**
   * Get available languages (limited browser support)
   */
  static getAvailableLanguages(): string[] {
    // Most browsers don't expose available languages
    // This is a common fallback list
    return [
      'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN',
      'es-ES', 'es-MX', 'es-AR', 'es-CO', 'es-CL',
      'fr-FR', 'fr-CA', 'de-DE', 'it-IT', 'pt-BR',
      'pt-PT', 'ru-RU', 'ja-JP', 'ko-KR', 'zh-CN',
      'zh-TW', 'ar-SA', 'hi-IN', 'nl-NL', 'sv-SE'
    ];
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    this.recognition = null;
    this.speakerHistory.clear();

    console.log('Web Speech Transcriber disposed');
  }
}

// Factory for managing transcription instances
export class TranscriptionFactory {
  private static instances = new Map<string, WebSpeechTranscriber>();

  static getInstance(
    meetingId: string,
    options?: TranscriptionOptions
  ): WebSpeechTranscriber {
    if (!this.instances.has(meetingId)) {
      this.instances.set(meetingId, new WebSpeechTranscriber(meetingId, options));
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