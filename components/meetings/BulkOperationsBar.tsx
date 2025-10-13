import { CheckSquare, Download, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkOperationsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onExport: () => void;
  onProcess: () => void;
  onDelete: () => void;
}

export function BulkOperationsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onExport,
  onProcess,
  onDelete,
}: BulkOperationsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-primary text-primary-foreground rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="font-medium">{selectedCount} selected</span>
        <Button
          variant="default"
          size="sm"
          onClick={onSelectAll}
          disabled={selectedCount === totalCount}
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          Select All
        </Button>
        <Button variant="default" size="sm" onClick={onDeselectAll}>
          Deselect All
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="default" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="default" size="sm" onClick={onProcess}>
          <Play className="h-4 w-4 mr-2" />
          Process
        </Button>
        <Button variant="default" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}