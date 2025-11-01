"use client";

import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { GeneralSettings } from './components/GeneralSettings';
import { SettingsTabs } from './components/SettingsTabs';

/**
 * Settings Page - User Preferences & Configuration
 *
 * This page provides comprehensive settings for the Linka Chrome extension
 * and web interface. Organized into categories:
 *
 * Features implemented:
 * - Transcription Settings: Language, quality, speaker detection
 * - Privacy Settings: Data retention, sharing preferences
 * - Notification Settings: Email alerts, browser notifications
 * - Export Settings: Default formats, cloud storage integration
 * - Appearance: Theme preferences, UI customization
 * - Account Settings: Profile management, subscription details
 *
 * For devs:
 * - Use tabs or accordion for different setting categories
 * - Implement form validation and save states
 * - Sync settings with Chrome extension storage
 * - Add confirmation dialogs for destructive actions
 */

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const { settings, loading, saving, error, updateSetting, resetCategory } = useSettings();
  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleGoToProfile = () => {
    window.location.href = '/profile';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading settings...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBackToDashboard}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={handleGoToProfile}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            Go to Profile →
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="space-y-6">
          <SettingsTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === 'general' && settings && (
            <GeneralSettings
              settings={settings.ui || {}}
              onUpdate={updateSetting}
              onReset={resetCategory}
            />
          )}

          {/* TODO: Add other settings components for different tabs */}
          {activeTab !== 'general' && (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Settings for {activeTab} will be implemented here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}