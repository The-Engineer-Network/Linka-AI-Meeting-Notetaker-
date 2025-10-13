"use client"
import { useState } from 'react';
import { QueueList } from './QueueList';

interface QueueTask {
    id: string;
    taskType: string;
    meetingName: string;
    progress: number;
}

export function ProcessingQueuePanel() {
    const [tasks, setTasks] = useState<QueueTask[]>([
        { id: '1', taskType: 'summary', meetingName: 'Team Standup - 2024-01-15', progress: 45 },
        { id: '2', taskType: 'translation', meetingName: 'Client Presentation', progress: 78 },
    ]);

    const handleCancelTask = (id: string) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Processing Queue</h3>
            <QueueList tasks={tasks} onCancelTask={handleCancelTask} />
        </div>
    );
}