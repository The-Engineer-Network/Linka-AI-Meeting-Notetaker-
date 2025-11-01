# Frontend Integration Guide - Linka AI Meeting Notetaker

## Overview

This guide explains how to integrate the backend APIs with the frontend components. The backend provides comprehensive APIs for all functionality, and the frontend needs to connect these APIs to create a seamless user experience.

## Backend API Structure

### Core API Modules

#### 1. Database Layer (`lib/database/`)
```typescript
import { database } from '@/lib/database';

// Initialize database
await database.initialize();

// Meeting operations
const meetings = await database.meetings.getAll();
const meeting = await database.meetings.getById('meeting-id');
await database.meetings.create(meetingData);
await database.meetings.update('meeting-id', updateData);
await database.meetings.delete('meeting-id');

// Transcript operations
const transcripts = await database.transcripts.getByMeetingId('meeting-id');
await database.transcripts.create(transcriptData);

// Settings operations
const settings = await database.settings.getGlobalSettings();
await database.settings.updateGlobalSettings(settingsData);
```

#### 2. Audio Processing (`lib/audio/`)
```typescript
import { audioService } from '@/lib/audio';

// Start recording
const stream = await audioService.startRecording();

// Stop recording and get audio data
const audioBlob = await audioService.stopRecording();

// Transcribe audio
const transcript = await audioService.transcribeAudio(audioBlob, {
  language: 'en-US',
  continuous: true,
  interimResults: true
});

// Process audio file
const processedAudio = await audioService.processAudio(audioBlob, {
  noiseReduction: true,
  normalize: true
});
```

#### 3. AI Processing (`lib/ai/`)
```typescript
import { aiService } from '@/lib/ai';

// Summarize transcript
const summary = await aiService.summarize(transcript, {
  style: 'concise',
  length: 'medium',
  includeTimestamps: true
});

// Translate text
const translation = await aiService.translate(text, 'es', {
  sourceLanguage: 'en',
  quality: 'high'
});

// Enhance/proofread text
const enhanced = await aiService.enhanceText(text, {
  tone: 'professional',
  preserveFormatting: true
});

// Extract action items
const actionItems = await aiService.extractActionItems(transcript, {
  includeContext: true,
  focusAreas: ['tasks', 'deadlines']
});
```

#### 4. Export System (`lib/export/`)
```typescript
import { exportService } from '@/lib/export';

// Export to PDF
const pdfBlob = await exportService.exportToPDF(meetingData, {
  includeTranscript: true,
  includeSummary: true,
  template: 'professional'
});

// Export to DOCX
const docxBlob = await exportService.exportToDOCX(meetingData, {
  format: 'meeting_minutes',
  branding: true
});

// Export to text
const textContent = await exportService.exportToText(meetingData, {
  format: 'markdown',
  includeMetadata: true
});

// Share via cloud storage
await exportService.shareToCloud(meetingData, {
  provider: 'google-drive',
  folder: 'Meetings'
});
```

#### 5. Sync System (`lib/sync/`)
```typescript
import { syncService } from '@/lib/sync';

// Initialize sync
await syncService.initialize();

// Sync data
await syncService.sync();

// Check sync status
const status = await syncService.getSyncStatus();

// Handle conflicts
await syncService.resolveConflict(conflictData);

// Backup data
await syncService.createBackup();

// Restore from backup
await syncService.restoreFromBackup(backupData);
```

#### 6. Settings System (`lib/settings/`)
```typescript
import { settingsManager } from '@/lib/settings';

// Get all settings
const settings = await settingsManager.getAll();

// Get category settings
const uiSettings = await settingsManager.getCategory('ui');
const aiSettings = await settingsManager.getCategory('ai');

// Update settings
await settingsManager.update({
  category: 'ui',
  key: 'theme',
  value: 'dark'
});

// Update multiple settings
await settingsManager.updateBatch([
  { category: 'ui', key: 'theme', value: 'dark' },
  { category: 'ui', key: 'language', value: 'es' }
]);

// Reset category
await settingsManager.resetCategory('ui');

// Export settings
const settingsJson = await settingsManager.export();

// Import settings
await settingsManager.import(settingsJson);
```

