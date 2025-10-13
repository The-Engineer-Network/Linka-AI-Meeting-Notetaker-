interface QueueItemProps {
    taskType: string;
    meetingName: string;
    progress: number;
    onCancel: () => void;
}

const getTaskIcon = (taskType: string) => {
    switch (taskType) {
        case 'summary': return '📝';
        case 'translation': return '🌐';
        case 'proofread': return '✏️';
        case 'rewrite': return '🔄';
        case 'write': return '✍️';
        default: return '⚙️';
    }
};

export function QueueItem({ taskType, meetingName, progress, onCancel }: QueueItemProps) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
                <span className="text-lg">{getTaskIcon(taskType)}</span>
                <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{meetingName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{taskType}</div>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <div className="w-24">
                    <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{progress}%</div>
                </div>
                <button
                    onClick={onCancel}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}