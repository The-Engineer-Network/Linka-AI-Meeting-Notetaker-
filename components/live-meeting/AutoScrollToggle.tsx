import React from 'react';
import { Button } from '@/components/ui/button';

interface AutoScrollToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  className?: string;
}

export const AutoScrollToggle: React.FC<AutoScrollToggleProps> = ({
  isEnabled,
  onToggle,
  className = ''
}) => {
  return (
    <Button
      onClick={onToggle}
      variant="outline"
      size="sm"
      className={`flex items-center space-x-2 ${className} ${
        isEnabled ? 'bg-blue-50 border-blue-300' : ''
      }`}
    >
      <svg
        className={`w-4 h-4 ${isEnabled ? 'text-blue-600' : 'text-gray-400'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
      <span className="text-sm">
        Auto-scroll {isEnabled ? 'On' : 'Off'}
      </span>
    </Button>
  );
};