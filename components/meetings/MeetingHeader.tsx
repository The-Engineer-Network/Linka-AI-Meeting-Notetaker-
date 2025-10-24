// components/meetings/MeetingHeader.tsx

import { Search, Filter, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface MeetingHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFiltersCount: number;
  onBackToDashboard?: () => void;
}

export function MeetingHeader({
  searchQuery,
  onSearchChange,
  showFilters,
  onToggleFilters,
  activeFiltersCount,
  onBackToDashboard,
}: MeetingHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {onBackToDashboard && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToDashboard}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Meeting Archive</h1>
              <p className="text-muted-foreground mt-1">Search and manage your AI meeting records</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search meetings by title, participants, or content..."
              className="pl-10 h-10"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={onToggleFilters}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">{activeFiltersCount}</Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
