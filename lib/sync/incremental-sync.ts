// lib/sync/incremental-sync.ts

import { meetingsRepository, transcriptsRepository } from '../database';

export interface SyncCheckpoint {
  id: string;
  collection: string;
  lastSyncTimestamp: number;
  lastSyncVersion: string;
  recordCount: number;
  checksum: string;
}

export interface IncrementalChanges {
  collection: string;
  created: any[];
  updated: any[];
  deleted: string[];
  checkpoint: SyncCheckpoint;
}

export interface SyncOptions {
  batchSize: number;
  maxChanges: number;
  includeDeletes: boolean;
  checksumValidation: boolean;
}

export class IncrementalSyncManager {
  private static readonly CHECKPOINT_STORE = 'sync_checkpoints';
  private checkpoints: Map<string, SyncCheckpoint> = new Map();

  private options: SyncOptions = {
    batchSize: 100,
    maxChanges: 1000,
    includeDeletes: true,
    checksumValidation: true,
  };

  /**
   * Initialize incremental sync
   */
  async initialize(): Promise<void> {
    await this.loadCheckpoints();
    console.log('Incremental sync initialized');
  }

  /**
   * Get changes since last sync for a collection
   */
  async getIncrementalChanges(
    collection: string,
    since?: number
  ): Promise<IncrementalChanges> {
    const checkpoint = await this.getCheckpoint(collection);
    const lastSyncTime = since || checkpoint?.lastSyncTimestamp || 0;

    let created: any[] = [];
    let updated: any[] = [];
    let deleted: string[] = [];

    switch (collection) {
      case 'meetings':
        ({ created, updated, deleted } = await this.getMeetingChanges(lastSyncTime));
        break;
      case 'transcripts':
        ({ created, updated, deleted } = await this.getTranscriptChanges(lastSyncTime));
        break;
      default:
        throw new Error(`Unsupported collection: ${collection}`);
    }

    // Limit the number of changes to prevent overwhelming sync
    const totalChanges = created.length + updated.length + deleted.length;
    if (totalChanges > this.options.maxChanges) {
      console.warn(`Too many changes (${totalChanges}), truncating to ${this.options.maxChanges}`);
      // Keep most recent changes
      const allChanges = [
        ...created.map(item => ({ type: 'created', item, timestamp: item.createdAt || item.timestamp })),
        ...updated.map(item => ({ type: 'updated', item, timestamp: item.updatedAt || item.timestamp })),
        ...deleted.map(id => ({ type: 'deleted', item: id, timestamp: Date.now() })),
      ].sort((a, b) => b.timestamp - a.timestamp);

      const limitedChanges = allChanges.slice(0, this.options.maxChanges);

      created = limitedChanges.filter(c => c.type === 'created').map(c => c.item);
      updated = limitedChanges.filter(c => c.type === 'updated').map(c => c.item);
      deleted = limitedChanges.filter(c => c.type === 'deleted').map(c => c.item);
    }

    // Create new checkpoint
    const newCheckpoint: SyncCheckpoint = {
      id: `${collection}_${Date.now()}`,
      collection,
      lastSyncTimestamp: Date.now(),
      lastSyncVersion: this.generateVersion(),
      recordCount: created.length + updated.length,
      checksum: this.calculateChecksum([...created, ...updated, ...deleted]),
    };

    return {
      collection,
      created,
      updated,
      deleted: this.options.includeDeletes ? deleted : [],
      checkpoint: newCheckpoint,
    };
  }

  /**
   * Apply incremental changes
   */
  async applyIncrementalChanges(changes: IncrementalChanges): Promise<{
    applied: number;
    failed: number;
    skipped: number;
  }> {
    let applied = 0;
    let failed = 0;
    let skipped = 0;

    try {
      // Process in batches to avoid overwhelming the database
      const batches = this.createBatches(changes);

      for (const batch of batches) {
        try {
          const result = await this.applyBatch(batch, changes.collection);
          applied += result.applied;
          failed += result.failed;
          skipped += result.skipped;
        } catch (error) {
          console.warn(`Failed to apply batch for ${changes.collection}:`, error);
          failed += batch.created.length + batch.updated.length + batch.deleted.length;
        }
      }

      // Update checkpoint after successful sync
      await this.saveCheckpoint(changes.checkpoint);

      console.log(`Applied ${applied} changes, ${failed} failed, ${skipped} skipped for ${changes.collection}`);
    } catch (error) {
      console.error('Failed to apply incremental changes:', error);
      throw error;
    }

    return { applied, failed, skipped };
  }

  /**
   * Get sync status for collections
   */
  async getSyncStatus(): Promise<{
    collections: {
      name: string;
      lastSync: number | null;
      pendingChanges: number;
      status: 'synced' | 'pending' | 'error';
    }[];
  }> {
    const collections = ['meetings', 'transcripts'];
    const status = [];

    for (const collection of collections) {
      const checkpoint = await this.getCheckpoint(collection);
      const changes = await this.getIncrementalChanges(collection);

      const totalChanges = changes.created.length + changes.updated.length + changes.deleted.length;

      status.push({
        name: collection,
        lastSync: checkpoint?.lastSyncTimestamp || null,
        pendingChanges: totalChanges,
        status: totalChanges > 0 ? 'pending' : 'synced',
      });
    }

    return { collections: status };
  }

