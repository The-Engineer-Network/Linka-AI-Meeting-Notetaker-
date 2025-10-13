// hooks/useMeetingFilters.ts

import { useState, useMemo } from "react";
import { Meeting, FilterState, SortBy } from "@/types/meeting.types";

export function useMeetingFilters(meetings: Meeting[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: null, end: null },
    durationRange: [0, 120],
    selectedParticipants: new Set(),
    contentTypes: {
      transcripts: true,
      summaries: true,
      actionItems: true,
    },
    selectedTags: new Set(),
  });

  // Get all unique participants
  const allParticipants = useMemo(() => {
    const participants = new Set<string>();
    meetings.forEach(meeting => {
      meeting.participants.forEach(p => participants.add(p));
    });
    return Array.from(participants).sort();
  }, [meetings]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.durationRange[0] > 0 || filters.durationRange[1] < 120) count++;
    if (filters.selectedParticipants.size > 0) count++;
    if (!filters.contentTypes.transcripts || !filters.contentTypes.summaries || !filters.contentTypes.actionItems) count++;
    if (filters.selectedTags.size > 0) count++;
    return count;
  }, [filters]);

  // Filter and sort meetings
  const filteredMeetings = useMemo(() => {
    let filtered = meetings.filter(meeting => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          meeting.title.toLowerCase().includes(query) ||
          meeting.participants.some(p => p.toLowerCase().includes(query)) ||
          meeting.tags.some(t => t.toLowerCase().includes(query)) ||
          meeting.transcript.toLowerCase().includes(query) ||
          meeting.summary.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Date range
      if (filters.dateRange.start && meeting.timestamp < filters.dateRange.start) return false;
      if (filters.dateRange.end && meeting.timestamp > filters.dateRange.end) return false;

      // Duration
      if (meeting.duration < filters.durationRange[0] || meeting.duration > filters.durationRange[1]) return false;

      // Participants
      if (filters.selectedParticipants.size > 0) {
        const hasParticipant = meeting.participants.some(p => filters.selectedParticipants.has(p));
        if (!hasParticipant) return false;
      }

      // Tags
      if (filters.selectedTags.size > 0) {
        const hasTag = meeting.tags.some(t => filters.selectedTags.has(t));
        if (!hasTag) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return b.timestamp.getTime() - a.timestamp.getTime();
      } else if (sortBy === "duration") {
        return b.duration - a.duration;
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [meetings, searchQuery, filters, sortBy]);

  const clearFilters = () => {
    setFilters({
      dateRange: { start: null, end: null },
      durationRange: [0, 120],
      selectedParticipants: new Set(),
      contentTypes: { transcripts: true, summaries: true, actionItems: true },
      selectedTags: new Set(),
    });
  };

  const removeFilter = (type: string, value?: string) => {
    if (type === "dateRange") {
      setFilters(prev => ({ ...prev, dateRange: { start: null, end: null } }));
    } else if (type === "duration") {
      setFilters(prev => ({ ...prev, durationRange: [0, 120] }));
    } else if (type === "participant" && value) {
      setFilters(prev => {
        const next = new Set(prev.selectedParticipants);
        next.delete(value);
        return { ...prev, selectedParticipants: next };
      });
    } else if (type === "tag" && value) {
      setFilters(prev => {
        const next = new Set(prev.selectedTags);
        next.delete(value);
        return { ...prev, selectedTags: next };
      });
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filters,
    setFilters,
    allParticipants,
    activeFiltersCount,
    filteredMeetings,
    clearFilters,
    removeFilter,
  };
}