"use client";

import { useState, useMemo } from "react";
import { DUMMY_MEETINGS } from "@/constants/meeting.constants";
import { useMeetingFilters } from "@/hooks/useMeetingFilters";
import { MeetingHeader } from "@/components/meetings/MeetingHeader";
import { FilterChips } from "@/components/meetings/FilterChips";
import { FiltersPanel } from "@/components/meetings/FiltersPanel";
import { MeetingToolbar } from "@/components/meetings/MeetingToolbar";
import { BulkOperationsBar } from "@/components/meetings/BulkOperationsBar";
import { MeetingsGrid } from "@/components/meetings/MeetingsGrid";
import { EmptyState } from "@/components/meetings/EmptyState";
import { Pagination } from "@/components/meetings/Pagination";
import { ViewMode } from "@/types/meeting.types";

export default function MeetingsPage() {
  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };
  // Filter hook
  const {
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
  } = useMeetingFilters(DUMMY_MEETINGS);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedMeetings, setSelectedMeetings] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(DUMMY_MEETINGS.filter(m => m.isFavorite).map(m => m.id))
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Pagination
  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
  const paginatedMeetings = useMemo(() => {
    return filteredMeetings.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredMeetings, currentPage, itemsPerPage]);

  // Handlers
  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectMeeting = (id: string) => {
    setSelectedMeetings(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedMeetings(new Set(paginatedMeetings.map(m => m.id)));
  };

  const deselectAll = () => {
    setSelectedMeetings(new Set());
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div className='bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-300
        min-h-screen transition-colors duration-300 p-4 sm:p-6 lg:p-8 mx-auto mt-8'>
      {/* Header */}
      <MeetingHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        activeFiltersCount={activeFiltersCount}
        onBackToDashboard={handleBackToDashboard}
      />

      {/* Filter Chips */}
      <FilterChips
        filters={filters}
        onRemoveFilter={removeFilter}
        onClearAll={clearFilters}
      />

      {/* Filters Panel */}
      {showFilters && (
        <FiltersPanel
          filters={filters}
          allParticipants={allParticipants}
          onFiltersChange={setFilters}
        />
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Toolbar */}
        <MeetingToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          totalMeetings={filteredMeetings.length}
        />

        {/* Bulk Operations Bar */}
        <BulkOperationsBar
          selectedCount={selectedMeetings.size}
          totalCount={paginatedMeetings.length}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onExport={() => console.log("Export")}
          onProcess={() => console.log("Process")}
          onDelete={() => console.log("Delete")}
        />

        {/* Meetings Grid/List or Empty State */}
        {filteredMeetings.length === 0 ? (
          <EmptyState
            hasActiveFilters={activeFiltersCount > 0}
            onClearFilters={clearFilters}
          />
        ) : (
          <>
            <MeetingsGrid
              meetings={paginatedMeetings}
              viewMode={viewMode}
              selectedMeetings={selectedMeetings}
              favorites={favorites}
              onToggleSelect={toggleSelectMeeting}
              onToggleFavorite={toggleFavorite}
            />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}