  /**
   * Reset sync checkpoint for a collection
   */
  async resetCheckpoint(collection: string): Promise<void> {
    this.checkpoints.delete(collection);
    // In a real implementation, you'd also clear this from persistent storage
    console.log(`Reset checkpoint for ${collection}`);
  }

  /**
   * Update sync options
   */
  updateOptions(newOptions: Partial<SyncOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  // Private methods

  private async getMeetingChanges(since: number): Promise<{
    created: any[];
    updated: any[];
    deleted: string[];
  }> {
    // Get all meetings modified since the last sync
    const allMeetings = await meetingsRepository.getAll();
    const recentMeetings = allMeetings.filter(meeting => {
      const modifiedTime = meeting.updatedAt || meeting.createdAt || 0;
      return modifiedTime > since;
    });

    // Separate into created and updated
    const created = recentMeetings.filter(meeting => meeting.createdAt > since);
    const updated = recentMeetings.filter(meeting => meeting.updatedAt && meeting.updatedAt > since);

    // For deleted items, we'd need a tombstone table in a real implementation
    // For now, we'll return an empty array
    const deleted: string[] = [];

    return { created, updated, deleted };
  }

  private async getTranscriptChanges(since: number): Promise<{
    created: any[];
    updated: any[];
    deleted: string[];
  }> {
    // Similar logic for transcripts
    const allTranscripts = await transcriptsRepository.getAll();
    const recentTranscripts = allTranscripts.filter(transcript => {
      const modifiedTime = transcript.updatedAt || transcript.createdAt || 0;
      return modifiedTime > since;
    });

    const created = recentTranscripts.filter(transcript => transcript.createdAt > since);
    const updated = recentTranscripts.filter(transcript => transcript.updatedAt && transcript.updatedAt > since);
    const deleted: string[] = [];

    return { created, updated, deleted };
  }

  private createBatches(changes: IncrementalChanges): Array<{
    created: any[];
    updated: any[];
    deleted: string[];
  }> {
    const batches = [];
    const allItems = [
      ...changes.created.map(item => ({ type: 'created', item })),
      ...changes.updated.map(item => ({ type: 'updated', item })),
      ...changes.deleted.map(item => ({ type: 'deleted', item })),
    ];

    for (let i = 0; i < allItems.length; i += this.options.batchSize) {
      const batch = allItems.slice(i, i + this.options.batchSize);

      batches.push({
        created: batch.filter(item => item.type === 'created').map(item => item.item),
        updated: batch.filter(item => item.type === 'updated').map(item => item.item),
        deleted: batch.filter(item => item.type === 'deleted').map(item => item.item),
      });
    }

    return batches;
  }

  private async applyBatch(
    batch: { created: any[]; updated: any[]; deleted: string[] },
    collection: string
  ): Promise<{ applied: number; failed: number; skipped: number }> {
    let applied = 0;
    let failed = 0;
    let skipped = 0;

    // Apply creates
    for (const item of batch.created) {
      try {
        switch (collection) {
          case 'meetings':
            await meetingsRepository.create(item);
            break;
          case 'transcripts':
            await transcriptsRepository.create(item);
            break;
        }
        applied++;
      } catch (error) {
        console.warn(`Failed to create ${collection} item:`, error);
        failed++;
      }
    }

    // Apply updates
    for (const item of batch.updated) {
      try {
        switch (collection) {
          case 'meetings':
            await meetingsRepository.update(item.id, item);
            break;
          case 'transcripts':
            await transcriptsRepository.update(item.id, item);
            break;
        }
        applied++;
      } catch (error) {
        console.warn(`Failed to update ${collection} item:`, error);
        failed++;
      }
    }

    // Apply deletes
    for (const id of batch.deleted) {
      try {
        switch (collection) {
          case 'meetings':
            await meetingsRepository.delete(id);
            break;
          case 'transcripts':
            await transcriptsRepository.delete(id);
            break;
        }
        applied++;
      } catch (error) {
        console.warn(`Failed to delete ${collection} item:`, error);
        failed++;
      }
    }

    return { applied, failed, skipped };
  }

  private async getCheckpoint(collection: string): Promise<SyncCheckpoint | null> {
    return this.checkpoints.get(collection) || null;
  }

  private async saveCheckpoint(checkpoint: SyncCheckpoint): Promise<void> {
    this.checkpoints.set(checkpoint.collection, checkpoint);
    // In a real implementation, save to persistent storage
  }

  private async loadCheckpoints(): Promise<void> {
    // In a real implementation, load from persistent storage
    // For now, checkpoints are kept in memory only
  }

  private generateVersion(): string {
    return `v${Date.now()}.${Math.random().toString(36).substr(2, 5)}`;
  }

  private calculateChecksum(items: any[]): string {
    if (!this.options.checksumValidation) return '';

    const content = JSON.stringify(items);
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Validate checksum for data integrity
   */
  validateChecksum(changes: IncrementalChanges, expectedChecksum: string): boolean {
    if (!this.options.checksumValidation) return true;

    const actualChecksum = this.calculateChecksum([
      ...changes.created,
      ...changes.updated,
      ...changes.deleted,
    ]);

    return actualChecksum === expectedChecksum;
  }
}

// Singleton instance
export const incrementalSyncManager = new IncrementalSyncManager();