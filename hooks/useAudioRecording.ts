// hooks/useAudioRecording.ts
import { useState, useRef, useCallback } from 'react';
import { audioService } from '@/lib/backend-init';

export function useAudioRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const currentMeetingId = useRef<string | null>(null);

  const startRecording = useCallback(async (meetingId?: string) => {
    try {
      setError(null);
      const id = meetingId || `meeting_${Date.now()}`;
      currentMeetingId.current = id;

      await audioService.startRecording(id);
      setIsRecording(true);

      // Start duration timer
      durationInterval.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      throw err;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      if (!currentMeetingId.current) {
        throw new Error('No active recording');
      }

      const audioBlob = await audioService.stopRecording(currentMeetingId.current);
      setIsRecording(false);

      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }

      setDuration(0);
      currentMeetingId.current = null;
      return audioBlob;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
      throw err;
    }
  }, []);

  const pauseRecording = useCallback(async () => {
    try {
      if (!currentMeetingId.current) {
        throw new Error('No active recording');
      }

      // Note: This would need to be implemented in the AudioManager
      // For now, we'll just stop the timer
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause recording');
    }
  }, []);

  const resumeRecording = useCallback(async () => {
    try {
      if (!currentMeetingId.current) {
        throw new Error('No active recording');
      }

      // Note: This would need to be implemented in the AudioManager
      // For now, we'll just restart the timer
      durationInterval.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume recording');
    }
  }, []);

  return {
    isRecording,
    duration,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording
  };
}