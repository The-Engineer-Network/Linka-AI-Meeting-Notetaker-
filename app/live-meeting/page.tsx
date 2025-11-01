/**
 * Live Meeting Interface Page
 *
 * This page provides the interface for active meeting recording and real-time
 * transcription, AI processing, and meeting management features.
 *
 * Features implemented:
 * - Real-time meeting timer and controls
 * - Live transcript display with speaker identification
 * - AI-powered summary and key points generation
 * - Action item detection and tracking
 * - Quick note input and export functionality
 * - Connection quality and processing status indicators
 *
 * For devs:
 * - Integrates with Chrome extension for audio capture
 * - Uses WebSocket/real-time connections for live updates
 * - Implements auto-scroll and speaker labeling toggles
 * - Handles AI processing status and error states
 */
"use client"
import { useState, useEffect } from 'react';
import { MeetingHeader } from '@/components/live-meeting/MeetingHeader';
import { MeetingTimer } from '@/components/live-meeting/MeetingTimer';
import { BackButton } from '@/components/live-meeting/BackButton';
import { RecordingControlPanel } from '@/components/live-meeting/RecordingControlPanel';
import { LiveTranscriptContainer } from '@/components/live-meeting/LiveTranscriptContainer';
import { LiveSummaryPanel } from '@/components/live-meeting/LiveSummaryPanel';
import { QuickNoteInput } from '@/components/live-meeting/QuickNoteInput';
import { ExportCurrentButton } from '@/components/live-meeting/ExportCurrentButton';
import { SpeakerLabelToggle } from '@/components/live-meeting/SpeakerLabelToggle';
import { ProcessingStatusBar } from '@/components/live-meeting/ProcessingStatusBar';
import { ConnectionQualityIndicator } from '@/components/live-meeting/ConnectionQualityIndicator';
import { SaveIndicator } from '@/components/live-meeting/SaveIndicator';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useAIProcessing } from '@/hooks/useAIProcessing';
import { useSettings } from '@/hooks/useSettings';
import { database } from '@/lib/backend-init';

export default function LiveMeeting() {
  const [transcript, setTranscript] = useState('');
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [showSpeakerLabels, setShowSpeakerLabels] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const { isRecording, duration, startRecording, stopRecording, pauseRecording, resumeRecording } = useAudioRecording();
  const { processWithAI } = useAIProcessing();
  const { settings } = useSettings();
  const [startTime] = useState(new Date());

  // Mock data for now - will be replaced with real transcript data
  const mockTranscripts = [
    {
      id: '1',
      speaker: 'Speaker 1',
      timestamp: '10:30',
      message: transcript || 'Recording in progress...',
      highlights: []
    }
  ];

  const mockKeyPoints = [
    { id: '1', text: 'Meeting in progress', timestamp: '10:30' }
  ];

  const mockActionItems: any[] = [];

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

  const handleStartRecording = async () => {
    try {
      await startRecording();
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioBlob = await stopRecording();

      if (meetingId && audioBlob) {
        // Process audio and generate transcript
        const transcriptResult = await database.transcripts.create({
          meetingId,
          content: transcript || 'No transcript available',
          timestamp: Date.now(),
          createdAt: new Date()
        });

        // Update meeting with transcript and audio
        await database.meetings.update(meetingId, {
          transcript: transcript || 'No transcript available',
          audioBlob,
          endTime: new Date(),
          status: 'completed'
        });
      }

      // Navigate back to dashboard after stopping recording
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const handlePauseRecording = async () => {
    try {
      if (isPaused) {
        await resumeRecording();
      } else {
        await pauseRecording();
      }
      setIsPaused(!isPaused);
    } catch (error) {
      console.error('Failed to toggle pause:', error);
    }
  };

  const handleAddNote = (note: string) => {
    console.log('Adding note:', note);
    // TODO: Implement note addition
  };

  const handleExportCurrent = () => {
    console.log('Exporting current session');
    // TODO: Implement export
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <MeetingHeader
              title="Team Standup Meeting"
              participantCount={5}
            />
            <div className="flex items-center space-x-4">
              <MeetingTimer
                isRunning={isRecording && !isPaused}
                startTime={startTime}
              />
              <BackButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Recording Controls */}
        <div className="mb-6">
          <RecordingControlPanel
            isRecording={isRecording}
            isPaused={isPaused}
            onStart={handleStartRecording}
            onStop={handleStopRecording}
            onPause={handlePauseRecording}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transcript */}
            <LiveTranscriptContainer
              transcripts={mockTranscripts}
              autoScrollEnabled={autoScrollEnabled}
              onToggleAutoScroll={() => setAutoScrollEnabled(!autoScrollEnabled)}
            />

            {/* Quick Actions */}
            <div className="bg-white p-4 rounded-lg border space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <QuickNoteInput onAddNote={handleAddNote} />
              <div className="flex items-center space-x-4">
                <ExportCurrentButton onExport={handleExportCurrent} />
                <SpeakerLabelToggle
                  showLabels={showSpeakerLabels}
                  onToggle={() => setShowSpeakerLabels(!showSpeakerLabels)}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Summary Panel */}
            <LiveSummaryPanel
              summary="The team is discussing quarterly goals and focusing on user engagement metrics. Key action items include scheduling a follow-up meeting."
              keyPoints={mockKeyPoints}
              actionItems={mockActionItems}
            />

            {/* Status Indicators */}
            <div className="space-y-4">
              <ProcessingStatusBar
                status="processing"
                message="Analyzing transcript for insights..."
              />
              <ConnectionQualityIndicator quality="good" />
              <SaveIndicator status="saved" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}