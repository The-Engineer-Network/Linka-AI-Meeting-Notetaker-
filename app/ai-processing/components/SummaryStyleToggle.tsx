interface SummaryStyleToggleProps {
    value: string;
    onChange: (value: string) => void;
}

const styles = [
    { value: 'bullet', label: 'Bullet Points' },
    { value: 'paragraph', label: 'Paragraph' },
];

export function SummaryStyleToggle({ value, onChange }: SummaryStyleToggleProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Summary Style
            </label>
            <div className="flex space-x-2">
                {styles.map((style) => (
                    <button
                        key={style.value}
                        onClick={() => onChange(style.value)}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                            value === style.value
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        {style.label}
                    </button>
                ))}
            </div>
        </div>
    );
}