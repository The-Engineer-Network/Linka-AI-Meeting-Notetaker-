import React from 'react';
import { Button } from '@/components/ui/button';

interface RecordingControlPanelProps {
  isRecording: boolean;
  isPaused: boolean;
  onStart?: () => void;
  onStop?: () => void;
  onPause?: () => void;
  className?: string;
}

export const RecordingControlPanel: React.FC<RecordingControlPanelProps> = ({
  isRecording,
  isPaused,
  onStart,
  onStop,
  onPause,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-4 p-4 bg-gray-50 rounded-lg ${className}`}>
      {/* Recording Indicator */}
      <div className="flex items-center space-x-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isRecording && !isPaused
              ? 'bg-red-500 animate-pulse'
              : 'bg-gray-400'
          }`}
        />
        <span className="text-sm font-medium text-gray-700">
          {isRecording
            ? (isPaused ? 'Paused' : 'Recording')
            : 'Not Recording'
          }
        </span>
      </div>

      {/* Control Buttons */}
      <div className="flex space-x-2">
        {!isRecording ? (
          <Button
            onClick={onStart}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Start
          </Button>
        ) : (
          <>
            <Button
              onClick={onPause}
              variant="outline"
              className={isPaused ? 'bg-yellow-50 border-yellow-300' : ''}
            >
              {isPaused ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Resume
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pause
                </>
              )}
            </Button>
            <Button
              onClick={onStop}
              variant="outline"
              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Stop
            </Button>
          </>
        )}
      </div>
    </div>
  );
};