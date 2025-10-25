// lib/database/repositories/transcripts.ts

import { TranscriptChunk } from '../schemas';
import { dbUtils } from '../indexeddb';
import { STORES } from '../schemas';

export class TranscriptsRepository {
  /**
   * Save transcript chunk
   */
  async save(chunk: Omit<TranscriptChunk, 'id' | 'createdAt'>): Promise<TranscriptChunk> {
    const transcriptChunk: TranscriptChunk = {
      ...chunk,
      id: this.generateId(),
      createdAt: new Date(),
    };

    await dbUtils.put(STORES.TRANSCRIPTS, transcriptChunk);
    return transcriptChunk;
  }

  /**
   * Get transcript chunk by ID
   */
  async getById(id: string): Promise<TranscriptChunk | null> {
    return await dbUtils.getByKey<TranscriptChunk>(STORES.TRANSCRIPTS, id) || null;
  }

  /**
   * Get all transcript chunks for a meeting
   */
  async getByMeetingId(meetingId: string): Promise<TranscriptChunk[]> {
    const keyRange = IDBKeyRange.only(meetingId);
    return await dbUtils.queryByIndex<TranscriptChunk>(STORES.TRANSCRIPTS, 'by-meeting', keyRange);
  }

  /**
   * Get transcript chunks by timestamp range
   */
  async getByTimestampRange(meetingId: string, startTime: number, endTime: number): Promise<TranscriptChunk[]> {
    const meetingChunks = await this.getByMeetingId(meetingId);
    return meetingChunks.filter(chunk =>
      chunk.timestamp >= startTime && chunk.timestamp <= endTime
    );
  }

  /**
   * Get transcript chunks by speaker
   */
  async getBySpeaker(meetingId: string, speaker: string): Promise<TranscriptChunk[]> {
    const meetingChunks = await this.getByMeetingId(meetingId);
    return meetingChunks.filter(chunk => chunk.speaker === speaker);
  }

  /**
   * Search transcript content
   */
  async search(meetingId: string, query: string): Promise<TranscriptChunk[]> {
    const meetingChunks = await this.getByMeetingId(meetingId);
    const lowerQuery = query.toLowerCase();

    return meetingChunks.filter(chunk =>
      chunk.content.toLowerCase().includes(lowerQuery) ||
      (chunk.speaker && chunk.speaker.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Update transcript chunk
   */
  async update(id: string, updates: Partial<Omit<TranscriptChunk, 'id' | 'meetingId' | 'createdAt'>>): Promise<TranscriptChunk | null> {
    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }

    const updated: TranscriptChunk = {
      ...existing,
      ...updates,
    };

    await dbUtils.put(STORES.TRANSCRIPTS, updated);
    return updated;
  }

  /**
   * Delete transcript chunk
   */
  async delete(id: string): Promise<boolean> {
    try {
      await dbUtils.delete(STORES.TRANSCRIPTS, id);
      return true;
    } catch (error) {
      console.error('Error deleting transcript chunk:', error);
      return false;
    }
  }

  /**
   * Delete all transcript chunks for a meeting
   */
  async deleteByMeetingId(meetingId: string): Promise<number> {
    const chunks = await this.getByMeetingId(meetingId);
    let deletedCount = 0;

    for (const chunk of chunks) {
      if (await this.delete(chunk.id)) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get full transcript text for a meeting
   */
  async getFullTranscript(meetingId: string): Promise<string> {
    const chunks = await this.getByMeetingId(meetingId);

    // Sort by timestamp
    chunks.sort((a, b) => a.timestamp - b.timestamp);

    return chunks.map(chunk => {
      const speaker = chunk.speaker ? `${chunk.speaker}: ` : '';
      return `${speaker}${chunk.content}`;
    }).join('\n\n');
  }

  /**
   * Get transcript statistics for a meeting
   */
  async getStats(meetingId: string): Promise<{
    totalChunks: number;
    totalWords: number;
    speakers: string[];
    duration: number; // in seconds
    confidence: number; // average confidence
  }> {
    const chunks = await this.getByMeetingId(meetingId);

    if (chunks.length === 0) {
      return {
        totalChunks: 0,
        totalWords: 0,
        speakers: [],
        duration: 0,
        confidence: 0,
      };
    }

    const speakers = [...new Set(chunks.map(c => c.speaker).filter(Boolean))] as string[];
    const totalWords = chunks.reduce((sum, chunk) => sum + chunk.content.split(' ').length, 0);
    const timestamps = chunks.map(c => c.timestamp).sort((a, b) => a - b);
    const duration = timestamps.length > 1 ? timestamps[timestamps.length - 1] - timestamps[0] : 0;
    const confidenceSum = chunks.reduce((sum, chunk) => sum + (chunk.confidence || 0), 0);
    const averageConfidence = confidenceSum / chunks.length;

    return {
      totalChunks: chunks.length,
      totalWords,
      speakers,
      duration: Math.round(duration / 1000), // Convert to seconds
      confidence: Math.round(averageConfidence * 100) / 100,
    };
  }

  /**
   * Bulk save transcript chunks
   */
  async bulkSave(chunks: Omit<TranscriptChunk, 'id' | 'createdAt'>[]): Promise<TranscriptChunk[]> {
    const savedChunks: TranscriptChunk[] = [];

    for (const chunk of chunks) {
      const saved = await this.save(chunk);
      savedChunks.push(saved);
    }

    return savedChunks;
  }

  /**
   * Generate unique ID for transcript chunks
   */
  private generateId(): string {
    return `transcript_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const transcriptsRepository = new TranscriptsRepository();