import { Calendar, Clock, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterState } from "@/types/meeting.types";

interface FilterChipsProps {
  filters: FilterState;
  onRemoveFilter: (type: string, value?: string) => void;
  onClearAll: () => void;
}

export function FilterChips({ filters, onRemoveFilter, onClearAll }: FilterChipsProps) {
  const hasFilters = 
    filters.dateRange.start || 
    filters.dateRange.end || 
    filters.durationRange[0] > 0 || 
    filters.durationRange[1] < 120 ||
    filters.selectedParticipants.size > 0 ||
    filters.selectedTags.size > 0;

  if (!hasFilters) return null;

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-wrap gap-2 py-3">
        {(filters.dateRange.start || filters.dateRange.end) && (
          <Badge variant="secondary" className="gap-1">
            <Calendar className="h-3 w-3" />
            {filters.dateRange.start?.toLocaleDateString()} - {filters.dateRange.end?.toLocaleDateString() || "Now"}
            <X className="h-3 w-3 cursor-pointer" onClick={() => onRemoveFilter("dateRange")} />
          </Badge>
        )}
        {(filters.durationRange[0] > 0 || filters.durationRange[1] < 120) && (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {filters.durationRange[0]}-{filters.durationRange[1]} min
            <X className="h-3 w-3 cursor-pointer" onClick={() => onRemoveFilter("duration")} />
          </Badge>
        )}
        {Array.from(filters.selectedParticipants).map(p => (
          <Badge key={p} variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {p}
            <X className="h-3 w-3 cursor-pointer" onClick={() => onRemoveFilter("participant", p)} />
          </Badge>
        ))}
        {Array.from(filters.selectedTags).map(t => (
          <Badge key={t} variant="secondary" className="gap-1">
            {t}
            <X className="h-3 w-3 cursor-pointer" onClick={() => onRemoveFilter("tag", t)} />
          </Badge>
        ))}
        <Button variant="ghost" size="sm" onClick={onClearAll} className="h-6 text-xs">
          Clear all
        </Button>
      </div>
    </div>
  );
}