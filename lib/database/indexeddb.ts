// lib/database/indexeddb.ts

import {
  DB_NAME,
  DB_VERSION,
  DB_SCHEMAS,
  STORES,
  MeetingRecord,
  TranscriptChunk,
  SettingsRecord,
  ProcessingQueueItem,
  DEFAULT_SETTINGS,
} from './schemas';

export class LinkaDatabase {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.init();
  }

  /**
   * Initialize the database connection
   */
  private async init(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.upgradeDatabase(db, event.oldVersion, event.newVersion || DB_VERSION);
      };
    });

    return this.dbPromise;
  }

  /**
   * Handle database schema upgrades
   */
  private upgradeDatabase(db: IDBDatabase, oldVersion: number, newVersion: number): void {
    console.log(`Upgrading database from ${oldVersion} to ${newVersion}`);

    // Create object stores for the current version
    const schema = DB_SCHEMAS[newVersion as keyof typeof DB_SCHEMAS];
    if (!schema) {
      throw new Error(`No schema defined for version ${newVersion}`);
    }

    Object.entries(schema.stores).forEach(([storeName, storeConfig]) => {
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, {
          keyPath: (storeConfig as any).keyPath,
        });

        // Create indexes
        Object.entries((storeConfig as any).indexes).forEach(([indexName, indexKeyPath]) => {
          store.createIndex(indexName, indexKeyPath as string);
        });
      }
    });

    // Initialize default settings if this is a fresh install
    if (oldVersion === 0) {
      this.initializeDefaultData(db);
    }
  }

  /**
   * Initialize default data for fresh installations
   */
  private initializeDefaultData(db: IDBDatabase): void {
    const settingsStore = db.transaction([STORES.SETTINGS], 'readwrite').objectStore(STORES.SETTINGS);

    const defaultSettings: SettingsRecord = {
      id: 'global',
      ...DEFAULT_SETTINGS,
      updatedAt: new Date(),
    };

    settingsStore.add(defaultSettings);
  }

  /**
   * Get database instance
   */
  async getDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }
    return this.init();
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.dbPromise = null;
    }
  }

  /**
   * Clear all data (for testing or reset)
   */
  async clearAllData(): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(Object.values(STORES), 'readwrite');

    Object.values(STORES).forEach(storeName => {
      transaction.objectStore(storeName).clear();
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    meetings: number;
    transcripts: number;
    processingQueue: number;
    storageEstimate?: number;
  }> {
    const db = await this.getDB();
    const transaction = db.transaction(Object.values(STORES), 'readonly');

    const stats = {
      meetings: 0,
      transcripts: 0,
      processingQueue: 0,
      storageEstimate: undefined as number | undefined,
    };

    // Count records in each store
    const promises = Object.values(STORES).map(storeName => {
      return new Promise<void>((resolve) => {
        const store = transaction.objectStore(storeName);
        const countRequest = store.count();

        countRequest.onsuccess = () => {
          switch (storeName) {
            case STORES.MEETINGS:
              stats.meetings = countRequest.result;
              break;
            case STORES.TRANSCRIPTS:
              stats.transcripts = countRequest.result;
              break;
            case STORES.PROCESSING_QUEUE:
              stats.processingQueue = countRequest.result;
              break;
          }
          resolve();
        };
      });
    });

    await Promise.all(promises);

    // Get storage estimate if available
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        stats.storageEstimate = estimate.usage;
      } catch (error) {
        console.warn('Could not get storage estimate:', error);
      }
    }

    return stats;
  }

  /**
   * Export all data as JSON
   */
  async exportData(): Promise<string> {
    const db = await this.getDB();
    const transaction = db.transaction(Object.values(STORES), 'readonly');

    const exportData: Record<string, any[]> = {};

    const promises = Object.values(STORES).map(storeName => {
      return new Promise<void>((resolve) => {
        const store = transaction.objectStore(storeName);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          exportData[storeName] = getAllRequest.result;
          resolve();
        };
      });
    });

    await Promise.all(promises);
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import data from JSON export
   */
  async importData(jsonData: string): Promise<void> {
    const importData = JSON.parse(jsonData);
    const db = await this.getDB();

    for (const [storeName, records] of Object.entries(importData)) {
      if (!Object.values(STORES).includes(storeName as any)) {
        console.warn(`Unknown store: ${storeName}, skipping`);
        continue;
      }

      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      for (const record of records) {
        store.put(record);
      }

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    }
  }
}

// Singleton instance
export const linkaDB = new LinkaDatabase();

// Utility functions for common operations
export const dbUtils = {
  /**
   * Execute a database operation with automatic transaction management
   */
  async executeInTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await linkaDB.getDB();
    const transaction = db.transaction([storeName], mode);
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);

      transaction.onerror = () => reject(transaction.error);
    });
  },

  /**
   * Get all records from a store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    return dbUtils.executeInTransaction(
      storeName,
      'readonly',
      (store) => store.getAll()
    );
  },

  /**
   * Get a record by key
   */
  async getByKey<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    try {
      return await dbUtils.executeInTransaction(
        storeName,
        'readonly',
        (store) => store.get(key)
      );
    } catch (error) {
      return undefined;
    }
  },

  /**
   * Add or update a record
   */
  async put<T extends { id: string }>(storeName: string, record: T): Promise<void> {
    await dbUtils.executeInTransaction(
      storeName,
      'readwrite',
      (store) => store.put(record)
    );
  },

  /**
   * Delete a record by key
   */
  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    await dbUtils.executeInTransaction(
      storeName,
      'readwrite',
      (store) => store.delete(key)
    );
  },

  /**
   * Query records using an index
   */
  async queryByIndex<T>(
    storeName: string,
    indexName: string,
    keyRange?: IDBKeyRange
  ): Promise<T[]> {
    const db = await linkaDB.getDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);

    return new Promise((resolve, reject) => {
      const request = keyRange ? index.getAll(keyRange) : index.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
};