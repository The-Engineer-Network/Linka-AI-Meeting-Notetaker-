// lib/database/validation.ts

import { VALIDATION_RULES } from './schemas';
import { MeetingRecord, TranscriptChunk, SettingsRecord } from './schemas';
import { Meeting } from '@/types/meeting.types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate meeting data
 */
export function validateMeeting(meeting: Partial<Meeting>): ValidationResult {
  const errors: string[] = [];
  const rules = VALIDATION_RULES.meeting;

  // Required fields
  if (!meeting.title || meeting.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (meeting.title.length > rules.title.maxLength) {
    errors.push(`Title must be less than ${rules.title.maxLength} characters`);
  }

  // Duration validation
  if (meeting.duration !== undefined) {
    if (meeting.duration < rules.duration.min) {
      errors.push(`Duration must be at least ${rules.duration.min} minutes`);
    } else if (meeting.duration > rules.duration.max) {
      errors.push(`Duration must be less than ${rules.duration.max} minutes`);
    }
  }

  // Participants validation
  if (meeting.participants && meeting.participants.length > rules.participants.maxItems) {
    errors.push(`Cannot have more than ${rules.participants.maxItems} participants`);
  }

  // Tags validation
  if (meeting.tags) {
    if (meeting.tags.length > rules.tags.maxItems) {
      errors.push(`Cannot have more than ${rules.tags.maxItems} tags`);
    }

    meeting.tags.forEach((tag: string, index: number) => {
      if (tag.length > rules.tags.maxLength) {
        errors.push(`Tag ${index + 1} must be less than ${rules.tags.maxLength} characters`);
      }
    });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate transcript chunk
 */
export function validateTranscriptChunk(chunk: Partial<TranscriptChunk>): ValidationResult {
  const errors: string[] = [];
  const rules = VALIDATION_RULES.transcript;

  // Required fields
  if (!chunk.content || chunk.content.trim().length === 0) {
    errors.push('Content is required');
  } else if (chunk.content.length > rules.content.maxLength) {
    errors.push(`Content must be less than ${rules.content.maxLength} characters`);
  }

  // Speaker validation
  if (chunk.speaker && chunk.speaker.length > rules.speaker.maxLength) {
    errors.push(`Speaker name must be less than ${rules.speaker.maxLength} characters`);
  }

  // Confidence validation
  if (chunk.confidence !== undefined) {
    if (chunk.confidence < rules.confidence.min || chunk.confidence > rules.confidence.max) {
      errors.push('Confidence must be between 0 and 1');
    }
  }

  // Meeting ID validation
  if (!chunk.meetingId) {
    errors.push('Meeting ID is required');
  }

  // Timestamp validation
  if (chunk.timestamp === undefined || chunk.timestamp < 0) {
    errors.push('Valid timestamp is required');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate settings
 */
export function validateSettings(settings: Partial<SettingsRecord>): ValidationResult {
  const errors: string[] = [];
  const rules = VALIDATION_RULES.settings;

  // Transcription settings
  if (settings.transcription) {
    const { language } = settings.transcription;
    if (language && !rules.transcription.language.pattern.test(language)) {
      errors.push('Invalid language format. Use format like "en" or "en-US"');
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength?: number): string {
  if (!input) return '';

  let sanitized = input.trim();

  // Remove potentially harmful characters
  sanitized = sanitized.replace(/[<>\"'&]/g, '');

  // Limit length if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitize array of strings
 */
export function sanitizeStringArray(input: string[], maxItems?: number, maxLength?: number): string[] {
  if (!Array.isArray(input)) return [];

  let sanitized = input
    .filter(item => typeof item === 'string' && item.trim().length > 0)
    .map(item => sanitizeString(item, maxLength));

  // Limit array size if specified
  if (maxItems && sanitized.length > maxItems) {
    sanitized = sanitized.slice(0, maxItems);
  }

  return sanitized;
}

/**
 * Validate and sanitize meeting data
 */
export function validateAndSanitizeMeeting(meeting: Partial<Meeting>): { data: Partial<Meeting>; validation: ValidationResult } {
  const sanitized: Partial<Meeting> = {
    ...meeting,
  };

  // Sanitize strings
  if (meeting.title) {
    sanitized.title = sanitizeString(meeting.title, VALIDATION_RULES.meeting.title.maxLength);
  }

  if (meeting.participants) {
    sanitized.participants = sanitizeStringArray(meeting.participants, VALIDATION_RULES.meeting.participants.maxItems);
  }

  if (meeting.tags) {
    sanitized.tags = sanitizeStringArray(meeting.tags, VALIDATION_RULES.meeting.tags.maxItems, VALIDATION_RULES.meeting.tags.maxLength);
  }

  if (meeting.transcript) {
    sanitized.transcript = sanitizeString(meeting.transcript);
  }

  if (meeting.summary) {
    sanitized.summary = sanitizeString(meeting.summary);
  }

  // Validate sanitized data
  const validation = validateMeeting(sanitized);

  return { data: sanitized, validation };
}

/**
 * Validate and sanitize transcript chunk
 */
export function validateAndSanitizeTranscriptChunk(chunk: Partial<TranscriptChunk>): { data: Partial<TranscriptChunk>; validation: ValidationResult } {
  const sanitized: Partial<TranscriptChunk> = {
    ...chunk,
  };

  // Sanitize strings
  if (chunk.content) {
    sanitized.content = sanitizeString(chunk.content, VALIDATION_RULES.transcript.content.maxLength);
  }

  if (chunk.speaker) {
    sanitized.speaker = sanitizeString(chunk.speaker, VALIDATION_RULES.transcript.speaker.maxLength);
  }

  if (chunk.highlights) {
    sanitized.highlights = sanitizeStringArray(chunk.highlights);
  }

  // Validate sanitized data
  const validation = validateTranscriptChunk(sanitized);

  return { data: sanitized, validation };
}

/**
 * Check data integrity for existing records
 */
export function checkDataIntegrity(record: any, type: 'meeting' | 'transcript' | 'settings'): ValidationResult {
  switch (type) {
    case 'meeting':
      return validateMeeting(record as Partial<Meeting>);
    case 'transcript':
      return validateTranscriptChunk(record as Partial<TranscriptChunk>);
    case 'settings':
      return validateSettings(record as Partial<SettingsRecord>);
    default:
      return { isValid: false, errors: ['Unknown record type'] };
  }
}