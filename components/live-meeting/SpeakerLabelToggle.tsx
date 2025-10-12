import React from 'react';
import { Button } from '@/components/ui/button';

interface SpeakerLabelToggleProps {
  showLabels: boolean;
  onToggle: () => void;
  className?: string;
}

export const SpeakerLabelToggle: React.FC<SpeakerLabelToggleProps> = ({
  showLabels,
  onToggle,
  className = ''
}) => {
  return (
    <Button
      onClick={onToggle}
      variant="outline"
      size="sm"
      className={`flex items-center space-x-2 ${className} ${
        showLabels ? 'bg-blue-50 border-blue-300' : ''
      }`}
    >
      <svg
        className={`w-4 h-4 ${showLabels ? 'text-blue-600' : 'text-gray-400'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      <span className="text-sm">
        Speaker Labels {showLabels ? 'On' : 'Off'}
      </span>
    </Button>
  );
};