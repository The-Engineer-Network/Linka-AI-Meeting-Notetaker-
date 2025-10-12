import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface QuickNoteInputProps {
  onAddNote: (note: string) => void;
  className?: string;
}

export const QuickNoteInput: React.FC<QuickNoteInputProps> = ({
  onAddNote,
  className = ''
}) => {
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (note.trim()) {
      onAddNote(note.trim());
      setNote('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex space-x-2 ${className}`}>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a quick note..."
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <Button
        type="submit"
        disabled={!note.trim()}
        className="px-4 py-2"
      >
        Add Note
      </Button>
    </form>
  );
};