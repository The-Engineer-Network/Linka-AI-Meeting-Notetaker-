interface ModelCardsProps {
    selectedModel: string;
    onChange: (model: string) => void;
}

const models = [
    {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Most capable model for complex tasks',
        performance: 95,
    },
    {
        id: 'gpt-3.5',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and cost-effective for most tasks',
        performance: 85,
    },
    {
        id: 'claude-3',
        name: 'Claude 3',
        description: 'Excellent for analysis and writing',
        performance: 90,
    },
];

export function ModelCards({ selectedModel, onChange }: ModelCardsProps) {
    return (
        <div className="space-y-3">
            {models.map((model) => (
                <label key={model.id} className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                        type="radio"
                        name="model"
                        value={model.id}
                        checked={selectedModel === model.id}
                        onChange={(e) => onChange(e.target.value)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{model.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{model.description}</div>
                        <div className="mt-2 flex items-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mr-2">Performance:</div>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${model.performance}%` }}
                                ></div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">{model.performance}%</div>
                        </div>
                    </div>
                </label>
            ))}
        </div>
    );
}