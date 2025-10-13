interface TranslationQualitySelectProps {
    value: string;
    onChange: (value: string) => void;
}

const qualityLevels = [
    { value: 'standard', label: 'Standard' },
    { value: 'high', label: 'High Quality' },
    { value: 'premium', label: 'Premium' },
];

export function TranslationQualitySelect({ value, onChange }: TranslationQualitySelectProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Translation Quality
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
                {qualityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                        {level.label}
                    </option>
                ))}
            </select>
        </div>
    );
}