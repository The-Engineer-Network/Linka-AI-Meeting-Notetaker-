"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, RotateCcw, AlertCircle } from 'lucide-react';

interface GeneralSettingsProps {
  settings: any;
  onUpdate: (category: string, key: string, value: any) => Promise<void>;
  onReset: (category: string) => Promise<void>;
}

export function GeneralSettings({ settings, onUpdate, onReset }: GeneralSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    setErrors([]);

    try {
      const updates = [];

      // Compare and collect changes
      if (localSettings.language !== settings.language) {
        updates.push(onUpdate('ui', 'language', localSettings.language));
      }
      if (localSettings.theme !== settings.theme) {
        updates.push(onUpdate('ui', 'theme', localSettings.theme));
      }
      if (localSettings.dateFormat !== settings.dateFormat) {
        updates.push(onUpdate('ui', 'dateFormat', localSettings.dateFormat));
      }
      if (localSettings.timeFormat !== settings.timeFormat) {
        updates.push(onUpdate('ui', 'timeFormat', localSettings.timeFormat));
      }
      if (localSettings.timezone !== settings.timezone) {
        updates.push(onUpdate('ui', 'timezone', localSettings.timezone));
      }
      if (localSettings.animations !== settings.animations) {
        updates.push(onUpdate('ui', 'animations', localSettings.animations));
      }
      if (localSettings.compactView !== settings.compactView) {
        updates.push(onUpdate('ui', 'compactView', localSettings.compactView));
      }
      if (localSettings.showTimestamps !== settings.showTimestamps) {
        updates.push(onUpdate('ui', 'showTimestamps', localSettings.showTimestamps));
      }

      await Promise.all(updates);
      setHasChanges(false);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Failed to save settings']);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await onReset('ui');
      setHasChanges(false);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Failed to reset settings']);
    } finally {
      setLoading(false);
    }
  };

  const updateLocalSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            General Settings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Basic application preferences and interface options
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            <span>Reset</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center space-x-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language & Localization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Language & Localization</CardTitle>
            <CardDescription>
              Set your preferred language and regional settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Interface Language</Label>
              <Select
                value={localSettings.language}
                onValueChange={(value) => updateLocalSetting('language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={localSettings.timezone}
                onValueChange={(value) => updateLocalSetting('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time Format */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Date & Time Format</CardTitle>
            <CardDescription>
              Customize how dates and times are displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={localSettings.dateFormat}
                onValueChange={(value) => updateLocalSetting('dateFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  <SelectItem value="MMM DD, YYYY">MMM DD, YYYY</SelectItem>
                  <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select
                value={localSettings.timeFormat}
                onValueChange={(value) => updateLocalSetting('timeFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                  <SelectItem value="24h">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={localSettings.theme}
                onValueChange={(value) => updateLocalSetting('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (System)</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="animations">Enable Animations</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Smooth transitions and animations
                </p>
              </div>
              <Switch
                id="animations"
                checked={localSettings.animations}
                onCheckedChange={(checked) => updateLocalSetting('animations', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compactView">Compact View</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use less space for a denser layout
                </p>
              </div>
              <Switch
                id="compactView"
                checked={localSettings.compactView}
                onCheckedChange={(checked) => updateLocalSetting('compactView', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Display Options</CardTitle>
            <CardDescription>
              Control what information is shown in the interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showTimestamps">Show Timestamps</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Display timestamps in transcripts and summaries
                </p>
              </div>
              <Switch
                id="showTimestamps"
                checked={localSettings.showTimestamps}
                onCheckedChange={(checked) => updateLocalSetting('showTimestamps', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoScroll">Auto-scroll Transcripts</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically scroll to new transcript content
                </p>
              </div>
              <Switch
                id="autoScroll"
                checked={localSettings.autoScroll}
                onCheckedChange={(checked) => updateLocalSetting('autoScroll', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}