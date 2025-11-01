// hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { settingsManager } from '@/lib/backend-init';
import type { SettingsRecord } from '@/lib/database/schemas';

export function useSettings() {
  const [settings, setSettings] = useState<SettingsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingsManager.getAll();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = useCallback(async (
    category: string,
    key: string,
    value: any
  ) => {
    try {
      setSaving(true);
      setError(null);

      await settingsManager.update({
        category,
        key,
        value
      });

      // Update local state
      setSettings(prev => {
        if (!prev) return prev;
        const categoryKey = category as keyof SettingsRecord;
        return {
          ...prev,
          [categoryKey]: {
            ...(prev[categoryKey] as any),
            [key]: value
          }
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update setting');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const resetCategory = useCallback(async (category: string) => {
    try {
      setSaving(true);
      setError(null);

      await settingsManager.resetCategory(category as any);

      // Reload settings
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset category');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [loadSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    updateSetting,
    resetCategory,
    refresh: loadSettings
  };
}