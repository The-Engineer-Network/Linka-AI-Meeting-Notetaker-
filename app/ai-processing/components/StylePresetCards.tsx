interface StylePresetCardsProps {
    selectedPreset: string;
    onChange: (preset: string) => void;
}

const presets = [
    { id: 'academic', label: 'Academic', description: 'Formal academic writing' },
    { id: 'business', label: 'Business', description: 'Professional business style' },
    { id: 'creative', label: 'Creative', description: 'Engaging creative writing' },
    { id: 'simple', label: 'Simple', description: 'Clear and straightforward' },
];

export function StylePresetCards({ selectedPreset, onChange }: StylePresetCardsProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Style Presets
            </label>
            <div className="grid grid-cols-2 gap-3">
                {presets.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => onChange(preset.id)}
                        className={`p-3 text-left border rounded-lg transition-colors ${
                            selectedPreset === preset.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                        }`}
                    >
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{preset.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{preset.description}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}