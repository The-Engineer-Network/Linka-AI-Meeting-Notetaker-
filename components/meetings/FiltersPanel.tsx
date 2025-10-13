import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FilterState } from "@/types/meeting.types";
import { AVAILABLE_TAGS } from "@/constants/meeting.constants";

interface FiltersPanelProps {
  filters: FilterState;
  allParticipants: string[];
  onFiltersChange: (filters: FilterState) => void;
}

export function FiltersPanel({ filters, allParticipants, onFiltersChange }: FiltersPanelProps) {
  return (
    <div className="border-b border-border bg-muted/30">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="space-y-2">
              <Input
                type="date"
                value={filters.dateRange.start?.toISOString().split('T')[0] || ""}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  dateRange: { ...filters.dateRange, start: e.target.value ? new Date(e.target.value) : null }
                })}
                className="text-sm"
              />
              <Input
                type="date"
                value={filters.dateRange.end?.toISOString().split('T')[0] || ""}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  dateRange: { ...filters.dateRange, end: e.target.value ? new Date(e.target.value) : null }
                })}
                className="text-sm"
              />
            </div>
          </div>

          {/* Duration Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Duration (minutes)</label>
            <div className="pt-2">
              <Slider
                value={filters.durationRange}
                onValueChange={(value) => onFiltersChange({
                  ...filters,
                  durationRange: value as [number, number]
                })}
                min={0}
                max={120}
                step={5}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{filters.durationRange[0]} min</span>
                <span>{filters.durationRange[1]} min</span>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Participants</label>
            <Select
              onValueChange={(value) => {
                const next = new Set(filters.selectedParticipants);
                next.add(value);
                onFiltersChange({ ...filters, selectedParticipants: next });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select participants" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-md">
                {allParticipants.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.selectedParticipants.size > 0 && (
              <div className="text-xs text-muted-foreground">
                {filters.selectedParticipants.size} selected
              </div>
            )}
          </div>

          {/* Content Types */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Types</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={filters.contentTypes.transcripts}
                  onCheckedChange={(checked) => onFiltersChange({
                    ...filters,
                    contentTypes: { ...filters.contentTypes, transcripts: checked as boolean }
                  })}
                />
                Transcripts
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={filters.contentTypes.summaries}
                  onCheckedChange={(checked) => onFiltersChange({
                    ...filters,
                    contentTypes: { ...filters.contentTypes, summaries: checked as boolean }
                  })}
                />
                Summaries
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={filters.contentTypes.actionItems}
                  onCheckedChange={(checked) => onFiltersChange({
                    ...filters,
                    contentTypes: { ...filters.contentTypes, actionItems: checked as boolean }
                  })}
                />
                Action Items
              </label>
            </div>
          </div>
        </div>

        {/* Tag Cloud */}
        <div className="mt-4">
          <label className="text-sm font-medium mb-2 block">Tags</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map(tag => (
              <Badge
                key={tag.name}
                variant={filters.selectedTags.has(tag.name) ? "default" : "outline"}
                className={`cursor-pointer ${filters.selectedTags.has(tag.name) ? tag.color + " text-white" : ""}`}
                onClick={() => {
                  const next = new Set(filters.selectedTags);
                  if (next.has(tag.name)) {
                    next.delete(tag.name);
                  } else {
                    next.add(tag.name);
                  }
                  onFiltersChange({ ...filters, selectedTags: next });
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}