// lib/sync/manager.ts

import { chromeStorageSync, ChromeStorageSync } from './chrome-storage';
import { conflictResolver, ConflictResolver } from './conflict-resolution';
import { offlineSupportManager, OfflineSupportManager } from './offline-support';
import { incrementalSyncManager, IncrementalSyncManager } from './incremental-sync';
import { settingsRepository } from '../database';

export interface SyncManagerOptions {
  enableChromeStorage: boolean;
  enableIncrementalSync: boolean;
  enableOfflineSupport: boolean;
  enableConflictResolution: boolean;
  autoSyncInterval: number; // minutes
  maxRetries: number;
  retryDelay: number; // milliseconds
}

export interface SyncStatus {
  isOnline: boolean;
  chromeStorage: {
    enabled: boolean;
    lastSync: number | null;
    status: 'idle' | 'syncing' | 'error';
  };
  incremental: {
    enabled: boolean;
    collections: {
      name: string;
      lastSync: number | null;
      pendingChanges: number;
      status: 'synced' | 'pending' | 'error';
    }[];
  };
  offline: {
    hasPendingChanges: boolean;
    pendingItemsCount: number;
    syncInProgress: boolean;
  };
  conflicts: {
    unresolvedCount: number;
    totalCount: number;
  };
}

export class SyncManager {
  private options: SyncManagerOptions = {
    enableChromeStorage: true,
    enableIncrementalSync: true,
    enableOfflineSupport: true,
    enableConflictResolution: true,
    autoSyncInterval: 15,
    maxRetries: 3,
    retryDelay: 5000,
  };

  private syncInProgress: boolean = false;
  private autoSyncTimer: number | null = null;
  private statusCallbacks: Set<(status: SyncStatus) => void> = new Set();

  constructor() {
    this.setupAutoSync();
  }

  /**
   * Initialize all sync systems
   */
  async initialize(): Promise<void> {
    console.log('Initializing Sync Manager...');

    // Load options from settings
    await this.loadOptions();

    // Initialize components
    const initPromises = [];

    if (this.options.enableChromeStorage && ChromeStorageSync.isSupported()) {
      initPromises.push(chromeStorageSync.initialize());
    }

    if (this.options.enableIncrementalSync) {
      initPromises.push(incrementalSyncManager.initialize());
    }

    if (this.options.enableOfflineSupport) {
      initPromises.push(offlineSupportManager.initialize());
    }

    await Promise.all(initPromises);

    console.log('Sync Manager initialized');
  }

