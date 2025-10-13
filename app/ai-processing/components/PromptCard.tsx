interface PromptCardProps {
    id: string;
    name: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onTest: (id: string) => void;
}

export function PromptCard({ id, name, onEdit, onDelete, onTest }: PromptCardProps) {
    return (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900 dark:text-gray-100">{name}</div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onTest(id)}
                        className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Test
                    </button>
                    <button
                        onClick={() => onEdit(id)}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(id)}
                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}