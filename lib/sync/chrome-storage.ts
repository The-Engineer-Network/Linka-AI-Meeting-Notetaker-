// lib/sync/chrome-storage.ts

import { settingsRepository } from '../database';

export interface ChromeStorageOptions {
  syncEnabled: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
  maxStorageSize: number; // MB
  excludedKeys: string[];
}

export interface SyncMetadata {
  lastSync: number;
  version: string;
  deviceId: string;
  changesCount: number;
  storageUsed: number;
}

export class ChromeStorageSync {
  private static readonly STORAGE_KEY_PREFIX = 'linka_sync_';
  private static readonly METADATA_KEY = 'linka_sync_metadata';
  private static readonly CHANGES_KEY = 'linka_sync_changes';

  private options: ChromeStorageOptions = {
    syncEnabled: true,
    autoSync: true,
    syncInterval: 15, // 15 minutes
    maxStorageSize: 5, // 5MB
    excludedKeys: ['temp', 'cache', 'session'],
  };

  private deviceId: string;
  private syncTimer: number | null = null;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.deviceId = this.generateDeviceId();
    this.setupEventListeners();
    this.loadOptions();
  }

  /**
   * Check if Chrome storage sync is available
   */
  static isSupported(): boolean {
    return typeof chrome !== 'undefined' && !!chrome.storage?.sync;
  }

  /**
   * Initialize sync system
   */
  async initialize(): Promise<void> {
    if (!ChromeStorageSync.isSupported()) {
      throw new Error('Chrome storage sync is not supported');
    }

    await this.loadOptions();
    await this.initializeMetadata();

    if (this.options.autoSync) {
      this.startAutoSync();
    }

    console.log('Chrome storage sync initialized');
  }

  /**
   * Sync data to Chrome storage
   */
  async syncToStorage(data: any, options: { force?: boolean } = {}): Promise<void> {
    if (!this.options.syncEnabled && !options.force) {
      return;
    }

    try {
      // Prepare data for storage
      const syncData = this.prepareDataForSync(data);

      // Check storage size limits
      const dataSize = this.calculateDataSize(syncData);
      if (dataSize > this.options.maxStorageSize * 1024 * 1024) {
        throw new Error(`Data size (${dataSize} bytes) exceeds maximum storage size`);
      }

      // Store in Chrome sync storage
      await this.setStorageData(syncData);

      // Update metadata
      await this.updateMetadata({
        lastSync: Date.now(),
        storageUsed: dataSize,
        changesCount: this.countChanges(data),
      });

      console.log(`Synced ${dataSize} bytes to Chrome storage`);
    } catch (error) {
      console.error('Sync to storage failed:', error);
      throw error;
    }
  }

  /**
   * Sync data from Chrome storage
   */
  async syncFromStorage(): Promise<any> {
    if (!this.options.syncEnabled) {
      return null;
    }

    try {
      const syncData = await this.getStorageData();
      if (!syncData) {
        return null;
      }

      // Validate and process synced data
      const processedData = this.processSyncedData(syncData);

      // Update local metadata
      const metadata = await this.getMetadata();
      if (metadata) {
        metadata.lastSync = Date.now();
        await this.setMetadata(metadata);
      }

      console.log('Synced data from Chrome storage');
      return processedData;
    } catch (error) {
      console.error('Sync from storage failed:', error);
      throw error;
    }
  }

  /**
   * Force immediate sync
   */
  async forceSync(): Promise<void> {
    await this.syncToStorage({}, { force: true });
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    enabled: boolean;
    lastSync: number | null;
    nextSync: number | null;
    storageUsed: number;
    isOnline: boolean;
    deviceId: string;
  }> {
    const metadata = await this.getMetadata();

    return {
      enabled: this.options.syncEnabled,
      lastSync: metadata?.lastSync || null,
      nextSync: this.syncTimer ? Date.now() + (this.options.syncInterval * 60 * 1000) : null,
      storageUsed: metadata?.storageUsed || 0,
      isOnline: this.isOnline,
      deviceId: this.deviceId,
    };
  }

  /**
   * Update sync options
   */
  async updateOptions(newOptions: Partial<ChromeStorageOptions>): Promise<void> {
    this.options = { ...this.options, ...newOptions };

    // Save options to settings
    const settings = await settingsRepository.getGlobalSettings();
    settings.sync = settings.sync || {};
    settings.sync.chromeStorage = this.options;
    await settingsRepository.updateGlobalSettings(settings);

    // Restart auto-sync if needed
    if (this.options.autoSync) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }

    console.log('Chrome storage sync options updated');
  }

  /**
   * Clear all synced data
   */
  async clearSyncedData(): Promise<void> {
    try {
      await chrome.storage.sync.clear();
      await this.initializeMetadata();
      console.log('Synced data cleared');
    } catch (error) {
      console.error('Failed to clear synced data:', error);
      throw error;
    }
  }

  /**
   * Get storage usage information
   */
  async getStorageUsage(): Promise<{
    used: number;
    quota: number;
    percentage: number;
  }> {
    try {
      const metadata = await this.getMetadata();
      const quota = this.options.maxStorageSize * 1024 * 1024; // Convert MB to bytes
      const used = metadata?.storageUsed || 0;
      const percentage = quota > 0 ? (used / quota) * 100 : 0;

      return {
        used,
        quota,
        percentage,
      };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return {
        used: 0,
        quota: this.options.maxStorageSize * 1024 * 1024,
        percentage: 0,
      };
    }
  }

  // Private methods

  private async loadOptions(): Promise<void> {
    try {
      const settings = await settingsRepository.getGlobalSettings();
      if (settings.sync?.chromeStorage) {
        this.options = { ...this.options, ...settings.sync.chromeStorage };
      }
    } catch (error) {
      console.warn('Failed to load sync options:', error);
    }
  }

  private async initializeMetadata(): Promise<void> {
    const metadata: SyncMetadata = {
      lastSync: 0,
      version: '1.0.0',
      deviceId: this.deviceId,
      changesCount: 0,
      storageUsed: 0,
    };

    await this.setMetadata(metadata);
  }

  private async getMetadata(): Promise<SyncMetadata | null> {
    try {
      const result = await chrome.storage.sync.get(ChromeStorageSync.METADATA_KEY);
      return result[ChromeStorageSync.METADATA_KEY] || null;
    } catch (error) {
      console.warn('Failed to get metadata:', error);
      return null;
    }
  }

  private async setMetadata(metadata: SyncMetadata): Promise<void> {
    try {
      await chrome.storage.sync.set({
        [ChromeStorageSync.METADATA_KEY]: metadata,
      });
    } catch (error) {
      console.warn('Failed to set metadata:', error);
    }
  }

  private async updateMetadata(updates: Partial<SyncMetadata>): Promise<void> {
    const current = await this.getMetadata();
    if (current) {
      const updated = { ...current, ...updates };
      await this.setMetadata(updated);
    }
  }

  private async setStorageData(data: any): Promise<void> {
    const storageData: Record<string, any> = {};

    // Split large data into chunks if needed
    const chunks = this.chunkData(data);
    chunks.forEach((chunk, index) => {
      storageData[`${ChromeStorageSync.STORAGE_KEY_PREFIX}${index}`] = chunk;
    });

    await chrome.storage.sync.set(storageData);
  }

  private async getStorageData(): Promise<any> {
    try {
      const allData = await chrome.storage.sync.get(null);
      const chunks: any[] = [];

      // Collect all sync data chunks
      Object.keys(allData).forEach(key => {
        if (key.startsWith(ChromeStorageSync.STORAGE_KEY_PREFIX)) {
          chunks.push(allData[key]);
        }
      });

      // Reassemble chunks
      return this.reassembleChunks(chunks);
    } catch (error) {
      console.warn('Failed to get storage data:', error);
      return null;
    }
  }

  private prepareDataForSync(data: any): any {
    // Remove excluded keys
    const filtered = { ...data };
    this.options.excludedKeys.forEach(key => {
      delete filtered[key];
    });

    // Add sync metadata
    filtered._syncMetadata = {
      timestamp: Date.now(),
      deviceId: this.deviceId,
      version: '1.0.0',
    };

    return filtered;
  }

  private processSyncedData(data: any): any {
    // Remove sync metadata before returning
    const processed = { ...data };
    delete processed._syncMetadata;

    return processed;
  }

  private calculateDataSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private countChanges(data: any): number {
    // Simple change counting - in a real implementation,
    // you'd compare with previous version
    return Object.keys(data).length;
  }

  private chunkData(data: any, maxChunkSize: number = 8000): any[] {
    const jsonString = JSON.stringify(data);
    const chunks: string[] = [];

    for (let i = 0; i < jsonString.length; i += maxChunkSize) {
      chunks.push(jsonString.slice(i, i + maxChunkSize));
    }

    return chunks;
  }

  private reassembleChunks(chunks: string[]): any {
    const fullString = chunks.join('');
    try {
      return JSON.parse(fullString);
    } catch (error) {
      console.error('Failed to reassemble chunks:', error);
      return null;
    }
  }

  private generateDeviceId(): string {
    // Generate a unique device ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `device_${timestamp}_${random}`;
  }

  private setupEventListeners(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      if (this.options.autoSync) {
        this.forceSync(); // Sync when coming back online
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Listen for storage changes from other devices
    if (chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync') {
          console.log('Chrome storage changed from another device');
          // Handle incoming changes from other devices
          this.handleIncomingChanges(changes);
        }
      });
    }
  }

  private async handleIncomingChanges(changes: { [key: string]: chrome.storage.StorageChange }): Promise<void> {
    // Handle changes from other devices
    // This would typically trigger a merge or conflict resolution
    console.log('Handling incoming storage changes:', Object.keys(changes));
  }

  private startAutoSync(): void {
    this.stopAutoSync(); // Clear existing timer

    this.syncTimer = window.setInterval(() => {
      if (this.isOnline) {
        this.forceSync().catch(error => {
          console.warn('Auto-sync failed:', error);
        });
      }
    }, this.options.syncInterval * 60 * 1000); // Convert minutes to milliseconds
  }

  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
}

// Singleton instance
export const chromeStorageSync = new ChromeStorageSync();