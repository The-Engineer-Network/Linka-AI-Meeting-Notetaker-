// lib/sync/__tests__/sync.test.ts

import { SyncManager, syncManager } from '../manager';
import { ChromeStorageSync, chromeStorageSync } from '../chrome-storage';
import { ConflictResolver, conflictResolver } from '../conflict-resolution';
import { OfflineSupportManager, offlineSupportManager } from '../offline-support';
import { IncrementalSyncManager, incrementalSyncManager } from '../incremental-sync';
import { BackupRestoreManager, backupRestoreManager } from '../backup-restore';
import { SyncSystem, syncSystem } from '../index';

// Mock dependencies
jest.mock('../../database', () => ({
  settingsRepository: {
    getGlobalSettings: jest.fn(),
    updateGlobalSettings: jest.fn(),
  },
  meetingsRepository: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  transcriptsRepository: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  dbUtils: {
    getAll: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    getByKey: jest.fn(),
  },
}));

// Mock Chrome APIs
const mockChrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
      onChanged: {
        addListener: jest.fn(),
      },
    },
  },
};

// @ts-ignore
global.chrome = mockChrome;

describe('Sync System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock settings
    const mockSettingsRepo = require('../../database').settingsRepository;
    mockSettingsRepo.getGlobalSettings.mockResolvedValue({
      sync: {
        manager: {
          enableChromeStorage: true,
          enableIncrementalSync: true,
          enableOfflineSupport: true,
          enableConflictResolution: true,
          autoSyncInterval: 15,
        },
      },
    });
    mockSettingsRepo.updateGlobalSettings.mockResolvedValue(undefined);

    // Mock repositories
    const mockMeetingsRepo = require('../../database').meetingsRepository;
    mockMeetingsRepo.getAll.mockResolvedValue([
      {
        id: 'meeting-1',
        title: 'Test Meeting',
        timestamp: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const mockTranscriptsRepo = require('../../database').transcriptsRepository;
    mockTranscriptsRepo.getAll.mockResolvedValue([]);

    // Mock Chrome storage
    mockChrome.storage.sync.get.mockResolvedValue({});
    mockChrome.storage.sync.set.mockResolvedValue(undefined);
  });

  describe('SyncManager', () => {
    test('should initialize sync systems', async () => {
      await syncManager.initialize();
      expect(syncManager).toBeDefined();
    });

    test('should perform full sync', async () => {
      const result = await syncManager.syncAll();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('errors');
    });

    test('should get sync status', async () => {
      const status = await syncManager.getStatus();
      expect(status).toHaveProperty('isOnline');
      expect(status).toHaveProperty('chromeStorage');
      expect(status).toHaveProperty('incremental');
      expect(status).toHaveProperty('offline');
      expect(status).toHaveProperty('conflicts');
    });

    test('should sync specific collection', async () => {
      const result = await syncManager.syncCollection('meetings');
      expect(result).toBeDefined();
    });

    test('should handle sync status callbacks', () => {
      const callback = jest.fn();
      const unsubscribe = syncManager.onStatusChange(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });
  });

  describe('ChromeStorageSync', () => {
    test('should check if supported', () => {
      const supported = ChromeStorageSync.isSupported();
      expect(typeof supported).toBe('boolean');
    });

    test('should sync to storage', async () => {
      const result = await chromeStorageSync.syncToStorage({ test: 'data' });
      expect(result).toBeUndefined(); // Should not throw
    });

    test('should get sync status', async () => {
      const status = await chromeStorageSync.getSyncStatus();
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('lastSync');
    });
  });

  describe('ConflictResolver', () => {
    test('should detect conflicts', () => {
      const localData = { title: 'Local Title', content: 'Local content' };
      const remoteData = { title: 'Remote Title', content: 'Local content' };

      const conflicts = conflictResolver.detectConflicts(localData, remoteData, 'test');

      expect(Array.isArray(conflicts)).toBe(true);
    });

    test('should resolve conflicts', () => {
      // Create a mock conflict
      const conflict = {
        id: 'conflict-1',
        localVersion: 'local',
        remoteVersion: 'remote',
        field: 'title',
        timestamp: Date.now(),
        resolved: false,
      };

      // Manually add to conflicts map for testing
      (conflictResolver as any).conflicts.set(conflict.id, conflict);

      const result = conflictResolver.resolveConflict(conflict.id, 'local');
      expect(result).toBe('local');
    });

    test('should get conflict stats', () => {
      const stats = conflictResolver.getConflictStats();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('resolved');
      expect(stats).toHaveProperty('unresolved');
    });
  });

  describe('OfflineSupportManager', () => {
    test('should initialize', async () => {
      await offlineSupportManager.initialize();
      expect(offlineSupportManager).toBeDefined();
    });

    test('should queue operations', async () => {
      const operationId = await offlineSupportManager.queueOperation(
        'create',
        'meetings',
        { title: 'Test Meeting' }
      );

      expect(typeof operationId).toBe('string');
      expect(operationId).toMatch(/^offline_op_/);
    });

    test('should get offline status', async () => {
      const status = await offlineSupportManager.getStatus();
      expect(status).toHaveProperty('isOnline');
      expect(status).toHaveProperty('hasPendingChanges');
      expect(status).toHaveProperty('pendingItemsCount');
    });

    test('should get queue stats', async () => {
      const stats = await offlineSupportManager.getQueueStats();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byType');
      expect(stats).toHaveProperty('byPriority');
    });
  });

  describe('IncrementalSyncManager', () => {
    test('should initialize', async () => {
      await incrementalSyncManager.initialize();
      expect(incrementalSyncManager).toBeDefined();
    });

    test('should get incremental changes', async () => {
      const changes = await incrementalSyncManager.getIncrementalChanges('meetings');
      expect(changes).toHaveProperty('collection');
      expect(changes).toHaveProperty('created');
      expect(changes).toHaveProperty('updated');
      expect(changes).toHaveProperty('deleted');
      expect(changes).toHaveProperty('checkpoint');
    });

    test('should get sync status', async () => {
      const status = await incrementalSyncManager.getSyncStatus();
      expect(status).toHaveProperty('collections');
      expect(Array.isArray(status.collections)).toBe(true);
    });
  });

  describe('BackupRestoreManager', () => {
    test('should create backup', async () => {
      const result = await backupRestoreManager.createBackup();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('blob');
    });

    test('should list backups', async () => {
      const backups = await backupRestoreManager.listBackups();
      expect(Array.isArray(backups)).toBe(true);
    });

    test('should get backup stats', async () => {
      const stats = await backupRestoreManager.getBackupStats();
      expect(stats).toHaveProperty('totalBackups');
      expect(stats).toHaveProperty('totalSize');
    });
  });

  describe('SyncSystem', () => {
    test('should initialize', async () => {
      await syncSystem.initialize();
      expect(syncSystem).toBeDefined();
    });

    test('should sync all', async () => {
      const result = await syncSystem.syncAll();
      expect(result).toHaveProperty('success');
    });

    test('should get status', async () => {
      const status = await syncSystem.getStatus();
      expect(status).toHaveProperty('isOnline');
    });

    test('should create backup', async () => {
      const result = await syncSystem.createBackup();
      expect(result).toHaveProperty('success');
    });

    test('should queue offline operation', async () => {
      const operationId = await syncSystem.queueOfflineOperation(
        'create',
        'meetings',
        { title: 'Test' }
      );
      expect(typeof operationId).toBe('string');
    });
  });

  describe('Error Handling', () => {
    test('should handle sync failures gracefully', async () => {
      // Mock a failure in Chrome storage
      mockChrome.storage.sync.set.mockRejectedValue(new Error('Storage quota exceeded'));

      const result = await syncManager.syncAll();
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Chrome storage sync failed: Storage quota exceeded');
    });

    test('should handle offline queue processing failures', async () => {
      // Mock offline processing failure
      const mockOfflineManager = require('../offline-support').offlineSupportManager;
      mockOfflineManager.processQueue = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await syncManager.syncAll();
      expect(result.offline.success).toBe(false);
    });

    test('should handle backup creation failures', async () => {
      // Mock database failure
      const mockDbUtils = require('../../database').dbUtils;
      mockDbUtils.getAll.mockRejectedValue(new Error('Database error'));

      await expect(backupRestoreManager.createBackup()).rejects.toThrow('Database error');
    });
  });

  describe('Integration Tests', () => {
    test('should perform complete sync workflow', async () => {
      // Initialize
      await syncSystem.initialize();

      // Create some test data
      await syncSystem.queueOfflineOperation('create', 'meetings', {
        title: 'Integration Test Meeting',
        timestamp: new Date(),
      });

      // Sync all
      const syncResult = await syncSystem.syncAll();
      expect(syncResult).toHaveProperty('success');

      // Create backup
      const backupResult = await syncSystem.createBackup();
      expect(backupResult.success).toBe(true);

      // Get status
      const status = await syncSystem.getStatus();
      expect(status).toHaveProperty('isOnline');
    });

    test('should handle cross-device sync simulation', async () => {
      // Simulate data from another device
      const remoteData = {
        meetings: [
          {
            id: 'remote-meeting-1',
            title: 'Remote Meeting',
            timestamp: new Date(),
            _lastModified: Date.now(),
          },
        ],
      };

      // Mock receiving remote data
      mockChrome.storage.sync.get.mockResolvedValue({
        'linka_sync_data': remoteData,
      });

      // Sync from storage
      await chromeStorageSync.syncFromStorage();

      // Check that incremental sync detects changes
      const changes = await incrementalSyncManager.getIncrementalChanges('meetings');
      expect(changes.created.length).toBeGreaterThan(0);
    });

    test('should handle conflict resolution workflow', () => {
      // Create conflicting data
      const localData = { title: 'Local Version', content: 'Local content' };
      const remoteData = { title: 'Remote Version', content: 'Local content' };

      // Detect conflicts
      const conflicts = conflictResolver.detectConflicts(localData, remoteData, 'meeting-1');
      expect(conflicts.length).toBe(1);

      // Resolve conflict
      const resolvedValue = conflictResolver.resolveConflict(conflicts[0].id, 'merge');
      expect(resolvedValue).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    test('should handle large datasets efficiently', async () => {
      // Create large mock dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `meeting-${i}`,
        title: `Meeting ${i}`,
        timestamp: new Date(),
        updatedAt: new Date(),
        content: 'Large content '.repeat(100), // ~1300 characters
      }));

      const mockMeetingsRepo = require('../../database').meetingsRepository;
      mockMeetingsRepo.getAll.mockResolvedValue(largeDataset);

      const startTime = Date.now();
      const changes = await incrementalSyncManager.getIncrementalChanges('meetings');
      const endTime = Date.now();

      expect(changes.created.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should limit sync batch sizes', async () => {
      // Test that large change sets are properly batched
      const largeChanges = {
        collection: 'meetings',
        created: Array.from({ length: 150 }, (_, i) => ({ id: `meeting-${i}`, title: `Meeting ${i}` })),
        updated: [],
        deleted: [],
        checkpoint: {
          id: 'test-checkpoint',
          collection: 'meetings',
          lastSyncTimestamp: Date.now(),
          lastSyncVersion: '1.0.0',
          recordCount: 150,
          checksum: 'test-checksum',
        },
      };

      const result = await incrementalSyncManager.applyIncrementalChanges(largeChanges);
      expect(result.applied + result.failed + result.skipped).toBe(150);
    });
  });
});