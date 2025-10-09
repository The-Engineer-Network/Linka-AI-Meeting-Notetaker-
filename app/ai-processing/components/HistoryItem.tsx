interface HistoryItemProps {
    timestamp: string;
    operation: string;
    status: 'success' | 'failed';
    onViewResult: () => void;
}

export function HistoryItem({ timestamp, operation, status, onViewResult }: HistoryItemProps) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">{timestamp}</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{operation}</div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    status === 'success'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                    {status}
                </span>
            </div>
            <button
                onClick={onViewResult}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                View Result
            </button>
        </div>
    );
}