#### 7. Authentication (`lib/auth/`)
```typescript
import { chromeIdentity } from '@/lib/auth/chrome-identity';

// Get current user
const user = await chromeIdentity.getCurrentUser();

// Get auth token
const token = await chromeIdentity.getAuthToken();

// Check if signed in
const isSignedIn = await chromeIdentity.isSignedIn();

// Sign out
await chromeIdentity.signOut();
```

## Frontend Integration Steps

### Step 1: Initialize Backend Services

Create a central initialization file:

```typescript
// lib/backend-init.ts
import { database } from './database';
import { audioService } from './audio';
import { aiService } from './ai';
import { exportService } from './export';
import { syncService } from './sync';
import { settingsManager } from './settings';
import { chromeIdentity } from './auth/chrome-identity';

export async function initializeBackend() {
  try {
    // Initialize database
    await database.initialize();

    // Initialize sync service
    await syncService.initialize();

    // Load settings
    await settingsManager.initialize();

    // Initialize audio service
    await audioService.initialize();

    // Initialize AI service
    await aiService.initialize();

    console.log('Backend services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize backend services:', error);
    throw error;
  }
}

export {
  database,
  audioService,
  aiService,
  exportService,
  syncService,
  settingsManager,
  chromeIdentity
};
```

### Step 2: Create React Hooks for Backend Integration

#### Database Hook
```typescript
// hooks/useMeetings.ts
import { useState, useEffect, useCallback } from 'react';
import { database } from '@/lib/backend-init';
import type { Meeting } from '@/types/meeting.types';

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
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

  const createMeeting = useCallback(async (meetingData: Partial<Meeting>) => {
    try {
      const newMeeting = await database.meetings.create(meetingData);
      setMeetings(prev => [newMeeting, ...prev]);
      return newMeeting;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
      throw err;
    }
  }, []);

  const updateMeeting = useCallback(async (id: string, updates: Partial<Meeting>) => {
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
    meetings: meetings.filter(m => !m.deleted),
    loading,
    error,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    refresh: loadMeetings
  };
}
```

#### Audio Recording Hook
```typescript
// hooks/useAudioRecording.ts
import { useState, useRef, useCallback } from 'react';
import { audioService } from '@/lib/backend-init';

export function useAudioRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const durationInterval = useRef<NodeJS.Timeout>();

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      await audioService.startRecording();
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
      const audioBlob = await audioService.stopRecording();
      setIsRecording(false);

      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }

      setDuration(0);
      return audioBlob;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
      throw err;
    }
  }, []);

  const pauseRecording = useCallback(async () => {
    try {
      await audioService.pauseRecording();
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause recording');
    }
  }, []);

  const resumeRecording = useCallback(async () => {
    try {
      await audioService.resumeRecording();
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
```

