import { QueueItem } from './QueueItem';
import { EmptyQueueState } from './EmptyQueueState';

interface QueueTask {
    id: string;
    taskType: string;
    meetingName: string;
    progress: number;
}

interface QueueListProps {
    tasks: QueueTask[];
    onCancelTask: (id: string) => void;
}

export function QueueList({ tasks, onCancelTask }: QueueListProps) {
    if (tasks.length === 0) {
        return <EmptyQueueState />;
    }

    return (
        <div className="space-y-3">
            {tasks.map((task) => (
                <QueueItem
                    key={task.id}
                    taskType={task.taskType}
                    meetingName={task.meetingName}
                    progress={task.progress}
                    onCancel={() => onCancelTask(task.id)}
                />
            ))}
        </div>
    );
}