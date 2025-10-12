import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  className = ''
}) => {
  return (
    <Link href="/dashboard">
      <Button
        variant="outline"
        className={`flex items-center space-x-2 ${className}`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Back to Dashboard</span>
      </Button>
    </Link>
  );
};