#### AI Processing Hook
```typescript
// hooks/useAIProcessing.ts
import { useState, useCallback } from 'react';
import { aiService } from '@/lib/backend-init';
import type { AIProcessingOptions, AIProcessingResult } from '@/lib/ai/types';

export function useAIProcessing() {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<Record<string, AIProcessingResult>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const processWithAI = useCallback(async (
    operation: 'summarize' | 'translate' | 'enhance' | 'extract',
    input: string,
    options: AIProcessingOptions = {}
  ) => {
    const operationId = `${operation}_${Date.now()}`;

    try {
      setProcessing(true);
      setErrors(prev => ({ ...prev, [operationId]: undefined }));

      let result: AIProcessingResult;

      switch (operation) {
        case 'summarize':
          result = await aiService.summarize(input, options);
          break;
        case 'translate':
          result = await aiService.translate(input, options.targetLanguage!, options);
          break;
        case 'enhance':
          result = await aiService.enhanceText(input, options);
          break;
        case 'extract':
          result = await aiService.extractActionItems(input, options);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      setResults(prev => ({ ...prev, [operationId]: result }));
      return { operationId, result };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI processing failed';
      setErrors(prev => ({ ...prev, [operationId]: errorMessage }));
      throw err;
    } finally {
      setProcessing(false);
    }
  }, []);

  const getResult = useCallback((operationId: string) => {
    return results[operationId];
  }, [results]);

  const getError = useCallback((operationId: string) => {
    return errors[operationId];
  }, [errors]);

  const clearResult = useCallback((operationId: string) => {
    setResults(prev => {
      const newResults = { ...prev };
      delete newResults[operationId];
      return newResults;
    });
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[operationId];
      return newErrors;
    });
  }, []);

  return {
    processing,
    processWithAI,
    getResult,
    getError,
    clearResult,
    results,
    errors
  };
}
```

#### Settings Hook
```typescript
// hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { settingsManager } from '@/lib/backend-init';
import type { Settings } from '@/lib/settings/types';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
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
    category: keyof Settings,
    key: string,
    value: any
  ) => {
    try {
      setSaving(true);
      setError(null);

      await settingsManager.update({
        category: category as string,
        key,
        value
      });

      // Update local state
      setSettings(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [category]: {
            ...prev[category],
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

  const resetCategory = useCallback(async (category: keyof Settings) => {
    try {
      setSaving(true);
      setError(null);

      await settingsManager.resetCategory(category as string);

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
```

### Step 3: Update Existing Components

#### Update Dashboard Page
```typescript
// app/dashboard/page.tsx
'use client';

import { useMeetings } from '@/hooks/useMeetings';
import { useSettings } from '@/hooks/useSettings';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useAIProcessing } from '@/hooks/useAIProcessing';

export default function Dashboard() {
  const { meetings, loading: meetingsLoading, createMeeting } = useMeetings();
  const { settings } = useSettings();
  const { isRecording, startRecording, stopRecording } = useAudioRecording();
  const { processing: aiProcessing, processWithAI } = useAIProcessing();

  const handleStartRecording = async () => {
    try {
      await startRecording();
      // Navigate to live meeting page or show recording UI
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleSummarize = async (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting?.transcript) return;

    try {
      const { result } = await processWithAI('summarize', meeting.transcript, {
        style: settings?.ai?.summarizer?.summaryStyle || 'concise'
      });

      // Update meeting with summary
      await updateMeeting(meetingId, { summary: result.data.summary });
    } catch (error) {
      console.error('Failed to summarize:', error);
    }
  };

  // ... rest of component
}
```

#### Update Live Meeting Page
```typescript
// app/live-meeting/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useAIProcessing } from '@/hooks/useAIProcessing';
import { database } from '@/lib/backend-init';

export default function LiveMeeting() {
  const [transcript, setTranscript] = useState('');
  const [meetingId, setMeetingId] = useState<string | null>(null);

  const { isRecording, duration, startRecording, stopRecording } = useAudioRecording();
  const { processWithAI } = useAIProcessing();

  useEffect(() => {
    // Create meeting record when recording starts
    if (isRecording && !meetingId) {
      createMeetingRecord();
    }
  }, [isRecording, meetingId]);

  const createMeetingRecord = async () => {
    try {
      const meeting = await database.meetings.create({
        title: 'Live Meeting',
        startTime: new Date(),
        status: 'recording'
      });
      setMeetingId(meeting.id);
    } catch (error) {
      console.error('Failed to create meeting record:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioBlob = await stopRecording();

      if (meetingId && audioBlob) {
        // Process audio and generate transcript
        const transcriptResult = await audioService.transcribeAudio(audioBlob);

        if (transcriptResult.success) {
          setTranscript(transcriptResult.data.text);

          // Update meeting with transcript
          await database.meetings.update(meetingId, {
            transcript: transcriptResult.data.text,
            audioBlob,
            endTime: new Date(),
            status: 'completed'
          });
        }
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // ... rest of component
}
```

