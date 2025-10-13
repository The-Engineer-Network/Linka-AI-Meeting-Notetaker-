interface CustomToneInputProps {
    value: string;
    onChange: (value: string) => void;
}

export function CustomToneInput({ value, onChange }: CustomToneInputProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custom Tone
            </label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="e.g., enthusiastic, sarcastic, diplomatic"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
                Describe the desired tone for rewriting
            </p>
        </div>
    );
}