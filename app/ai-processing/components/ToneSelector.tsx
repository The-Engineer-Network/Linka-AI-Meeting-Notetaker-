interface ToneSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

const tones = [
    { value: 'formal', label: 'Formal' },
    { value: 'casual', label: 'Casual' },
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
];

export function ToneSelector({ value, onChange }: ToneSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tone
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
                {tones.map((tone) => (
                    <option key={tone.value} value={tone.value}>
                        {tone.label}
                    </option>
                ))}
            </select>
        </div>
    );
}