// types/meeting.types.ts

export interface Meeting {
  id: string;
  title: string;
  timestamp: Date;
  duration: number; // minutes
  participants: string[];
  tags: string[];
  isFavorite: boolean;
  transcript: string;
  summary: string;
  translations: Translation[];
  actionItems: ActionItem[];
}

export interface Translation {
  language: string;
  content: string;
}

export interface ActionItem {
  text: string;
  assignee: string;
  completed: boolean;
}

export interface FilterState {
  dateRange: { start: Date | null; end: Date | null };
  durationRange: [number, number];
  selectedParticipants: Set<string>;
  contentTypes: {
    transcripts: boolean;
    summaries: boolean;
    actionItems: boolean;
  };
  selectedTags: Set<string>;
}

export type ViewMode = "grid" | "list";
export type SortBy = "date" | "duration" | "title";

export interface TagInfo {
  name: string;
  color: string;
}