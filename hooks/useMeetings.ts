// hooks/useMeetings.ts
import { useState, useEffect, useCallback } from 'react';
import { database } from '@/lib/backend-init';
import type { MeetingRecord } from '@/lib/database/schemas';

export function useMeetings() {
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await database.meetings.getAll();
      setMeetings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMeeting = useCallback(async (meetingData: Partial<MeetingRecord>) => {
    try {
      const newMeeting = await database.meetings.create(meetingData);
      setMeetings(prev => [newMeeting, ...prev]);
      return newMeeting;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
      throw err;
    }
  }, []);

  const updateMeeting = useCallback(async (id: string, updates: Partial<MeetingRecord>) => {
    try {
      const updated = await database.meetings.update(id, updates);
      setMeetings(prev => prev.map(m => m.id === id ? updated : m));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update meeting');
      throw err;
    }
  }, []);

  const deleteMeeting = useCallback(async (id: string) => {
    try {
      await database.meetings.delete(id);
      setMeetings(prev => prev.map(m => m.id === id ? { ...m, deleted: true } : m));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete meeting');
      throw err;
    }
  }, []);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  return {
    meetings,
    loading,
    error,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    refresh: loadMeetings
  };
}