"use client"
import { useState } from 'react';
import { MeetingCheckboxList } from './MeetingCheckboxList';
import { EstimatedTimeDisplay } from './EstimatedTimeDisplay';

export function BatchProcessingPanel() {
    const [selectedMeetings, setSelectedMeetings] = useState<string[]>([]);

    const handleSelectAll = () => {
        // Assuming 5 meetings from the list
        setSelectedMeetings(['1', '2', '3', '4', '5']);
    };

    const handleProcessSelected = () => {
        // Handle processing
        alert(`Processing ${selectedMeetings.length} meetings`);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Batch Processing</h3>
            <div className="space-y-4">
                <MeetingCheckboxList selectedMeetings={selectedMeetings} onChange={setSelectedMeetings} />
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleSelectAll}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800"
                    >
                        Select All
                    </button>
                    <EstimatedTimeDisplay selectedCount={selectedMeetings.length} />
                </div>
                <button
                    onClick={handleProcessSelected}
                    disabled={selectedMeetings.length === 0}
                    className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
                >
                    Process Selected Meetings
                </button>
            </div>
        </div>
    );
}