import React from 'react';

interface LiveMeetingStatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export const LiveMeetingStatusBadge: React.FC<LiveMeetingStatusBadgeProps> = ({
  isActive,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className={`w-3 h-3 rounded-full ${
          isActive
            ? 'bg-red-500 animate-pulse'
            : 'bg-gray-400'
        }`}
      />
      <span className="text-sm font-medium text-gray-700">
        {isActive ? 'Live Meeting' : 'No Active Meeting'}
      </span>
    </div>
  );
};