#### Update Settings Page
```typescript
// app/settings/page.tsx
'use client';

import { useSettings } from '@/hooks/useSettings';
import { GeneralSettings } from './components/GeneralSettings';
import { TranscriptionSettings } from './components/TranscriptionSettings';
import { AISettings } from './components/AISettings';

export default function SettingsPage() {
  const { settings, loading, saving, error, updateSetting, resetCategory } = useSettings();

  if (loading) return <div>Loading settings...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <GeneralSettings
          settings={settings}
          onUpdate={updateSetting}
          onReset={resetCategory}
          saving={saving}
        />

        <TranscriptionSettings
          settings={settings}
          onUpdate={updateSetting}
          onReset={resetCategory}
          saving={saving}
        />

        <AISettings
          settings={settings}
          onUpdate={updateSetting}
          onReset={resetCategory}
          saving={saving}
        />
      </div>
    </div>
  );
}
```

### Step 4: Add Error Boundaries

```typescript
// components/ErrorBoundary.tsx
'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
```

### Step 5: Add Loading States and Skeletons

```typescript
// components/LoadingSkeleton.tsx
export function MeetingCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="flex space-x-2">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
}

export function TranscriptSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-3">
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Step 6: Add Real-time Updates

```typescript
// hooks/useRealtimeUpdates.ts
import { useEffect, useCallback } from 'react';
import { syncService } from '@/lib/backend-init';

export function useRealtimeUpdates(onUpdate: (data: any) => void) {
  useEffect(() => {
    const handleSyncUpdate = (data: any) => {
      onUpdate(data);
    };

    // Listen for sync updates
    syncService.onUpdate(handleSyncUpdate);

    return () => {
      syncService.offUpdate(handleSyncUpdate);
    };
  }, [onUpdate]);
}

// Usage in components
function MeetingList() {
  const { meetings, refresh } = useMeetings();

  useRealtimeUpdates((update) => {
    if (update.type === 'meeting_updated') {
      refresh(); // Refresh meetings list
    }
  });

  // ... rest of component
}
```

### Step 7: Add Offline Support

```typescript
// hooks/useOfflineSupport.ts
import { useState, useEffect } from 'react';
import { syncService } from '@/lib/backend-init';

