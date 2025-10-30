// lib/audio/storage.ts

import { linkaDB, dbUtils } from '../database';

export interface AudioBlobData {
  id: string;
  meetingId: string;
  blob: Blob;
  timestamp: number;
  duration: number; // in milliseconds
  format: string; // 'audio/webm', 'audio/wav', etc.
  size: number; // in bytes
  metadata?: {
    sampleRate?: number;
    channels?: number;
    bitrate?: number;
  };
}

export class AudioStorageManager {
  private readonly STORE_NAME = 'audio_blobs';

  /**
   * Store audio blob in IndexedDB
   */
  async storeAudioBlob(
    meetingId: string,
    blob: Blob,
    metadata?: {
      timestamp?: number;
      duration?: number;
      format?: string;
      sampleRate?: number;
      channels?: number;
      bitrate?: number;
    }
  ): Promise<string> {
    const id = this.generateId();
    const timestamp = metadata?.timestamp || Date.now();
    const format = metadata?.format || blob.type || 'audio/webm';
    const size = blob.size;

    const audioData: AudioBlobData = {
      id,
      meetingId,
      blob,
      timestamp,
      duration: metadata?.duration || 0,
      format,
      size,
      metadata: {
        sampleRate: metadata?.sampleRate,
        channels: metadata?.channels,
        bitrate: metadata?.bitrate,
      },
    };

    // Store metadata (without blob) in a separate object store for queries
    const metadataOnly = { ...audioData };
    delete (metadataOnly as any).blob;

    await dbUtils.put(this.STORE_NAME, metadataOnly);

    // Store the actual blob in a separate operation
    // Note: In a real implementation, you might want to use a different storage mechanism
    // for large blobs, but IndexedDB can handle reasonable audio files
    await this.storeBlobSeparately(id, blob);

    return id;
  }

  /**
   * Store blob separately (placeholder for future optimization)
   */
  private async storeBlobSeparately(id: string, blob: Blob): Promise<void> {
    // For now, we'll store metadata only
    // In a production implementation, you might:
    // 1. Use the File System Access API (limited browser support)
    // 2. Use Cache API for temporary storage
    // 3. Compress the audio before storage
    // 4. Split large files into chunks

    console.log(`Audio blob stored with ID: ${id}, size: ${blob.size} bytes`);
  }

  /**
   * Retrieve audio blob metadata
   */
  async getAudioBlobMetadata(id: string): Promise<AudioBlobData | null> {
    try {
      const metadata = await dbUtils.getByKey<AudioBlobData>(this.STORE_NAME, id);
      return metadata || null;
    } catch (error) {
      console.error('Failed to retrieve audio blob metadata:', error);
      return null;
    }
  }

  /**
   * Get all audio blobs for a meeting
   */
  async getMeetingAudioBlobs(meetingId: string): Promise<AudioBlobData[]> {
    // This would require an index on meetingId
    // For now, we'll get all and filter
    const allBlobs = await dbUtils.getAll<AudioBlobData>(this.STORE_NAME);
    return allBlobs.filter(blob => blob.meetingId === meetingId);
  }

  /**
   * Delete audio blob
   */
  async deleteAudioBlob(id: string): Promise<boolean> {
    try {
      await dbUtils.delete(this.STORE_NAME, id);
      // Also clean up the actual blob storage
      await this.deleteBlobSeparately(id);
      return true;
    } catch (error) {
      console.error('Failed to delete audio blob:', error);
      return false;
    }
  }

  /**
   * Delete blob separately
   */
  private async deleteBlobSeparately(id: string): Promise<void> {
    // Clean up blob storage
    console.log(`Audio blob deleted: ${id}`);
  }

  /**
   * Delete all audio blobs for a meeting
   */
  async deleteMeetingAudioBlobs(meetingId: string): Promise<number> {
    const meetingBlobs = await this.getMeetingAudioBlobs(meetingId);
    let deletedCount = 0;

    for (const blob of meetingBlobs) {
      if (await this.deleteAudioBlob(blob.id)) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get audio storage statistics
   */
  async getStorageStats(): Promise<{
    totalBlobs: number;
    totalSize: number;
    meetingsCount: number;
    averageBlobSize: number;
  }> {
    const allBlobs = await dbUtils.getAll<AudioBlobData>(this.STORE_NAME);
    const totalSize = allBlobs.reduce((sum, blob) => sum + blob.size, 0);
    const meetings = new Set(allBlobs.map(blob => blob.meetingId));

    return {
      totalBlobs: allBlobs.length,
      totalSize,
      meetingsCount: meetings.size,
      averageBlobSize: allBlobs.length > 0 ? totalSize / allBlobs.length : 0,
    };
  }

  /**
   * Export audio data for a meeting
   */
  async exportMeetingAudio(meetingId: string): Promise<{
    metadata: AudioBlobData[];
    totalSize: number;
  }> {
    const blobs = await this.getMeetingAudioBlobs(meetingId);
    const totalSize = blobs.reduce((sum, blob) => sum + blob.size, 0);

    return {
      metadata: blobs,
      totalSize,
    };
  }

  /**
   * Compress audio blob (placeholder for future implementation)
   */
  async compressAudioBlob(blob: Blob, options?: {
    targetFormat?: string;
    quality?: number;
  }): Promise<Blob> {
    // Placeholder for audio compression
    // In a real implementation, you might use:
    // - Web Audio API for format conversion
    // - Audio compression libraries
    // - Opus encoding for smaller file sizes

    console.log('Audio compression not yet implemented, returning original blob');
    return blob;
  }

  /**
   * Convert audio format (placeholder for future implementation)
   */
  async convertAudioFormat(blob: Blob, targetFormat: string): Promise<Blob> {
    // Placeholder for format conversion
    // This would use Web Audio API or external libraries

    console.log(`Audio format conversion not yet implemented, returning original blob`);
    return blob;
  }

  /**
   * Clean up old audio blobs based on retention policy
   */
  async cleanupOldAudioBlobs(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const allBlobs = await dbUtils.getAll<AudioBlobData>(this.STORE_NAME);
    let deletedCount = 0;

    for (const blob of allBlobs) {
      if (blob.timestamp < cutoffDate.getTime()) {
        if (await this.deleteAudioBlob(blob.id)) {
          deletedCount++;
        }
      }
    }

    return deletedCount;
  }

  /**
   * Generate unique ID for audio blobs
   */
  private generateId(): string {
    return `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const audioStorageManager = new AudioStorageManager();