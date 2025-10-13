export function EmptyQueueState() {
    return (
        <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tasks in queue</h3>
            <p className="text-gray-500 dark:text-gray-400">Your AI processing tasks will appear here when you start processing meetings.</p>
        </div>
    );
}