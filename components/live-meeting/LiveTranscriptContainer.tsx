import React, { useRef, useEffect } from 'react';
import { TranscriptMessage } from './TranscriptMessage';
import { AutoScrollToggle } from './AutoScrollToggle';

interface TranscriptEntry {
  id: string;
  speaker: string;
  timestamp: string;
  message: string;
  avatar?: string;
  highlights?: string[];
}

interface LiveTranscriptContainerProps {
  transcripts: TranscriptEntry[];
  autoScrollEnabled: boolean;
  onToggleAutoScroll: () => void;
  className?: string;
}

export const LiveTranscriptContainer: React.FC<LiveTranscriptContainerProps> = ({
  transcripts,
  autoScrollEnabled,
  onToggleAutoScroll,
  className = ''
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScrollEnabled && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts, autoScrollEnabled]);

  return (
    <div className={`bg-white border rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Live Transcript</h3>
        <AutoScrollToggle
          isEnabled={autoScrollEnabled}
          onToggle={onToggleAutoScroll}
        />
      </div>

      {/* Transcript Content */}
      <div
        ref={scrollRef}
        className="h-96 overflow-y-auto p-4 space-y-2"
      >
        {transcripts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Transcript will appear here during recording...</p>
          </div>
        ) : (
          transcripts.map((transcript) => (
            <TranscriptMessage
              key={transcript.id}
              speaker={transcript.speaker}
              timestamp={transcript.timestamp}
              message={transcript.message}
              avatar={transcript.avatar}
              highlights={transcript.highlights}
            />
          ))
        )}
      </div>
    </div>
  );
};