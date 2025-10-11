import React from 'react';

interface AIConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export const AIConnectionStatus: React.FC<AIConnectionStatusProps> = ({
  isConnected,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-sm font-medium text-gray-700">
        AI {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
};