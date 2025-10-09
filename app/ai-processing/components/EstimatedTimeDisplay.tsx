interface EstimatedTimeDisplayProps {
    selectedCount: number;
}

export function EstimatedTimeDisplay({ selectedCount }: EstimatedTimeDisplayProps) {
    const estimatedTime = selectedCount * 2; // 2 minutes per meeting

    if (selectedCount === 0) {
        return (
            <div className="text-sm text-gray-500 dark:text-gray-400">
                Select meetings to see estimated processing time
            </div>
        );
    }

    return (
        <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Estimated time:</span> {estimatedTime} minutes for {selectedCount} meeting{selectedCount > 1 ? 's' : ''}
        </div>
    );
}