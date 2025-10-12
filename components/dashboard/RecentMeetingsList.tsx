import React from 'react';
import { MeetingListItem } from './MeetingListItem';
import { EmptyState } from './EmptyState';

interface Meeting {
  id: string;
  title: string;
  timestamp: string;
  duration: string;
  participantCount: number;
}

interface RecentMeetingsListProps {
  meetings: Meeting[];
  onViewMeeting?: (meetingId: string) => void;
  onExportMeeting?: (meetingId: string) => void;
  onDeleteMeeting?: (meetingId: string) => void;
  className?: string;
}

export const RecentMeetingsList: React.FC<RecentMeetingsListProps> = ({
  meetings,
  onViewMeeting,
  onExportMeeting,
  onDeleteMeeting,
  className = ''
}) => {
  if (meetings.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {meetings.map((meeting) => (
        <MeetingListItem
          key={meeting.id}
          title={meeting.title}
          timestamp={meeting.timestamp}
          duration={meeting.duration}
          participantCount={meeting.participantCount}
          onView={() => onViewMeeting?.(meeting.id)}
          onExport={() => onExportMeeting?.(meeting.id)}
          onDelete={() => onDeleteMeeting?.(meeting.id)}
        />
      ))}
    </div>
  );
};