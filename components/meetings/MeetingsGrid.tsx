// components/meetings/MeetingsGrid.tsx

import { Meeting, ViewMode } from "@/types/meeting.types";
import { MeetingCard } from "./MeetingCard";

interface MeetingsGridProps {
  meetings: Meeting[];
  viewMode: ViewMode;
  selectedMeetings: Set<string>;
  favorites: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function MeetingsGrid({
  meetings,
  viewMode,
  selectedMeetings,
  favorites,
  onToggleSelect,
  onToggleFavorite,
}: MeetingsGridProps) {
  return (
    <div className={viewMode === "grid" 
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6" 
      : "space-y-4 mb-6"
    }>
      {meetings.map(meeting => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          viewMode={viewMode}
          isSelected={selectedMeetings.has(meeting.id)}
          isFavorite={favorites.has(meeting.id)}
          onToggleSelect={onToggleSelect}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}