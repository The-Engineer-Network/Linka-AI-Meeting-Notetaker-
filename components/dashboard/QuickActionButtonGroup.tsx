import React from 'react';
import { Button } from '@/components/ui/button';

interface QuickActionButtonGroupProps {
  onStartRecording?: () => void;
  onSummarize?: () => void;
  onTranslate?: () => void;
  onExport?: () => void;
  className?: string;
}

export const QuickActionButtonGroup: React.FC<QuickActionButtonGroupProps> = ({
  onStartRecording,
  onSummarize,
  onTranslate,
  onExport,
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <Button
        onClick={onStartRecording}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        Start Recording
      </Button>
      <Button
        onClick={onSummarize}
        variant="outline"
      >
        Summarize
      </Button>
      <Button
        onClick={onTranslate}
        variant="outline"
      >
        Translate
      </Button>
      <Button
        onClick={onExport}
        variant="outline"
      >
        Export
      </Button>
    </div>
  );
};