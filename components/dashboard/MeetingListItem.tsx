import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MeetingListItemProps {
  title: string;
  timestamp: string;
  duration: string;
  participantCount: number;
  onView?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const MeetingListItem: React.FC<MeetingListItemProps> = ({
  title,
  timestamp,
  duration,
  participantCount,
  onView,
  onExport,
  onDelete,
  className = ''
}) => {
  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{timestamp}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <span>Duration: {duration}</span>
            <span>{participantCount} participants</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={onView}
            variant="outline"
            size="sm"
          >
            View
          </Button>
          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
          >
            Export
          </Button>
          <Button
            onClick={onDelete}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};