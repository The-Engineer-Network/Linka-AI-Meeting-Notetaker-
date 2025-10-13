interface SavedPromptsDropdownProps {
    value: string;
    onChange: (value: string) => void;
}

const savedPrompts = [
    { value: 'meeting-summary', label: 'Meeting Summary Prompt' },
    { value: 'email-draft', label: 'Email Draft Prompt' },
    { value: 'report-outline', label: 'Report Outline Prompt' },
    { value: 'social-post', label: 'Social Media Post Prompt' },
];

export function SavedPromptsDropdown({ value, onChange }: SavedPromptsDropdownProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Saved Prompts
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
                <option value="">Select a saved prompt...</option>
                {savedPrompts.map((prompt) => (
                    <option key={prompt.value} value={prompt.value}>
                        {prompt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}