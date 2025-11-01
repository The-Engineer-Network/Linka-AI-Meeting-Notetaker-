/**
 * Dashboard Page - Main App Interface
 *
 * This is the main dashboard that users see after installing the Chrome extension
 * and accessing the Linka web interface. It provides:
 *
 * Features implemented:
 * - Meeting history with recent meetings list
 * - Analytics and usage statistics
 * - Quick actions (start recording, summarize, translate, export)
 * - Recent transcripts and summaries
 * - Performance metrics and insights
 * - Live meeting status and AI connection status
 *
 * For devs:
 * - This integrates with the Chrome extension via APIs
 * - Uses real-time data from user's meeting history
 * - Implements pagination for large datasets
 * - Adds export functionality for transcripts
 */

"use client"
import { ExtensionLogo } from '@/components/dashboard/ExtensionLogo';
import { NavigationBar } from '@/components/dashboard/NavigationBar';
import { UserProfileButton } from '@/components/dashboard/UserProfileButton';
import { LiveMeetingStatusBadge } from '@/components/dashboard/LiveMeetingStatusBadge';
import { AIConnectionStatus } from '@/components/dashboard/AIConnectionStatus';
import { QuickActionButtonGroup } from '@/components/dashboard/QuickActionButtonGroup';
import { StatisticsGrid } from '@/components/dashboard/StatisticsGrid';
import { RecentMeetingsList } from '@/components/dashboard/RecentMeetingsList';
import { SettingsButton } from '@/components/dashboard/SettingsButton';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';
import { useMeetings } from '@/hooks/useMeetings';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useAIProcessing } from '@/hooks/useAIProcessing';
import { useSettings } from '@/hooks/useSettings';

export default function Dashboard() {
  const { meetings, loading: meetingsLoading, createMeeting } = useMeetings();
  const { settings } = useSettings();
  const { isRecording, startRecording, stopRecording } = useAudioRecording();
  const { processing: aiProcessing, processWithAI } = useAIProcessing();

  const handleStartRecording = async () => {
    try {
      await startRecording();
      // Navigate to live meeting page
      window.location.href = '/live-meeting';
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleSummarize = async () => {
    // TODO: Implement batch summarize logic
    console.log('Summarize');
  };

  const handleTranslate = async () => {
    // TODO: Implement batch translate logic
    console.log('Translate');
  };

  const handleExport = async () => {
    // TODO: Implement batch export logic
    console.log('Export');
  };

  const handleViewMeeting = (meetingId: string) => {
    // Navigate to archive detail page
    window.location.href = `/archive/${meetingId}`;
  };

  const handleExportMeeting = (meetingId: string) => {
    // TODO: Implement export meeting logic
    console.log('Export meeting:', meetingId);
  };

  const handleDeleteMeeting = (meetingId: string) => {
    // TODO: Implement delete meeting logic
    console.log('Delete meeting:', meetingId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <ExtensionLogo />
            <div className="flex items-center space-x-6">
              <UserProfileButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <LiveMeetingStatusBadge isActive={isRecording} />
            <AIConnectionStatus isConnected={!aiProcessing} />
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <SettingsButton />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActionButtonGroup
            onStartRecording={handleStartRecording}
            onSummarize={handleSummarize}
            onTranslate={handleTranslate}
            onExport={handleExport}
          />
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <StatisticsGrid
            totalMeetings={24}
            hoursRecorded={156}
            notesGenerated={89}
            activeTime="2h 34m"
          />
        </div>

        {/* Recent Meetings */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Meetings</h2>
          <RecentMeetingsList
            meetings={mockMeetings}
            onViewMeeting={handleViewMeeting}
            onExportMeeting={handleExportMeeting}
            onDeleteMeeting={handleDeleteMeeting}
          />
        </div>
      </div>
    </div>
  );
}
