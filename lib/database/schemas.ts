// lib/database/schemas.ts

import { Meeting, Translation, ActionItem } from "@/types/meeting.types";

// Database version and store names
export const DB_NAME = 'LinkaDB';
export const DB_VERSION = 1;

export const STORES = {
  MEETINGS: 'meetings',
  TRANSCRIPTS: 'transcripts',
  SETTINGS: 'settings',
  PROCESSING_QUEUE: 'processing_queue',
} as const;

// Object store schemas
export interface MeetingRecord extends Meeting {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TranscriptChunk {
  id: string;
  meetingId: string;
  timestamp: number; // Unix timestamp
  speaker?: string;
  content: string;
  confidence?: number;
  highlights?: string[];
  createdAt: Date;
}

export interface SettingsRecord {
  id: string; // 'global' for global settings
  transcription: {
    language: string;
    continuous: boolean;
    interimResults: boolean;
  };
  ai: {
    summaryStyle: 'tl;dr' | 'key-points' | 'teaser' | 'headline';
    summaryLength: 'short' | 'medium' | 'long';
    translationTargetLanguage: string;
    writerTone: string;
    rewriterTone: string;
  };
  privacy: {
    dataRetentionDays: number;
    autoDeleteOldMeetings: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    autoScroll: boolean;
    showSpeakerLabels: boolean;
  };
  updatedAt: Date;
}

export interface ProcessingQueueItem {
  id: string;
  meetingId: string;
  type: 'summarize' | 'translate' | 'proofread' | 'rewrite';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  data: any; // Type-specific data
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Database schema definition for migrations
export const DB_SCHEMAS = {
  [DB_VERSION]: {
    stores: {
      [STORES.MEETINGS]: {
        keyPath: 'id',
        indexes: {
          'by-date': 'timestamp',
          'by-title': 'title',
          'by-favorite': 'isFavorite',
          'by-tags': 'tags',
        },
      },
      [STORES.TRANSCRIPTS]: {
        keyPath: 'id',
        indexes: {
          'by-meeting': 'meetingId',
          'by-timestamp': 'timestamp',
          'by-speaker': 'speaker',
        },
      },
      [STORES.SETTINGS]: {
        keyPath: 'id',
        indexes: {},
      },
      [STORES.PROCESSING_QUEUE]: {
        keyPath: 'id',
        indexes: {
          'by-meeting': 'meetingId',
          'by-status': 'status',
          'by-type': 'type',
          'by-priority': 'priority',
        },
      },
    },
  },
};

// Default settings
export const DEFAULT_SETTINGS: Omit<SettingsRecord, 'id' | 'updatedAt'> = {
  transcription: {
    language: 'en-US',
    continuous: true,
    interimResults: true,
  },
  ai: {
    summaryStyle: 'key-points',
    summaryLength: 'medium',
    translationTargetLanguage: 'es',
    writerTone: 'professional',
    rewriterTone: 'more-formal',
  },
  privacy: {
    dataRetentionDays: 365,
    autoDeleteOldMeetings: false,
  },
  ui: {
    theme: 'auto',
    autoScroll: true,
    showSpeakerLabels: true,
  },
};

// Data validation schemas
export const VALIDATION_RULES = {
  meeting: {
    title: { required: true, maxLength: 200 },
    duration: { min: 0, max: 480 }, // 0-8 hours
    participants: { maxItems: 100 },
    tags: { maxItems: 20, maxLength: 50 },
  },
  transcript: {
    content: { required: true, maxLength: 10000 },
    speaker: { maxLength: 100 },
    confidence: { min: 0, max: 1 },
  },
  settings: {
    transcription: {
      language: { pattern: /^[a-z]{2}(-[A-Z]{2})?$/ },
    },
  },
} as const;