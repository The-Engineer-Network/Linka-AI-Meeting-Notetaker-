// lib/database/repositories/processing-queue.ts

import { ProcessingQueueItem } from '../schemas';
import { dbUtils } from '../indexeddb';
import { STORES } from '../schemas';

export class ProcessingQueueRepository {
  /**
   * Add item to processing queue
   */
  async enqueue(item: Omit<ProcessingQueueItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProcessingQueueItem> {
    const queueItem: ProcessingQueueItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await dbUtils.put(STORES.PROCESSING_QUEUE, queueItem);
    return queueItem;
  }

  /**
   * Get item by ID
   */
  async getById(id: string): Promise<ProcessingQueueItem | null> {
    return await dbUtils.getByKey<ProcessingQueueItem>(STORES.PROCESSING_QUEUE, id) || null;
  }

  /**
   * Get pending items
   */
  async getPending(): Promise<ProcessingQueueItem[]> {
    const keyRange = IDBKeyRange.only('pending');
    return await dbUtils.queryByIndex<ProcessingQueueItem>(STORES.PROCESSING_QUEUE, 'by-status', keyRange);
  }

  /**
   * Get items by meeting ID
   */
  async getByMeetingId(meetingId: string): Promise<ProcessingQueueItem[]> {
    const keyRange = IDBKeyRange.only(meetingId);
    return await dbUtils.queryByIndex<ProcessingQueueItem>(STORES.PROCESSING_QUEUE, 'by-meeting', keyRange);
  }

  /**
   * Get items by type
   */
  async getByType(type: ProcessingQueueItem['type']): Promise<ProcessingQueueItem[]> {
    const keyRange = IDBKeyRange.only(type);
    return await dbUtils.queryByIndex<ProcessingQueueItem>(STORES.PROCESSING_QUEUE, 'by-type', keyRange);
  }

  /**
   * Get items by priority
   */
  async getByPriority(priority: ProcessingQueueItem['priority']): Promise<ProcessingQueueItem[]> {
    const keyRange = IDBKeyRange.only(priority);
    return await dbUtils.queryByIndex<ProcessingQueueItem>(STORES.PROCESSING_QUEUE, 'by-priority', keyRange);
  }

  /**
   * Update item status
   */
  async updateStatus(id: string, status: ProcessingQueueItem['status'], result?: any, error?: string): Promise<ProcessingQueueItem | null> {
    const item = await this.getById(id);
    if (!item) {
      return null;
    }

    const updates: Partial<ProcessingQueueItem> = {
      status,
      updatedAt: new Date(),
    };

    if (result !== undefined) {
      updates.result = result;
    }

    if (error !== undefined) {
      updates.error = error;
    }

    if (status === 'completed' || status === 'failed') {
      updates.completedAt = new Date();
    }

    const updatedItem: ProcessingQueueItem = {
      ...item,
      ...updates,
    };

    await dbUtils.put(STORES.PROCESSING_QUEUE, updatedItem);
    return updatedItem;
  }

  /**
   * Mark item as processing
   */
  async markAsProcessing(id: string): Promise<ProcessingQueueItem | null> {
    return await this.updateStatus(id, 'processing');
  }

  /**
   * Mark item as completed
   */
  async markAsCompleted(id: string, result: any): Promise<ProcessingQueueItem | null> {
    return await this.updateStatus(id, 'completed', result);
  }

  /**
   * Mark item as failed
   */
  async markAsFailed(id: string, error: string): Promise<ProcessingQueueItem | null> {
    return await this.updateStatus(id, 'failed', undefined, error);
  }

  /**
   * Delete item
   */
  async delete(id: string): Promise<boolean> {
    try {
      await dbUtils.delete(STORES.PROCESSING_QUEUE, id);
      return true;
    } catch (error) {
      console.error('Error deleting processing queue item:', error);
      return false;
    }
  }

  /**
   * Get next pending item (by priority and creation time)
   */
  async getNextPending(): Promise<ProcessingQueueItem | null> {
    const pendingItems = await this.getPending();

    if (pendingItems.length === 0) {
      return null;
    }

    // Sort by priority (high -> medium -> low) then by creation time
    const priorityOrder = { high: 3, medium: 2, low: 1 };

    return pendingItems.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    })[0];
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const allItems = await dbUtils.getAll<ProcessingQueueItem>(STORES.PROCESSING_QUEUE);

    const stats = {
      total: allItems.length,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    };

    for (const item of allItems) {
      stats[item.status]++;

      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
    }

    return stats;
  }

  /**
   * Clean up old completed/failed items
   */
  async cleanup(olderThanDays: number = 7): Promise<number> {
    const allItems = await dbUtils.getAll<ProcessingQueueItem>(STORES.PROCESSING_QUEUE);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let deletedCount = 0;
    for (const item of allItems) {
      if ((item.status === 'completed' || item.status === 'failed') &&
          item.completedAt && item.completedAt < cutoffDate) {
        if (await this.delete(item.id)) {
          deletedCount++;
        }
      }
    }

    return deletedCount;
  }

  /**
   * Bulk operations
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
   * Generate unique ID for queue items
   */
  private generateId(): string {
    return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const processingQueueRepository = new ProcessingQueueRepository();