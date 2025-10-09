import { HistoryItem } from './HistoryItem';

interface HistoryEntry {
    id: string;
    timestamp: string;
    operation: string;
    status: 'success' | 'failed';
}

interface HistoryListProps {
    history: HistoryEntry[];
    onViewResult: (id: string) => void;
}

export function HistoryList({ history, onViewResult }: HistoryListProps) {
    return (
        <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.map((entry) => (
                <HistoryItem
                    key={entry.id}
                    timestamp={entry.timestamp}
                    operation={entry.operation}
                    status={entry.status}
                    onViewResult={() => onViewResult(entry.id)}
                />
            ))}
        </div>
    );
}