export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      syncService.sync().catch(console.error);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for sync status changes
    const handleSyncStatus = (status: string) => {
      setSyncStatus(status as 'synced' | 'syncing' | 'error');
    };

    syncService.onStatusChange(handleSyncStatus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      syncService.offStatusChange(handleSyncStatus);
    };
  }, []);

  return { isOnline, syncStatus };
}
```

### Step 8: Initialize App with Backend

```typescript
// app/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { initializeBackend } from '@/lib/backend-init';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeBackend()
      .then(() => {
        setInitialized(true);
      })
      .catch((err) => {
        console.error('Failed to initialize backend:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize app');
      });
  }, []);

  if (error) {
    return (
      <html lang="en">
        <body>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Initialization Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </body>
      </html>
    );
  }

  if (!initialized) {
    return (
      <html lang="en">
        <body>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

## Integration Checklist

### ✅ Core Integration
- [ ] Initialize backend services in app layout
- [ ] Create React hooks for all backend APIs
- [ ] Update existing components to use hooks
- [ ] Add error boundaries and loading states
- [ ] Implement offline support

### ✅ Data Management
- [ ] Connect meetings list to database
- [ ] Implement meeting creation and editing
- [ ] Add transcript display and management
- [ ] Connect export functionality
- [ ] Implement search and filtering

### ✅ Audio & AI Features
- [ ] Connect audio recording to UI
- [ ] Implement real-time transcription display
- [ ] Add AI processing controls
- [ ] Connect summary and translation features
- [ ] Implement action item extraction

### ✅ Settings & Configuration
- [ ] Connect settings UI to backend
- [ ] Implement real-time settings updates
- [ ] Add settings validation and error handling
- [ ] Implement settings export/import
- [ ] Add settings reset functionality

### ✅ Real-time Features
- [ ] Implement WebSocket connections for live updates
- [ ] Add collaborative editing capabilities
- [ ] Implement real-time notifications
- [ ] Add live meeting status updates
- [ ] Connect sync status indicators

### ✅ Advanced Features
- [ ] Implement offline queue management
- [ ] Add background sync capabilities
- [ ] Connect cloud storage integration
- [ ] Implement team collaboration features
- [ ] Add analytics and reporting

## Testing Integration

### Unit Tests
```typescript
// Test hooks integration
describe('useMeetings', () => {
  it('should load meetings from database', async () => {
    const { result } = renderHook(() => useMeetings(), {
      wrapper: TestWrapper
    });

    await waitFor(() => {
      expect(result.current.meetings).toBeDefined();
    });
  });
});
```

### Integration Tests
```typescript
// Test full meeting flow
describe('Meeting Creation Flow', () => {
  it('should create meeting, record audio, and generate transcript', async () => {
    // Start recording
    // Stop recording
    // Process audio
    // Generate transcript
    // Create meeting record
    // Verify all data is saved
  });
});
```

### E2E Tests
```typescript
// Test complete user journey
describe('Complete Meeting Workflow', () => {
  it('should allow user to create, record, process, and export meeting', () => {
    // Navigate to dashboard
    // Create new meeting
    // Start recording
    // Stop recording
    // View transcript
    // Generate summary
    // Export to PDF
    // Verify all steps work
  });
});
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy load heavy components
const AIProcessingPanel = lazy(() => import('./components/AIProcessingPanel'));
const ExportPanel = lazy(() => import('./components/ExportPanel'));
```

### Memoization
```typescript
// Memoize expensive computations
const processedTranscript = useMemo(() => {
  return processTranscript(rawTranscript, settings);
}, [rawTranscript, settings]);
```

### Virtualization
```typescript
// Virtualize large lists
import { FixedSizeList as List } from 'react-window';

function MeetingList({ meetings }) {
  return (
    <List
      height={400}
      itemCount={meetings.length}
      itemSize={50}
    >
      {({ index, style }) => (
        <div style={style}>
          <MeetingCard meeting={meetings[index]} />
        </div>
      )}
    </List>
  );
}
```

## Deployment Considerations

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.linka.ai
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_VERSION=1.0.0
```

### Build Optimization
```typescript
// next.config.js
module.exports = {
  // Enable static optimization
  output: 'export',
  trailingSlash: true,

  // Optimize images
  images: {
    unoptimized: true,
  },

  // Bundle analyzer
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks.chunks = 'all';
    }
    return config;
  },
};
```

### CDN and Caching
```typescript
// Cache API responses
const cache = new Map();

async function cachedFetch(url: string, options?: RequestInit) {
  const key = `${url}-${JSON.stringify(options)}`;

  if (cache.has(key)) {
    return cache.get(key);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  cache.set(key, data);
  return data;
}
```

## Conclusion

The backend provides a comprehensive API layer that the frontend can easily integrate with using React hooks and modern patterns. The integration focuses on:

1. **Clean Separation**: Backend logic separated from UI components
2. **Reactive Updates**: Real-time data synchronization
3. **Error Handling**: Comprehensive error boundaries and fallbacks
4. **Performance**: Optimized loading and caching strategies
5. **Offline Support**: Service workers and background sync
6. **Type Safety**: Full TypeScript integration throughout

Following this guide will result in a robust, scalable frontend that leverages all the powerful backend capabilities while providing an excellent user experience.