// components/meetings/MeetingCard.tsx

import { useState } from "react";
import { Star, Clock, Users, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Meeting, ViewMode } from "@/types/meeting.types";
import { AVAILABLE_TAGS } from "@/constants/meeting.constants";
import { MeetingDetails } from "./MeetingDetails";

interface MeetingCardProps {
  meeting: Meeting;
  viewMode: ViewMode;
  isSelected: boolean;
  isFavorite: boolean;
  onToggleSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function MeetingCard({
  meeting,
  viewMode,
  isSelected,
  isFavorite,
  onToggleSelect,
  onToggleFavorite,
}: MeetingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const completedActions = meeting.actionItems.filter(a => a.completed).length;
  const totalActions = meeting.actionItems.length;

  return (
    <Card className={`p-4 hover:shadow-lg transition-shadow ${isSelected ? "ring-2 ring-primary" : ""}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(meeting.id)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{meeting.title}</h3>
              <p className="text-sm text-muted-foreground">
                {meeting.timestamp.toLocaleDateString()} at {meeting.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto"
            onClick={() => onToggleFavorite(meeting.id)}
          >
            <Star className={`h-5 w-5 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
          </Button>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {meeting.duration} min
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {meeting.participants.length}
          </Badge>
          {totalActions > 0 && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {completedActions}/{totalActions}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {meeting.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {meeting.tags.map(tag => {
              const tagInfo = AVAILABLE_TAGS.find(t => t.name === tag);
              return (
                <Badge key={tag} variant="outline" className={`text-xs ${tagInfo?.color || ""}`}>
                  {tag}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Expand Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Expand Details
            </>
          )}
        </Button>

        {/* Expanded View */}
        {isExpanded && <MeetingDetails meeting={meeting} />}
      </div>
    </Card>
  );
}