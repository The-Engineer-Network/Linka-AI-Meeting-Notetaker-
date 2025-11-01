// hooks/useOfflineSupport.ts
import { useState, useEffect } from 'react';
import { syncService } from '@/lib/backend-init';

export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [pendingChanges, setPendingChanges] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      syncService.syncAll().catch(console.error);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for sync status changes
    const unsubscribe = syncService.onStatusChange((status) => {
      setSyncStatus(status.offline.syncInProgress ? 'syncing' : 'synced');
      setPendingChanges(status.offline.pendingItemsCount);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const forceSync = async () => {
    try {
      setSyncStatus('syncing');
      await syncService.syncAll({ force: true });
      setSyncStatus('synced');
    } catch (error) {
      setSyncStatus('error');
      throw error;
    }
  };

  return {
    isOnline,
    syncStatus,
    pendingChanges,
    forceSync
  };
}