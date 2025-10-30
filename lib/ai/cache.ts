// lib/ai/cache.ts

import { linkaDB, dbUtils } from '../database';

export interface AICacheEntry {
  id: string;
  taskType: string;
  inputHash: string;
  meetingId: string;
  result: any;
  createdAt: number;
  expiresAt: number;
  metadata?: {
    processingTime?: number;
    modelVersion?: string;
    confidence?: number;
  };
}

export class AICacheManager {
  private readonly STORE_NAME = 'ai_cache';
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate hash for cache key
   */
  private generateHash(input: any): string {
    const str = JSON.stringify(input);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached result
   */
  async get(taskType: string, input: any, meetingId?: string): Promise<any | null> {
    try {
      const inputHash = this.generateHash(input);
      const cacheKey = `${taskType}:${inputHash}${meetingId ? `:${meetingId}` : ''}`;

      const entry = await dbUtils.getByKey<AICacheEntry>(this.STORE_NAME, cacheKey);

      if (!entry) {
        return null;
      }

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        await this.delete(cacheKey);
        return null;
      }

      console.log(`Cache hit for ${taskType}`);
      return entry.result;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached result
   */
  async set(
    taskType: string,
    input: any,
    result: any,
    meetingId?: string,
    ttl: number = this.DEFAULT_TTL,
    metadata?: AICacheEntry['metadata']
  ): Promise<void> {
    try {
      const inputHash = this.generateHash(input);
      const cacheKey = `${taskType}:${inputHash}${meetingId ? `:${meetingId}` : ''}`;

      const entry: AICacheEntry = {
        id: cacheKey,
        taskType,
        inputHash,
        meetingId: meetingId || '',
        result,
        createdAt: Date.now(),
        expiresAt: Date.now() + ttl,
        metadata,
      };

      await dbUtils.put(this.STORE_NAME, entry);
      console.log(`Cached result for ${taskType}`);
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  /**
   * Delete cached entry
   */
  async delete(cacheKey: string): Promise<boolean> {
    try {
      await dbUtils.delete(this.STORE_NAME, cacheKey);
      return true;
    } catch (error) {
      console.warn('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Clear expired entries
   */
  async clearExpired(): Promise<number> {
    try {
      const allEntries = await dbUtils.getAll<AICacheEntry>(this.STORE_NAME);
      let deletedCount = 0;
      const now = Date.now();

      for (const entry of allEntries) {
        if (now > entry.expiresAt) {
          await this.delete(entry.id);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(`Cleared ${deletedCount} expired cache entries`);
      }

      return deletedCount;
    } catch (error) {
      console.warn('Clear expired cache error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAll(): Promise<number> {
    try {
      const allEntries = await dbUtils.getAll<AICacheEntry>(this.STORE_NAME);
      let deletedCount = 0;

      for (const entry of allEntries) {
        await this.delete(entry.id);
        deletedCount++;
      }

      console.log(`Cleared all ${deletedCount} cache entries`);
      return deletedCount;
    } catch (error) {
      console.warn('Clear all cache error:', error);
      return 0;
    }
  }

  /**
   * Clear cache entries for a specific meeting
   */
  async clearMeetingCache(meetingId: string): Promise<number> {
    try {
      const allEntries = await dbUtils.getAll<AICacheEntry>(this.STORE_NAME);
      let deletedCount = 0;

      for (const entry of allEntries) {
        if (entry.meetingId === meetingId) {
          await this.delete(entry.id);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(`Cleared ${deletedCount} cache entries for meeting ${meetingId}`);
      }

      return deletedCount;
    } catch (error) {
      console.warn('Clear meeting cache error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    activeEntries: number;
    totalSize: number;
  }> {
    try {
      const allEntries = await dbUtils.getAll<AICacheEntry>(this.STORE_NAME);
      const now = Date.now();

      let expiredEntries = 0;
      let totalSize = 0;

      for (const entry of allEntries) {
        if (now > entry.expiresAt) {
          expiredEntries++;
        }

        // Estimate size (rough calculation)
        const entrySize = JSON.stringify(entry).length;
        totalSize += entrySize;
      }

      return {
        totalEntries: allEntries.length,
        expiredEntries,
        activeEntries: allEntries.length - expiredEntries,
        totalSize,
      };
    } catch (error) {
      console.warn('Get cache stats error:', error);
      return {
        totalEntries: 0,
        expiredEntries: 0,
        activeEntries: 0,
        totalSize: 0,
      };
    }
  }

  /**
   * Set default TTL for cache entries
   */
  setDefaultTTL(ttl: number): void {
    (this as any).DEFAULT_TTL = ttl;
  }

  /**
   * Get default TTL
   */
  getDefaultTTL(): number {
    return this.DEFAULT_TTL;
  }
}

// Singleton instance
export const aiCacheManager = new AICacheManager();