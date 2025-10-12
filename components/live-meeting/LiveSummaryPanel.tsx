import React, { useState } from 'react';
import { KeyPointsList } from './KeyPointsList';
import { ActionItemDetector } from './ActionItemDetector';

interface KeyPoint {
  id: string;
  text: string;
  timestamp: string;
}

interface ActionItem {
  id: string;
  text: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface LiveSummaryPanelProps {
  summary: string;
  keyPoints: KeyPoint[];
  actionItems: ActionItem[];
  className?: string;
}

export const LiveSummaryPanel: React.FC<LiveSummaryPanelProps> = ({
  summary,
  keyPoints,
  actionItems,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`bg-white border rounded-lg ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold text-gray-900">AI Summary</h3>
        <button className="text-gray-500 hover:text-gray-700">
          <svg
            className={`w-5 h-5 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Summary Text */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Live Summary</h4>
            <p className="text-sm text-gray-700">
              {summary || 'Summary will be generated as the meeting progresses...'}
            </p>
          </div>

          {/* Key Points */}
          <KeyPointsList keyPoints={keyPoints} />

          {/* Action Items */}
          <ActionItemDetector actionItems={actionItems} />
        </div>
      )}
    </div>
  );
};