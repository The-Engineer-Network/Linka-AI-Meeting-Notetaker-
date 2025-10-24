"use client";

/**
 * Profile Page - User Account Management
 *
 * This page provides user account management and personal information
 * for Linka users. Since it's a Chrome extension, this focuses on:
 *
 * Features to implement:
 * - Profile Information: Name, email, avatar
 * - Usage Statistics: Meeting count, processing time, storage used
 * - Account Status: Subscription details, billing information
 * - Data Export: Download all user data and transcripts
 * - Account Actions: Delete account, data management
 * - Connected Devices: Show linked Chrome installations
 *
 * For developers:
 * - Since it's a Chrome extension, focus on extension-specific data
 * - Implement avatar upload with cloud storage
 * - Add data export functionality for GDPR compliance
 * - Show usage analytics and limits
 * - Handle account deletion with confirmation flows
 *
 * TODO: Implement profile editing with form validation
 * TODO: Add usage statistics and analytics
 * TODO: Implement data export functionality
 * TODO: Add billing/subscription management
 * TODO: Implement account deletion flow
 */

export default function Profile() {
  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleGoToSettings = () => {
    window.location.href = '/settings';
  };

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
            onClick={handleGoToSettings}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            Edit Settings →
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">User profile and account management will be implemented here.</p>
          {/* TODO: Add profile editing, usage stats, and account management */}
        </div>
      </div>
    </div>
  );
}