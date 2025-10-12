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

export default function Dashboard() {
  // Mock data - replace with real data from APIs
  const mockMeetings = [
    {
      id: '1',
      title: 'Team Standup Meeting',
      timestamp: '2024-01-15 10:00 AM',
      duration: '30 min',
      participantCount: 5,
    },
    {
      id: '2',
      title: 'Project Planning Session',
      timestamp: '2024-01-14 2:00 PM',
      duration: '1h 15min',
      participantCount: 8,
    },
  ];

  const handleStartRecording = () => {
    // TODO: Implement start recording logic
    console.log('Start recording');
  };

  const handleSummarize = () => {
    // TODO: Implement summarize logic
    console.log('Summarize');
  };

  const handleTranslate = () => {
    // TODO: Implement translate logic
    console.log('Translate');
  };

  const handleExport = () => {
    // TODO: Implement export logic
    console.log('Export');
  };

  const handleViewMeeting = (meetingId: string) => {
    // TODO: Implement view meeting logic
    console.log('View meeting:', meetingId);
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
              <NavigationBar />
              <UserProfileButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <LiveMeetingStatusBadge isActive={false} />
            <AIConnectionStatus isConnected={true} />
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
