// lib/sync/offline-support.ts

import { linkaDB, dbUtils } from '../database';

export interface OfflineQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'medium' | 'high';
  dependencies?: string[]; // IDs of items that must be processed first
}

export interface OfflineStatus {
  isOnline: boolean;
  hasPendingChanges: boolean;
  pendingItemsCount: number;
  lastSyncAttempt: number | null;
  syncInProgress: boolean;
}

export class OfflineSupportManager {
  private static readonly QUEUE_STORE = 'offline_queue';
  private static readonly METADATA_STORE = 'offline_metadata';

  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private eventListeners: Set<(status: OfflineStatus) => void> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Initialize offline support
   */
  async initialize(): Promise<void> {
    await this.ensureOfflineStores();
    this.isOnline = navigator.onLine;
    console.log('Offline support initialized');
  }

  /**
   * Queue an operation for offline execution
   */
  async queueOperation(
    type: OfflineQueueItem['type'],
    collection: string,
    data: any,
    options: {
      priority?: OfflineQueueItem['priority'];
      dependencies?: string[];
      maxRetries?: number;
    } = {}
  ): Promise<string> {
    const item: OfflineQueueItem = {
      id: this.generateOperationId(),
      type,
      collection,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      priority: options.priority || 'medium',
      dependencies: options.dependencies || [],
    };

    await dbUtils.put(this.constructor.QUEUE_STORE, item);

    // Notify listeners of status change
    this.notifyStatusChange();

    console.log(`Queued ${type} operation for ${collection}:`, item.id);
    return item.id;
  }

  /**
   * Process queued operations when coming back online
   */
  async processQueue(): Promise<{
    processed: number;
    failed: number;
    skipped: number;
  }> {
    if (this.syncInProgress || !this.isOnline) {
      return { processed: 0, failed: 0, skipped: 0 };
    }

    this.syncInProgress = true;

    try {
      const queue = await this.getPendingOperations();
      if (queue.length === 0) {
        return { processed: 0, failed: 0, skipped: 0 };
      }

      // Sort by priority and dependencies
      const sortedQueue = this.sortQueueByPriority(queue);

      let processed = 0;
      let failed = 0;
      let skipped = 0;

      for (const item of sortedQueue) {
        try {
          // Check if dependencies are satisfied
          if (!this.areDependenciesSatisfied(item, sortedQueue)) {
            skipped++;
            continue;
          }

          await this.executeOperation(item);
          await this.removeFromQueue(item.id);
          processed++;

          // Small delay between operations to prevent overwhelming the server
          await this.delay(100);
        } catch (error) {
          console.warn(`Failed to process queued operation ${item.id}:`, error);

          item.retryCount++;
          if (item.retryCount >= item.maxRetries) {
            await this.markAsFailed(item.id);
            failed++;
          } else {
            await dbUtils.put(this.constructor.QUEUE_STORE, item);
          }
        }
      }

      console.log(`Processed ${processed} operations, ${failed} failed, ${skipped} skipped`);
      return { processed, failed, skipped };
    } finally {
      this.syncInProgress = false;
      this.notifyStatusChange();
    }
  }

  /**
   * Get current offline status
   */
  async getStatus(): Promise<OfflineStatus> {
    const pendingItems = await this.getPendingOperations();

    return {
      isOnline: this.isOnline,
      hasPendingChanges: pendingItems.length > 0,
      pendingItemsCount: pendingItems.length,
      lastSyncAttempt: await this.getLastSyncAttempt(),
      syncInProgress: this.syncInProgress,
    };
  }

  /**
   * Clear all pending operations
   */
  async clearQueue(): Promise<number> {
    const allItems = await dbUtils.getAll<OfflineQueueItem>(this.constructor.QUEUE_STORE);
    let cleared = 0;

    for (const item of allItems) {
      await dbUtils.delete(this.constructor.QUEUE_STORE, item.id);
      cleared++;
    }

    this.notifyStatusChange();
    console.log(`Cleared ${cleared} queued operations`);
    return cleared;
  }

