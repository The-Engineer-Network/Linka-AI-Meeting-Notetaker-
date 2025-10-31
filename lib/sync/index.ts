// lib/sync/index.ts

// Core sync components
export { chromeStorageSync, ChromeStorageSync } from './chrome-storage';
export { conflictResolver, ConflictResolver } from './conflict-resolution';
export { offlineSupportManager, OfflineSupportManager } from './offline-support';
export { incrementalSyncManager, IncrementalSyncManager } from './incremental-sync';
export { backupRestoreManager, BackupRestoreManager } from './backup-restore';

// Main sync manager
export { syncManager, SyncManager } from './manager';

// Types
export type {
  ChromeStorageOptions,
  SyncMetadata,
} from './chrome-storage';

export type {
  SyncConflict,
  ConflictResolutionOptions,
} from './conflict-resolution';

export type {
  OfflineQueueItem,
  OfflineStatus,
} from './offline-support';

export type {
  SyncCheckpoint,
  IncrementalChanges,
  SyncOptions,
} from './incremental-sync';

export type {
  BackupOptions,
  BackupMetadata,
  BackupResult,
  RestoreOptions,
  RestoreResult,
} from './backup-restore';

export type {
  SyncManagerOptions,
  SyncStatus,
} from './manager';

// Main Sync System class for easy integration
export class SyncSystem {
  constructor() {
    // Initialize cleanup routines
    this.setupPeriodicCleanup();
  }

  /**
   * Initialize all sync systems
   */
  async initialize(): Promise<void> {
    await syncManager.initialize();
  }

  /**
   * Perform full synchronization
   */
  async syncAll(options?: { force?: boolean }): Promise<any> {
    return await syncManager.syncAll(options);
  }

  /**
   * Sync specific collection
   */
  async syncCollection(collection: string, options?: { force?: boolean }): Promise<any> {
    return await syncManager.syncCollection(collection, options);
  }

  /**
   * Get sync status
   */
  async getStatus(): Promise<any> {
    return await syncManager.getStatus();
  }

  /**
   * Create backup
   */
  async createBackup(options?: any): Promise<any> {
    return await backupRestoreManager.createBackup(options);
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupBlob: Blob, options?: any): Promise<any> {
    return await backupRestoreManager.restoreBackup(backupBlob, options);
  }

  /**
   * Queue offline operation
   */
  async queueOfflineOperation(
    type: 'create' | 'update' | 'delete',
    collection: string,
    data: any,
    options?: any
  ): Promise<string> {
    return await offlineSupportManager.queueOperation(type, collection, data, options);
  }

  /**
   * Process offline queue
   */
  async processOfflineQueue(): Promise<any> {
    return await offlineSupportManager.processQueue();
  }

  /**
   * Resolve sync conflicts
   */
  async resolveConflicts(conflictIds: string[], resolution: 'local' | 'remote' | 'merge'): Promise<void> {
    return await syncManager.resolveConflicts(conflictIds, resolution);
  }

  /**
   * Get unresolved conflicts
   */
  getUnresolvedConflicts(): any[] {
    return syncManager.getUnresolvedConflicts();
  }

  /**
   * Subscribe to sync status changes
   */
  onStatusChange(callback: (status: any) => void): () => void {
    return syncManager.onStatusChange(callback);
  }

  /**
   * Subscribe to offline status changes
   */
  onOfflineStatusChange(callback: (status: any) => void): () => void {
    return offlineSupportManager.onStatusChange(callback);
  }

  /**
   * Reset all sync data
   */
  async resetSync(): Promise<void> {
    return await syncManager.resetSync();
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<any[]> {
    return await backupRestoreManager.listBackups();
  }

  /**
   * Download backup
   */
  downloadBackup(result: any): void {
    backupRestoreManager.downloadBackup(result);
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<any> {
    return await backupRestoreManager.getBackupStats();
  }

  /**
   * Check if Chrome storage sync is supported
   */
  isChromeStorageSupported(): boolean {
    return ChromeStorageSync.isSupported();
  }

  /**
   * Setup periodic cleanup
   */
  private setupPeriodicCleanup(): void {
    // Clean up expired offline operations every hour
    setInterval(() => {
      try {
        // In a real implementation, you'd clean up old offline operations
        console.log('Periodic sync cleanup');
      } catch (error) {
        console.warn('Sync cleanup error:', error);
      }
    }, 60 * 60 * 1000);
  }
}

// Singleton instance
export const syncSystem = new SyncSystem();