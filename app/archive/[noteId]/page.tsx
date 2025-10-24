"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArchiveDetailPageProps {
  params: {
    noteId: string;
  };
}

export default function ArchiveDetailPage({ params }: ArchiveDetailPageProps) {
  const handleBackToArchive = () => {
    window.location.href = '/archive';
  };

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={handleBackToArchive}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Archive
          </Button>
          <Button
            variant="outline"
            onClick={handleGoToDashboard}
          >
            Go to Dashboard
          </Button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Meeting Details</h1>
          <p className="text-gray-600 mb-4">Meeting ID: {params.noteId}</p>
          <p className="text-gray-600">Detailed meeting content will be implemented here.</p>
        </div>
      </div>
    </div>
  );
}