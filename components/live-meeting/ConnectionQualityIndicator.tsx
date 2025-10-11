import React from 'react';

interface ConnectionQualityIndicatorProps {
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  className?: string;
}

const getQualityColor = (quality: string) => {
  switch (quality) {
    case 'excellent':
      return 'bg-green-500';
    case 'good':
      return 'bg-blue-500';
    case 'fair':
      return 'bg-yellow-500';
    case 'poor':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};

const getQualityText = (quality: string) => {
  switch (quality) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'fair':
      return 'Fair';
    case 'poor':
      return 'Poor';
    default:
      return 'Unknown';
  }
};

const getSignalBars = (quality: string) => {
  const bars = [];
  const maxBars = 4;
  let filledBars = 0;

  switch (quality) {
    case 'excellent':
      filledBars = 4;
      break;
    case 'good':
      filledBars = 3;
      break;
    case 'fair':
      filledBars = 2;
      break;
    case 'poor':
      filledBars = 1;
      break;
    default:
      filledBars = 0;
  }

  for (let i = 1; i <= maxBars; i++) {
    bars.push(
      <div
        key={i}
        className={`w-1 mx-0.5 rounded-sm ${
          i <= filledBars ? getQualityColor(quality) : 'bg-gray-300'
        }`}
        style={{ height: `${i * 4}px` }}
      />
    );
  }

  return bars;
};

export const ConnectionQualityIndicator: React.FC<ConnectionQualityIndicatorProps> = ({
  quality,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-end">
        {getSignalBars(quality)}
      </div>
      <span className="text-sm font-medium text-gray-700">
        Audio Quality: {getQualityText(quality)}
      </span>
    </div>
  );
};