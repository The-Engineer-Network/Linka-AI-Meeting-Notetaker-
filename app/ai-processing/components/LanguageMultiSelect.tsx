interface LanguageMultiSelectProps {
    selectedLanguages: string[];
    onChange: (languages: string[]) => void;
}

const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
];

export function LanguageMultiSelect({ selectedLanguages, onChange }: LanguageMultiSelectProps) {
    const handleChange = (code: string, checked: boolean) => {
        if (checked) {
            onChange([...selectedLanguages, code]);
        } else {
            onChange(selectedLanguages.filter(lang => lang !== code));
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Target Languages
            </label>
            <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                    <label key={lang.code} className="flex items-center">
                        <input
                            type="checkbox"
                            checked={selectedLanguages.includes(lang.code)}
                            onChange={(e) => handleChange(lang.code, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{lang.name}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}