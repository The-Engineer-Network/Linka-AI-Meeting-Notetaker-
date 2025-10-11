import React, { useState, useEffect } from 'react';

interface MeetingTimerProps {
  isRunning: boolean;
  startTime?: Date;
  className?: string;
}

export const MeetingTimer: React.FC<MeetingTimerProps> = ({
  isRunning,
  startTime,
  className = ''
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        const now = Date.now();
        const start = startTime?.getTime() || now;
        setElapsed(Math.floor((now - start) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      <span className="text-lg font-mono font-semibold text-gray-900">
        {formatTime(elapsed)}
      </span>
    </div>
  );
};