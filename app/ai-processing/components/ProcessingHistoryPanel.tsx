"use client"
import { useState } from 'react';
import { HistoryList } from './HistoryList';

interface HistoryEntry {
    id: string;
    timestamp: string;
    operation: string;
    status: 'success' | 'failed';
}

export function ProcessingHistoryPanel() {
    const [history] = useState<HistoryEntry[]>([
        { id: '1', timestamp: '2024-01-15 10:30', operation: 'Meeting Summary', status: 'success' },
        { id: '2', timestamp: '2024-01-15 09:15', operation: 'Translation', status: 'success' },
        { id: '3', timestamp: '2024-01-14 16:45', operation: 'Proofreading', status: 'failed' },
        { id: '4', timestamp: '2024-01-14 14:20', operation: 'Rewrite', status: 'success' },
    ]);

    const handleViewResult = (id: string) => {
        // View result
        alert(`View result for ${id}`);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Processing History</h3>
            <HistoryList history={history} onViewResult={handleViewResult} />
        </div>
    );
}