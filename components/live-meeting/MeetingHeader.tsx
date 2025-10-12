import React from 'react';

interface MeetingHeaderProps {
  title: string;
  participantCount?: number;
  className?: string;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  title,
  participantCount,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {participantCount && (
          <p className="text-sm text-gray-600 mt-1">
            {participantCount} participant{participantCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
};