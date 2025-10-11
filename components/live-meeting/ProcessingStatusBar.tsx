import React from 'react';

interface ProcessingStatusBarProps {
  status: 'idle' | 'processing' | 'completed' | 'error';
  message?: string;
  className?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'processing':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-green-500';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'processing':
      return 'AI Processing...';
    case 'completed':
      return 'Processing Complete';
    case 'error':
      return 'Processing Error';
    default:
      return 'Ready';
  }
};

export const ProcessingStatusBar: React.FC<ProcessingStatusBarProps> = ({
  status,
  message,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-3 p-3 bg-gray-50 rounded-lg ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} ${
        status === 'processing' ? 'animate-pulse' : ''
      }`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          {getStatusText(status)}
        </p>
        {message && (
          <p className="text-xs text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
};