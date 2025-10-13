interface CorrectionTypeCheckboxesProps {
    selectedTypes: string[];
    onChange: (types: string[]) => void;
}

const correctionTypes = [
    { value: 'grammar', label: 'Grammar' },
    { value: 'spelling', label: 'Spelling' },
    { value: 'punctuation', label: 'Punctuation' },
];

export function CorrectionTypeCheckboxes({ selectedTypes, onChange }: CorrectionTypeCheckboxesProps) {
    const handleChange = (type: string, checked: boolean) => {
        if (checked) {
            onChange([...selectedTypes, type]);
        } else {
            onChange(selectedTypes.filter(t => t !== type));
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Correction Types
            </label>
            <div className="space-y-2">
                {correctionTypes.map((type) => (
                    <label key={type.value} className="flex items-center">
                        <input
                            type="checkbox"
                            checked={selectedTypes.includes(type.value)}
                            onChange={(e) => handleChange(type.value, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}