  /**
   * Perform full synchronization
   */
  async syncAll(options: { force?: boolean } = {}): Promise<{
    success: boolean;
    chromeStorage?: any;
    incremental?: any;
    offline?: any;
    errors: string[];
  }> {
    if (this.syncInProgress && !options.force) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    const errors: string[] = [];
    const results: any = { success: false, errors };

    try {
      // Chrome Storage Sync
      if (this.options.enableChromeStorage && ChromeStorageSync.isSupported()) {
        try {
          await chromeStorageSync.forceSync();
          results.chromeStorage = { success: true };
        } catch (error) {
          const errorMsg = `Chrome storage sync failed: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          results.chromeStorage = { success: false, error: errorMsg };
        }
      }

      // Incremental Sync
      if (this.options.enableIncrementalSync) {
        try {
          const status = await incrementalSyncManager.getSyncStatus();
          results.incremental = { success: true, status };
        } catch (error) {
          const errorMsg = `Incremental sync failed: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          results.incremental = { success: false, error: errorMsg };
        }
      }

      // Offline Queue Processing
      if (this.options.enableOfflineSupport) {
        try {
          const offlineResult = await offlineSupportManager.processQueue();
          results.offline = { success: true, ...offlineResult };
        } catch (error) {
          const errorMsg = `Offline processing failed: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          results.offline = { success: false, error: errorMsg };
        }
      }

      results.success = errors.length === 0;
      console.log('Full sync completed:', results);
    } finally {
      this.syncInProgress = false;
      this.notifyStatusChange();
    }

    return results;
  }

  /**
   * Sync specific collection incrementally
   */
  async syncCollection(
    collection: string,
    options: { force?: boolean } = {}
  ): Promise<any> {
    if (!this.options.enableIncrementalSync) {
      throw new Error('Incremental sync is disabled');
    }

    try {
      const changes = await incrementalSyncManager.getIncrementalChanges(collection);
      const result = await incrementalSyncManager.applyIncrementalChanges(changes);

      console.log(`Synced collection ${collection}:`, result);
      return result;
    } catch (error) {
      console.error(`Failed to sync collection ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Get current sync status
   */
  async getStatus(): Promise<SyncStatus> {
    const status: SyncStatus = {
      isOnline: navigator.onLine,
      chromeStorage: {
        enabled: this.options.enableChromeStorage && ChromeStorageSync.isSupported(),
        lastSync: null,
        status: 'idle',
      },
      incremental: {
        enabled: this.options.enableIncrementalSync,
        collections: [],
      },
      offline: {
        hasPendingChanges: false,
        pendingItemsCount: 0,
        syncInProgress: false,
      },
      conflicts: {
        unresolvedCount: 0,
        totalCount: 0,
      },
    };

    // Get Chrome storage status
    if (status.chromeStorage.enabled) {
      try {
        const chromeStatus = await chromeStorageSync.getSyncStatus();
        status.chromeStorage.lastSync = chromeStatus.lastSync;
        status.chromeStorage.status = this.syncInProgress ? 'syncing' : 'idle';
      } catch (error) {
        status.chromeStorage.status = 'error';
      }
    }

    // Get incremental sync status
    if (status.incremental.enabled) {
      try {
        const incrementalStatus = await incrementalSyncManager.getSyncStatus();
        status.incremental.collections = incrementalStatus.collections;
      } catch (error) {
        // Collections will remain empty
      }
    }

    // Get offline status
    if (this.options.enableOfflineSupport) {
      try {
        const offlineStatus = await offlineSupportManager.getStatus();
        status.offline = {
          hasPendingChanges: offlineStatus.hasPendingChanges,
          pendingItemsCount: offlineStatus.pendingItemsCount,
          syncInProgress: offlineStatus.syncInProgress,
        };
      } catch (error) {
        // Offline status remains default
      }
    }

    // Get conflict status
    if (this.options.enableConflictResolution) {
      const conflictStats = conflictResolver.getConflictStats();
      status.conflicts = {
        unresolvedCount: conflictStats.unresolved,
        totalCount: conflictStats.total,
      };
    }

    return status;
  }

  /**
   * Update sync options
   */
  async updateOptions(newOptions: Partial<SyncManagerOptions>): Promise<void> {
    this.options = { ...this.options, ...newOptions };

    // Save to settings
    const settings = await settingsRepository.getGlobalSettings();
    settings.sync = settings.sync || {};
    settings.sync.manager = this.options;
    await settingsRepository.updateGlobalSettings(settings);

    // Restart auto-sync if interval changed
    this.setupAutoSync();

    console.log('Sync manager options updated');
  }

  /**
   * Subscribe to sync status changes
   */
  onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.statusCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  /**
   * Resolve sync conflicts
   */
  async resolveConflicts(conflictIds: string[], resolution: 'local' | 'remote' | 'merge'): Promise<void> {
    if (!this.options.enableConflictResolution) {
      throw new Error('Conflict resolution is disabled');
    }

    conflictResolver.resolveConflictsBatch(conflictIds, resolution);
    this.notifyStatusChange();
  }

  /**
   * Get unresolved conflicts
   */
  getUnresolvedConflicts(): any[] {
    if (!this.options.enableConflictResolution) {
      return [];
    }

    return conflictResolver.getUnresolvedConflicts();
  }

  /**
   * Clear sync data and reset
   */
  async resetSync(): Promise<void> {
    console.log('Resetting sync data...');

    const resetPromises = [];

    if (this.options.enableChromeStorage && ChromeStorageSync.isSupported()) {
      resetPromises.push(chromeStorageSync.clearSyncedData());
    }

    if (this.options.enableOfflineSupport) {
      resetPromises.push(offlineSupportManager.clearQueue());
    }

    if (this.options.enableConflictResolution) {
      conflictResolver.clearResolvedConflicts();
    }

    await Promise.all(resetPromises);

    // Reset incremental checkpoints
    const collections = ['meetings', 'transcripts'];
    for (const collection of collections) {
      await incrementalSyncManager.resetCheckpoint(collection);
    }

    console.log('Sync data reset complete');
  }

  // Private methods

  private async loadOptions(): Promise<void> {
    try {
      const settings = await settingsRepository.getGlobalSettings();
      if (settings.sync?.manager) {
        this.options = { ...this.options, ...settings.sync.manager };
      }
    } catch (error) {
      console.warn('Failed to load sync options:', error);
    }
  }

  private setupAutoSync(): void {
    // Clear existing timer
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
    }

    // Set up new timer if auto-sync is enabled
    if (this.options.autoSyncInterval > 0) {
      this.autoSyncTimer = window.setInterval(() => {
        if (navigator.onLine && !this.syncInProgress) {
          this.syncAll().catch(error => {
            console.warn('Auto-sync failed:', error);
          });
        }
      }, this.options.autoSyncInterval * 60 * 1000);
    }
  }

  private notifyStatusChange(): void {
    this.getStatus().then(status => {
      this.statusCallbacks.forEach(callback => {
        try {
          callback(status);
        } catch (error) {
          console.warn('Sync status callback error:', error);
        }
      });
    }).catch(error => {
      console.warn('Failed to get sync status for notification:', error);
    });
  }
}

// Singleton instance
export const syncManager = new SyncManager();