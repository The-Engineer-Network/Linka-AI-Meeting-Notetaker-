"use client";

import { useState } from 'react';
import { Settings, Mic, Cpu, Shield, Palette, Download, Sync, Volume2, Zap } from 'lucide-react';

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'general', label: 'General', icon: Settings, description: 'Basic settings and preferences' },
  { id: 'transcription', label: 'Transcription', icon: Mic, description: 'Audio capture and speech recognition' },
  { id: 'ai', label: 'AI Processing', icon: Cpu, description: 'AI summarization and translation' },
  { id: 'privacy', label: 'Privacy', icon: Shield, description: 'Data protection and retention' },
  { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and UI customization' },
  { id: 'export', label: 'Export', icon: Download, description: 'Export formats and templates' },
  { id: 'sync', label: 'Sync & Backup', icon: Sync, description: 'Data synchronization and backup' },
  { id: 'notifications', label: 'Notifications', icon: Volume2, description: 'Alerts and notifications' },
  { id: 'advanced', label: 'Advanced', icon: Zap, description: 'Advanced options and debugging' },
];

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Settings Categories
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-sm ${
                      isActive
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {tab.label}
                    </h3>
                    <p className={`text-xs mt-1 ${
                      isActive
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {tab.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}