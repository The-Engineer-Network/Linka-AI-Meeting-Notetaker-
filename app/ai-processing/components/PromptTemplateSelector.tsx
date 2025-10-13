interface PromptTemplateSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

const templates = [
    { value: 'email', label: 'Email Response' },
    { value: 'blog', label: 'Blog Post' },
    { value: 'report', label: 'Report Summary' },
    { value: 'social', label: 'Social Media Post' },
    { value: 'custom', label: 'Custom' },
];

export function PromptTemplateSelector({ value, onChange }: PromptTemplateSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Prompt Template
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
                {templates.map((template) => (
                    <option key={template.value} value={template.value}>
                        {template.label}
                    </option>
                ))}
            </select>
        </div>
    );
}