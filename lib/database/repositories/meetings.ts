// lib/database/repositories/meetings.ts

import { MeetingRecord } from '../schemas';
import { dbUtils } from '../indexeddb';
import { STORES } from '../schemas';
import { Meeting } from '@/types/meeting.types';

export class MeetingsRepository {
  /**
   * Create a new meeting
   */
  async create(meeting: Omit<Meeting, 'id'>): Promise<MeetingRecord> {
    const now = new Date();
    const meetingRecord: MeetingRecord = {
      ...meeting,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    await dbUtils.put(STORES.MEETINGS, meetingRecord);
    return meetingRecord;
  }

  /**
   * Get meeting by ID
   */
  async getById(id: string): Promise<MeetingRecord | null> {
    return await dbUtils.getByKey<MeetingRecord>(STORES.MEETINGS, id) || null;
  }

  /**
   * Get all meetings
   */
  async getAll(): Promise<MeetingRecord[]> {
    return await dbUtils.getAll<MeetingRecord>(STORES.MEETINGS);
  }

  /**
   * Update meeting
   */
  async update(id: string, updates: Partial<Omit<MeetingRecord, 'id' | 'createdAt'>>): Promise<MeetingRecord | null> {
    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }

    const updated: MeetingRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    await dbUtils.put(STORES.MEETINGS, updated);
    return updated;
  }

  /**
   * Delete meeting
   */
  async delete(id: string): Promise<boolean> {
    try {
      await dbUtils.delete(STORES.MEETINGS, id);
      return true;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      return false;
    }
  }

  /**
   * Search meetings by query
   */
  async search(query: string): Promise<MeetingRecord[]> {
    const allMeetings = await this.getAll();
    const lowerQuery = query.toLowerCase();

    return allMeetings.filter(meeting =>
      meeting.title.toLowerCase().includes(lowerQuery) ||
      meeting.participants.some(p => p.toLowerCase().includes(lowerQuery)) ||
      meeting.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
      meeting.transcript.toLowerCase().includes(lowerQuery) ||
      meeting.summary.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get meetings by date range
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<MeetingRecord[]> {
    const keyRange = IDBKeyRange.bound(startDate, endDate);
    return await dbUtils.queryByIndex<MeetingRecord>(STORES.MEETINGS, 'by-date', keyRange);
  }

  /**
   * Get favorite meetings
   */
  async getFavorites(): Promise<MeetingRecord[]> {
    const allMeetings = await this.getAll();
    return allMeetings.filter(meeting => meeting.isFavorite);
  }

  /**
   * Get meetings by tag
   */
  async getByTag(tag: string): Promise<MeetingRecord[]> {
    const allMeetings = await this.getAll();
    return allMeetings.filter(meeting => meeting.tags.includes(tag));
  }

  /**
   * Get meetings by participant
   */
  async getByParticipant(participant: string): Promise<MeetingRecord[]> {
    const allMeetings = await this.getAll();
    return allMeetings.filter(meeting =>
      meeting.participants.some(p => p.toLowerCase().includes(participant.toLowerCase()))
    );
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id: string): Promise<MeetingRecord | null> {
    const meeting = await this.getById(id);
    if (!meeting) {
      return null;
    }

    return await this.update(id, { isFavorite: !meeting.isFavorite });
  }

  /**
   * Get recent meetings (last N meetings)
   */
  async getRecent(limit: number = 10): Promise<MeetingRecord[]> {
    const allMeetings = await this.getAll();
    return allMeetings
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Bulk delete meetings
   */
  async bulkDelete(ids: string[]): Promise<number> {
    let deletedCount = 0;

    for (const id of ids) {
      if (await this.delete(id)) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get meeting statistics
   */
  async getStats(): Promise<{
    total: number;
    favorites: number;
    totalDuration: number;
    averageDuration: number;
    dateRange: { earliest: Date | null; latest: Date | null };
  }> {
    const meetings = await this.getAll();

    if (meetings.length === 0) {
      return {
        total: 0,
        favorites: 0,
        totalDuration: 0,
        averageDuration: 0,
        dateRange: { earliest: null, latest: null },
      };
    }

    const favorites = meetings.filter(m => m.isFavorite).length;
    const totalDuration = meetings.reduce((sum, m) => sum + m.duration, 0);
    const sortedByDate = meetings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return {
      total: meetings.length,
      favorites,
      totalDuration,
      averageDuration: Math.round(totalDuration / meetings.length),
      dateRange: {
        earliest: sortedByDate[0].timestamp,
        latest: sortedByDate[sortedByDate.length - 1].timestamp,
      },
    };
  }

  /**
   * Generate unique ID for meetings
   */
  private generateId(): string {
    return `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const meetingsRepository = new MeetingsRepository();