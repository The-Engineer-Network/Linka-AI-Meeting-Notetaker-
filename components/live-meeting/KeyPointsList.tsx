import React from 'react';

interface KeyPoint {
  id: string;
  text: string;
  timestamp: string;
}

interface KeyPointsListProps {
  keyPoints: KeyPoint[];
  className?: string;
}

export const KeyPointsList: React.FC<KeyPointsListProps> = ({
  keyPoints,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Points</h4>
      {keyPoints.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No key points detected yet...</p>
      ) : (
        <ul className="space-y-2">
          {keyPoints.map((point) => (
            <li key={point.id} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-700">{point.text}</p>
                <span className="text-xs text-gray-500">{point.timestamp}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};