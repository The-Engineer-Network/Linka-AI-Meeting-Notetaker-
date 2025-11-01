// hooks/useRealtimeUpdates.ts
import { useEffect, useRef } from 'react';
import { syncService } from '@/lib/backend-init';

export function useRealtimeUpdates(onUpdate: (data: any) => void) {
  const callbackRef = useRef(onUpdate);

  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const handleSyncUpdate = (data: any) => {
      callbackRef.current(data);
    };

    // Listen for sync updates
    const unsubscribe = syncService.onStatusChange(handleSyncUpdate);

    return unsubscribe;
  }, []);
}

// Hook for meeting-specific real-time updates
export function useMeetingUpdates(meetingId: string, onUpdate: (data: any) => void) {
  const callbackRef = useRef(onUpdate);

  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const handleMeetingUpdate = (data: any) => {
      if (data.meetingId === meetingId) {
        callbackRef.current(data);
      }
    };

    // Listen for meeting-specific updates
    const unsubscribe = syncService.onStatusChange(handleMeetingUpdate);

    return unsubscribe;
  }, [meetingId]);
}

// Hook for transcript real-time updates
export function useTranscriptUpdates(meetingId: string, onUpdate: (data: any) => void) {
  const callbackRef = useRef(onUpdate);

  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const handleTranscriptUpdate = (data: any) => {
      if (data.type === 'transcript_update' && data.meetingId === meetingId) {
        callbackRef.current(data);
      }
    };

    // Listen for transcript updates
    const unsubscribe = syncService.onStatusChange(handleTranscriptUpdate);

    return unsubscribe;
  }, [meetingId]);
}