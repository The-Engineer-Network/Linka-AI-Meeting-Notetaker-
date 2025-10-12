import React from 'react';

interface TranscriptMessageProps {
  speaker: string;
  timestamp: string;
  message: string;
  avatar?: string;
  highlights?: string[];
  className?: string;
}

export const TranscriptMessage: React.FC<TranscriptMessageProps> = ({
  speaker,
  timestamp,
  message,
  avatar,
  highlights = [],
  className = ''
}) => {
  return (
    <div className={`flex space-x-3 p-3 hover:bg-gray-50 rounded-lg ${className}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={speaker}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {speaker.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-medium text-gray-900">{speaker}</span>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
        <div className="text-sm text-gray-700 relative">
          {message}
          {/* AI Highlights Overlay */}
          {highlights.length > 0 && (
            <div className="absolute -top-1 -left-1 right-0 bottom-0 pointer-events-none">
              {highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="absolute bg-yellow-200 opacity-50 rounded"
                  style={{
                    // TODO: Position highlights based on text analysis
                    top: '0',
                    left: '0',
                    width: '100px',
                    height: '20px'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};