  /**
   * Get pending operations count by type
   */
  async getQueueStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    failed: number;
  }> {
    const allItems = await dbUtils.getAll<OfflineQueueItem>(this.constructor.QUEUE_STORE);

    const stats = {
      total: allItems.length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      failed: 0,
    };

    allItems.forEach(item => {
      // Count by type
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;

      // Count by priority
      stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;

      // Count failed items
      if (item.retryCount >= item.maxRetries) {
        stats.failed++;
      }
    });

    return stats;
  }

  /**
   * Subscribe to offline status changes
   */
  onStatusChange(callback: (status: OfflineStatus) => void): () => void {
    this.eventListeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.eventListeners.delete(callback);
    };
  }

  /**
   * Force retry failed operations
   */
  async retryFailedOperations(): Promise<number> {
    const allItems = await dbUtils.getAll<OfflineQueueItem>(this.constructor.QUEUE_STORE);
    let retried = 0;

    for (const item of allItems) {
      if (item.retryCount >= item.maxRetries) {
        // Reset retry count to allow retry
        item.retryCount = 0;
        await dbUtils.put(this.constructor.QUEUE_STORE, item);
        retried++;
      }
    }

    console.log(`Retried ${retried} failed operations`);
    return retried;
  }

  // Private methods

  private async ensureOfflineStores(): Promise<void> {
    // Ensure the offline queue store exists
    // This is handled by the database schema, but we can add specific validation here
    const stores = await linkaDB.getStoreNames();
    if (!stores.includes(this.constructor.QUEUE_STORE)) {
      console.warn(`Offline queue store ${this.constructor.QUEUE_STORE} not found`);
    }
  }

  private async getPendingOperations(): Promise<OfflineQueueItem[]> {
    const allItems = await dbUtils.getAll<OfflineQueueItem>(this.constructor.QUEUE_STORE);
    return allItems.filter(item => item.retryCount < item.maxRetries);
  }

  private sortQueueByPriority(queue: OfflineQueueItem[]): OfflineQueueItem[] {
    const priorityOrder = { high: 3, medium: 2, low: 1 };

    return queue.sort((a, b) => {
      // Sort by priority first
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by timestamp (older first)
      return a.timestamp - b.timestamp;
    });
  }

  private areDependenciesSatisfied(item: OfflineQueueItem, queue: OfflineQueueItem[]): boolean {
    if (!item.dependencies || item.dependencies.length === 0) {
      return true;
    }

    // Check if all dependencies are either completed or not in queue
    return item.dependencies.every(depId => {
      const depItem = queue.find(item => item.id === depId);
      return !depItem; // If dependency is not in queue, assume it's completed
    });
  }

  private async executeOperation(item: OfflineQueueItem): Promise<void> {
    // This would integrate with the actual data repositories
    // For now, we'll simulate the operations
    console.log(`Executing ${item.type} operation on ${item.collection}:`, item.data);

    switch (item.type) {
      case 'create':
        // await repositories[item.collection].create(item.data);
        break;
      case 'update':
        // await repositories[item.collection].update(item.data.id, item.data);
        break;
      case 'delete':
        // await repositories[item.collection].delete(item.data.id);
        break;
      default:
        throw new Error(`Unknown operation type: ${item.type}`);
    }

    // Simulate network delay
    await this.delay(200);
  }

  private async removeFromQueue(itemId: string): Promise<void> {
    await dbUtils.delete(this.constructor.QUEUE_STORE, itemId);
  }

  private async markAsFailed(itemId: string): Promise<void> {
    // Mark item as permanently failed by setting retry count to max
    const item = await dbUtils.getByKey<OfflineQueueItem>(this.constructor.QUEUE_STORE, itemId);
    if (item) {
      item.retryCount = item.maxRetries;
      await dbUtils.put(this.constructor.QUEUE_STORE, item);
    }
  }

  private async getLastSyncAttempt(): Promise<number | null> {
    try {
      const metadata = await dbUtils.getByKey(this.constructor.METADATA_STORE, 'last_sync');
      return metadata?.timestamp || null;
    } catch {
      return null;
    }
  }

  private generateOperationId(): string {
    return `offline_op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners(): void {
    window.addEventListener('online', async () => {
      console.log('Connection restored - processing offline queue');
      this.isOnline = true;
      this.notifyStatusChange();

      // Automatically process queue when coming back online
      setTimeout(() => {
        this.processQueue().catch(error => {
          console.error('Failed to process queue on reconnect:', error);
        });
      }, 1000); // Small delay to ensure connection is stable
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost - switching to offline mode');
      this.isOnline = false;
      this.notifyStatusChange();
    });
  }

  private notifyStatusChange(): void {
    this.getStatus().then(status => {
      this.eventListeners.forEach(callback => {
        try {
          callback(status);
        } catch (error) {
          console.warn('Offline status callback error:', error);
        }
      });
    }).catch(error => {
      console.warn('Failed to get offline status for notification:', error);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const offlineSupportManager = new OfflineSupportManager();