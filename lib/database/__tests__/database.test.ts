// lib/database/__tests__/database.test.ts

import { linkaDB, meetingsRepository, transcriptsRepository, settingsRepository, processingQueueRepository } from '../index';
import { Meeting } from '@/types/meeting.types';

describe('IndexedDB Implementation', () => {
  beforeEach(async () => {
    // Clear all data before each test
    await linkaDB.clearAllData();
  });

  afterAll(async () => {
    // Close database connection after all tests
    linkaDB.close();
  });

  describe('Database Initialization', () => {
    test('should initialize database successfully', async () => {
      const db = await linkaDB.getDB();
      expect(db).toBeDefined();
      expect(db.name).toBe('LinkaDB');
      expect(db.version).toBe(1);
    });

    test('should get database statistics', async () => {
      const stats = await linkaDB.getStats();
      expect(stats).toHaveProperty('meetings');
      expect(stats).toHaveProperty('transcripts');
      expect(stats).toHaveProperty('processingQueue');
      expect(stats.meetings).toBe(0);
      expect(stats.transcripts).toBe(0);
      expect(stats.processingQueue).toBe(0);
    });
  });

  describe('Meetings Repository', () => {
    const mockMeeting: Omit<Meeting, 'id'> = {
      title: 'Test Meeting',
      timestamp: new Date(),
      duration: 60,
      participants: ['Alice', 'Bob'],
      tags: ['test', 'meeting'],
      isFavorite: false,
      transcript: 'This is a test transcript.',
      summary: 'Test meeting summary.',
      translations: [],
      actionItems: [],
    };

    test('should create and retrieve meeting', async () => {
      const created = await meetingsRepository.create(mockMeeting);
      expect(created.id).toBeDefined();
      expect(created.title).toBe(mockMeeting.title);

      const retrieved = await meetingsRepository.getById(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved!.title).toBe(mockMeeting.title);
    });

    test('should update meeting', async () => {
      const created = await meetingsRepository.create(mockMeeting);
      const updated = await meetingsRepository.update(created.id, { title: 'Updated Title' });

      expect(updated).toBeDefined();
      expect(updated!.title).toBe('Updated Title');
    });

    test('should delete meeting', async () => {
      const created = await meetingsRepository.create(mockMeeting);
      const deleted = await meetingsRepository.delete(created.id);

      expect(deleted).toBe(true);

      const retrieved = await meetingsRepository.getById(created.id);
      expect(retrieved).toBeNull();
    });

    test('should search meetings', async () => {
      await meetingsRepository.create(mockMeeting);
      await meetingsRepository.create({
        ...mockMeeting,
        title: 'Another Meeting',
        transcript: 'Different content',
      });

      const results = await meetingsRepository.search('test');
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Test Meeting');
    });

    test('should get favorite meetings', async () => {
      await meetingsRepository.create(mockMeeting);
      await meetingsRepository.create({
        ...mockMeeting,
        title: 'Favorite Meeting',
        isFavorite: true,
      });

      const favorites = await meetingsRepository.getFavorites();
      expect(favorites.length).toBe(1);
      expect(favorites[0].title).toBe('Favorite Meeting');
    });
  });

  describe('Transcripts Repository', () => {
    const meetingId = 'test-meeting-123';

    test('should save and retrieve transcript chunk', async () => {
      const chunk = await transcriptsRepository.save({
        meetingId,
        timestamp: 1000,
        speaker: 'Alice',
        content: 'Hello world',
        confidence: 0.95,
      });

      expect(chunk.id).toBeDefined();
      expect(chunk.content).toBe('Hello world');

      const retrieved = await transcriptsRepository.getById(chunk.id);
      expect(retrieved).toBeDefined();
      expect(retrieved!.content).toBe('Hello world');
    });

    test('should get transcripts by meeting ID', async () => {
      await transcriptsRepository.save({
        meetingId,
        timestamp: 1000,
        content: 'First message',
      });

      await transcriptsRepository.save({
        meetingId,
        timestamp: 2000,
        content: 'Second message',
      });

      await transcriptsRepository.save({
        meetingId: 'other-meeting',
        timestamp: 1000,
        content: 'Other meeting message',
      });

      const meetingTranscripts = await transcriptsRepository.getByMeetingId(meetingId);
      expect(meetingTranscripts.length).toBe(2);
    });

    test('should get full transcript text', async () => {
      await transcriptsRepository.save({
        meetingId,
        timestamp: 1000,
        speaker: 'Alice',
        content: 'Hello',
      });

      await transcriptsRepository.save({
        meetingId,
        timestamp: 2000,
        speaker: 'Bob',
        content: 'Hi there',
      });

      const fullTranscript = await transcriptsRepository.getFullTranscript(meetingId);
      expect(fullTranscript).toContain('Alice: Hello');
      expect(fullTranscript).toContain('Bob: Hi there');
    });
  });

  describe('Settings Repository', () => {
    test('should get and update global settings', async () => {
      const settings = await settingsRepository.getGlobalSettings();
      expect(settings).toBeDefined();
      expect(settings.id).toBe('global');

      const updated = await settingsRepository.updateGlobalSettings({
        transcription: { language: 'es-ES' },
      });

      expect(updated.transcription.language).toBe('es-ES');
    });

    test('should validate settings', async () => {
      const validation = settingsRepository.validateSettings({
        transcription: { language: 'invalid-lang' },
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Processing Queue Repository', () => {
    test('should enqueue and dequeue items', async () => {
      const item = await processingQueueRepository.enqueue({
        meetingId: 'test-meeting',
        type: 'summarize',
        status: 'pending',
        priority: 'high',
        data: { text: 'test content' },
      });

      expect(item.id).toBeDefined();
      expect(item.status).toBe('pending');

      const nextItem = await processingQueueRepository.getNextPending();
      expect(nextItem).toBeDefined();
      expect(nextItem!.id).toBe(item.id);
    });

    test('should update item status', async () => {
      const item = await processingQueueRepository.enqueue({
        meetingId: 'test-meeting',
        type: 'summarize',
        status: 'pending',
        priority: 'high',
        data: { text: 'test content' },
      });

      const updated = await processingQueueRepository.markAsCompleted(item.id, { summary: 'completed' });
      expect(updated!.status).toBe('completed');
      expect(updated!.result).toEqual({ summary: 'completed' });
    });
  });

  describe('Data Export/Import', () => {
    test('should export and import data', async () => {
      // Create some test data
      await meetingsRepository.create({
        title: 'Export Test Meeting',
        timestamp: new Date(),
        duration: 30,
        participants: ['Test User'],
        tags: ['test'],
        isFavorite: false,
        transcript: 'Test transcript',
        summary: 'Test summary',
        translations: [],
        actionItems: [],
      });

      // Export data
      const exportedData = await linkaDB.exportData();
      expect(typeof exportedData).toBe('string');

      // Clear data
      await linkaDB.clearAllData();

      // Import data
      await linkaDB.importData(exportedData);

      // Verify data was imported
      const meetings = await meetingsRepository.getAll();
      expect(meetings.length).toBe(1);
      expect(meetings[0].title).toBe('Export Test Meeting');
    });
  });
});